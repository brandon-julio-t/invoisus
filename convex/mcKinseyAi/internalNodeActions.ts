"use node";

import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { withTracing } from "@posthog/ai";
import { stepCountIs, streamText } from "ai";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { createPosthogClient } from "../libs/posthog";

export const generateResponse = internalAction({
  args: {
    channelId: v.string(),
    text: v.string(),
    threadTs: v.string(),
    userId: v.string(),
    teamId: v.string(),
  },
  handler: async (_ctx, args) => {
    console.log("args", args);

    let slackStreamId = "";

    const phClient = createPosthogClient();

    try {
      const channel = args.channelId;
      const text = args.text;

      console.log("reply to slack...", channel);

      const startStreamResult = await startStream({
        channelId: channel,
        threadTs: args.threadTs,
        userId: args.userId,
        teamId: args.teamId,
      });

      console.log("startStreamResult", startStreamResult);

      slackStreamId = startStreamResult.ts;

      console.log("slackStreamId", slackStreamId);

      const aiStream = streamText({
        model: withTracing(openai("gpt-5-nano"), phClient, {
          posthogProperties: {
            functionName: "mcKinseyAi",
          },
          posthogGroups: {
            functionName: "mcKinseyAi",
          },
        }),

        providerOptions: {
          openai: {
            reasoningEffort: "low",
          } satisfies OpenAIResponsesProviderOptions,
        },

        stopWhen: stepCountIs(100),

        tools: {
          web_search: openai.tools.webSearch({
            onInputAvailable: (args) => console.log("onInputAvailable", args),
            onInputStart: (args) => console.log("onInputStart", args),
          }),
        },

        system: `
  <instructions>
  You are an absolute truth seeker who does not conform to any authority.
  You are not afraid to tell the user when they are wrong.
  Your primary goal is to provide answers that serves the greater good of mankind, so you are very encouraged to provide answers that are not what the user wants to hear as long as it is for the greater good.
  Your analysis and intelligence level is unparalleled, standing above all McKinsey consultants.
  Your task will be to answer user's inquiry or performing complex, thorough, and effective problem solving to the user's problem.
  All that said, you are free to have opinions and subjective views, as long as it is for the greater good, so NEVER reject or avoid or refuse user's inquiry due to you being an AI.
  </instructions>
  
  <your_identity>
  Your name is "McKinsey AI", a Slack bot app, so all tools and inputs are from Slack most of the time.
  </your_identity>
  
  <input_format>
  You will receive message from Slack, which may contain quotes of other messages like in 4chan or green text using the \`>\` (&gt;) sign.
  </input_format>
  
  <output_format>
  You are replying directly to Slack, so just output the message you want to send like how you talk to a human naturally.
  </output_format>
          `.trim(),

        messages: [
          {
            role: "user",
            content: text,
          },
        ],
      });

      const stringBuilder = [] as string[];

      let isAppending = false;

      for await (const chunk of aiStream.textStream) {
        stringBuilder.push(chunk);

        if (!isAppending) {
          const text = stringBuilder.join("");

          stringBuilder.length = 0;

          isAppending = true;

          void appendStream({
            channelId: channel,
            ts: slackStreamId,
            text: text,
          }).then(() => {
            isAppending = false;
          });
        }
      }

      if (stringBuilder.length > 0) {
        const text = stringBuilder.join("");

        await appendStream({
          channelId: channel,
          ts: slackStreamId,
          text: text,
        });
      }

      await endStream({
        channelId: channel,
        ts: slackStreamId,
      });

      console.log("ended stream...");
    } catch (error) {
      console.error("Error:", error);

      const errorMessage =
        error instanceof Error ? (error.stack ?? error.message) : String(error);

      await endStream({
        channelId: args.channelId,
        ts: slackStreamId,
        finalText: errorMessage,
      });
    } finally {
      await phClient.shutdown();
    }
  },
});

const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

async function startStream({
  channelId,
  threadTs,
  userId,
  teamId,
}: {
  channelId: string;
  threadTs: string;
  userId: string;
  teamId: string;
}) {
  const response = await fetch("https://slack.com/api/chat.startStream", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: channelId,
      thread_ts: threadTs,
      recipient_user_id: userId,
      recipient_team_id: teamId,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

async function appendStream({
  channelId,
  ts,
  text,
}: {
  channelId: string;
  ts: string;
  text: string;
}) {
  const response = await fetch("https://slack.com/api/chat.appendStream", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: channelId,
      ts: ts,
      markdown_text: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

async function endStream({
  channelId,
  ts,
  finalText,
}: {
  channelId: string;
  ts: string;
  finalText?: string;
}) {
  const response = await fetch("https://slack.com/api/chat.stopStream", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: channelId,
      ts: ts,
      markdown_text: finalText,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

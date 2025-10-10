import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { stepCountIs, streamText } from "ai";
import { httpRouter } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { httpAction, internalAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// 10/9/2025, 5:32:14 PM [CONVEX H(POST /slack)] [LOG] 'body' {
//   token: '8uCGkG0Qumszf1ckC6gcdPd3',
//   team_id: 'T05F0GQQER0',
//   api_app_id: 'A07N93W4MPC',
//   event: {
//     user: 'U05H2SM3TF0',
//     type: 'app_mention',
//     ts: '1760005928.816399',
//     client_msg_id: 'b4a8137a-ed9d-4dbf-bfe9-06c2599454fa',
//     text: '<@U07N9464S4A> this message is in regular',
//     team: 'T05F0GQQER0',
//     blocks: [
//       {
//         type: 'rich_text',
//         block_id: 'WhKmu',
//         elements: [ [Object] ]
//       }
//     ],
//     channel: 'C09KH9L4CJH',
//     event_ts: '1760005928.816399'
//   },
//   type: 'event_callback',
//   event_id: 'Ev09KLPQTR7U',
//   event_time: 1760005928,
//   authorizations: [
//     {
//       enterprise_id: null,
//       team_id: 'T05F0GQQER0',
//       user_id: 'U07N9464S4A',
//       is_bot: true,
//       is_enterprise_install: false
//     }
//   ],
//   is_ext_shared_channel: false,
//   event_context: '4-eyJldCI6ImFwcF9tZW50aW9uIiwidGlkIjoiVDA1RjBHUVFFUjAiLCJhaWQiOiJBMDdOOTNXNE1QQyIsImNpZCI6IkMwOUtIOUw0Q0pIIn0'
// }
// 10/9/2025, 5:32:22 PM [CONVEX H(POST /slack)] [LOG] 'body' {
//   token: '8uCGkG0Qumszf1ckC6gcdPd3',
//   team_id: 'T05F0GQQER0',
//   api_app_id: 'A07N93W4MPC',
//   event: {
//     user: 'U05H2SM3TF0',
//     type: 'app_mention',
//     ts: '1760005940.933399',
//     client_msg_id: '7f651248-b457-4f23-bc17-cc3ebae1cc61',
//     text: '<@U07N9464S4A> this message is in thread',
//     team: 'T05F0GQQER0',
//     thread_ts: '1760005928.816399',
//     parent_user_id: 'U05H2SM3TF0',
//     blocks: [
//       {
//         type: 'rich_text',
//         block_id: 'J9L33',
//         elements: [ [Object] ]
//       }
//     ],
//     channel: 'C09KH9L4CJH',
//     event_ts: '1760005940.933399'
//   },
//   type: 'event_callback',
//   event_id: 'Ev09KEBHF9UK',
//   event_time: 1760005940,
//   authorizations: [
//     {
//       enterprise_id: null,
//       team_id: 'T05F0GQQER0',
//       user_id: 'U07N9464S4A',
//       is_bot: true,
//       is_enterprise_install: false
//     }
//   ],
//   is_ext_shared_channel: false,
//   event_context: '4-eyJldCI6ImFwcF9tZW50aW9uIiwidGlkIjoiVDA1RjBHUVFFUjAiLCJhaWQiOiJBMDdOOTNXNE1QQyIsImNpZCI6IkMwOUtIOUw0Q0pIIn0'
// }

interface SlackEvent {
  token: string;
  team_id: string;
  api_app_id: string;
  event: {
    user: string;
    type: string;
    ts: string;
    client_msg_id: string;
    text: string;
    team: string;
    blocks: Array<{
      type: string;
      block_id: string;
      elements: Array<Record<string, unknown>>;
    }>;
    channel: string;
    event_ts: string;
    thread_ts?: string;
    parent_user_id?: string;
  };
  type: string;
  event_id: string;
  event_time: number;
  authorizations: Array<{
    enterprise_id: string | null;
    team_id: string;
    user_id: string;
    is_bot: boolean;
    is_enterprise_install: boolean;
  }>;
  is_ext_shared_channel: boolean;
  event_context: string;
}

interface SlackChallenge {
  challenge: string;
}

http.route({
  path: "/slack",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = (await req.json()) as SlackEvent | SlackChallenge;

    if ("challenge" in body) {
      return Response.json(body);
    }

    console.log("body", JSON.stringify(body));

    console.log("running action...");

    await ctx.scheduler.runAfter(0, internal.http.generateResponse, {
      channelId: body.event.channel,
      text: body.event.text,
      threadTs: body.event.thread_ts ?? body.event.ts,
      userId: body.event.user,
      teamId: body.team_id,
    });

    console.log("returning...");

    return Response.json({ ok: true });
  }),
});

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
        model: openai("gpt-5-nano"),

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

export default http;

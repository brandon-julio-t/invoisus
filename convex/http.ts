import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import type { SlackChallenge, SlackEvent } from "./mcKinseyAi/types";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

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

    await ctx.scheduler.runAfter(
      0,
      internal.mcKinseyAi.internalNodeActions.generateResponse,
      {
        channelId: body.event.channel,
        text: body.event.text,
        threadTs: body.event.thread_ts ?? body.event.ts,
        userId: body.event.user,
        teamId: body.team_id,
      },
    );

    console.log("returning...");

    return Response.json({ ok: true });
  }),
});

export default http;

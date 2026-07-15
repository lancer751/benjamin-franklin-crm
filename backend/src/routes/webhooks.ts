import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { processLeadgenEvent } from "@/services/leadgenProcessor";
import { metaService } from "@/services/metaservice";
import { Hono } from "hono";

// routes/webhooks.ts
const META_WEBHOOK_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN!;

export const metaWebhookRoutes = new Hono<ContextWithPrisma>().use(withPrisma)
  // Meta calls this once when you configure the webhook subscription
  .get("/meta/leadgen", (c) => {
    const mode = c.req.query("hub.mode");
    const token = c.req.query("hub.verify_token");
    const challenge = c.req.query("hub.challenge");

    if (mode === "subscribe" && token === META_WEBHOOK_VERIFY_TOKEN) {
      return c.text(challenge ?? "", 200);
    }
    return c.text("Forbidden", 403);
  })

  // Actual lead events
  .post("/meta/leadgen", async (c) => {
    const rawBody = await c.req.text();
    const signature = c.req.header("x-hub-signature-256");

    if (!metaService.verifyWebhookSignature(rawBody, signature)) {
      return c.text("Invalid signature", 401);
    }

    const payload = JSON.parse(rawBody);
    const prisma = c.get("prisma");

    // Always 200 quickly — Meta retries aggressively on non-200,
    // so failures are logged, not surfaced as HTTP errors
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== "leadgen") continue;

        const { leadgen_id, form_id } = change.value;
        try {
          await processLeadgenEvent(prisma, { leadgenId: leadgen_id, formId: form_id });
        } catch (err) {
          console.error("Failed to process leadgen event", { leadgen_id, form_id, err });
        }
      }
    }

    return c.text("EVENT_RECEIVED", 200);
  });
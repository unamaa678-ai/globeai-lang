import { FastifyInstance } from "fastify";
import { messageQueue } from "@/lib/queue";
import { verifyWhatsAppSignature } from "@/services/whatsapp/verifySignature";

export async function whatsappWebhookRoutes(app: FastifyInstance) {
  // Meta's one-time verification handshake when you register the webhook URL
  app.get("/webhooks/whatsapp", async (req, reply) => {
    const query = req.query as Record<string, string>;
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return reply.send(challenge);
    }
    return reply.status(403).send();
  });

  // Inbound message events
  app.post("/webhooks/whatsapp", async (req, reply) => {
    const signature = req.headers["x-hub-signature-256"] as string | undefined;
    const rawBody = (req as any).rawBody as string; // requires rawBody plugin, see server.ts

    if (!verifyWhatsAppSignature(rawBody, signature)) {
      return reply.status(401).send({ error: "invalid signature" });
    }

    const entry = (req.body as any)?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (message?.type === "text") {
      await messageQueue.add("process-inbound-message", {
        from: message.from,
        text: message.text?.body,
        phoneNumberId: change.metadata.phone_number_id,
        timestamp: message.timestamp,
      });
    }

    // Always ACK with 200 quickly — WhatsApp retries (and eventually disables
    // the webhook) if it doesn't get a fast 200 response.
    return reply.status(200).send();
  });
}

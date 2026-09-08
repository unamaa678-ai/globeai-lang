import "dotenv/config";
import Fastify from "fastify";
import { whatsappWebhookRoutes } from "@/routes/webhooks/whatsapp";
import { shopifyWebhookRoutes } from "@/routes/webhooks/shopify";

const app = Fastify({ logger: true });

// Capture the raw request body so we can verify HMAC signatures
// (both Shopify and WhatsApp sign the exact raw bytes, not the parsed JSON).
app.addContentTypeParser("application/json", { parseAs: "string" }, (req, body, done) => {
  (req as any).rawBody = body as string;
  try {
    done(null, JSON.parse(body as string));
  } catch (err) {
    done(err as Error, undefined);
  }
});

app.register(whatsappWebhookRoutes);
app.register(shopifyWebhookRoutes);

app.get("/health", async () => ({ status: "ok" }));

const PORT = Number(process.env.PORT) || 3001;
app.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
  app.log.info(`GlobalStore AI backend listening on :${PORT}`);
});

import { FastifyInstance } from "fastify";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { syncQueue } from "@/lib/queue";

function verifyShopifyWebhook(rawBody: string, hmacHeader: string | undefined): boolean {
  if (!hmacHeader) return false;
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET!)
    .update(rawBody, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}

export async function shopifyWebhookRoutes(app: FastifyInstance) {
  app.post("/webhooks/shopify/products", async (req, reply) => {
    const hmac = req.headers["x-shopify-hmac-sha256"] as string | undefined;
    const rawBody = (req as any).rawBody as string;

    if (!verifyShopifyWebhook(rawBody, hmac)) {
      return reply.status(401).send({ error: "invalid signature" });
    }

    const shopDomain = req.headers["x-shopify-shop-domain"] as string;
    const store = await prisma.store.findUnique({ where: { shopifyDomain: shopDomain } });

    if (store) {
      // Enqueue a full sync job rather than parsing individual product diffs —
      // simpler to reason about, and Shopify's product payload varies by event type.
      await syncQueue.add("sync-store-products", { storeId: store.id });
    }

    return reply.status(200).send();
  });
}

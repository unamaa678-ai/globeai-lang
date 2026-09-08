import { shopifyApiClient } from "./client";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/crypto";
import { getEmbedding } from "@/services/ai/embeddings";

export async function syncStoreProducts(storeId: string) {
  const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });
  const client = shopifyApiClient(store.shopifyDomain, decryptToken(store.accessToken));

  await prisma.store.update({ where: { id: storeId }, data: { syncStatus: "SYNCING" } });

  let hasNextPage = true;
  let cursor: string | undefined;

  try {
    while (hasNextPage) {
      const { products, pageInfo } = await client.fetchProducts({ after: cursor, limit: 50 });

      for (const p of products) {
        const embedding = await getEmbedding(`${p.title}\n${p.description}`);
        const vectorLiteral = `[${embedding.join(",")}]`;

        await prisma.$executeRaw`
          INSERT INTO "Product" (id, "storeId", "shopifyId", title, description, price, currency, embedding, "updatedAt")
          VALUES (gen_random_uuid()::text, ${storeId}, ${p.id}, ${p.title}, ${p.description}, ${p.price}::decimal, ${p.currency}, ${vectorLiteral}::vector, now())
          ON CONFLICT ("shopifyId") DO UPDATE
          SET title = EXCLUDED.title,
              description = EXCLUDED.description,
              price = EXCLUDED.price,
              embedding = EXCLUDED.embedding,
              "updatedAt" = now()
        `;
      }

      hasNextPage = pageInfo.hasNextPage;
      cursor = pageInfo.endCursor;
    }

    await prisma.store.update({
      where: { id: storeId },
      data: { syncStatus: "SYNCED", lastSyncedAt: new Date() },
    });
  } catch (err) {
    await prisma.store.update({ where: { id: storeId }, data: { syncStatus: "ERROR" } });
    throw err;
  }
}

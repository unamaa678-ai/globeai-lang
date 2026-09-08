import { prisma } from "@/lib/prisma";
import { getEmbedding } from "./embeddings";

export interface RelevantProduct {
  title: string;
  description: string;
  price: string;
  currency: string;
}

export async function findRelevantProducts(
  storeId: string,
  queryText: string,
  limit = 4
): Promise<RelevantProduct[]> {
  const queryEmbedding = await getEmbedding(queryText);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  // Cosine distance search via pgvector's <=> operator
  const results = await prisma.$queryRaw<RelevantProduct[]>`
    SELECT title, description, price::text, currency
    FROM "Product"
    WHERE "storeId" = ${storeId}
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${limit}
  `;

  return results;
}

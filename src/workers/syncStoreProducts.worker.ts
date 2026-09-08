import "dotenv/config";
import { Worker } from "bullmq";
import { connection } from "@/lib/queue";
import { syncStoreProducts } from "@/services/shopify/syncProducts";

export const syncWorker = new Worker(
  "sync-queue",
  async (job) => {
    const { storeId } = job.data as { storeId: string };
    await syncStoreProducts(storeId);
  },
  { connection, concurrency: 2 }
);

syncWorker.on("failed", (job, err) => {
  console.error(`Sync job ${job?.id} failed:`, err);
});

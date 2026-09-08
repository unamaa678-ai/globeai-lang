import "dotenv/config";
import { Worker } from "bullmq";
import { connection } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/crypto";
import { detectLanguage, translateText } from "@/services/translation";
import { findRelevantProducts } from "@/services/ai/retrieval";
import { generateReply } from "@/services/ai/claude";
import { sendWhatsAppMessage } from "@/services/whatsapp/send";

export const inboundWorker = new Worker(
  "message-queue",
  async (job) => {
    const { from, text, phoneNumberId } = job.data as {
      from: string;
      text: string;
      phoneNumberId: string;
    };

    const waSettings = await prisma.whatsAppSettings.findUniqueOrThrow({
      where: { phoneNumberId },
      include: { merchant: { include: { stores: true } } },
    });
    const store = waSettings.merchant.stores[0];
    if (!store) throw new Error(`No connected Shopify store for merchant ${waSettings.merchantId}`);

    // 1. Detect language + translate inbound message to English
    const customerLang = await detectLanguage(text);
    const englishText = customerLang.toLowerCase() === "en" ? text : await translateText(text, { to: "en" });

    // 2. Upsert conversation + log inbound message
    const conversation = await prisma.conversation.upsert({
      where: { storeId_customerPhone: { storeId: store.id, customerPhone: from } },
      create: { storeId: store.id, customerPhone: from, customerLang },
      update: { customerLang },
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "INBOUND",
        sender: "CUSTOMER",
        originalText: text,
        originalLang: customerLang,
        translatedText: englishText,
        translatedLang: "en",
      },
    });

    if (!waSettings.autoReplyEnabled) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { status: "AWAITING_MERCHANT" },
      });
      return; // merchant will reply manually from the dashboard
    }

    // 3. RAG: retrieve relevant products
    const relevantProducts = await findRelevantProducts(store.id, englishText);

    // 4. Generate AI reply in English
    const aiReplyEnglish = await generateReply({
      customerMessage: englishText,
      products: relevantProducts,
      storeName: store.shopifyDomain,
    });

    // 5. Translate reply back into the customer's language
    const aiReplyNative =
      customerLang.toLowerCase() === "en"
        ? aiReplyEnglish
        : await translateText(aiReplyEnglish, { to: customerLang, tone: "friendly, casual, native-sounding" });

    // 6. Send via WhatsApp
    await sendWhatsAppMessage({
      to: from,
      phoneNumberId,
      text: aiReplyNative,
      accessToken: decryptToken(waSettings.accessToken),
    });

    // 7. Log outbound message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        sender: "AI",
        originalText: aiReplyEnglish,
        originalLang: "en",
        translatedText: aiReplyNative,
        translatedLang: customerLang,
        aiGenerated: true,
      },
    });
  },
  { connection, concurrency: 5 }
);

inboundWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

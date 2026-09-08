import Anthropic from "@anthropic-ai/sdk";
import type { RelevantProduct } from "./retrieval";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateReply(params: {
  customerMessage: string;
  products: RelevantProduct[];
  storeName: string;
}): Promise<string> {
  const { customerMessage, products, storeName } = params;

  const productContext = products
    .map((p) => `- ${p.title} (${p.price} ${p.currency}): ${p.description.slice(0, 200)}`)
    .join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: `You are a helpful customer support agent for the online store "${storeName}". ` +
      `Answer the customer's question using only the product info provided. ` +
      `Be concise, friendly, and helpful. If you don't have enough information to answer confidently, ` +
      `say so and offer to connect them with a human — never invent product details, prices, or policies.`,
    messages: [
      {
        role: "user",
        content: `Relevant products:\n${productContext || "(none found)"}\n\nCustomer message:\n${customerMessage}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "";
}

// Used when DeepL doesn't cover a language well, or when phrasing needs to sound
// natural/idiomatic rather than literal (e.g. Arabic dialects, casual Portuguese).
export async function localizeWithLLM(params: {
  text: string;
  targetLanguage: string;
  tone?: string;
}): Promise<string> {
  const { text, targetLanguage, tone = "friendly, natural, native-sounding" } = params;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: `You are a professional translator. Translate the given text into ${targetLanguage}. ` +
      `Tone: ${tone}. Use natural, locally idiomatic phrasing, not a literal word-for-word translation. ` +
      `Return ONLY the translated text, nothing else.`,
    messages: [{ role: "user", content: text }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text.trim() : text;
}

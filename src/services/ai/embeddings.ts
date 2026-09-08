// Uses OpenAI's embedding endpoint (text-embedding-3-small, 1536 dims) since
// Anthropic does not currently offer a first-party embeddings API.
// Swap for Voyage AI (voyage-2) if you'd prefer an all-non-OpenAI stack.

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000), // guard against overlong descriptions
    }),
  });

  if (!res.ok) throw new Error(`Embedding API error: ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding as number[];
}

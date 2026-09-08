import crypto from "crypto";

// Meta signs every webhook payload with X-Hub-Signature-256, computed as
// HMAC-SHA256 of the raw request body using your app secret. Always verify
// this before trusting a webhook payload.
export function verifyWhatsAppSignature(rawBody: string, signatureHeader: string | undefined): boolean {
  if (!signatureHeader) return false;

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", process.env.WHATSAPP_APP_SECRET!)
      .update(rawBody)
      .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false; // length mismatch etc.
  }
}

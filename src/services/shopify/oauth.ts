import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { encryptToken } from "@/lib/crypto";

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL, SHOPIFY_SCOPES } = process.env;

export function buildInstallUrl(shop: string, state: string) {
  const redirectUri = `${SHOPIFY_APP_URL}/api/shopify/callback`;
  const params = new URLSearchParams({
    client_id: SHOPIFY_API_KEY!,
    scope: SHOPIFY_SCOPES!,
    redirect_uri: redirectUri,
    state,
  });
  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

export function verifyHmac(query: Record<string, string>): boolean {
  const { hmac, ...rest } = query;
  const message = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join("&");

  const digest = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET!)
    .update(message)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

export async function exchangeCodeForToken(shop: string, code: string) {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  const { access_token, scope } = await res.json();
  return { accessToken: access_token as string, scopes: scope as string };
}

export async function connectStore(merchantId: string, shop: string, code: string) {
  const { accessToken, scopes } = await exchangeCodeForToken(shop, code);

  return prisma.store.upsert({
    where: { shopifyDomain: shop },
    create: {
      merchantId,
      shopifyDomain: shop,
      accessToken: encryptToken(accessToken),
      scopes,
      syncStatus: "PENDING",
    },
    update: {
      accessToken: encryptToken(accessToken),
      scopes,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Kicks off the Shopify OAuth install flow. The actual token exchange happens
// in the backend's /api/shopify/callback route (see src/services/shopify/oauth.ts).
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  if (!shop) {
    return NextResponse.json({ error: "Missing ?shop=yourstore.myshopify.com" }, { status: 400 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shopify/callback`;

  const params = new URLSearchParams({
    client_id: process.env.SHOPIFY_API_KEY!,
    scope: process.env.SHOPIFY_SCOPES!,
    redirect_uri: redirectUri,
    state,
  });

  const installUrl = `https://${shop}/admin/oauth/authorize?${params.toString()}`;
  return NextResponse.redirect(installUrl);
}

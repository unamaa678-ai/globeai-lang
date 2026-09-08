const GRAPH_API_VERSION = "v20.0";

export async function sendWhatsAppMessage(params: {
  to: string;
  phoneNumberId: string;
  text: string;
  accessToken: string;
}) {
  const { to, phoneNumberId, text, accessToken } = params;

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`WhatsApp send failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

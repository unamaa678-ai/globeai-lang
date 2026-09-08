interface Message {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  sender: "CUSTOMER" | "AI" | "MERCHANT";
  originalText: string;
  originalLang: string;
  translatedText?: string;
}

async function getMessages(conversationId: string): Promise<Message[]> {
  // Replace with a real fetch to your backend's /api/conversations/:id/messages
  return [
    { id: "1", direction: "INBOUND", sender: "CUSTOMER", originalText: "Bonjour, ma commande est-elle expédiée ?", originalLang: "fr", translatedText: "Hello, has my order shipped?" },
    { id: "2", direction: "OUTBOUND", sender: "AI", originalText: "Yes! Your order shipped yesterday and should arrive within 5-7 business days.", originalLang: "en", translatedText: "Oui ! Votre commande a été expédiée hier et devrait arriver sous 5 à 7 jours ouvrés." },
  ];
}

export default async function ConversationDetailPage({ params }: { params: { id: string } }) {
  const messages = await getMessages(params.id);

  return (
    <div className="p-8 bg-neutral-950 min-h-screen text-neutral-100 flex flex-col h-screen">
      <h1 className="text-xl font-semibold mb-4">Conversation</h1>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl p-3">
              <div className="text-xs text-neutral-500 mb-1">
                {m.sender} · {m.originalLang}
              </div>
              <div>{m.originalText}</div>
              {m.translatedText && (
                <div className="text-sm text-neutral-400 mt-2 border-t border-neutral-800 pt-2">
                  {m.translatedText}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-800 pt-4">
        <textarea
          placeholder="Type your reply in English — it will be translated automatically before sending..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-sm resize-none"
          rows={3}
        />
        <div className="flex justify-end gap-2 mt-2">
          <button className="px-4 py-2 text-sm rounded-lg border border-neutral-700 hover:bg-neutral-800">
            Preview Translation
          </button>
          <button className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

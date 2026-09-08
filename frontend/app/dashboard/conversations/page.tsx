import Link from "next/link";

interface ConversationSummary {
  id: string;
  customerPhone: string;
  customerLang: string;
  status: "OPEN" | "RESOLVED" | "AWAITING_MERCHANT";
  lastMessagePreview: string;
}

async function getConversations(): Promise<ConversationSummary[]> {
  // Replace with a real fetch to your backend's /api/conversations endpoint
  return [
    { id: "1", customerPhone: "+33 6 12 34 56 78", customerLang: "fr", status: "AWAITING_MERCHANT", lastMessagePreview: "Bonjour, ma commande est-elle expédiée ?" },
    { id: "2", customerPhone: "+49 151 2345678", customerLang: "de", status: "OPEN", lastMessagePreview: "Gibt es diesen Artikel in Größe M?" },
  ];
}

const statusColor: Record<ConversationSummary["status"], string> = {
  OPEN: "bg-blue-500/20 text-blue-300",
  RESOLVED: "bg-green-500/20 text-green-300",
  AWAITING_MERCHANT: "bg-amber-500/20 text-amber-300",
};

export default async function ConversationsPage() {
  const conversations = await getConversations();

  return (
    <div className="p-8 bg-neutral-950 min-h-screen text-neutral-100">
      <h1 className="text-2xl font-semibold mb-6">Conversations</h1>
      <div className="space-y-2">
        {conversations.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/conversations/${c.id}`}
            className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 hover:border-neutral-700 transition"
          >
            <div>
              <div className="font-medium">{c.customerPhone}</div>
              <div className="text-sm text-neutral-400 truncate max-w-md">{c.lastMessagePreview}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase text-neutral-500">{c.customerLang}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor[c.status]}`}>
                {c.status.replace("_", " ")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

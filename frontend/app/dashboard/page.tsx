interface ConversationPreview {
  phone: string;
  flag: string;
  preview: string;
  status: "waiting" | "resolved";
  resolvedIn?: string;
}

async function getOverviewData() {
  // Replace with a real fetch to your backend's /api/stats and /api/conversations endpoints
  return {
    stats: {
      openConversations: 14,
      languagesThisWeek: 6,
      aiAnsweredRate: 0.82,
      avgReplySeconds: 4.2,
    },
    needsReply: [
      { phone: "+33 6 12 34 56 78", flag: "🇫🇷", preview: "\"Bonjour, ma commande est-elle expédiée ?\"", status: "waiting" },
      { phone: "+49 151 2345678", flag: "🇩🇪", preview: "\"Gibt es diesen Artikel in Größe M?\"", status: "waiting" },
    ] satisfies ConversationPreview[],
    handledByAi: [
      { phone: "+55 11 98765 4321", flag: "🇧🇷", preview: "\"Qual o prazo de entrega para o Brasil?\"", status: "resolved", resolvedIn: "6 seconds" },
      { phone: "+34 612 345 678", flag: "🇪🇸", preview: "\"¿Puedo cambiar la dirección de envío?\"", status: "resolved", resolvedIn: "4 seconds" },
    ] satisfies ConversationPreview[],
  };
}

export default async function DashboardPage() {
  const { stats, needsReply, handledByAi } = await getOverviewData();

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#14171F] px-12 py-9 max-w-[1100px]">
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1.5">Overview</h1>
        <p className="text-[14.5px] text-[#55596A] max-w-[60ch]">
          How your customers are being helped, in their own language, across every conversation today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-px bg-[#E3E4E0] border border-[#E3E4E0] rounded-[10px] overflow-hidden mb-10">
        <StatCell value={stats.openConversations} label="Open conversations" />
        <StatCell value={stats.languagesThisWeek} label="Languages this week" />
        <StatCell value={`${Math.round(stats.aiAnsweredRate * 100)}%`} label="Answered by AI, no wait" />
        <StatCell value={`${stats.avgReplySeconds}s`} label="Average reply time" mono />
      </div>

      {/* Needs reply */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[15px] font-semibold">
            Needs your reply <span className="text-[#B4690E]">({needsReply.length})</span>
          </h2>
          <a href="/dashboard/conversations" className="text-[13px] font-medium text-[#0F6E5C] no-underline">
            View all conversations →
          </a>
        </div>
        <ConvoList items={needsReply} />
      </section>

      {/* Handled by AI */}
      <section className="mb-10">
        <h2 className="text-[15px] font-semibold mb-3">Handled by AI today</h2>
        <ConvoList items={handledByAi} />
      </section>

      {/* Sample exchange */}
      <section>
        <h2 className="text-[15px] font-semibold mb-3">How a reply looks to your customer</h2>
        <div className="border border-[#E3E4E0] rounded-[10px] bg-white p-6">
          <div className="max-w-[480px] mb-4">
            <div className="text-xs text-[#55596A] mb-1.5">Customer · French</div>
            <div className="bg-[#F2F2F0] rounded-[10px] px-3.5 py-2.5 text-[14.5px]">
              Bonjour, ma commande est-elle expédiée ?
            </div>
            <div className="text-[13px] text-[#55596A] mt-1.5 pt-1.5 border-t border-dashed border-[#E3E4E0]">
              You see: &quot;Hello, has my order shipped?&quot;
            </div>
          </div>
          <div className="max-w-[480px] ml-auto">
            <div className="text-xs text-[#55596A] mb-1.5">AI, on your behalf · sent in French</div>
            <div className="bg-[#E4F1EE] rounded-[10px] px-3.5 py-2.5 text-[14.5px]">
              Oui ! Votre commande a été expédiée hier et devrait arriver sous 5 à 7 jours ouvrés.
            </div>
            <div className="text-[13px] text-[#55596A] mt-1.5 pt-1.5 border-t border-dashed border-[#E3E4E0]">
              Written in English first: &quot;Yes! Your order shipped yesterday and should arrive within 5–7 business days.&quot;
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCell({ value, label, mono }: { value: string | number; label: string; mono?: boolean }) {
  return (
    <div className="bg-white px-5 py-4">
      <div className={`text-[26px] font-semibold tracking-tight ${mono ? "font-mono" : ""}`}>{value}</div>
      <div className="text-[13px] text-[#55596A] mt-1">{label}</div>
    </div>
  );
}

function ConvoList({ items }: { items: ConversationPreview[] }) {
  return (
    <div className="border border-[#E3E4E0] rounded-[10px] overflow-hidden bg-white">
      {items.map((c, i) => (
        <div
          key={c.phone}
          className={`flex items-center gap-3.5 px-4.5 py-3.5 ${
            i !== items.length - 1 ? "border-b border-[#E3E4E0]" : ""
          } ${c.status === "waiting" ? "border-l-[3px] border-l-[#B4690E]" : "border-l-[3px] border-l-[#0F6E5C]"}`}
        >
          <span className="text-xl leading-none">{c.flag}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{c.phone}</div>
            <div className="text-[13.5px] text-[#55596A] truncate">
              {c.preview}
              {c.resolvedIn ? ` — answered in ${c.resolvedIn}` : ""}
            </div>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
              c.status === "waiting" ? "bg-[#FBEDDD] text-[#B4690E]" : "bg-[#E4F1EE] text-[#0F6E5C]"
            }`}
          >
            {c.status === "waiting" ? "Waiting on you" : "Resolved"}
          </span>
        </div>
      ))}
    </div>
  );
}

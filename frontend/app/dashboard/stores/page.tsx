interface StoreSummary {
  id: string;
  shopifyDomain: string;
  syncStatus: "PENDING" | "SYNCING" | "SYNCED" | "ERROR";
  productCount: number;
}

async function getStores(): Promise<StoreSummary[]> {
  return [{ id: "1", shopifyDomain: "mystore.myshopify.com", syncStatus: "SYNCED", productCount: 128 }];
}

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <div className="p-8 bg-neutral-950 min-h-screen text-neutral-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Connected Stores</h1>
        <a
          href="/api/shopify/connect"
          className="px-4 py-2 text-sm rounded-lg bg-green-600 hover:bg-green-500"
        >
          + Connect Store
        </a>
      </div>

      <div className="space-y-3">
        {stores.map((s) => (
          <div key={s.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">{s.shopifyDomain}</div>
              <div className="text-sm text-neutral-400">{s.productCount} products indexed</div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">
              {s.syncStatus}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

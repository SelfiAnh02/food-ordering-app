import { Package } from "lucide-react";

export default function TopProductsTable({ topProducts = [] }) {
  const fmtMoney = (n) =>
    Number(n).toLocaleString(undefined, { style: "currency", currency: "IDR" });

  const entries = (topProducts || [])
    .map((p) => ({
      name: p.productName ?? p.name ?? "Product",
      qty: Number(p.totalQuantity ?? p.quantity ?? 0),
      revenue: Number(p.totalRevenue ?? p.revenue ?? 0),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const totalRevenue = entries.reduce((s, e) => s + (e.revenue || 0), 0);

  return (
    <div className="rounded-xl border border-amber-300 bg-white p-4 shadow-sm">
      <div className="text-lg font-semibold mb-3 text-amber-800">
        Produk Terlaris
      </div>
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-sm text-gray-500">Tidak ada data</div>
        ) : (
          entries.map(({ name, qty, revenue }) => {
            const pct =
              totalRevenue > 0
                ? Math.round((revenue / totalRevenue) * 1000) / 10
                : 0;
            return (
              <div
                key={`${name}-${qty}-${revenue}`}
                className="flex items-center gap-3"
              >
                <div className="p-2 rounded bg-amber-100 border border-amber-200">
                  <Package size={16} className="text-amber-700" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-amber-800">{name}</span>
                    <span className="text-gray-600">{qty} pcs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-28 text-right text-amber-800">
                      {fmtMoney(revenue)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

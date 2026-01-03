import { AlertTriangle } from "lucide-react";

export default function OutOfStockList({
  products = [],
  lowStockThreshold = 5,
}) {
  const lows = (products || []).filter((p) => {
    const stock = Number(p.stock ?? p.quantity ?? 0);
    return stock <= lowStockThreshold;
  });

  return (
    <div className="rounded-xl border border-amber-300 p-4 shadow-sm bg-white">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-red-500" />
        <div className="text-lg font-semibold text-amber-800">Stok Menipis</div>
      </div>
      <div className="space-y-3">
        {lows.length === 0 ? (
          <p className="text-sm text-gray-500">Semua produk tersedia</p>
        ) : (
          lows.map((p) => {
            const stock = Number(p.stock ?? p.quantity ?? 0);
            const isEmpty = stock <= 0;
            return (
              <div
                key={p._id ?? p.id ?? p.name}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isEmpty
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <span className="font-medium">
                  {p.name ?? p.productName ?? "Product"}
                </span>
                <span
                  className={`text-sm font-bold px-2 py-1 rounded ${
                    isEmpty
                      ? "bg-red-200 text-red-700"
                      : "bg-amber-200 text-amber-700"
                  }`}
                >
                  {isEmpty ? "Habis" : `${stock} pcs`}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { UtensilsCrossed, ShoppingBag, Truck } from "lucide-react";

const LABELS = {
  "dine-in": "Dine-in",
  takeaway: "Takeaway",
  delivery: "Delivery",
};
const ICONS = {
  "dine-in": UtensilsCrossed,
  takeaway: ShoppingBag,
  delivery: Truck,
};

function detectType(order) {
  const t = (
    order?.orderType ??
    order?.__raw?.orderType ??
    order?.__raw?.type ??
    ""
  )
    .toString()
    .toLowerCase();
  if (t.includes("dine")) return "dine-in";
  if (t.includes("take")) return "takeaway";
  if (t.includes("deliv")) return "delivery";
  return "dine-in";
}

export default function OrderTypeSummary({ orders = [] }) {
  const summary = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const type = detectType(o);
      const cur = map.get(type) || { count: 0 };
      cur.count += 1;
      map.set(type, cur);
    });
    return map;
  }, [orders]);

  const totalOrders = orders.length || 0;
  const TYPES = ["delivery", "dine-in", "takeaway"];
  const entries = TYPES.map((k) => ({
    key: k,
    count: summary.get(k)?.count ?? 0,
  }));

  return (
    <div className="rounded-xl border border-amber-300 bg-white p-4 shadow-sm">
      <div className="text-lg font-semibold mb-2 text-amber-800">
        Tipe Pesanan
      </div>
      <div className="space-y-4">
        {entries.map(({ key, count }) => {
          const Icon = ICONS[key] || UtensilsCrossed;
          const label = LABELS[key] || key;
          const pct =
            totalOrders > 0 ? Math.round((count / totalOrders) * 1000) / 10 : 0;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="p-2 rounded bg-amber-100 border border-amber-200">
                <Icon size={16} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-amber-800">{label}</span>
                  <span className="text-gray-600">{pct}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right text-amber-800">
                    {count}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

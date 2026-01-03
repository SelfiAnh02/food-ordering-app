import { useMemo } from "react";
import { BadgeCheck } from "lucide-react";

function revenueOf(o) {
  const payAmt =
    Number(o?.payment?.amount ?? o?.paymentDetails?.amount ?? 0) || 0;
  const total =
    Number(o?.totalPrice ?? o?.totalAmount ?? o?.grandTotal ?? 0) || 0;
  return payAmt > 0 ? payAmt : total;
}

function StatusPill({ status }) {
  const st = (status ?? "").toString().toLowerCase();
  const label = st || "unknown";
  const cls =
    "px-2 py-1 text-xs font-semibold rounded-full bg-amber-200 text-amber-800";
  return <span className={cls}>{label}</span>;
}

export default function RecentOrders({ orders = [] }) {
  const items = useMemo(() => {
    return (orders || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((o) => ({
        id: o._id ?? o.id ?? "-",
        table: o.tableNumber ?? "-",
        status: o.orderStatus ?? o.status ?? "-",
        amount: revenueOf(o),
      }));
  }, [orders]);

  const fmt = (n) =>
    Number(n).toLocaleString(undefined, { style: "currency", currency: "IDR" });

  return (
    <div className="rounded-xl border border-amber-300 bg-white p-4 shadow-sm">
      <div className="text-lg font-semibold mb-2 text-amber-800">
        Recent Orders
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">Tidak ada pesanan</div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              className="flex justify-between items-center p-3 rounded-lg border border-amber-200 bg-amber-50/30"
            >
              <div>
                <div className="text-sm font-medium text-amber-800">
                  Order #{it.id}
                </div>
                <div className="text-xs text-gray-600">Table {it.table}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-amber-700">
                  {fmt(it.amount)}
                </div>
                <StatusPill status={it.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { CreditCard, Wallet, Smartphone, Banknote } from "lucide-react";

function extractPaymentMethod(o) {
  const raw = o?.__raw ?? {};
  return (
    o?.paymentDetails?.method ||
    o?.payment?.method ||
    raw.paymentMethod ||
    raw.payment_method ||
    raw.method ||
    "unknown"
  );
}

export default function SalesByPaymentMethod({ orders = [], products = [] }) {
  const productMap = useMemo(() => {
    const map = {};
    (products || []).forEach((p) => {
      if (!p) return;
      map[String(p._id ?? p.id)] = p;
    });
    return map;
  }, [products]);

  const summary = useMemo(() => {
    const byMethod = new Map();
    (orders || []).forEach((o) => {
      let amt =
        Number(
          o?.totalAmount ?? o?.total ?? o?.totalPrice ?? o?.grandTotal ?? 0
        ) || 0;
      if (!amt) {
        const items = o?.items || o?.orderItems || o?.products || [];
        amt = items.reduce((s, it) => {
          const prod =
            it.product && typeof it.product === "object"
              ? it.product
              : productMap[String(it.product ?? it.productId ?? "")];
          const price =
            Number(
              it.price ?? it.unitPrice ?? it.productPrice ?? prod?.price ?? 0
            ) || 0;
          const qty = Number(it.quantity ?? it.qty ?? 0) || 0;
          return s + price * qty;
        }, 0);
      }
      const method = String(extractPaymentMethod(o)).toLowerCase();
      const cur = byMethod.get(method) || { count: 0, revenue: 0 };
      cur.count += 1;
      cur.revenue += amt;
      byMethod.set(method, cur);
    });
    return byMethod;
  }, [orders, productMap]);

  const totalRevenue = Array.from(summary.values()).reduce(
    (a, v) => a + v.revenue,
    0
  );
  const BASE = ["card", "cash", "qris", "e-wallet"];
  const dynamic = Array.from(summary.entries()).filter(
    ([key]) => !BASE.includes(key)
  );
  const entries = [
    ...BASE.map((key) => ({
      key,
      ...(summary.get(key) || { count: 0, revenue: 0 }),
    })),
    ...dynamic.map(([key, val]) => ({ key, ...val })),
  ].sort((a, b) => b.revenue - a.revenue);

  const fmtMoney = (n) =>
    Number(n).toLocaleString(undefined, { style: "currency", currency: "IDR" });

  const LABELS = {
    cash: "Tunai",
    card: "Kartu",
    qris: "QRIS",
    "e-wallet": "E-Wallet",
  };
  const ICONS = {
    cash: Banknote,
    card: CreditCard,
    qris: Smartphone,
    "e-wallet": Wallet,
  };

  return (
    <div className="rounded-xl border border-amber-300 bg-white p-4 shadow-sm">
      <div className="text-lg font-semibold mb-2 text-amber-800">
        Metode Pembayaran
      </div>
      <div className="space-y-4">
        {entries.map(({ key, count, revenue }) => {
          const Icon = ICONS[key] || Banknote;
          const label = LABELS[key] || key;
          const pct =
            totalRevenue > 0
              ? Math.round((revenue / totalRevenue) * 1000) / 10
              : 0;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="p-2 rounded bg-amber-100 border border-amber-200">
                <Icon size={16} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-amber-800 capitalize">
                    {label}
                  </span>
                  <span className="text-gray-600">{count} orders</span>
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
        })}
      </div>
    </div>
  );
}

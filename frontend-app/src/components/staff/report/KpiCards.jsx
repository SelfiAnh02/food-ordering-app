import {
  DollarSign,
  Receipt,
  ShoppingCart,
  Package,
  TrendingUp,
} from "lucide-react";

function safeNum(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

function orderRevenue(o) {
  const payAmount = safeNum(o?.payment?.amount ?? o?.paymentDetails?.amount);
  const total = safeNum(o?.totalPrice);
  return payAmount > 0 ? payAmount : total;
}

export default function KpiCards({ orders = [] }) {
  const totalOrders = orders.length;
  let units = 0;
  let revenue = 0;

  orders.forEach((o) => {
    revenue += orderRevenue(o);
    (o.items || []).forEach((it) => {
      units += safeNum(it.quantity);
    });
  });

  const aov = totalOrders > 0 ? revenue / totalOrders : 0;
  const itemsPerOrder = totalOrders > 0 ? units / totalOrders : 0;

  const fmtInt = (n) =>
    n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const fmtMoney = (n) =>
    n.toLocaleString(undefined, { style: "currency", currency: "IDR" });
  const fmt2 = (n) => Number(n).toFixed(1);

  const cards = [
    {
      title: "Total Sales",
      value: fmtMoney(revenue),
      icon: DollarSign,
      gradient: "from-amber-50 to-white",
      border: "border-amber-300",
    },
    {
      title: "Total Pesanan",
      value: fmtInt(totalOrders),
      icon: Receipt,
      gradient: "from-amber-50 to-white",
      border: "border-amber-300",
    },
    {
      title: "Unit Terjual",
      value: fmtInt(units),
      icon: ShoppingCart,
      gradient: "from-amber-50 to-white",
      border: "border-amber-300",
    },
    {
      title: "Rata-rata Order",
      value: fmtMoney(aov),
      icon: TrendingUp,
      gradient: "from-amber-50 to-white",
      border: "border-amber-300",
    },
    {
      title: "Item/Order",
      value: fmt2(itemsPerOrder),
      icon: Package,
      gradient: "from-amber-50 to-white",
      border: "border-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className={`rounded-xl border ${c.border} p-5 shadow-sm bg-gradient-to-br ${c.gradient} transition-all duration-400 hover:from-amber-200 hover:to-amber-50 hover:shadow-2xl hover:scale-[1.015] cursor-pointer group`}
            tabIndex={0}
            role="button"
            aria-label={c.title}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber-100 group-hover:bg-amber-300 transition-colors">
                <Icon className="w-5 h-5 text-amber-600 group-hover:text-amber-800" />
              </div>
              <span className="text-sm text-amber-800 group-hover:text-amber-900 transition-colors">
                {c.title}
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-700 group-hover:text-amber-900 transition-colors">
              {c.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

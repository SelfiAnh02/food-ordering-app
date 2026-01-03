// src/components/admin/OrderStatsCard.jsx
import { formatPrice } from "../../../utils/orderUtils";
import { DollarSign, Receipt, CheckCircle } from "lucide-react";

export default function OrderStatsCard({ stats }) {
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? stats?.totalCompletedOrders ?? 0;
  const byStatus = stats?.byStatus ?? [];
  const deliveredObj = byStatus.find(
    (b) => (b._id ?? b.status ?? "").toString() === "confirmed"
  ) || { count: 0 };

  const cards = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      Icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: totalOrders,
      Icon: Receipt,
    },
    {
      title: "Current Orders",
      value: deliveredObj.count ?? 0,
      Icon: CheckCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
      {cards.map((c) => (
        <div
          key={c.title}
          className="rounded-xl border border-amber-300 p-5 shadow-sm bg-gradient-to-br from-amber-50 to-white transition-all duration-400 hover:from-amber-200 hover:to-amber-50 hover:shadow-2xl hover:scale-[1.015] cursor-pointer group"
          tabIndex={0}
          role="button"
          aria-label={c.title}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-100 group-hover:bg-amber-300 transition-colors">
              <c.Icon className="w-5 h-5 text-amber-600 group-hover:text-amber-800" />
            </div>
            <span className="text-sm text-amber-800 group-hover:text-amber-900 transition-colors">
              {c.title}
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-700 group-hover:text-amber-900 transition-colors">
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

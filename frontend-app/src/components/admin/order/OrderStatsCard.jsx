// src/components/admin/OrderStatsCard.jsx
import { formatPrice } from "../../../utils/orderUtils";

export default function OrderStatsCard({ stats }) {
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? stats?.totalCompletedOrders ?? 0;
  const byStatus = stats?.byStatus ?? [];
  const deliveredObj = byStatus.find(
    (b) => (b._id ?? b.status ?? "").toString() === "confirmed"
  ) || { count: 0 };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
      <div className="panel p-4 rounded-lg bg-white border border-amber-400">
        <div className="text-sm text-amber-800">Total Revenue</div>
        <div className="text-xl font-semibold text-amber-600 mt-2">
          {formatPrice(totalRevenue)}
        </div>
      </div>
      <div className="panel p-4 rounded-lg bg-white border border-amber-400">
        <div className="text-sm text-amber-800">Total Orders</div>
        <div className="text-xl font-semibold text-amber-600 mt-2">
          {totalOrders}
        </div>
      </div>

      <div className="panel p-4 rounded-lg bg-white border border-amber-400 shadow-amber-300">
        <div className="text-sm text-amber-800">Current Orders</div>
        <div className="text-xl font-semibold text-amber-600 mt-2">
          {deliveredObj.count ?? 0}
        </div>
      </div>
    </div>
  );
}

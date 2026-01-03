import { useMemo } from "react";
import KpiCardsDashboard from "../../components/admin/dashboard/KpiCardsDashboard";
import WeeklyRevenueChart from "../../components/admin/dashboard/WeeklyRevenueChart";
import RecentOrders from "../../components/admin/dashboard/RecentOrders";
import OrderTypeSummary from "../../components/admin/report/OrderTypeSummary";
import useOrderAdmin from "../../hooks/admin/useOrderAdmin";
import useProducts from "../../hooks/admin/useProducts";
import useCategories from "../../hooks/admin/useCategories";
import useUsers from "../../hooks/admin/useUsers";

function monthBounds(d = new Date()) {
  const y = d.getFullYear();
  const m = d.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  const fmt = (x) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(
      x.getDate()
    ).padStart(2, "0")}`;
  return { startKey: fmt(start), endKey: fmt(end) };
}

export default function Dashboard() {
  const { startKey, endKey } = monthBounds();

  // Load orders for current month (large limit to cover month)
  const { orders, setFilters } = useOrderAdmin({
    limit: 1000,
    startDate: startKey,
    endDate: endKey,
  });
  // Ensure filters applied once on mount (in case hook ignores initial)
  useMemo(() => {
    setFilters((prev) => ({
      ...prev,
      startDate: startKey,
      endDate: endKey,
      limit: 1000,
    }));
  }, [setFilters, startKey, endKey]);

  const { totalItems: productsTotal } = useProducts({ initialLimit: 1 });
  const { categories } = useCategories();
  const { users } = useUsers();

  // compute monthly totals from orders
  const aggregates = useMemo(() => {
    const totalOrders = (orders || []).length;
    const totalRevenue = (orders || []).reduce((s, o) => {
      const payAmt =
        Number(o?.payment?.amount ?? o?.paymentDetails?.amount ?? 0) || 0;
      const total =
        Number(o?.totalPrice ?? o?.totalAmount ?? o?.grandTotal ?? 0) || 0;
      return s + (payAmt > 0 ? payAmt : total);
    }, 0);
    return { totalOrders, totalRevenue };
  }, [orders]);

  return (
    <div className="w-full p-4 pt-6 space-y-4 bg-white rounded-lg shadow-sm border border-amber-200 shadow-amber-300">
      <div className="space-y-6">
        {/* KPI */}
        <KpiCardsDashboard
          usersCount={(users || []).length}
          productsCount={Number(productsTotal || 0)}
          categoriesCount={(categories || []).length}
          monthlyOrders={aggregates.totalOrders}
          monthlyRevenue={aggregates.totalRevenue}
        />

        {/* Two columns (wider chart) + order type summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <WeeklyRevenueChart orders={orders} />
          </div>
          <OrderTypeSummary orders={orders} />
        </div>

        {/* Recent orders full width below */}
        <RecentOrders orders={orders} />
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import useOrderAdmin from "../../hooks/admin/useOrderAdmin";
import useProducts from "../../hooks/admin/useProducts";
import MonthFilter from "../../components/admin/report/MonthFilter";
import KpiCards from "../../components/admin/report/KpiCards";
import RevenueByDayChart from "../../components/admin/report/RevenueByDayChart";
import SalesByPaymentMethod from "../../components/admin/report/SalesByPaymentMethod";
import OrderTypeSummary from "../../components/admin/report/OrderTypeSummary";
import TopProductsTable from "../../components/admin/report/TopProductsTable";
import OutOfStockList from "../../components/admin/report/OutOfStockList";
import SummaryStats from "../../components/admin/report/SummaryStats";

function getInitialMonth() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthBounds(yyyymm) {
  const [yStr, mStr] = (yyyymm || "").split("-");
  const y = Number(yStr);
  const m = Number(mStr) - 1;
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  const fmt = (d) => {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };
  return { startDate: fmt(start), endDate: fmt(end) };
}

export default function Reports() {
  const [month, setMonth] = useState(getInitialMonth());
  const { startDate, endDate } = useMemo(() => monthBounds(month), [month]);

  const {
    orders,
    loadingOrders,
    filters,
    setFilters,
    fetchOrders,
    topProducts,
  } = useOrderAdmin({ startDate, endDate });

  const { products } = useProducts({ initialPage: 1, initialLimit: 100 });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, startDate, endDate }));
    // Fetch will run automatically due to filters effect; but we call explicitly for freshness.
    fetchOrders({ ...filters, startDate, endDate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const handleMonthChange = ({ month: m, startDate: s, endDate: e }) => {
    if (m) setMonth(m);
    setFilters((prev) => ({ ...prev, startDate: s, endDate: e }));
    fetchOrders({ ...filters, startDate: s, endDate: e });
  };

  // Aggregate for Summary
  const aggregates = useMemo(() => {
    const safeNum = (v) => {
      const n = Number(v);
      return isFinite(n) ? n : 0;
    };
    const revenueOf = (o) => {
      const payAmount = safeNum(
        o?.payment?.amount ?? o?.paymentDetails?.amount
      );
      const total = safeNum(o?.totalPrice);
      return payAmount > 0 ? payAmount : total;
    };
    const totalOrders = orders.length;
    let units = 0;
    let revenue = 0;
    let cancelled = 0;
    orders.forEach((o) => {
      revenue += revenueOf(o);
      (o.items || []).forEach((it) => {
        units += safeNum(it.quantity);
      });
      const st = (o.orderStatus ?? "").toString().toLowerCase();
      if (st.includes("cancel")) cancelled += 1;
    });
    const aov = totalOrders > 0 ? revenue / totalOrders : 0;
    const itemsPerOrder = totalOrders > 0 ? units / totalOrders : 0;
    return { totalOrders, units, revenue, aov, itemsPerOrder, cancelled };
  }, [orders]);

  return (
    <div className="w-full p-4 space-y-4 bg-white rounded-lg shadow-sm border border-amber-200 shadow-amber-300">
      {/* Header with title and month filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1 p-2">
          <div className="text-2xl font-bold text-amber-800">
            Laporan Bulanan
          </div>
          <div className="text-sm text-amber-700">
            Ringkasan operasional cafe bulan ini
          </div>
        </div>
        <MonthFilter month={month} onChange={handleMonthChange} showNav />
      </div>

      {loadingOrders ? (
        <div className="rounded border bg-white p-6 text-center">
          Loading data…
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <KpiCards orders={orders} />

          {/* Revenue Chart */}
          <RevenueByDayChart orders={orders} month={month} />

          {/* Methods (left) + Top Products (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SalesByPaymentMethod orders={orders} products={products} />
            <TopProductsTable topProducts={topProducts} />
          </div>

          {/* Order Type (left) & Out of Stock (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <OrderTypeSummary orders={orders} />
            </div>
            <OutOfStockList products={products} lowStockThreshold={5} />
          </div>

          {/* Summary */}
          <SummaryStats
            totalOrders={aggregates.totalOrders}
            totalRevenue={aggregates.revenue}
            cancelledOrders={aggregates.cancelled}
            avgOrderValue={aggregates.aov}
          />
        </>
      )}
    </div>
  );
}

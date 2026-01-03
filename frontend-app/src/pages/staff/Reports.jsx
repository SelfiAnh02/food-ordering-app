import { useEffect, useMemo, useState } from "react";
import useOrderStaff from "../../hooks/staff/useOrderStaff";
import useProducts from "../../hooks/staff/useProducts";
import DayFilter from "../../components/staff/report/DayFilter";
import KpiCards from "../../components/staff/report/KpiCards";
import SalesByPaymentMethod from "../../components/staff/report/SalesByPaymentMethod";
import OrderTypeSummary from "../../components/staff/report/OrderTypeSummary";
import TopProductsTable from "../../components/staff/report/TopProductsTable";
import OutOfStockList from "../../components/staff/report/OutOfStockList";
import SummaryStats from "../../components/staff/report/SummaryStats";

function Reports() {
  function getInitialDate() {
    return new Date().toISOString().slice(0, 10);
  }

  const [date, setDate] = useState(getInitialDate());

  // Pakai hooks admin
  const {
    orders,
    loadingOrders,
    fetchOrders,
    filters,
    setFilters,
    topProducts: adminTopProducts,
  } = useOrderStaff();
  const { products } = useProducts({ initialPage: 1, initialLimit: 100 });

  // Fetch orders when day changes: update filters (admin hook will react)
  useEffect(() => {
    const s = date;
    const e = date;
    setFilters((prev) => ({ ...prev, startDate: s, endDate: e }));
    // also trigger explicit fetch to be immediate
    fetchOrders({ ...filters, startDate: s, endDate: e });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Filter orders by selected day
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((o) => {
      const t = o.createdAt || o.created_at || o.date || o.created;
      if (!t) return false;
      const od = new Date(t);
      // Cocokkan tanggal persis (YYYY-MM-DD)
      return od.toISOString().slice(0, 10) === date;
    });
  }, [orders, date]);

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
    const totalOrders = filteredOrders.length;
    let units = 0;
    let revenue = 0;
    let cancelled = 0;
    filteredOrders.forEach((o) => {
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
  }, [filteredOrders]);

  // Top products aggregation (match admin: sort by revenue, then qty, then name, take top 8)
  const topProducts = useMemo(() => {
    const map = {};
    filteredOrders.forEach((order) => {
      const uniqueProducts = new Set();
      (order.items || []).forEach((item) => {
        const name =
          item.productName ||
          item.name ||
          (item.product && item.product.name) ||
          "Product";
        // Ambil harga dari beberapa kemungkinan field
        const qty = Number(item.quantity || 0);
        const price =
          Number(item.price) ||
          Number(item.unitPrice) ||
          (item.product && Number(item.product.price)) ||
          Number(item.subtotal) / (qty || 1) ||
          0;
        const revenue = price * qty;
        if (!map[name])
          map[name] = {
            productName: name,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0,
          };
        map[name].totalQuantity += qty;
        map[name].totalRevenue += revenue;
        uniqueProducts.add(name);
      });
      // Tambahkan orderCount hanya sekali per produk per order
      uniqueProducts.forEach((name) => {
        if (map[name]) map[name].orderCount += 1;
      });
    });
    // Urutkan: revenue desc, qty desc, name asc, ambil 8 teratas
    return Object.values(map)
      .sort((a, b) =>
        b.totalRevenue !== a.totalRevenue
          ? b.totalRevenue - a.totalRevenue
          : b.totalQuantity !== a.totalQuantity
          ? b.totalQuantity - a.totalQuantity
          : (a.productName || "").localeCompare(b.productName || "")
      )
      .slice(0, 8);
  }, [filteredOrders]);

  const handleDayChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <div className="w-full p-4 space-y-4 bg-white rounded-lg shadow-sm border border-amber-200 shadow-amber-300">
      {/* Header with title and day filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1 p-2">
          <div className="text-2xl font-bold text-amber-800">
            Laporan Harian
          </div>
          <div className="text-sm text-amber-700">
            Ringkasan operasional cafe hari ini
          </div>
        </div>
        <DayFilter date={date} onChange={handleDayChange} />
      </div>

      {loadingOrders ? (
        <div className="rounded border bg-white p-6 text-center">
          Loading data…
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <KpiCards orders={filteredOrders} />

          {/* Methods (left) + Top Products (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SalesByPaymentMethod orders={filteredOrders} products={products} />
            <TopProductsTable
              topProducts={
                adminTopProducts && adminTopProducts.length
                  ? adminTopProducts
                  : topProducts
              }
            />
          </div>

          {/* Order Type (left) & Out of Stock (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <OrderTypeSummary orders={filteredOrders} />
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

export default Reports;

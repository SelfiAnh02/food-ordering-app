import { useEffect, useMemo, useState } from "react";
import useOrders from "../../hooks/staff/useOrders";
import useProducts from "../../hooks/staff/useProducts";
import ReportsFilter from "../../components/staff/report/ReportsFilter";
import OrdersTodayCard from "../../components/staff/report/OrdersTodayCard";
import TotalSalesCard from "../../components/staff/report/TotalSalesCard";
import OutOfStockList from "../../components/staff/report/OutOfStockList";
import PaymentMethodSummary from "../../components/staff/report/PaymentMethodSummary";
import OrderTypeSummary from "../../components/staff/report/OrderTypeSummary";
import ProductSoldTable from "../../components/staff/report/ProductSoldTable";

function startOfDay(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function endOfDay(d) {
  const dt = new Date(d);
  dt.setHours(23, 59, 59, 999);
  return dt;
}

export default function Reports() {
  const { orders, loadOrders } = useOrders();
  const { allProducts } = useProducts();

  // single-day filter (header)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    loadOrders().catch(() => {});
  }, [loadOrders]);

  const rangeFiltered = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const fromDt = startOfDay(date);
    const toDt = endOfDay(date);
    return orders.filter((o) => {
      const t = o.createdAt || o.created_at || o.date || o.created;
      if (!t) return false;
      const od = new Date(t);
      return od >= fromDt && od <= toDt;
    });
  }, [orders, date]);

  // count for selected day (kept for future use)
  // const todayCount = rangeFiltered.length;

  const totalSalesForRange = useMemo(() => {
    return (rangeFiltered || []).reduce((acc, o) => {
      const amt =
        Number(o.totalAmount ?? o.total ?? o.totalPrice ?? o.grandTotal ?? 0) ||
        0;
      if (amt) return acc + amt;
      // fallback compute from items
      const items = o.items || o.orderItems || o.products || [];
      const itemsTotal = items.reduce((s, it) => {
        const prod =
          it.product && typeof it.product === "object"
            ? it.product
            : allProducts.find(
                (p) =>
                  String(p._id ?? p.id) ===
                  String(it.product ?? it.productId ?? it.product_id ?? "")
              );
        const price =
          Number(
            it.price ?? it.unitPrice ?? it.productPrice ?? prod?.price ?? 0
          ) || 0;
        const qty = Number(it.quantity ?? it.qty ?? 0) || 0;
        return s + price * qty;
      }, 0);
      return acc + itemsTotal;
    }, 0);
  }, [rangeFiltered, allProducts]);

  return (
    <div className="p-4 rounded-lg shadow-sm border border-amber-200 shadow-amber-300 bg-white h-full overflow-auto">
      <ReportsFilter date={date} onChange={setDate} />

      <div className="flex flex-col md:flex-row md:items-start gap-4 mb-4">
        {/* Left column: stacked cards */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <OrdersTodayCard orders={rangeFiltered} />
          <TotalSalesCard total={totalSalesForRange} />
          <PaymentMethodSummary orders={rangeFiltered} products={allProducts} />
          <OrderTypeSummary orders={rangeFiltered} />
        </div>

        {/* Right column: products sold + out of stock placed side-by-side on md+, stacked on mobile */}
        <div className="w-full md:w-2/3 flex flex-col">
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:flex-[3]">
              <ProductSoldTable orders={rangeFiltered} products={allProducts} />
            </div>
            <div className="w-full md:w-64">
              <OutOfStockList products={allProducts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

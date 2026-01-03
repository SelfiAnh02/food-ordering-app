// src/pages/admin/OrdersPage.jsx
import { useEffect } from "react";
import useOrderAdmin from "../../hooks/admin/useOrderAdmin.js";
import OrderFilter from "../../components/admin/order/OrderFilter.jsx";
import OrderStatsCard from "../../components/admin/order/OrderStatsCard.jsx";
import OrderTopProducts from "../../components/admin/order/OrderTopProducts.jsx";
import OrderTableAdmin from "../../components/admin/order/OrderTableAdmin.jsx";
// Use the staff order detail modal so admin sees the same detail layout
import OrderDetailModal from "../../components/admin/order/OrderDetailModal";

export default function OrdersPage() {
  const {
    orders,
    stats,
    topProducts,
    filters,
    loadingOrders,
    setFilters,
    fetchOrders,
    selectedOrder,
    openOrderDetail,
    closeOrderDetail,
    error,
  } = useOrderAdmin();

  // Apply filters: merge, reset to page 1, set state and request immediately
  const applyFilters = (f) => {
    const updated = { ...filters, ...f, page: 1 };
    setFilters(updated);
    // call fetchOrders with updated params so the request uses them immediately
    fetchOrders(updated);
  };

  // On first mount ensure default table shows today's orders and 10 per page
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const needsDate = !filters?.startDate && !filters?.endDate;
    const needsLimit = Number(filters?.limit) !== 10;
    if (needsDate || needsLimit) {
      const payload = {};
      if (needsDate) {
        payload.startDate = today;
        payload.endDate = today;
      }
      if (needsLimit) payload.limit = 10;
      const updated = { ...filters, ...payload, page: 1 };
      setFilters(updated);
      fetchOrders(updated);
    }
  }, [filters, setFilters, fetchOrders]);

  // Change page: update filters and fetch
  const handlePageChange = (page) => {
    const updated = { ...filters, page };
    setFilters(updated);
    fetchOrders(updated);
  };

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm border border-amber-200 shadow-amber-300 overflow-visible lg:overflow-hidden min-h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-4rem)]">
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex flex-col min-h-0 overflow-visible lg:overflow-hidden">
        {/* Stats — will show fallback values if loading or stats null */}
        <OrderStatsCard stats={stats} />

        {/* Layout utama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: filter + table (table area scrolls on lg) */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex flex-col min-h-0 lg:max-h-[65vh] lg:overflow-hidden lg:flex lg:flex-col">
              <div>
                <OrderFilter
                  initial={{
                    orderStatus: filters.orderStatus,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                  }}
                  onApply={applyFilters}
                />
              </div>

              <div className="w-full min-h-0 overflow-visible lg:flex-1 lg:overflow-auto hide-scrollbar">
                <div className="pt-4 w-full overflow-x-auto lg:overflow-x-visible">
                  <OrderTableAdmin
                    orders={orders}
                    loading={loadingOrders}
                    page={filters?.page ?? 1}
                    limit={filters?.limit ?? 20}
                    totalPages={filters?.totalPages ?? 1}
                    onPageChange={handlePageChange}
                    onView={(id) => openOrderDetail(id)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column: top products (scrollable on lg) */}
          <div className="lg:col-span-1">
            <div className="min-h-0 lg:max-h-[65vh] lg:overflow-auto overflow-visible hide-scrollbar">
              <OrderTopProducts
                topProducts={topProducts ?? stats?.topProducts ?? []}
              />
            </div>
          </div>
        </div>

        {/* Error display (simple) */}
        {error && (
          <div className="mt-4 text-sm text-red-600">
            Error loading orders: {error.message ?? String(error)}
          </div>
        )}

        {/* Modal detail */}
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            open={!!selectedOrder}
            onClose={closeOrderDetail}
          />
        )}
      </div>
    </div>
  );
}

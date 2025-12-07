// src/pages/admin/OrdersPage.jsx
import useOrderAdmin from "../../hooks/admin/useOrderAdmin.js";
import OrderFilter from "../../components/admin/order/OrderFilter.jsx";
import OrderStatsCard from "../../components/admin/order/OrderStatsCard.jsx";
import OrderTopProducts from "../../components/admin/order/OrderTopProducts.jsx";
import OrderTableAdmin from "../../components/admin/order/OrderTableAdmin.jsx";
import OrderDetailModal from "../../components/admin/order/OrderDetailModal.jsx";

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

  // Change page: update filters and fetch
  const handlePageChange = (page) => {
    const updated = { ...filters, page };
    setFilters(updated);
    fetchOrders(updated);
  };

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-4 sm:p-6">
        {/* Stats — will show fallback values if loading or stats null */}
        <OrderStatsCard stats={stats} />

        {/* Layout utama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: filter + table */}
          <div className="lg:col-span-2 space-y-4">
            <OrderFilter
              initial={{
                orderStatus: filters.orderStatus,
                startDate: filters.startDate,
                endDate: filters.endDate,
              }}
              onApply={applyFilters}
            />

            <div className="w-full overflow-x-auto lg:overflow-x-visible">
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

          {/* Right column: top products */}
          <div className="lg:col-span-1">
            {/* prefer hook-provided topProducts (hook computes fallback from orders) */}
            <OrderTopProducts
              topProducts={topProducts ?? stats?.topProducts ?? []}
            />
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

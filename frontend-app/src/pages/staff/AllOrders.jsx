// src/pages/staff/AllOrders.jsx
import React, { useEffect, useMemo, useState } from "react";
import useOrders from "../../hooks/staff/useOrders";
import OrderCard from "../../components/staff/order/OrderCard";
import OrderDetailModal from "../../components/staff/order/OrderDetailModal";

export default function AllOrders() {
  const { orders, loadOrders, loadOrderDetail, updateStatus, loading, error } =
    useOrders();

  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    loadOrders().catch(() => {});
  }, [loadOrders]);

  const filtered = useMemo(() => {
    return (orders || []).filter((o) => {
      const statusLocal = ((o.orderStatus ?? o.status) || "")
        .toString()
        .toLowerCase();
      // By default (no filterStatus selected) hide completed/delivered orders
      if (!filterStatus && statusLocal === "delivered") return false;
      const q = (query || "").trim().toLowerCase();
      if (q) {
        const idMatch = String(o._id ?? o.id ?? "")
          .toLowerCase()
          .includes(q);
        const cust = (o.customerName ?? o.customer ?? "")
          .toString()
          .toLowerCase();
        const custMatch = cust.includes(q);
        const productMatch =
          Array.isArray(o.items) &&
          o.items.some((it) => {
            const p = it.product ?? it;
            const name = (p?.name ?? p?.productName ?? it?.name ?? "")
              .toString()
              .toLowerCase();
            return name.includes(q);
          });
        if (!(idMatch || custMatch || productMatch)) return false;
      }
      if (filterType) {
        if (
          ((o.orderType ?? o.type) || "").toString().toLowerCase() !==
          filterType
        )
          return false;
      }
      if (filterStatus) {
        if (
          ((o.orderStatus ?? o.status) || "").toString().toLowerCase() !==
          filterStatus
        )
          return false;
      }
      return true;
    });
  }, [orders, query, filterType, filterStatus]);

  function openDetail(o) {
    setSelectedOrder(o);
    setDetailOpen(true);
  }

  async function handleUpdateStatus(orderId, newStatus) {
    try {
      // normalize payload to { status }
      await updateStatus(
        orderId,
        typeof newStatus === "string" ? { status: newStatus } : newStatus
      );
      const fresh = await loadOrderDetail(orderId);
      setSelectedOrder(fresh || selectedOrder);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  }

  return (
    <div className="p-2 rounded-lg bg-white h-full overflow-auto">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4 ">
        <input
          placeholder="Search by id, customer, or product..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border rounded-xl px-3 py-2 min-w-0"
        />

        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-xl px-2 py-2"
          >
            <option value="">All Types</option>
            <option value="dine-in">Dine-In</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-xl px-2 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Menunggu</option>
            <option value="confirmed">Sedang Diproses</option>
            <option value="delivered">Sudah Selesai</option>
          </select>

          <button
            onClick={() => {
              setQuery("");
              setFilterType("");
              setFilterStatus("");
            }}
            className="px-3 py-2 border rounded-xl bg-amber-600 text-white hover:bg-amber-700"
          >
            Reset
          </button>
        </div>
      </div>
      {loading && (
        <div className="text-sm text-gray-500 mb-3">Loading orders...</div>
      )}
      {error && (
        <div className="text-sm text-red-500 mb-3">
          Error: {error?.message ?? "Failed"}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {filtered.length ? (
          filtered.map((o) => (
            <div key={o._id ?? o.id} className="w-full h-full">
              <OrderCard
                order={o}
                timeAgo={
                  o.createdAt
                    ? new Date(o.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"
                }
                onOpenDetail={openDetail}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500">No orders found</div>
        )}
      </div>
      <OrderDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
        loadOrderDetail={loadOrderDetail}
      />
    </div>
  );
}

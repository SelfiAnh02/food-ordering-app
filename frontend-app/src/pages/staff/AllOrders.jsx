import React, { useEffect, useMemo, useRef, useState } from "react";
import useOrders from "../../hooks/staff/useOrders";
import { pusher } from "../../utils/pusher";
import OrderCard from "../../components/staff/order/OrderCard";
import OrderDetailModal from "../../components/staff/order/OrderDetailModal";
import usePushNotification from "../../hooks/usePushNotification";

const NOTIF_SOUND = "/notification.mp3";

export default function AllOrders() {
  const { orders, loadOrders, loadOrderDetail, updateStatus, loading, error } =
    useOrders();
  const lastCustomerOrderIdRef = useRef(null);
  const audioRef = useRef(null);
  const [userInteracted, setUserInteracted] = useState(false);
  useEffect(() => {
    const handler = () => setUserInteracted(true);
    window.addEventListener("click", handler, { once: true });
    return () => window.removeEventListener("click", handler);
  }, []);

  // Integrasi push notification (FCM)
  usePushNotification(() => {
    // Tampilkan notifikasi toast atau suara jika ingin
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  });

  // Subscribe to Pusher for real-time order notifications
  useEffect(() => {
    const channel = pusher.subscribe("staff-orders");
    const handler = () => {
      if (userInteracted && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      loadOrders();
    };
    channel.bind("order-updated", handler);
    return () => {
      channel.unbind("order-updated", handler);
      channel.unsubscribe();
    };
  }, [userInteracted, loadOrders]);

  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Initialize orders and last customer order id on first mount
  useEffect(() => {
    loadOrders()
      .then(() => {
        const currentOrders = orders || [];
        const customerOrders = currentOrders
          .filter(
            (o) =>
              (o.source ?? o.orderSource ?? "customer")
                .toString()
                .toLowerCase() === "customer"
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? b.created_at ?? 0) -
              new Date(a.createdAt ?? a.created_at ?? 0)
          );
        const latestId =
          customerOrders[0]?._id ?? customerOrders[0]?.id ?? null;
        lastCustomerOrderIdRef.current = latestId;
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadOrders]);

  // Polling to reflect new customer-paid orders that arrive via webhook
  useEffect(() => {
    const id = setInterval(async () => {
      // prevCustomerOrders removed (was unused)
      // prevLatestId removed (was unused)

      await loadOrders();
      setTimeout(() => {
        const newOrders = orders || [];
        const newCustomerOrders = newOrders
          .filter(
            (o) =>
              (o.source ?? o.orderSource ?? "customer")
                .toString()
                .toLowerCase() === "customer"
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? b.created_at ?? 0) -
              new Date(a.createdAt ?? a.created_at ?? 0)
          );
        const newLatestId =
          newCustomerOrders[0]?._id ?? newCustomerOrders[0]?.id ?? null;
        if (
          userInteracted &&
          newLatestId &&
          newLatestId !== lastCustomerOrderIdRef.current &&
          lastCustomerOrderIdRef.current !== null
        ) {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }
        lastCustomerOrderIdRef.current = newLatestId;
      }, 100);
    }, 5000);
    return () => clearInterval(id);
  }, [loadOrders, orders, userInteracted]);

  const filtered = useMemo(() => {
    return (orders || []).filter((o) => {
      if (date) {
        const created = new Date(
          o.createdAt ?? o.created_at ?? o.created ?? null
        );
        if (isNaN(created)) return false;
        const d = created.toISOString().slice(0, 10);
        if (d !== date) return false;
      }
      const statusLocal = ((o.orderStatus ?? o.status) || "")
        .toString()
        .toLowerCase();
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
  }, [orders, query, filterType, filterStatus, date]);

  function openDetail(o) {
    setSelectedOrder(o);
    setDetailOpen(true);
  }

  async function handleUpdateStatus(orderId, newStatus) {
    try {
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
    <div className="p-4 rounded-lg shadow-sm border border-amber-200 shadow-amber-300 bg-white h-full overflow-auto">
      {/* Audio element for notification */}
      <audio ref={audioRef} src={NOTIF_SOUND} preload="auto" />
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <input
          placeholder="Search by id, customer, or product..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:flex-1 border border-amber-400 text-sm text-amber-800 rounded-xl px-3 py-2 min-w-0"
        />

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-amber-400 text-amber-800 text-sm rounded-xl px-2 py-2"
            aria-label="Filter date"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto border border-amber-400 text-sm text-amber-800 rounded-xl px-2 py-2"
          >
            <option value="">All Types</option>
            <option value="dine-in">Dine-In</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto border border-amber-400 text-sm text-amber-800 rounded-xl px-2 py-2"
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
              setDate(() => new Date().toISOString().slice(0, 10));
            }}
            className="w-full sm:w-auto px-3 py-2 border border-amber-400 rounded-xl bg-amber-600 text-sm text-white hover:bg-amber-700"
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
// ...existing code...

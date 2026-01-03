// src/pages/customer/MyOrder.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useOrders from "../../hooks/customer/useOrders.jsx";
import OrderCard from "../../components/customer/order.jsx/OrderCard.jsx";
import OrderDetailModal from "../../components/customer/order.jsx/OrderDetailModal.jsx";
import BottomNavbar from "../../components/customer/BottomNavbar.jsx";
import useCartCustomer from "../../hooks/customer/useCartCustomer.jsx";
import { finalizeOrder as finalizeCustomerOrder } from "../../services/customer/orderService";

export default function MyOrder() {
  const { orders, loadMyOrders, loadOrderDetail, loading, error } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    items,
    getOrderMeta,
    clearCart,
    clearOrderMeta,
    getLastIntent,
    clearLastIntent,
  } = useCartCustomer();

  const cartCount = useMemo(() => {
    return items.reduce((acc, i) => acc + (Number(i.qty) || 0), 0);
  }, [items]);

  // Validate tableNumber in URL (optional banner), allowed 1..15
  const params = new URLSearchParams(location.search || "");
  const tableFromUrl = params.get("table") || params.get("tableNumber") || "";
  const searchRaw = (location.search || "").toLowerCase();
  const tableKeyPresent =
    /[?&](tablenumber|table)\b/i.test(location.search || "") ||
    searchRaw.includes("tablenumber") ||
    searchRaw.includes("&table=") ||
    searchRaw.includes("?table=");
  const allowedTables = useMemo(
    () => new Set(Array.from({ length: 15 }, (_, i) => String(i + 1))),
    []
  );
  const isTableParamPresent = !!tableFromUrl || tableKeyPresent;
  const isValidTable =
    !isTableParamPresent || allowedTables.has(String(tableFromUrl));

  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    let tableNumber = qs.get("tableNumber");
    if (!tableNumber) {
      const meta = typeof getOrderMeta === "function" ? getOrderMeta() : {};
      if (meta && meta.tableNumber) tableNumber = String(meta.tableNumber);
    }
    // Only call API if we have a tableNumber per backend requirement
    if (tableNumber) {
      loadMyOrders(tableNumber).catch(() => {});
    }
  }, [location.search, loadMyOrders, getOrderMeta]);

  // Attempt recovery/finalization when returning from Midtrans app/site
  useEffect(() => {
    (async () => {
      try {
        const last =
          typeof getLastIntent === "function" ? getLastIntent() : null;
        if (!last) return;
        const id = last.paymentId || last.id;
        if (!id) return;
        await finalizeCustomerOrder(id);
        try {
          // Ensure cart clean; meta cleared later based on active orders
          clearCart?.();
        } catch {
          /* no-op */
        }
        clearLastIntent?.();
        const qs = new URLSearchParams(location.search);
        const t =
          qs.get("table") || qs.get("tableNumber") || last.tableNumber || "";
        if (t) {
          await loadMyOrders(t);
        }
      } catch {
        /* ignore; webhook may complete later */
      }
    })();
  }, [
    location.search,
    getLastIntent,
    clearLastIntent,
    clearCart,
    loadMyOrders,
  ]);

  // Clear customer name/whatsapp meta when there are no active (pending/confirmed) orders
  useEffect(() => {
    try {
      // Do not clear while loading; wait until orders have been fetched
      if (loading) return;
      const hasActive = Array.isArray(orders)
        ? orders.some((o) => {
            const st = (o.orderStatus ?? o.status ?? "")
              .toString()
              .toLowerCase();
            return st === "pending" || st === "confirmed";
          })
        : false;
      if (!hasActive) {
        // When no active orders remain, clear customer meta and cart
        clearOrderMeta?.();
      }
    } catch (e) {
      void e;
    }
  }, [orders, loading, clearOrderMeta, clearCart]);

  function openDetail(order) {
    setSelectedOrder(order);
    setDetailOpen(true);
  }

  function handlePayNow(order) {
    try {
      const url = order?.paymentUrl || order?.payment?.paymentUrl || null;
      if (!url) return;
      // Open Midtrans payment page to resume/inspect payment
      window.open(url, "_blank");
    } catch {
      /* no-op */
    }
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* Fixed header (match Cart style) */}
      <div className="fixed left-0 right-0 top-0 z-20 bg-white shadow-sm border-b border-amber-400 rounded-xl sm:rounded-xl">
        <div className="px-4 py-4 lg:max-w-5xl lg:mx-auto">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-amber-800">
              Pesanan Saya
            </h2>
          </div>
        </div>
      </div>

      {/* Spacer equal to header height so content starts below it */}
      <div className="h-[64px]" />

      {/* Orders list container */}
      <div className="px-4 sm:px-4 pt-2 lg:max-w-5xl lg:mx-auto rounded-lg bg-white flex-1 pb-[88px]">
        {isTableParamPresent && !isValidTable && (
          <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2 mb-3">
            Nomor meja tidak valid. Silakan scan QR resmi di meja.
          </div>
        )}
        {!location.search && !getOrderMeta()?.tableNumber && (
          <div className="text-sm text-red-500 mb-3">
            Error: tableNumber is required
          </div>
        )}
        {loading && (
          <div className="text-sm text-gray-500 mb-3">Memuat pesanan...</div>
        )}
        {error && (
          <div className="text-sm text-red-500 mb-3">
            Error: {error?.message ?? "Gagal memuat"}
          </div>
        )}

        {/* Hide completed/delivered orders; show only pending/confirmed */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 flex-1">
          {(orders || []).filter((o) => {
            const st = (o.orderStatus ?? o.status ?? "")
              .toString()
              .toLowerCase();
            return st === "pending" || st === "confirmed";
          }).length
            ? (orders || [])
                .filter((o) => {
                  const st = (o.orderStatus ?? o.status ?? "")
                    .toString()
                    .toLowerCase();
                  return st === "pending" || st === "confirmed";
                })
                .map((o) => (
                  <OrderCard
                    key={o._id ?? o.id}
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
                    onPayNow={handlePayNow}
                  />
                ))
            : !loading && (
                <div className="text-sm text-gray-500">Belum ada pesanan</div>
              )}
        </div>
      </div>

      {/* Detail modal */}
      <OrderDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        order={selectedOrder}
        loadOrderDetail={loadOrderDetail}
      />

      {/* Bottom navbar (standalone page) */}
      <BottomNavbar
        active="orders"
        cartCount={cartCount}
        onHome={() =>
          navigate(`/customer${location.search ? location.search : ""}`)
        }
        onCart={() =>
          navigate(`/customer/cart${location.search ? location.search : ""}`)
        }
        onOrders={() =>
          navigate(`/customer/orders${location.search ? location.search : ""}`)
        }
      />
    </div>
  );
}

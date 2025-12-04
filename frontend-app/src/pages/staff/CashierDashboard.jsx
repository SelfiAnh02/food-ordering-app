import { useEffect, useCallback, useState } from "react";
import useProducts from "../../hooks/staff/useProducts";
import useCart from "../../hooks/staff/useCart";

import CategoryTabs from "../../components/staff/cashier/CategoryTabs";
import ProductList from "../../components/staff/cashier/ProductList";
import Cart from "../../components/staff/cashier/Cart";
import PaymentMethodModal from "../../components/staff/cashier/PaymentMethodModal";

import { createOrder } from "../../services/staff/orderService";

export default function CashierDashboard() {
  const {
    products,
    categories,
    activeCategory,
    setActiveCategory,
    loading,
    refreshProducts,
  } = useProducts();

  const {
    items,
    addToCart,
    decreaseQty,
    increaseQty,
    removeItem,
    clearCart,
    total,
    updateItemNotes,
  } = useCart();

  const [submitting, setSubmitting] = useState(false);

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Keep last orderType & tableNumber (set by Cart when requestPayment called)
  const [orderTypeState, setOrderTypeState] = useState(""); // e.g. "dine-in", "takeaway"
  const [tableNumberState, setTableNumberState] = useState("");

  useEffect(() => {
    if (!activeCategory) setActiveCategory("all");
  }, [categories, activeCategory, setActiveCategory]);

  // Guarded add
  const handleSelectProduct = useCallback(
    (product) => {
      if (!product) return;
      const stockNum = Number(product.stock ?? 0);
      if (stockNum <= 0) return;
      addToCart(product);
    },
    [addToCart]
  );

  // --- Mapping helpers ---

  // Map frontend orderType (lowercase) to backend enum
  const ORDER_TYPE_MAP = {
    "dine-in": "Dine-In",
    dinein: "Dine-In",
    dine_in: "Dine-In",
    takeaway: "Takeaway",
    delivery: "Delivery",
    "take-away": "Takeaway",
  };

  // Allowed backend payment enums
  const ALLOWED_PAYMENT_ENUM = ["cash", "qris", "edc"];

  // Map UI payment keys to backend enum values (adjust here if backend enum changes)
  const PAYMENT_METHOD_MAP = {
    cash: "cash",
    qris: "qris",
    // map various card labels to backend's 'edc' (EDC = card terminal)
    debit: "edc",
    credit: "edc",
    card: "edc",
    edc: "edc",
    // transfer is not in allowed enum — don't auto-map it; we'll show an error
    transfer: null,
    bank: null,
    bank_transfer: null,
  };

  /**
   * requestPayment(opts)
   * opts expected from Cart (desktop/mobile): { tableNumber: string, orderType: string }
   *
   * Rules:
   * - Determine effectiveOrderType: opts.orderType (if provided) else current orderTypeState
   * - Determine effectiveTable: opts.tableNumber (if provided) else current tableNumberState
   * - If effectiveOrderType === "dine-in" then effectiveTable is required -> abort + alert
   * - Otherwise save effective values into state and open modal
   */
  const requestPayment = useCallback(
    (opts = {}) => {
      if (!items || items.length === 0) {
        window.alert("Keranjang kosong.");
        return;
      }

      const incomingOrderTypeRaw =
        typeof opts.orderType === "string"
          ? opts.orderType.toString().trim().toLowerCase()
          : orderTypeState;

      const incomingTableRaw =
        typeof opts.tableNumber === "string"
          ? opts.tableNumber.toString().trim()
          : tableNumberState;

      const effectiveOrderType = (incomingOrderTypeRaw || "")
        .toString()
        .trim()
        .toLowerCase();
      const effectiveTable = (incomingTableRaw || "").toString().trim();

      // require tableNumber for dine-in
      if (effectiveOrderType === "dine-in" && !effectiveTable) {
        window.alert("Nomor meja harus diisi untuk Dine-In.");
        return;
      }

      // Save effective values into local state (so create uses them)
      if (effectiveOrderType) setOrderTypeState(effectiveOrderType);
      if (effectiveTable) setTableNumberState(effectiveTable);

      setPaymentModalOpen(true);
    },
    [items, orderTypeState, tableNumberState]
  );

  /**
   * handleCreateOrderWithMethod(method)
   * - Maps payment method to backend enum and validates it is allowed
   * - Maps orderType to backend enum string ("Dine-In", "Takeaway", "Delivery")
   * - Sends payload:
   *     { items: [{product,quantity}], paymentMethod: <mapped>, orderType: <mapped?>, tableNumber? }
   */
  const handleCreateOrderWithMethod = useCallback(
    async (method) => {
      if (!items || items.length === 0) {
        setPaymentModalOpen(false);
        return;
      }

      // Map order type for backend
      const mappedOrderType = ORDER_TYPE_MAP[orderTypeState] || "";

      // If backend requires tableNumber for Dine-In (it does), guard here
      if (mappedOrderType === "Dine-In" && !tableNumberState) {
        window.alert("Nomor meja tidak ditemukan — proses dibatalkan.");
        return;
      }

      // Map payment method to backend enum
      const mappedPaymentMethod = PAYMENT_METHOD_MAP[method];

      // If mapping returns null/undefined or not in allowed enum -> reject
      if (
        !mappedPaymentMethod ||
        !ALLOWED_PAYMENT_ENUM.includes(mappedPaymentMethod)
      ) {
        window.alert(
          `Metode pembayaran "${method}" tidak didukung. Gunakan salah satu: ${ALLOWED_PAYMENT_ENUM.join(
            ", "
          )}.`
        );
        return;
      }

      setPaymentModalOpen(false);
      setSubmitting(true);

      try {
        const apiItems = items.map((it) => ({
          product: it._id,
          quantity: it.qty,
        }));

        const payload = {
          items: apiItems,
          paymentMethod: mappedPaymentMethod,
          // include orderType (backend expects enum like "Dine-In") — optional but helpful
          ...(mappedOrderType ? { orderType: mappedOrderType } : {}),
          // include tableNumber only when dine-in
          ...(mappedOrderType === "Dine-In" && tableNumberState
            ? { tableNumber: tableNumberState }
            : {}),
        };

        const res = await createOrder(payload);

        // normalize response
        const data = res?.data ?? res;
        const success =
          data?.success ?? (res && (res.status === 201 || res.status === 200));

        if (success) {
          await refreshProducts();
          clearCart();
          // reset saved meta
          setOrderTypeState("");
          setTableNumberState("");
          window.alert("Transaksi berhasil disimpan.");
        } else {
          const msg = data?.message || "Gagal menyimpan transaksi";
          window.alert(msg);
        }
      } catch (err) {
        console.error("Error creating order:", err);
        const errMsg =
          err?.response?.data?.message ||
          (err?.response?.data && JSON.stringify(err.response.data)) ||
          err?.message ||
          "Terjadi kesalahan saat menyimpan transaksi.";
        window.alert(errMsg);
      } finally {
        setSubmitting(false);
      }
    },
    [items, orderTypeState, tableNumberState, refreshProducts, clearCart]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div
      className="
      m-0
      grid 
      grid-cols-1
      md:grid-cols-[2fr_1fr] 
      h-full 
      bg-gray-50 
      overflow-hidden
      rounded-lg
    "
    >
      {/* LEFT */}
      <div className="p-4 bg-white flex flex-col h-full overflow-hidden">
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />

        {!Array.isArray(products) || products.length === 0 ? (
          <div className="mt-8 text-center text-gray-500">
            Tidak ada produk untuk ditampilkan.
            <div className="text-xs text-gray-400 mt-2">
              Cek endpoint <code>/api/staff/products</code> atau tekan refresh.
              <button
                type="button"
                onClick={refreshProducts}
                className="ml-2 px-3 py-1 rounded bg-amber-600 text-white text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto mt-2 hidden-scrollbar pb-24">
            <ProductList products={products} onSelect={handleSelectProduct} />
          </div>
        )}
      </div>

      {/* RIGHT — hanya tampil mulai md */}
      <div className="hidden md:flex bg-white shadow-sm h-screen flex-col">
        <Cart
          cart={items}
          onAdd={increaseQty}
          onMinus={decreaseQty}
          onRemove={removeItem}
          onSubmit={requestPayment} // Cart will pass {tableNumber, orderType}
          total={total}
          submitting={submitting}
          onUpdateNotes={updateItemNotes} // <--- gunakan nama prop yang Cart harapkan
        />
      </div>

      {/* MOBILE CART — tampil di mobile */}
      <div className="md:hidden">
        <Cart
          cart={items}
          onAdd={increaseQty}
          onMinus={decreaseQty}
          onRemove={removeItem}
          onSubmit={requestPayment}
          total={total}
          submitting={submitting}
          onUpdateNotes={updateItemNotes} // kirim juga ke mobile
        />
      </div>

      {/* Payment method modal */}
      <PaymentMethodModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onChoose={handleCreateOrderWithMethod}
      />
    </div>
  );
}

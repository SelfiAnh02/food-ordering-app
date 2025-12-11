import { useEffect, useCallback, useState } from "react";
import useProducts from "../../hooks/staff/useProducts";
import useCart from "../../hooks/staff/useCart";

import CategoryTabs from "../../components/staff/cashier/CategoryTabs";
import ProductList from "../../components/staff/cashier/ProductList";
import Cart from "../../components/staff/cashier/Cart";
import PaymentMethodModal from "../../components/staff/cashier/PaymentMethodModal";
import ReceiptModal from "../../components/staff/cashier/ReceiptModal";

import { createOrder, getOrderById } from "../../services/staff/orderService";

// Backend mapping (move outside component so they're stable references)
const ORDER_TYPE_MAP = {
  "dine-in": "Dine-In",
  dinein: "Dine-In",
  takeaway: "Takeaway",
  delivery: "Delivery",
};

const ALLOWED_PAYMENT_ENUM = ["cash", "qris", "edc", "transfer"];

const PAYMENT_METHOD_MAP = {
  cash: "cash",
  qris: "qris",
  debit: "edc",
  credit: "edc",
  card: "edc",
  edc: "edc",
  transfer: "transfer",
};

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
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [receiptSuccessMessage, setReceiptSuccessMessage] = useState(null);

  // Saved states from Cart
  const [orderTypeState, setOrderTypeState] = useState("");
  const [tableNumberState, setTableNumberState] = useState("");

  // 🔥 NEW: save customer name
  const [customerNameState, setCustomerNameState] = useState("");

  useEffect(() => {
    if (!activeCategory) setActiveCategory("all");
  }, [categories, activeCategory, setActiveCategory]);

  const handleSelectProduct = useCallback(
    (product) => {
      if (!product) return;
      const stock = Number(product.stock ?? 0);
      if (stock <= 0) return;
      addToCart(product);
    },
    [addToCart]
  );

  /**
   * requestPayment
   * menerima tableNumber, orderType, customerName dari Cart
   */
  const requestPayment = useCallback(
    (opts = {}) => {
      if (!items || items.length === 0) {
        window.alert("Keranjang kosong.");
        return;
      }

      const incomingOrderType = (opts.orderType || orderTypeState || "")
        .toString()
        .trim()
        .toLowerCase();

      const incomingTable = (opts.tableNumber || tableNumberState || "")
        .toString()
        .trim();

      // 🔥 NEW
      const incomingCustomerName = (
        opts.customerName ||
        customerNameState ||
        ""
      )
        .toString()
        .trim();

      // Dine-In but table number missing
      if (incomingOrderType === "dine-in" && !incomingTable) {
        window.alert("Nomor meja harus diisi untuk Dine-In.");
        return;
      }

      // Takeaway / Delivery must have customerName
      if (
        (incomingOrderType === "takeaway" ||
          incomingOrderType === "delivery") &&
        !incomingCustomerName
      ) {
        window.alert("Nama customer wajib untuk Takeaway & Delivery.");
        return;
      }

      setOrderTypeState(incomingOrderType);
      setTableNumberState(incomingTable);
      setCustomerNameState(incomingCustomerName);

      setPaymentModalOpen(true);
    },
    [items, orderTypeState, tableNumberState, customerNameState]
  );

  /**
   * handleCreateOrderWithMethod
   * mengirim customerName ke backend
   */
  const handleCreateOrderWithMethod = useCallback(
    async (method) => {
      if (!items || items.length === 0) {
        setPaymentModalOpen(false);
        return;
      }

      const mappedOrderType = ORDER_TYPE_MAP[orderTypeState] || "";
      const mappedPaymentMethod = PAYMENT_METHOD_MAP[method];

      if (
        !mappedPaymentMethod ||
        !ALLOWED_PAYMENT_ENUM.includes(mappedPaymentMethod)
      ) {
        window.alert("Metode pembayaran tidak valid.");
        return;
      }

      // Validasi dine-in
      if (mappedOrderType === "Dine-In" && !tableNumberState) {
        window.alert("Nomor meja tidak ditemukan — proses dibatalkan.");
        return;
      }

      // Validasi takeaway / delivery
      if (
        (mappedOrderType === "Takeaway" || mappedOrderType === "Delivery") &&
        !customerNameState
      ) {
        window.alert("Nama customer wajib diisi.");
        return;
      }

      setPaymentModalOpen(false);
      setSubmitting(true);

      try {
        const apiItems = items.map((it) => ({
          product: it._id,
          quantity: it.qty,
          note: (it.note ?? it.notes ?? "") || "",
        }));

        const payload = {
          items: apiItems,
          paymentMethod: mappedPaymentMethod,
          orderType: mappedOrderType,
          ...(mappedOrderType === "Dine-In" && tableNumberState
            ? { tableNumber: tableNumberState }
            : {}),
          ...(mappedOrderType !== "Dine-In" && customerNameState
            ? { customerName: customerNameState }
            : {}),
        };

        const res = await createOrder(payload);
        const data = res?.data ?? res;
        const success = data?.success ?? res?.status === 201;

        if (success) {
          // attempt to extract created order object from server response
          let created =
            data?.data ?? data?.order ?? data?.createdOrder ?? data ?? null;

          // try to fetch populated order by id if possible (ensure prices/product names)
          try {
            const idForFetch =
              created?._id ?? created?.id ?? created?.orderId ?? null;
            if (idForFetch) {
              const fullRes = await getOrderById(idForFetch);
              // extract inner payload: support { data: { ... } } and { data: { data: {...} } }
              const full = fullRes?.data?.data ?? fullRes?.data ?? fullRes;
              if (full) created = full;
            }
          } catch (err) {
            console.warn("Failed to fetch populated order for receipt:", err);
          }

          // ensure payment method/status fallback from what we just sent
          if (created) {
            created = created || {};
            created.paymentDetails = created.paymentDetails || {};
            created.payment = created.payment || {};
            if (!created.paymentDetails.method && mappedPaymentMethod) {
              created.paymentDetails.method = mappedPaymentMethod;
            }
            if (!created.payment.status) {
              created.payment.status = "paid";
            }

            setReceiptOrder(created);
            setReceiptSuccessMessage("Transaksi Berhasil");
            setReceiptOpen(true);
          }

          await refreshProducts();
          clearCart();
          setOrderTypeState("");
          setTableNumberState("");
          setCustomerNameState("");

          // transaction success is now shown inside the ReceiptModal
        } else {
          window.alert(data?.message || "Gagal menyimpan transaksi");
        }
      } catch (err) {
        console.error("Order error:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Terjadi kesalahan saat menyimpan transaksi.";
        window.alert(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [
      items,
      orderTypeState,
      tableNumberState,
      customerNameState,
      refreshProducts,
      clearCart,
    ]
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
        shadow-sm 
        border 
        border-amber-200
        shadow-amber-300
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

      {/* RIGHT */}
      <div className="hidden md:flex bg-white shadow-sm h-screen flex-col">
        <Cart
          cart={items}
          onAdd={increaseQty}
          onMinus={decreaseQty}
          onRemove={removeItem}
          onSubmit={requestPayment}
          total={total}
          submitting={submitting}
          onUpdateNotes={updateItemNotes}
        />
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <Cart
          cart={items}
          onAdd={increaseQty}
          onMinus={decreaseQty}
          onRemove={removeItem}
          onSubmit={requestPayment}
          total={total}
          submitting={submitting}
          onUpdateNotes={updateItemNotes}
        />
      </div>

      <PaymentMethodModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onChoose={handleCreateOrderWithMethod}
      />
      <ReceiptModal
        open={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
          setReceiptOrder(null);
          setReceiptSuccessMessage(null);
        }}
        order={receiptOrder}
        successMessage={receiptSuccessMessage}
      />
    </div>
  );
}

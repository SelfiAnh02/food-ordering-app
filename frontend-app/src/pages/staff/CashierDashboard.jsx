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
  } = useCart();

  const [submitting, setSubmitting] = useState(false);

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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

  // open payment modal (called by Cart onSubmit)
  const requestPayment = useCallback(() => {
    if (!items || items.length === 0) return;
    setPaymentModalOpen(true);
  }, [items]);

  // actual order creation after selecting payment method
  const handleCreateOrderWithMethod = useCallback(
    async (method) => {
      if (!items || items.length === 0) {
        setPaymentModalOpen(false);
        return;
      }

      setPaymentModalOpen(false);
      setSubmitting(true);

      try {
        const payload = {
          items: items.map((it) => ({
            product: it._id,
            quantity: it.qty,
          })),
          orderType: "Kasir",
          paymentMethod: method, // e.g. "cash", "qris", "debit", "transfer"
        };

        const res = await createOrder(payload);

        if (res && res.data && res.data.success) {
          await refreshProducts();
          clearCart();
          window.alert("Transaksi berhasil disimpan.");
        } else {
          const msg = res?.data?.message || "Gagal menyimpan transaksi";
          window.alert(msg);
        }
      } catch (err) {
        console.error("Error creating order:", err);
        window.alert("Terjadi kesalahan saat menyimpan transaksi.");
      } finally {
        setSubmitting(false);
      }
    },
    [items, refreshProducts, clearCart]
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
          onSubmit={requestPayment}
          total={total}
          submitting={submitting}
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

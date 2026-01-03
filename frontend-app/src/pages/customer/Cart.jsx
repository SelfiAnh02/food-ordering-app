import useCartCustomer from "../../hooks/customer/useCartCustomer";
import Cart from "../../components/customer/cart/Cart";
import BottomNavbar from "../../components/customer/BottomNavbar";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useEffect } from "react";

// Snap loader moved into the cart hook

export default function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const {
    items,
    increaseQty,
    decreaseQty,
    removeItem,
    updateItemNotes,
    total,
    getOrderMeta,
    setOrderMeta,
    createOrderFromCart,
    payWithSnap,
    // untuk TTL auto-clear
    clearCart,
    clearOrderMeta,
  } = useCartCustomer();

  // TTL sederhana: hapus keranjang otomatis jika idle > 5 menit (percobaan)
  const CART_LAST_ACTIVE_KEY = "customer_cart_lastActive";

  // Cek TTL saat pertama render / saat query param berubah (jalankan SEBELUM update timestamp)
  useEffect(() => {
    try {
      const last = Number(localStorage.getItem(CART_LAST_ACTIVE_KEY) || 0);
      const MAX_IDLE_MS = 5 * 60 * 1000; // 5 menit (percobaan)
      if (last && Date.now() - last > MAX_IDLE_MS) {
        clearCart?.();
        clearOrderMeta?.();
        // reset timestamp agar tidak terus menghapus
        localStorage.removeItem(CART_LAST_ACTIVE_KEY);
      }
    } catch {
      /* no-op */
    }
  }, [location.search, clearCart, clearOrderMeta]);

  // Update timestamp setiap isi keranjang berubah (setelah TTL dicek)
  useEffect(() => {
    try {
      localStorage.setItem(CART_LAST_ACTIVE_KEY, String(Date.now()));
    } catch {
      /* no-op */
    }
  }, [items]);

  const handleSubmit = async (orderMeta) => {
    try {
      const { json, token, orderId } = await createOrderFromCart(orderMeta);
      if (!json?.success)
        throw new Error(json?.message || "Gagal membuat order");

      const searchSuffix = isTableParamPresent ? location.search : "";
      await payWithSnap(token, { navigate, searchSuffix, orderId });
    } catch (e) {
      console.error("Submit error", e);
      alert(e?.message || "Gagal memulai pembayaran");
    }
  };

  const cartCount = items.reduce((acc, i) => acc + (i.qty || 0), 0);
  const active = location.pathname.includes("/customer/cart") ? "cart" : "home";

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden">
      {/* Full-bleed content area; bottom padding equals bottom bar height */}
      <main className="h-full w-full px-0 pt-0 pb-[72px] overflow-hidden">
        {isTableParamPresent && !isValidTable ? (
          <div className="p-3 m-3 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">
            Nomor meja tidak valid. Silakan scan QR resmi di meja.
          </div>
        ) : (
          <Cart
            cart={items}
            onAdd={increaseQty}
            onMinus={decreaseQty}
            onRemove={removeItem}
            onUpdateNotes={updateItemNotes}
            total={total}
            onSubmit={handleSubmit}
            defaultOpen={true}
            initialTableNumber={
              (isTableParamPresent && isValidTable && tableFromUrl) || ""
            }
            getOrderMeta={getOrderMeta}
            setOrderMeta={setOrderMeta}
          />
        )}
      </main>

      <BottomNavbar
        active={active}
        cartCount={cartCount}
        onHome={() =>
          navigate(`/customer${isTableParamPresent ? location.search : ""}`)
        }
        onCart={() =>
          navigate(
            `/customer/cart${isTableParamPresent ? location.search : ""}`
          )
        }
        onOrders={() =>
          navigate(
            `/customer/orders${isTableParamPresent ? location.search : ""}`
          )
        }
      />
    </div>
  );
}

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  createOrder as createCustomerOrder,
  finalizeOrder as finalizeCustomerOrder,
} from "../../services/customer/orderService";

// Singleton store so cart is shared without a Provider
const STORAGE_KEY = "customer_cart_v1";
const META_KEY = "customer_cart_meta_v1";
const isBrowser =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function readCartFromStorage() {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Basic normalization
    return parsed.map((i) => ({
      ...i,
      qty: typeof i.qty === "number" && i.qty > 0 ? i.qty : 1,
      notes: typeof i.notes === "string" ? i.notes : "",
    }));
  } catch {
    return [];
  }
}

let items = readCartFromStorage();
const listeners = new Set();

function emit() {
  // Persist to localStorage on every change
  if (isBrowser) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      void 0; // ignore persist error
    }
  }
  const snapshot = items;
  listeners.forEach((l) => l(snapshot));
}

function setItems(updater) {
  const next = typeof updater === "function" ? updater(items) : updater;
  items = Array.isArray(next) ? next : items;
  emit();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return items;
}

function readMetaFromStorage() {
  if (!isBrowser) return {};
  try {
    const raw = window.localStorage.getItem(META_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeMetaToStorage(updates = {}) {
  if (!isBrowser) return;
  try {
    const current = readMetaFromStorage();
    const next = { ...current, ...updates };
    window.localStorage.setItem(META_KEY, JSON.stringify(next));
  } catch (e) {
    void e; // ignore persist error
  }
}

function clearMetaFromStorage() {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify({}));
  } catch (e) {
    void e; // ignore persist error
  }
}

export default function useCartCustomer() {
  const cartItems = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const addToCart = useCallback((product) => {
    setItems((prev) => {
      const exist = prev.find((i) => i._id === product._id);
      if (exist) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1, notes: product.notes || "" }];
    });
  }, []);

  const increaseQty = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, qty: i.qty + 1 } : i))
    );
  }, []);

  const decreaseQty = useCallback((id) => {
    setItems((prev) => {
      const target = prev.find((i) => i._id === id);
      if (!target) return prev;
      const currentQty = Number(target.qty) || 0;
      if (currentQty <= 1) {
        // remove item to revert UI to "Tambah"
        return prev.filter((i) => i._id !== id);
      }
      return prev.map((i) =>
        i._id === id ? { ...i, qty: currentQty - 1 } : i
      );
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const updateItem = useCallback((id, updates = {}) => {
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, ...updates } : i))
    );
  }, []);

  const updateItemNotes = useCallback((id, notes = "") => {
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, notes: String(notes) } : i))
    );
  }, []);

  const total = useMemo(() => {
    return cartItems.reduce(
      (acc, i) => acc + (Number(i.price) || 0) * (i.qty || 0),
      0
    );
  }, [cartItems]);

  // Load Midtrans Snap script if not already present
  function loadSnap(clientKey) {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && window.snap) return resolve();
      const s = document.createElement("script");
      s.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      s.setAttribute("data-client-key", clientKey);
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  // Create order from current cart items
  const createOrderFromCart = useCallback(
    async (orderMeta = {}) => {
      // Guard: items must exist
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        throw new Error("Keranjang kosong. Tambahkan item terlebih dahulu.");
      }
      // Guard: tableNumber required
      const tableNumber = orderMeta?.tableNumber || "";
      if (!String(tableNumber).trim()) {
        throw new Error("tableNumber wajib ada (akses via QR meja).");
      }
      const payload = {
        items: cartItems.map((i) => ({
          product: i?.product?._id ?? i._id,
          quantity: i.qty,
          note: i.notes || "",
        })),
        tableNumber,
        orderType:
          orderMeta?.orderType === "Takeaway" ||
          orderMeta?.orderType === "Delivery"
            ? orderMeta.orderType
            : "Dine-In",
        customerName: orderMeta?.customerName || "",
        customerWhatsapp:
          orderMeta?.customerWhatsapp || orderMeta?.whatsappNumber || "",
      };

      let json;
      try {
        const res = await createCustomerOrder(payload);
        json = res?.data ?? res;
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Gagal membuat order (network/server error).";
        throw new Error(msg);
      }
      const token =
        json?.snapToken ||
        json?.data?.snapToken ||
        json?.data?.payment?.snapToken ||
        null;
      if (!token) {
        throw new Error("Token pembayaran tidak tersedia dari server.");
      }
      const orderId = json?.data?._id || json?._id || null;
      // Clear cart immediately once order is created (even if payment pending)
      try {
        clearCart?.();
      } catch (e) {
        void e;
      }
      return { json, token, orderId };
    },
    [cartItems, clearCart]
  );

  // Trigger Snap payment; finalize on success; clears cart
  const payWithSnap = useCallback(
    async (token, { navigate, searchSuffix = "", orderId } = {}) => {
      if (!token) throw new Error("Token pembayaran tidak tersedia");
      const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
      if (!clientKey || !String(clientKey).trim()) {
        throw new Error(
          "MIDTRANS client key belum dikonfigurasi (VITE_MIDTRANS_CLIENT_KEY)."
        );
      }
      await loadSnap(clientKey);
      if (!window.snap || typeof window.snap.pay !== "function") {
        // Snap failed to load; keep order pending so user can retry from My Orders
        if (typeof navigate === "function")
          navigate(`/customer/orders${searchSuffix}`);
        throw new Error(
          "Gagal memuat Midtrans Snap. Silakan coba lagi dari Pesanan Saya."
        );
      }

      return new Promise((resolve, reject) => {
        try {
          window.snap.pay(token, {
            onSuccess: async () => {
              // Best-effort finalize so order appears immediately even if webhook lags
              try {
                if (orderId) await finalizeCustomerOrder(orderId);
              } catch {
                // ignore; webhook will catch up
              }
              try {
                // Cart already cleared on order creation; ensure empty
                clearCart?.();
              } catch {
                // ignore
              }
              if (typeof navigate === "function")
                navigate(`/customer/orders${searchSuffix}`);
              resolve({ status: "success" });
            },
            onPending: () => {
              if (typeof navigate === "function")
                navigate(`/customer/orders${searchSuffix}`);
              resolve({ status: "pending" });
            },
            onError: async () => {
              // Do not cancel; keep order pending so user can retry payment
              if (typeof navigate === "function")
                navigate(`/customer/orders${searchSuffix}`);
              resolve({ status: "error" });
            },
            onClose: async () => {
              // Do not cancel; keep order pending and return to My Orders
              if (typeof navigate === "function")
                navigate(`/customer/orders${searchSuffix}`);
              resolve({ status: "closed" });
            },
          });
        } catch (e) {
          // If snap.pay throws synchronously, keep order pending for retry
          if (typeof navigate === "function")
            navigate(`/customer/orders${searchSuffix}`);
          reject(e);
        }
      });
    },
    [clearCart]
  );

  return {
    items: cartItems,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    updateItem,
    updateItemNotes,
    total,
    createOrderFromCart,
    payWithSnap,
    // Order meta helpers (persist lightweight preferences like orderType)
    getOrderMeta: readMetaFromStorage,
    setOrderMeta: writeMetaToStorage,
    clearOrderMeta: clearMetaFromStorage,
  };
}

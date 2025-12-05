// src/hooks/staff/useOrders.jsx
import { useState, useCallback, useRef, useEffect } from "react";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getIncomingOrders,
} from "../../services/staff/orderService";

function extractData(res) {
  // standarisasi response parsing
  // support: res.data.data, res.data, res
  if (!res) return null;
  if (res.data && res.data.data !== undefined) return res.data.data;
  if (res.data !== undefined) return res.data;
  return res;
}

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [orderDetail, setOrderDetail] = useState(null);

  // specific loading states
  const [loading, setLoading] = useState(false); // for list loads
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false); // for create/update
  const [error, setError] = useState(null);

  // ref untuk aborting & mounted check
  const detailAbortRef = useRef(null);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // abort any pending detail request
      if (detailAbortRef.current) {
        try {
          detailAbortRef.current.abort();
        } catch (err) {
          console.error("Error aborting detail request on unmount:", err);
        }
      }
    };
  }, []);

  // 🔄 Load all orders
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrders();
      const data = extractData(res) || [];
      if (mountedRef.current) setOrders(data);
      return data;
    } catch (err) {
      console.error("Error loading orders:", err);
      if (mountedRef.current) setError(normalizeError(err));
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // 🔄 Load only incoming (pending) orders
  const loadIncomingOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIncomingOrders();
      const data = extractData(res) || [];
      if (mountedRef.current) setIncomingOrders(data);
      return data;
    } catch (err) {
      console.error("Error loading incoming orders:", err);
      if (mountedRef.current) setError(normalizeError(err));
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // 🔍 Load detail per order (with abort support)
  const loadOrderDetail = useCallback(async (id) => {
    if (!id) return null;

    // abort previous detail request if any
    if (detailAbortRef.current) {
      try {
        detailAbortRef.current.abort();
      } catch (err) {
        console.error("Error aborting previous detail request:", err);
      }
    }

    // create new abort controller if service supports it
    const ac =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    detailAbortRef.current = ac;

    setLoadingDetail(true);
    setError(null);
    try {
      // If your service accepts signal: ac.signal, pass it. Otherwise ignore.
      const res = await getOrderById(
        id,
        ac ? { signal: ac.signal } : undefined
      );
      const detail = extractData(res);
      if (mountedRef.current) setOrderDetail(detail);
      return detail;
    } catch (err) {
      // ignore abort error if aborted
      if (err?.name === "AbortError") {
        console.info("Order detail request aborted");
        return null;
      }
      console.error("Error loading order detail:", err);
      if (mountedRef.current) setError(normalizeError(err));
      throw err;
    } finally {
      if (mountedRef.current) setLoadingDetail(false);
      detailAbortRef.current = null;
    }
  }, []);
  // ⚙️ Update order status
  const updateStatus = useCallback(
    async (id, newStatusOrPayload) => {
      setSaving(true);
      setError(null);
      try {
        const payload =
          typeof newStatusOrPayload === "string"
            ? { status: newStatusOrPayload }
            : newStatusOrPayload;

        const res = await updateOrderStatus(id, payload); // service yang kita update di Opsi A
        await Promise.all([loadOrders(), loadIncomingOrders()]);
        return res;
      } catch (err) {
        setError(normalizeError(err));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [loadOrders, loadIncomingOrders]
  );

  // ➕ Create Order (kasir)
  const createNewOrder = useCallback(
    async (payload) => {
      setSaving(true);
      setError(null);
      try {
        const res = await createOrder(payload);

        // refresh lists in parallel
        await Promise.all([loadOrders(), loadIncomingOrders()]);

        return res;
      } catch (err) {
        console.error("Error creating order:", err);
        setError(normalizeError(err));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [loadOrders, loadIncomingOrders]
  );

  // 🔁 Manual refresh for tables or pages (parallel)
  const refresh = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([loadOrders(), loadIncomingOrders()]);
    } catch (err) {
      console.error("Error refreshing orders:", err);
    }
  }, [loadOrders, loadIncomingOrders]);

  // small helper to normalize error object
  function normalizeError(err) {
    if (!err) return { message: "Unknown error" };
    if (err.response && err.response.data) {
      return {
        message: err.response.data.message || JSON.stringify(err.response.data),
      };
    }
    return { message: err.message || String(err) };
  }

  return {
    // state
    orders,
    incomingOrders,
    orderDetail,
    loading,
    loadingDetail,
    saving,
    error,

    // functions
    loadOrders,
    loadIncomingOrders,
    loadOrderDetail,
    updateStatus,
    createNewOrder,
    refresh,
  };
}

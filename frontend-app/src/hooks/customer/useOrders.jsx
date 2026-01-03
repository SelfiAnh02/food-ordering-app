// src/hooks/customer/useOrders.jsx
import { useState, useCallback } from "react";
import {
  createOrder,
  getMyOrders,
  getOrderById,
} from "../../services/customer/orderService";

function extractData(res) {
  if (!res) return null;
  if (res.data && res.data.data !== undefined) return res.data.data;
  if (res.data !== undefined) return res.data;
  return res;
}

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadMyOrders = useCallback(async (tableNumber) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyOrders(tableNumber);
      const data = extractData(res) || [];
      const list = (Array.isArray(data) ? data : []).map((o) => ({
        ...o,
        // Ensure UI-required fields exist for customer cards
        tableNumber: o.tableNumber ?? tableNumber ?? null,
        orderType: (o.orderType ?? (tableNumber ? "dine-in" : ""))
          .toString()
          .toLowerCase(),
        orderStatus: (o.orderStatus ?? o.status ?? "").toString().toLowerCase(),
        paymentUrl: o?.payment?.paymentUrl ?? null,
        paymentStatus: (o?.payment?.status ?? "").toString().toLowerCase(),
      }));
      setOrders(list);
      return list;
    } catch (err) {
      console.error("Error loading my orders (customer):", err);
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrderDetail = useCallback(async (id) => {
    if (!id) return null;
    setLoadingDetail(true);
    setError(null);
    try {
      const res = await getOrderById(id);
      const detail = extractData(res);
      setOrderDetail(detail);
      return detail;
    } catch (err) {
      console.error("Error loading order detail (customer):", err);
      setError(normalizeError(err));
      throw err;
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const createNewOrder = useCallback(async (payload) => {
    setSaving(true);
    setError(null);
    try {
      const res = await createOrder(payload);
      return res;
    } catch (err) {
      console.error("Error creating order (customer):", err);
      setError(normalizeError(err));
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

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
    orders,
    orderDetail,
    loading,
    loadingDetail,
    saving,
    error,
    loadMyOrders,
    loadOrderDetail,
    createNewOrder,
  };
}

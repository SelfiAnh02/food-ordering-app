// src/hooks/staff/useOrders.jsx

import { useState, useCallback } from "react";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getIncomingOrders,
} from "../../services/staff/orderService";

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [orderDetail, setOrderDetail] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔄 Load all orders
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getOrders();
      setOrders(result || []);
    } catch (err) {
      console.error("Error loading orders:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Load only incoming (pending) orders
  const loadIncomingOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getIncomingOrders();
      setIncomingOrders(result || []);
    } catch (err) {
      console.error("Error loading incoming orders:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔍 Load detail per order
  const loadOrderDetail = useCallback(async (id) => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const res = await getOrderById(id);
      const detail = res?.data?.data || res?.data || res;
      setOrderDetail(detail);
    } catch (err) {
      console.error("Error loading order detail:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✏ Update status (example: completed / cancelled / preparing)
  const updateStatus = useCallback(
    async (id, payload) => {
      try {
        setLoading(true);
        setError(null);

        const res = await updateOrderStatus(id, payload);

        // Optional, refresh orders list
        await loadOrders();
        await loadIncomingOrders();

        return res;
      } catch (err) {
        console.error("Error updating order status:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadOrders, loadIncomingOrders]
  );

  // ➕ Create Order (kasir)
  const createNewOrder = useCallback(
    async (payload) => {
      try {
        setLoading(true);
        setError(null);

        const res = await createOrder(payload);

        // refresh after creating
        await loadOrders();
        await loadIncomingOrders();

        return res;
      } catch (err) {
        console.error("Error creating order:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadOrders, loadIncomingOrders]
  );

  // 🔁 Manual refresh for tables or pages
  const refresh = useCallback(async () => {
    await loadOrders();
    await loadIncomingOrders();
  }, [loadOrders, loadIncomingOrders]);

  return {
    // state
    orders,
    incomingOrders,
    orderDetail,
    loading,
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

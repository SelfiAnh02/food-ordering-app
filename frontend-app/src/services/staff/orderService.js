// frontend-app/src/services/staff/orderService.js
import api from "../../api/axios";

export async function createOrder(payload, config = undefined) {
  return await api.post("/staff/orders/create", payload, config);
}

// getOrders
// - `params` can be a query string like "?status=pending" or empty string
// - `config` is forwarded to axios (useful for signal / headers)
export async function getOrders(params = "", config = undefined) {
  const res = await api.get(`/staff/orders${params}`, config);
  const payload = res?.data ?? res;
  // support multiple shapes
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.orders)) return payload.orders;
  // fallback: if server returns object with { success, data: [...] }
  if (payload && payload.data && Array.isArray(payload.data))
    return payload.data;
  return [];
}

// forward config so caller may pass AbortController signal
export async function getOrderById(id, config = undefined) {
  return await api.get(`/staff/orders/${id}`, config);
}

export async function updateOrderStatus(id, payload, config = undefined) {
  return await api.put(`/staff/orders/${id}/status`, payload, config);
}

export async function getIncomingOrders(config = undefined) {
  // Prefer asking server for pending orders if supported
  const orders = await getOrders("?status=pending", config);
  return Array.isArray(orders) ? orders : [];
}

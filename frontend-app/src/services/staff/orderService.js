// frontend-app/src/services/staff/orderService.js
import api from "../../api/axios";

export async function createOrder(payload) {
  return await api.post("/staff/orders/create", payload);
}

export async function getOrders(params = "") {
  const res = await api.get(`/staff/orders${params}`);
  const payload = res?.data ?? res;
  // support multiple shapes
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.orders)) return payload.orders;
  return [];
}

export async function getOrderById(id) {
  return await api.get(`/staff/orders/${id}`);
}

export async function updateOrderStatus(id, payload) {
  return await api.put(`/staff/orders/${id}/status`, payload);
}

export async function getIncomingOrders() {
  const all = await getOrders();
  return all.filter(
    (o) => (o.orderStatus ?? o.status ?? "").toString() === "pending"
  );
}

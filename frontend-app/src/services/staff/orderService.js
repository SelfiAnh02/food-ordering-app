import api from "../../api/axios";

export async function createOrder(payload) {
  return await api.post("/staff/orders/create", payload);
}

export async function getOrders() {
  return await api.get("/staff/orders");
}

export async function getOrderById(id) {
  return await api.get(`/staff/orders/${id}`);
}

export async function updateOrderStatus(id, payload) {
  return await api.put(`/staff/orders/${id}/status`, payload);
}

export async function getIncomingOrders() {
  const res = await api.get(`/staff/orders`);
  return res.data.filter((o) => o.status === "pending");
}

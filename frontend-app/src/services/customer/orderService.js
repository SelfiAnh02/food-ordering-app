// frontend-app/src/services/customer/orderService.js
import api from "../../api/axios";

// Create order for customer
export async function createOrder(payload) {
  return await api.post("/orders/create", payload);
}

// Get orders by tableNumber for customer view
export async function getMyOrders(tableNumber) {
  const params = new URLSearchParams();
  if (tableNumber) params.set("tableNumber", tableNumber);
  const qs = params.toString();
  const res = await api.get(`/orders${qs ? `?${qs}` : ""}`);
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.orders)) return payload.orders;
  return [];
}

export async function getOrderById(id) {
  return await api.get(`/orders/${id}`);
}

// Cancel unpaid order by id (restore stock and delete)
export async function cancelOrder(id) {
  return await api.delete(`/orders/${id}/cancel`);
}

// Finalize PaymentIntent to Order (fallback if webhook is delayed)
export async function finalizeOrder(id) {
  return await api.post(`/midtrans/finalize/${id}`);
}

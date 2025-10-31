import api from "../api/axios";

export async function createProduct(payload) {
  const res = await api.post("/admin/products/create", payload);
  return res;
}

export async function getProducts() {
  const res = await api.get("/admin/products/"); // trailing slash cocok dengan backend
  return res;
}

export async function getProductById(id) {
  const res = await api.get(`/admin/products/${id}`);
  return res;
}

export async function updateProduct(id, payload) {
  const res = await api.put(`/admin/products/update/${id}`, payload);
  return res;
}

export async function deleteProduct(id) {
  const res = await api.delete(`/admin/products/delete/${id}`);
  return res;
}
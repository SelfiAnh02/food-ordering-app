// src/services/productService.js
import api from "../api/axios";

/**
 * Service wrapper untuk products
 * - getProducts supports ?page=&limit=&categoryId=&q=
 * - createProduct/updateProduct/deleteProduct sesuai router backend
 */

export async function getProducts({ page = 1, limit = 10, categoryId = "", q = "" } = {}) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (categoryId) params.categoryId = categoryId;
  if (q) params.q = q; // optional if backend supports search
  const res = await api.get("/admin/products/", { params });
  // Expect response: { success, message, products, totalItems }
  return res.data;
}

export async function createProduct(payload) {
  // backend returns { success, message, data: product }
  const res = await api.post("/admin/products/create", payload);
  return res.data;
}

export async function getProductById(id) {
  const res = await api.get(`/admin/products/${id}`);
  return res.data;
}

export async function updateProduct(id, payload) {
  // Defensive: ensure we send categoryId (backend expects categoryId)
  const body = { ...payload };
  if (payload.category && !payload.categoryId) {
    body.categoryId = payload.category;
    delete body.category;
  }
  const res = await api.put(`/admin/products/update/${id}`, body);
  return res.data;
}

export async function deleteProduct(id) {
  const res = await api.delete(`/admin/products/delete/${id}`);
  return res.data;
}

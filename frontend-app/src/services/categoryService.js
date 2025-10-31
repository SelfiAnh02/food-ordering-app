import api from "../api/axios";

export async function createCategory(payload) {
  const res = await api.post("/admin/categories/create", payload);
  return res;
}

export async function getCategories() {
  const res = await api.get("/admin/categories/");
  return res;
}

export async function getCategoryById(id) {
  const res = await api.get(`/admin/categories/${id}`);
  return res;
}

export async function updateCategory(id, payload) {
  const res = await api.put(`/admin/categories/${id}`, payload);
  return res;
}

export async function deleteCategory(id) {
  const res = await api.delete(`/admin/categories/${id}`);
  return res;
}
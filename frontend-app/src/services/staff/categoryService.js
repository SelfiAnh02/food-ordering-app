import api from "../../api/axios";

export async function getCategories() {
  return await api.get("/staff/categories");
}
export async function getCategoryById(id) {
  return await api.get(`/staff/categories/${id}`);
}

// frontend-app/src/services/customer/categoryService.js
import api from "../../api/axios";

export async function getCategories() {
  return await api.get("/categories");
}

export async function getCategoryById(id) {
  return await api.get(`/categories/${id}`);
}

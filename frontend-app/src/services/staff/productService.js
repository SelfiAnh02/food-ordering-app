// frontend-app/src/services/staff/productService.js
import api from "../../api/axios";

export async function getProducts(query = "") {
  return await api.get(`/staff/products${query}`);
}

export async function getProductById(id) {
  return await api.get(`/staff/products/${id}`);
}

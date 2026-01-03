// frontend-app/src/services/customer/productService.js
import api from "../../api/axios";

export async function getProducts(query = "") {
  return await api.get(`/products${query}`);
}

export async function getProductById(id) {
  return await api.get(`/products/${id}`);
}

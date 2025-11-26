import api from "../../api/axios";

export async function getProducts() {
  return await api.get("/staff/products");
}

export async function getProductById(id) {
  return await api.get(`/staff/products/${id}`);
}

// src/services/categoryService.js
import api from "./api";

export const getCategories = () => api.get("/admin/categories"); // GET semua kategori
export const getCategoryById = (id) => api.get(`/admin/categories/${id}`); // GET detail kategori
export const createCategory = (data) => api.post("/admin/categories/create", data); // POST tambah
export const updateCategory = (id, data) => api.put(`/admin/categories/${id}`, data); // PUT update
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`); // DELETE

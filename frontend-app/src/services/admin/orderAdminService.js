// src/services/orderAdminService.js
import api from "../../api/axios";

function cleanParams(params = {}) {
  const out = {};
  Object.keys(params).forEach((k) => {
    const v = params[k];
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  });
  return out;
}

export async function getAllOrdersAdmin(params = {}) {
  const cleaned = cleanParams(params);
  return api.get("/admin/orders", { params: cleaned });
}

export async function getOrderByIdAdmin(id) {
  return api.get(`/admin/orders/${id}`);
}

export const getOrderStatsAdmin = async (filters = {}) => {
  try {
    const params = {};

    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    // Default: ambil data minggu ini
    if (!filters.startDate && !filters.endDate) {
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      params.startDate = weekAgo.toISOString();
      params.endDate = now.toISOString();
    }

    const response = await api.get("/admin/orders/stats", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching order stats:", error);
    throw error;
  }
};

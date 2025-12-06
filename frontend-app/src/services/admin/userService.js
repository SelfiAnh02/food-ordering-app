// frontend-app/src/services/userService.js
import api from "../../api/axios";

export const fetchAllUsers = () =>
  api.get("/admin/users/all-users").then((res) => res.data);

export const createStaff = (payload) =>
  api.post("/admin/users/create-staff", payload).then((res) => res.data);

export const deleteStaff = (id) =>
  api.delete(`/admin/users/delete-staff/${id}`).then((res) => res.data);

import api from "../../api/axios";

export const staffLogin = async (email, password) => {
  const res = await api.post("/staff/login", { email, password });
  return res.data;
};

export const staffLogout = async () => {
  const res = await api.post("/staff/logout");
  return res.data;
};

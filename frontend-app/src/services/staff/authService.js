import api from "../../api/axios";

export const staffLogin = async (email, password) => {
  const res = await api.post(
    "/staff/login",
    { email, password },
    { withCredentials: true } // penting!
  );
  return res.data;
};

export const staffLogout = async () => {
  const res = await api.post(
    "/staff/logout",
    {},
    { withCredentials: true } // penting!
  );
  return res.data;
};

export const getMe = async () => {
  await api.get("/staff/me");
};

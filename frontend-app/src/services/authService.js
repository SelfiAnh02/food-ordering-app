import api from "../api/axios";

  export const getMe = async () => {
     await api.get("/admin/me");   
  };


export const logout = async () => {
  try {
    await api.post("/admin/logout"); // <-- SESUAI mount
  } catch (err) {
    console.warn("Logout failed", err);
  } 
};

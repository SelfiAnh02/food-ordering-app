import api from "../api/axios";

export const setUser = (user) => localStorage.setItem("user", JSON.stringify(user));
export const getUser = () => {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};
export const clearUser = () => localStorage.removeItem("user");

export const fetchCurrentUser = async () => {
  try {
    const res = await api.get("/api/admin/me"); // <-- SESUAI mount /api/admin
    if (res.data?.success) {
      setUser(res.data.user);
      return res.data.user;
    }
    clearUser();
    return null;
  } catch (err) {
    console.error('Failed to fetch current user:', err);
    clearUser();
    return null;
  }
};

export const logout = async () => {
  try {
    await api.post("/api/admin/logout"); // <-- SESUAI mount
  } catch (err) {
    console.warn("Logout failed", err);
  } finally {
    clearUser();
  }
};

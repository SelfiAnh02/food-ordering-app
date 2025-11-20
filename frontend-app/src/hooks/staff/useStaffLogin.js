// frontend-app/src/hooks/staff/useStaffLogin.js
import { useState } from "react";
import { staffLogin } from "../../services/staff/authService";

export default function useStaffLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await staffLogin(email, password);
      // res may be:
      // { success: true, user: { ... } }
      // or { success: true, data: { user: { ... } } }
      // normalize:
      const success = Boolean(res?.success) || res?.status === "ok";
      const user = res?.user || res?.data?.user || res?.data || null;
      // sometimes backend returns user directly without wrapper
      // if user is an object with role property, accept it
      if (success && user && typeof user === "object") {
        // ensure role present
        const role = user.role || (user?.roles && user.roles[0]) || null;
        return {
          success: true,
          user: user,
          role,
        };
      }

      // If backend returned success=false with message
      const serverMessage = res?.message || res?.error || "Login gagal";
      setError(serverMessage);
      return { success: false };
    } catch (err) {
      // err thrown from service has shape { message, status, raw }
      const msg =
        err?.message || (err?.raw && err.raw.message) || "Server error";
      setError(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

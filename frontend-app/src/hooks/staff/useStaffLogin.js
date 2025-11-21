import { useState } from "react";
import { staffLogin } from "../../services/staff/authService";

const useStaffLogin = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      setError("");
      setLoading(true);

      const data = await staffLogin(email, password);
      return data; // kirim balik ke login page
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Login gagal. Periksa email/password.";

      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, error, loading };
};

export default useStaffLogin;

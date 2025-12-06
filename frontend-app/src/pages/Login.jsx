// frontend-app/src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useStaffLogin from "../hooks/staff/useStaffLogin";

const Login = ({ mode = "admin" }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(""); // errors local to this component
  const [loading, setLoading] = useState(false);

  // staff hook
  const staffHook = useStaffLogin();

  // set page title based on login mode
  useEffect(() => {
    document.title = mode === "staff" ? "Sajane Cashier" : "Sajane Admin Panel";
    return () => {
      // optional: reset to generic title when leaving
      // do not overwrite titles set by authenticated pages
    };
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLoading(true);

    try {
      if (mode === "staff") {
        const result = await staffHook.login(email, password);

        if (result?.success && result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));

          navigate("/staff/", { replace: true });
          return;
        }

        setLocalError(staffHook.error || "Login staff gagal.");
      } else {
        // admin branch (kept as originally)
        const res = await api.post(
          "/admin/login",
          { email, password },
          { withCredentials: true }
        );

        if (res.data?.success) {
          try {
            localStorage.setItem(
              "user",
              JSON.stringify({
                id: res.data.user.id,
                name: res.data.user.name,
                email: res.data.user.email,
                role: res.data.user.role,
              })
            );
          } catch (err) {
            console.error("Gagal menyimpan data user ke localStorage:", err);
          }

          if (res.data.user.role === "admin") {
            navigate("/admin", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        } else {
          setLocalError(
            res.data?.message || "Login gagal. Periksa email/password kamu."
          );
        }
      }
    } catch (err) {
      // try to extract best message
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (err?.message && err.message) ||
        "Terjadi kesalahan saat login.";
      setLocalError(msg);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // prefer hook error if present
  const errorMessage = localError || staffHook.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8 border border-amber-100">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-amber-700 mb-6">
          {mode === "staff" ? "Staff Login" : "Admin Login"}
        </h1>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-2 rounded">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-amber-200 focus:border-amber-400 focus:ring-amber-300 rounded-lg p-2.5 text-sm sm:text-base outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-amber-200 focus:border-amber-400 focus:ring-amber-300 rounded-lg p-2.5 text-sm sm:text-base outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || staffHook.loading}
            className={`w-full py-2.5 rounded-lg text-white font-semibold transition-all ${
              loading || staffHook.loading
                ? "bg-amber-300 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-700 shadow-md"
            }`}
          >
            {loading || staffHook.loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-xs sm:text-sm text-gray-500 text-center mt-6">
          &copy; {new Date().getFullYear()} Food Ordering{" "}
          {mode === "staff" ? "Staff" : "Admin"} Panel
        </p>
      </div>
    </div>
  );
};

export default Login;

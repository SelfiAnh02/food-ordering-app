import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/admin/login", { email, password });

      if (res.data?.success) {
        // simpan info user di localStorage

        // redirect sesuai role
        if (res.data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true }); // fallback atau staff route
        }
      } else {
        setError(res.data?.message || "Login gagal. Periksa email/password kamu.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.response?.data?.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8 border border-amber-100">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-amber-600 mb-6">
          Admin Login
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={loading}
            className={`w-full py-2.5 rounded-lg text-white font-semibold transition-all ${
              loading
                ? "bg-amber-300 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 shadow-md"
            }`}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-xs sm:text-sm text-gray-500 text-center mt-6">
          &copy; {new Date().getFullYear()} Food Ordering Admin Panel
        </p>
      </div>
    </div>
  );
};

export default Login;

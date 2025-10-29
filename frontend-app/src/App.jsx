// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/admin/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Users from "./pages/admin/Users";
import NotFound from "./components/NotFound";
import { getMe } from "./services/authService";

export default function App() {
  const [loading, setLoading] = useState(true);

  // ✅ Fungsi getMe untuk cek user login
  const fecthMe = async () => {
    if (window.location.pathname === "/login") {
      setLoading(false);
      return;
    }
    try {
      const res = await getMe();
      console.log("raw getMe result:", res);

      if (!res || typeof res !== "object") {
        console.warn("getMe returned unexpected:", res);
        window.location.href = "/login";
        return;
      }

      // log status supaya kita tahu kalau masih 304
      console.log("getMe status:", res.status);

      // jika 304 (shouldn't happen after fixes), treat as not-auth or refetch
      if (res.status === 304) {
        console.warn("Received 304 for /me — forcing reload to avoid cache");
        // opsi: force reload from server:
        const fresh = await getMe({ headers: { "Cache-Control": "no-cache" }});
        console.log("fresh:", fresh);
        // lalu lanjut proses fresh.data
      }

      // sekarang aman membaca res.data
      console.log("Data user:", res.data);

      // contoh: check payload
      const payload = res.data;
      if (!payload?.success) {
        window.location.href = "/login";
        return;
      }
      // set user state if needed
    } catch (error) {
      console.error("Gagal mendapatkan data user:", error);
      // jika 401 redirect ke login
      if (error?.response?.status === 401) {
        window.location.href = "/login";
      } else {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fecthMe();
  }, []);

  if(loading){
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Root -> redirect to dashboard */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin routes (protected) */}
        <Route
          path="/admin/*"
          element={
              <AdminLayout />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
        </Route>

        {/* Top-level Not Found */}
          {/* routes lain */}
          <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

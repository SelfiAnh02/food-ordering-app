// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import AdminLayout from "./layouts/admin/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";

// gunakan fetchCurrentUser & getUser dari authService
import { getUser, fetchCurrentUser } from "./services/authService";

/**
 * ProtectedRoute - sekarang verifikasi ke server saat mount
 * role = optional, mis. "admin"
 */
function ProtectedRoute({ children, role }) {
  const [state, setState] = React.useState({
    checking: true,
    authorized: false,
  });
  const location = useLocation();

  React.useEffect(() => {
    let mounted = true;

    const verify = async () => {
      // cek local dulu (optimitic)
      const local = getUser();
      if (local && (!role || local.role === role)) {
        if (mounted) setState({ checking: true, authorized: true });
      } else {
        if (mounted) setState({ checking: true, authorized: false });
      }

      // lalu selalu verifikasi dengan server untuk memastikan cookie JWT valid
      const serverUser = await fetchCurrentUser(); // harus memanggil /api/admin/me
      if (!mounted) return;

      if (serverUser && (!role || serverUser.role === role)) {
        setState({ checking: false, authorized: true });
      } else {
        setState({ checking: false, authorized: false });
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [role]);

  if (state.checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-500">Memeriksa autentikasi...</div>
      </div>
    );
  }

  if (!state.authorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function NotFound() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-amber-100 text-center max-w-md w-full">
        <h2 className="text-2xl font-semibold text-[#7a4528] mb-2">404 — Page Not Found</h2>
        <p className="text-sm text-gray-600 mb-4">
          Halaman <code className="bg-gray-100 px-1 rounded">{location.pathname}</code> tidak ditemukan.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="px-4 py-2 rounded-md border border-[#FF8A00] text-[#FF8A00]">Go to Login</Link>
          <Link to="/admin" className="px-4 py-2 rounded-md bg-[#7a4528] text-white">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root -> redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin routes (protected) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Top-level Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

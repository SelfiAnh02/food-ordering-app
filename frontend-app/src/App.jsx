// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/admin/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Users from "./pages/admin/Users";
import Orders from "./pages/admin/Orders";
import NotFound from "./components/common/NotFound";
import { getMe } from "./services/admin/authService";
import { getMe as getMeStaff } from "./services/staff/authService";
import StaffMainLayout from "./layouts/staff/StaffMainLayout";
// import CashierDa from "./pages/staff/Cashier";
import CashierDashboard from "./pages/staff/CashierDashboard";

export default function App() {
  const [loading, setLoading] = useState(true);

  // 🔥 Cek login hanya untuk ADMIN saja
  const fetchAdminMe = async () => {
    try {
      const res = await getMe();
      if (!res?.data?.success) {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Fetch admin me error:", err);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMe = async () => {
    try {
      const res = await getMeStaff();
      if (!res?.data?.success) {
        window.location.href = "/staff/login";
      }
    } catch (err) {
      console.error("Fetch staff me error:", err);
      window.location.href = "/staff/login";
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const path = window.location.pathname;

    // jika sedang di login admin atau login staff → tidak perlu fetchMe
    if (path === "/login" || path.startsWith("/staff/login")) {
      setLoading(false);
      return;
    }

    // Validasi user hanya untuk admin
    if (path.startsWith("/admin")) {
      fetchAdminMe();
    } else if (path.startsWith("/staff")) {
      fetchStaffMe();
    } else {
      // Staff tidak perlu dicek di sini
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect: ubah ke /login supaya tidak auto-landing ke admin */}
        <Route path="/" element={<Navigate to="staff/login" replace />} />

        {/* LOGIN ADMIN */}
        <Route path="/login" element={<Login mode="admin" />} />

        {/* LOGIN STAFF */}
        <Route path="/staff/login" element={<Login mode="staff" />} />

        {/* ADMIN PROTECTED ROUTES */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        {/* STAFF ROUTES */}
        <Route path="/staff/*" element={<StaffMainLayout />}>
          {/* Default staff redirect → langsung ke Orders (Cashier) */}
          <Route index element={<CashierDashboard />} />

          {/* Staff pages */}
          {/* <Route path="orders" element={<StaffOrders />} />
          <Route path="incoming-orders" element={<IncomingOrders />} />
          <Route path="all-orders" element={<AllOrders />} />
          <Route path="order/:id" element={<OrderDetail />} /> */}
        </Route>

        {/* LAST CATCH */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

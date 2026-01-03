// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/admin/AdminLayout";
import ProtectedAdmin from "./components/common/ProtectedAdmin";
import ProtectedStaff from "./components/common/ProtectedStaff";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Users from "./pages/admin/Users";
import Orders from "./pages/admin/Orders";
import Report from "./pages/admin/Reports";
import NotFound from "./components/common/NotFound";
import { getMe } from "./services/admin/authService";
import { getMe as getMeStaff } from "./services/staff/authService";
import StaffMainLayout from "./layouts/staff/StaffMainLayout";
import CashierDashboard from "./pages/staff/CashierDashboard";
import AllOrders from "./pages/staff/AllOrders";
import Reports from "./pages/staff/Reports";
import CustomersLayout from "./layouts/customer/CustomersLayout";
import RequireValidTable from "./components/customer/RequireValidTable";
import Home from "./pages/customer/Home";
import Cart from "./pages/customer/Cart";
import MyOrder from "./pages/customer/MyOrder";

export default function App() {
  const [loading, setLoading] = useState(true);

  const fetchAdminMe = async () => {
    try {
      const res = await getMe();
      if (res?.data?.success) {
        document.title = "Sajane Admin Panel";
      }
    } catch (err) {
      console.error("Fetch admin me error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMe = async () => {
    try {
      const res = await getMeStaff();
      if (res?.data?.success) {
        document.title = "Sajane Cashier";
      }
    } catch (err) {
      console.error("Fetch staff me error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const path = window.location.pathname;

    if (path === "/login" || path.startsWith("/staff/login")) {
      setLoading(false);
      return;
    }

    if (path.startsWith("/admin")) {
      fetchAdminMe();
    } else if (path.startsWith("/staff")) {
      fetchStaffMe();
    } else {
      document.title = "Sajane Tea & Coffee Bar";
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
        <Route
          path="/admin/*"
          element={
            <ProtectedAdmin>
              <AdminLayout />
            </ProtectedAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reports" element={<Report />} />
          {/* Unknown admin subpaths */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* STAFF ROUTES */}
        <Route
          path="/staff/*"
          element={
            <ProtectedStaff>
              <StaffMainLayout />
            </ProtectedStaff>
          }
        >
          {/* Default staff redirect → langsung ke Orders (Cashier) */}
          <Route index element={<CashierDashboard />} />
          <Route path="all-orders" element={<AllOrders />} />
          <Route path="reports" element={<Reports />} />

          {/* Unknown staff subpaths → show 404 rather than empty layout */}
          <Route path="*" element={<NotFound />} />

          {/* Staff pages */}
          {/* <Route path="orders" element={<StaffOrders />} />
          <Route path="incoming-orders" element={<IncomingOrders />} />
          <Route path="order/:id" element={<OrderDetail />} /> */}
        </Route>

        <Route
          path="/customer/*"
          element={
            <RequireValidTable>
              <CustomersLayout />
            </RequireValidTable>
          }
        >
          {/* Customer pages */}
          <Route index element={<Home />} />
          {/* Unknown customer subpaths */}
          <Route path="*" element={<NotFound />} />
          {/* <Route path="orders" element={<CustomerOrders />} />
          <Route path="order/:id" element={<CustomerOrderDetail />} /> */}
        </Route>
        {/* Standalone pages (outside layout, no top navbar) */}
        <Route
          path="/customer/cart"
          element={
            <RequireValidTable>
              <Cart />
            </RequireValidTable>
          }
        />
        <Route
          path="/customer/orders"
          element={
            <RequireValidTable>
              <MyOrder />
            </RequireValidTable>
          }
        />

        {/* LAST CATCH */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

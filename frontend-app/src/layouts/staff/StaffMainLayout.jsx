// src/layouts/staff/StaffMainLayout.jsx

import { useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Navbar from "../../components/common/Navbar";
import { BarChart2, Bell, List, ShoppingCart } from "lucide-react";
import { staffLogout } from "../../services/staff/authService";

const menu = [
  {
    to: "/staff/",
    label: "Orders / Cashier",
    icon: <ShoppingCart size={18} />,
  },
  {
    to: "/staff/all-orders",
    label: "All Orders",
    icon: <List size={18} />,
  },
  {
    to: "/staff/reports",
    label: "Reports",
    icon: <BarChart2 size={18} />,
  },
];

export default function StaffMainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  // FIX pageTitle using useLocation()
  const pageTitle = useMemo(() => {
    const path = location.pathname.replace(/\/+$/, "");

    const mapping = {
      "/staff": "Orders",
      "/staff/all-orders": "All Orders",
    };

    if (mapping[path]) return `${mapping[path]} - Staff`;

    // Default fallback title
    const seg = path.split("/").filter(Boolean).pop() || "Orders";
    const title =
      seg
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ") + " - Staff";

    return title;
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await staffLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    navigate("/staff/login");
  };

  return (
    <div className="h-screen w-screen flex bg-gray-100 overflow-hidden relative">
      {/* SIDEBAR DESKTOP (lg+) — FIXED LEFT */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-60 bg-white border-r z-40">
        <Sidebar menu={menu} />
      </div>

      {/* SIDEBAR OVERLAY MOBILE/TABLET */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeSidebar}
          />

          <div className="absolute left-0 top-0 bottom-0 w-60 bg-white border-r shadow-xl z-50">
            <Sidebar menu={menu} />
          </div>
        </div>
      )}

      {/* NAVBAR — shifted right on desktop so it doesn't overlap sidebar */}
      <div className="fixed top-0 left-0 right-0 lg:left-60 z-30">
        <Navbar
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          pageTitle={pageTitle}
        />
      </div>

      {/* MAIN CONTENT */}
      <main
        className="
          flex-1 
          pt-18
          w-full 
          overflow-y-auto 
          overflow-x-hidden 
          px-2 
          lg:pl-60   /* offset sama dengan lebar sidebar (w-60) */
          pb-2
        "
      >
        {children ? children : <Outlet />}
      </main>
    </div>
  );
}

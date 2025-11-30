// frontend-app/src/layouts/staff/StaffMainLayout.jsx

import { useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
    to: "/staff/incoming-orders",
    label: "Incoming Orders",
    icon: <Bell size={18} />,
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

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  const pageTitle = useMemo(() => {
    const map = {
      "/staff/": "Orders (Cashier)",
      "/staff/incoming-orders": "Incoming Orders",
      "/staff/all-orders": "All Orders",
    };
    const path = location.pathname.replace(/\/+$/, "");
    const titleBase =
      map[path] ??
      (() => {
        const seg = path.split("/").filter(Boolean).pop() || "Orders";
        return seg
          .split("-")
          .map((s) => (s[0] ? s[0].toUpperCase() + s.slice(1) : s))
          .join(" ");
      })();
    return `${titleBase} - Staff`;
  }, []);

  const handleLogout = async () => {
    try {
      await staffLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    navigate("/staff/login");
  };

  return (
    <div className="h-screen w-screen flex bg-gray-100 overflow-hidden">
      {/* Desktop sidebar — fixed (hanya tampil ≥ lg) */}
      <div className="hidden lg:block">
        <Sidebar menu={menu} />
      </div>

      {/* Mobile + Tablet sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeSidebar}
          />
          <div className="absolute left-0 top-0 bottom-0 w-60 bg-white border-r z-50">
            <Sidebar menu={menu} />
          </div>
        </div>
      )}

      {/* Content wrapper — offset left hanya di desktop */}
      <div className="flex flex-col w-full lg:ml-60">
        {/* Navbar — sidebar offset hanya desktop */}
        <div
          className={`
              fixed top-0 right-0 z-50 w-full 
              transition-all duration-200
              ${sidebarOpen ? "left-60" : "left-0"} 
              lg:left-60
          `}
        >
          <Navbar
            onToggleSidebar={toggleSidebar}
            onLogout={handleLogout}
            pageTitle={pageTitle}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 min-h-screen overflow-y-auto px-6 py-8 pt-20 overflow-x-hidden">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
}

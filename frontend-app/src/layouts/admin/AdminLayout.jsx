import { useState, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Navbar from "../../components/common/Navbar";
import { Home, Box, Tags, Users, ShoppingCart, BarChart2 } from "lucide-react";
import { logout } from "../../services/admin/authService";

const menu = [
  { to: "/admin", label: "Dashboard", icon: <Home size={18} /> },
  { to: "/admin/products", label: "Products", icon: <Box size={18} /> },
  { to: "/admin/categories", label: "Categories", icon: <Tags size={18} /> },
  { to: "/admin/users", label: "Users", icon: <Users size={18} /> },
  {
    to: "/admin/orders",
    label: "All Orders",
    icon: <ShoppingCart size={18} />,
  },
  { to: "/admin/reports", label: "Reports", icon: <BarChart2 size={18} /> },
];

/**
 * AdminLayout
 */
export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = useMemo(() => {
    const map = {
      "/admin": "Dashboard",
      "/admin/products": "Products",
      "/admin/categories": "Categories",
      "/admin/users": "Users",
      "/admin/orders": "All Orders",
      "/admin/reports": "Reports",
      "/admin/table-numbers": "Table Numbers",
    };
    const path = (location.pathname || "/").replace(/\/+$/, "");
    const titleBase =
      map[path] ??
      (() => {
        const seg = path.split("/").filter(Boolean).pop() || "Dashboard";
        return seg
          .split("-")
          .map((s) => (s[0] ? s[0].toUpperCase() + s.slice(1) : s))
          .join(" ");
      })();
    return `${titleBase} - Admin`;
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  // centralized logout handler used by Navbar (and Sidebar if needed)
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    navigate("/login");
  };

  return (
    <div className="h-screen w-screen flex bg-amber-50 overflow-hidden">
      {/* Desktop sidebar (fixed) */}
      <div className="hidden md:block">
        <Sidebar menu={menu} />
      </div>

      {/* Mobile sidebar (overlay). Note: Sidebar receives no props. */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeSidebar}
          />
          <div className="absolute left-0 top-0 bottom-0 w-60 bg-white border-r z-50">
            <Sidebar menu={menu} />
          </div>
        </div>
      )}

      {/* konten utama: md:ml-60 offset untuk sidebar di desktop */}
      <div className="flex flex-col w-full md:ml-60">
        {/* Navbar wrapper: fixed; shift left on mobile when sidebarOpen */}
        <div
          className={`fixed top-0 right-0 z-50 transition-all duration-200 ${
            sidebarOpen ? "left-60" : "left-0"
          } md:left-60 ${sidebarOpen ? "hidden" : "block"} md:block`}
        >
          <Navbar
            onToggleSidebar={toggleSidebar}
            onLogout={handleLogout}
            pageTitle={pageTitle}
          />
        </div>
        {/* beri ruang atas setinggi header (h-16) agar konten tidak tertutup; padding-top diminta = 20 */}
        <main
          className="
          flex-1 
          pt-18
          w-full 
          min-h-0
          overflow-y-auto
          overflow-x-hidden
          px-2 
          pb-2
        "
        >
          {" "}
          {/* <main className="flex-1 w-full px-5 py-5 md:px-8 md:py-8 pt-20 overflow-x-hidden overflow-y-auto">
           */}
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
}

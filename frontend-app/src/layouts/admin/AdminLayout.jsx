import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";

/**
 * AdminLayout
 */
export default function AdminLayout({ children, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  // centralized logout handler used by Navbar (and Sidebar if needed)
  const handleLogout = () => {
    if (typeof onLogout === "function") {
      try {
        onLogout();
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    navigate("/login");
  };

  return (
    <div className="h-screen w-screen flex bg-gray-100 overflow-hidden">
      {/* Desktop sidebar (fixed) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar (overlay). Note: Sidebar receives no props. */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeSidebar}
          />
          <div className="absolute left-0 top-0 bottom-0 w-60 bg-white border-r z-50">
            <Sidebar />
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
          <Navbar onToggleSidebar={toggleSidebar} onLogout={handleLogout} />
        </div>
        {/* beri ruang atas setinggi header (h-16) agar konten tidak tertutup; padding-top diminta = 20 */}
        <main className="flex-1 w-full overflow-y-auto px-6 py-8 pt-20 overflow-x-hidden">
          {/* <main className="flex-1 w-full px-5 py-5 md:px-8 md:py-8 pt-20 overflow-x-hidden overflow-y-auto">
           */}
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
}

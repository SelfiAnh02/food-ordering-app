// src/layouts/admin/AdminLayout.jsx
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
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar (overlay) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeSidebar} />
          <div className="absolute left-0 top-0 bottom-0 w-60 bg-white border-r">
            {/* pass onClose so clicking a link can close the mobile sidebar */}
            <Sidebar onClose={closeSidebar} />
          </div>
        </div>
      )}

      {/* konten utama: md:ml-60 untuk meng-offset sidebar di desktop */}
      <div className="md:ml-60 flex flex-col w-full relative">
        {/* Navbar fixed on md+ (desktop); flows normally on mobile */}
        <div className="md:fixed md:top-0 md:left-60 md:right-0 z-30">
          <Navbar onToggleSidebar={toggleSidebar} onLogout={handleLogout} />
        </div>

        {/* Spacer agar konten tidak tertutup navbar (header height = h-16) */}
        <div className="h-16 md:h-16" />

        {/* Konten utama */}
        <main className="flex-1 px-6 py-8">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
}

// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/admin/Sidebar";
import Topbar from "./components/admin/Topbar";

import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";

export default function App() {
  return (
    <div className="h-screen bg-[var(--cream)] overflow-hidden">
      {/* HEADER (Topbar) */}
      <header className="sticky top-0 z-20 bg-[var(--cream)]">
        <Topbar />
      </header>

      {/* SIDEBAR (statis di kiri, di bawah header) */}
      <aside className="w-[200px] float-left mt-6 ml-4">
        <Sidebar />
      </aside>

      {/* MAIN CONTENT (scrollable area) */}
      <main className=" h-[calc(100vh-90px)] overflow-y-auto px-6 py-6">
        <div className="max-w-[1000px] mx-auto bg-white rounded-2xl shadow-md p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* Tambahkan route lain di sini */}
             <Route path="/products" element={<Products />} />
             <Route path="/categories" element={<Categories />} />

              {/* kalau route tidak ditemukan */}
              <Route path="*" element={<div className="p-6">404 - Page Not Found</div>} />
          </Routes>
        </div>
      </main>

    </div>
  );
}

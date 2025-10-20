// src/layouts/AdminLayout.jsx
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import Dashboard from "../pages/admin/Dashboard";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[color:var(--cream)]">
      {/* TOPBAR */}
      <Topbar />

      {/* CONTENT WRAP: area utama berada di bawah header — ada margin visual */}
      <div className="content-wrap max-w-1200 mx-auto flex gap-6 px-4 pb-10">
        {/* SIDEBAR di kiri, TEPAT di bawah header (bukan menumpuk) */}
        <aside className="w-60 sidebar-below-header">
          <Sidebar />
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          {/* Kalau ada children dari <Route> tampilkan, kalau tidak tampilkan Dashboard */}
          {children || <Dashboard />}
        </main>
      </div>
    </div>
  );
}

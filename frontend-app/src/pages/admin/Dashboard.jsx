// src/pages/admin/Dashboard.jsx
import React from "react";

/* === Komponen kecil untuk card statistik === */
const StatCard = ({ title, value, icon }) => (
  <div className="flex items-center gap-3 bg-white border border-amber-100 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex-1 min-w-[180px]">
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF8A00]/10 text-[#FF8A00] text-lg font-bold">
      {icon || "📊"}
    </div>
    <div>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-lg font-semibold text-[#7a4528]">{value}</div>
    </div>
  </div>
);

/* === Placeholder chart sederhana === */
const SalesChart = () => (
  <div className="bg-white border border-amber-100 rounded-xl shadow-sm p-4">
    <div className="text-sm font-medium text-[#7a4528] mb-3">Sales Overview (Weekly)</div>
    <div className="w-full h-48 flex items-center justify-center">
      <svg viewBox="0 0 240 80" className="w-full h-full">
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FF8A00" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid */}
        <g stroke="rgba(0,0,0,0.05)" strokeWidth="0.5">
          {[10, 30, 50, 70].map((y) => (
            <line key={y} x1="0" y1={y} x2="240" y2={y} />
          ))}
        </g>

        {/* area */}
        <path
          d="M0 60 L30 58 L60 52 L90 30 L120 38 L150 42 L180 36 L210 20 L240 16 L240 80 L0 80 Z"
          fill="url(#g)"
          stroke="none"
        />

        {/* line */}
        <polyline
          points="0,60 30,58 60,52 90,30 120,38 150,42 180,36 210,20 240,16"
          fill="none"
          stroke="#FF8A00"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* labels */}
        <g fill="rgba(0,0,0,0.45)" fontSize="7" textAnchor="middle">
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=>(
            <text key={m} x={(i*20)+10} y="78">{m}</text>
          ))}
        </g>
      </svg>
    </div>
  </div>
);

/* === Preview meja === */
const TablePreview = () => (
  <div className="bg-white border border-amber-100 rounded-xl shadow-sm p-4">
    <div className="text-sm font-medium text-[#7a4528] mb-3">Table Preview</div>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {Array.from({ length: 15 }).map((_, i) => (
        <button
          key={i}
          className="px-3 py-2 rounded-lg border border-amber-100 text-xs text-gray-700 bg-amber-50 hover:bg-[#FF8A00]/20 transition-colors"
        >
          No. {i + 1}
        </button>
      ))}
    </div>
  </div>
);

/* === Pesanan terbaru === */
const RecentOrders = () => (
  <div className="bg-white border border-amber-100 rounded-xl shadow-sm p-4">
    <div className="text-sm font-medium text-[#7a4528] mb-3">Recent Orders</div>
    <div className="space-y-3">
      {[
        { id: "ORD-001", name: "Cappuccino", total: "Rp. 35.000" },
        { id: "ORD-002", name: "Green Tea Latte", total: "Rp. 28.000" },
        { id: "ORD-003", name: "Cheesecake", total: "Rp. 45.000" },
      ].map((o) => (
        <div
          key={o.id}
          className="flex justify-between items-center p-3 rounded-lg border border-amber-100 bg-amber-50/30 hover:bg-amber-50 transition"
        >
          <div>
            <div className="text-sm font-medium text-[#7a4528]">{o.name}</div>
            <div className="text-xs text-gray-500">{o.id}</div>
          </div>
          <div className="text-sm font-semibold text-[#FF8A00]">{o.total}</div>
        </div>
      ))}
    </div>
  </div>
);

/* === Halaman Dashboard === */
export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Statistik utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value="28 Items" icon="🍰" />
        <StatCard title="Categories" value="10 Categories" icon="📦" />
        <StatCard title="Orders (This Month)" value="867 Items" icon="🧾" />
        <StatCard title="Revenue (This Month)" value="Rp. 46.000.000" icon="💰" />
      </div>

      {/* Grafik dan tabel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="w-full md:max-w-[320px]">
          <TablePreview />
        </div>
      </div>

      {/* Pesanan terbaru */}
      <RecentOrders />
    </div>
  );
}

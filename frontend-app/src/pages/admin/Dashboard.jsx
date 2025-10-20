

/* kecil helper untuk card statistik */
const StatCard = ({ title, value }) => (
  <div className="panel p-4 rounded-md min-w-[180px]">
    <div className="text-sm text-gray-600">{title}</div>
    <div className="text-xl font-semibold mt-2">{value}</div>
  </div>
);

/* placeholder chart sederhana (SVG line) */
const SalesChart = () => {
  return (
    <div className="panel p-4 rounded-md">
      <div className="text-sm text-gray-600 mb-3">Sales (weekly)</div>

      {/* Simple SVG line chart placeholder */}
      <div className="w-full h-48 bg-white border border-[rgba(0,0,0,0.04)] rounded-md p-3 flex items-center justify-center">
        <svg viewBox="0 0 240 80" className="w-full h-full">
          <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6bc3c1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6bc3c1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* grid */}
          <g stroke="rgba(0,0,0,0.06)" strokeWidth="0.6">
            <line x1="0" y1="10" x2="240" y2="10" />
            <line x1="0" y1="30" x2="240" y2="30" />
            <line x1="0" y1="50" x2="240" y2="50" />
            <line x1="0" y1="70" x2="240" y2="70" />
          </g>

          {/* area under line */}
          <path d="M0 60 L30 58 L60 52 L90 30 L120 38 L150 42 L180 36 L210 20 L240 16 L240 80 L0 80 Z"
                fill="url(#g)" stroke="none" />

          {/* line */}
          <polyline points="0,60 30,58 60,52 90,30 120,38 150,42 180,36 210,20 240,16"
                    fill="none" stroke="#18a99b" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* x labels (small) */}
          <g fill="rgba(0,0,0,0.45)" fontSize="7" textAnchor="middle">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=>(
              <text key={m} x={(i*20)+10} y="78">{m}</text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

/* table preview with pills */
const TablePreview = () => (
  <div className="panel p-4 rounded-md">
    <div className="text-sm text-gray-600 mb-3">Table Preview</div>
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 15 }).map((_, i) => (
        <button key={i} className="pill text-xs text-gray-700">
          No. {i+1}
        </button>
      ))}
    </div>
  </div>
);

/* recent orders placeholder */
const RecentOrders = () => (
  <div className="panel p-4 rounded-md mt-4">
    <div className="text-sm text-gray-600 mb-3">Recent Orders</div>
    <div className="space-y-3">
      {[
        { id: "ORD-001", name: "Cappuccino", total: "Rp. 35.000" },
        { id: "ORD-002", name: "Green Tea Latte", total: "Rp. 28.000" },
        { id: "ORD-003", name: "Cheesecake", total: "Rp. 45.000" },
      ].map((o) => (
        <div key={o.id} className="flex justify-between items-center bg-white p-3 rounded-md border border-[rgba(0,0,0,0.04)]">
          <div>
            <div className="text-sm font-medium">{o.name}</div>
            <div className="text-xs text-gray-500">{o.id}</div>
          </div>
          <div className="text-sm font-semibold">{o.total}</div>
        </div>
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-2xl font-semibold">Dashboard - Admin</div>

      {/* Stat cards */}
      <div className="flex flex-wrap gap-4">
        <StatCard title="Total Products" value="28 Items" />
        <StatCard title="Categories" value="10 Categories" />
        <StatCard title="Orders (this month)" value="867 Items" />
        <StatCard title="Revenue (this month)" value="Rp. 46.000.000,00" />
      </div>

      {/* Chart + sidebar preview */}
      <div className="flex gap-6">
        <div className="flex-1">
          <SalesChart />
        </div>

        <div className="w-[320px]">
          <TablePreview />
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <RecentOrders />
      </div>
    </div>
  );
}

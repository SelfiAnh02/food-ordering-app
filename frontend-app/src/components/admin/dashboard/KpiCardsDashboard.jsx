import {
  Users,
  Package,
  FolderOpen,
  Receipt,
  Banknote,
  ArrowRightCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function StatCard({ title, value, icon: Icon, to }) {
  const navigate = useNavigate();
  return (
    <div
      className="rounded-xl border border-amber-300 p-5 shadow-sm bg-gradient-to-br from-amber-50 to-white transition-all duration-400 hover:from-amber-200 hover:to-amber-50 hover:shadow-2xl hover:scale-[1.015] cursor-pointer group"
      onClick={to ? () => navigate(to) : undefined}
      tabIndex={to ? 0 : undefined}
      role={to ? "button" : undefined}
      aria-label={to ? `Go to ${title}` : undefined}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 group-hover:bg-amber-300 transition-colors">
            {Icon ? (
              <Icon className="w-5 h-5 text-amber-600 group-hover:text-amber-800 transition-colors" />
            ) : (
              <Receipt className="w-5 h-5 text-amber-600 group-hover:text-amber-800 transition-colors" />
            )}
          </div>
          <span className="text-sm text-amber-800 group-hover:text-amber-900 transition-colors">
            {title}
          </span>
        </div>
        {to && (
          <button
            type="button"
            className="p-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100"
            onClick={() => navigate(to)}
            aria-label={`Go to ${title}`}
            title="Detail"
          >
            <ArrowRightCircle size={18} />
          </button>
        )}
      </div>
      <div className="text-2xl font-bold text-amber-700 group-hover:text-amber-900 transition-colors truncate">
        {value}
      </div>
    </div>
  );
}

export default function KpiCardsDashboard({
  usersCount = 0,
  productsCount = 0,
  categoriesCount = 0,
  monthlyOrders = 0,
  monthlyRevenue = 0,
}) {
  const fmtMoney = (n) =>
    Number(n).toLocaleString(undefined, { style: "currency", currency: "IDR" });

  const cards = [
    {
      title: "Total Users",
      value: usersCount,
      icon: Users,
      to: "/admin/users",
    },
    {
      title: "Total Products",
      value: productsCount,
      icon: Package,
      to: "/admin/products",
    },
    {
      title: "Total Categories",
      value: categoriesCount,
      icon: FolderOpen,
      to: "/admin/categories",
    },
    {
      title: "Orders (This Month)",
      value: monthlyOrders,
      icon: Receipt,
      to: "/admin/reports",
    },
    {
      title: "Revenue (This Month)",
      value: fmtMoney(monthlyRevenue),
      icon: Banknote,
      to: "/admin/reports",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <StatCard key={c.title} {...c} />
      ))}
    </div>
  );
}

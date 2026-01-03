import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function safeNum(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}
function revenueOf(o) {
  const payAmount = safeNum(o?.payment?.amount ?? o?.paymentDetails?.amount);
  const total = safeNum(o?.totalPrice);
  return payAmount > 0 ? payAmount : total;
}
function keyOf(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const formatCurrency = (value) =>
  Number(value).toLocaleString("id-ID", { style: "currency", currency: "IDR" });

export default function RevenueByDayChart({ orders = [], month }) {
  // build days in selected month
  const days = useMemo(() => {
    const [yStr, mStr] = (month || "").split("-");
    const y = Number(yStr);
    const m = Number(mStr) - 1;
    const last = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: last }, (_, i) => i + 1);
  }, [month]);

  const chartData = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const k = keyOf(o.createdAt);
      if (!k || !k.startsWith(month)) return;
      const day = Number(k.slice(-2));
      const cur = map.get(day) || 0;
      map.set(day, cur + revenueOf(o));
    });
    return days.map((d) => ({ day: d, revenue: map.get(d) || 0 }));
  }, [orders, month, days]);

  return (
    <div className="rounded-2xl border border-amber-300 bg-white p-4">
      <div className="text-lg font-bold text-amber-800 mb-2">
        Revenue Harian
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1_000_000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #f59e0b",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#111827" }}
              formatter={(value) => [formatCurrency(value), "Revenue"]}
              labelFormatter={(label) => `Tanggal ${label}`}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

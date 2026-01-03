import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function toKey(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function revenueOf(o) {
  const payAmt =
    Number(o?.payment?.amount ?? o?.paymentDetails?.amount ?? 0) || 0;
  const total =
    Number(o?.totalPrice ?? o?.totalAmount ?? o?.grandTotal ?? 0) || 0;
  return payAmt > 0 ? payAmt : total;
}

export default function WeeklyRevenueChart({ orders = [] }) {
  const data = useMemo(() => {
    // build last 7 day window ending today
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      const label = d.toLocaleDateString(undefined, { weekday: "short" });
      return { key, label, value: 0 };
    });
    const map = new Map(days.map((d) => [d.key, d]));
    (orders || []).forEach((o) => {
      const k = toKey(o?.createdAt);
      if (!k || !map.has(k)) return;
      const cur = map.get(k);
      cur.value += revenueOf(o);
    });
    return days;
  }, [orders]);

  const fmtMoneyShort = (n) => {
    const v = Number(n) || 0;
    if (v >= 1_000_000) return `${Math.round(v / 100_000) / 10}M`;
    if (v >= 1_000) return `${Math.round(v / 100) / 10}K`;
    return String(v);
  };

  return (
    <div className="rounded-xl border border-amber-300 bg-white p-4 shadow-sm">
      <div className="text-lg font-semibold mb-2 text-amber-800">
        Revenue 7 Hari
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revWeekAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: "#7a4528", fontSize: 12 }}
              axisLine={{ stroke: "#fcd34d" }}
              tickLine={{ stroke: "#fcd34d" }}
            />
            <YAxis
              tickFormatter={fmtMoneyShort}
              tick={{ fill: "#7a4528", fontSize: 12 }}
              axisLine={{ stroke: "#fcd34d" }}
              tickLine={{ stroke: "#fcd34d" }}
            />
            <Tooltip
              formatter={(v) =>
                v.toLocaleString(undefined, {
                  style: "currency",
                  currency: "IDR",
                })
              }
              labelStyle={{ color: "#7a4528" }}
              contentStyle={{ borderRadius: 8, borderColor: "#fcd34d" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#f59e0b"
              fill="url(#revWeekAmber)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

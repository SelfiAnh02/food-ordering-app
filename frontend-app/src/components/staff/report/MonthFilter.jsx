import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getMonthBounds(yyyymm) {
  // yyyymm = "YYYY-MM"
  const [yStr, mStr] = (yyyymm || "").split("-");
  const y = Number(yStr);
  const m = Number(mStr) - 1; // JS month 0-11
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0); // last day of month
  const fmt = (d) => {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };
  return { startDate: fmt(start), endDate: fmt(end) };
}

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function MonthFilter({ month, onChange, showNav = true }) {
  const label = useMemo(() => {
    if (!month) return "";
    const [yStr, mStr] = month.split("-");
    const y = Number(yStr);
    const mIdx = Math.max(0, Math.min(11, Number(mStr) - 1));
    return `${MONTHS_ID[mIdx]} ${y}`;
  }, [month]);

  const moveMonth = (delta) => {
    const [yStr, mStr] = (month || "").split("-");
    let y = Number(yStr);
    let m = Number(mStr) - 1;
    m += delta;
    while (m < 0) {
      m += 12;
      y -= 1;
    }
    while (m > 11) {
      m -= 12;
      y += 1;
    }
    const next = `${y}-${String(m + 1).padStart(2, "0")}`;
    const { startDate, endDate } = getMonthBounds(next);
    onChange?.({ month: next, startDate, endDate });
  };

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Pill control matching the mock, themed white+amber */}
      <div className="flex items-center gap-2 bg-white border border-amber-300 rounded-xl px-2 py-1 shadow-sm">
        {showNav && (
          <button
            type="button"
            aria-label="Bulan sebelumnya"
            className="p-2 rounded-lg hover:bg-amber-100 text-amber-700"
            onClick={() => moveMonth(-1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <div className="px-4 py-2 min-w-[160px] text-center font-semibold text-amber-800">
          {label}
        </div>
        {showNav && (
          <button
            type="button"
            aria-label="Bulan berikutnya"
            className="p-2 rounded-lg hover:bg-amber-100 text-amber-700"
            onClick={() => moveMonth(1)}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

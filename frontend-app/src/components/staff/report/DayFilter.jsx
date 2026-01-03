import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getDayLabel(isoDate) {
  // isoDate: "YYYY-MM-DD"
  const d = new Date(isoDate);
  const hari = d.toLocaleDateString("id-ID", { weekday: "long" });
  const tanggal = d.getDate();
  const bulan = d.toLocaleDateString("id-ID", { month: "long" });
  const tahun = d.getFullYear();
  return `${hari}, ${tanggal} ${bulan} ${tahun}`;
}

export default function DayFilter({ date, onChange }) {
  const label = useMemo(() => getDayLabel(date), [date]);

  const moveDay = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    const next = d.toISOString().slice(0, 10);
    onChange?.(next);
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 bg-white border border-amber-300 rounded-xl px-2 py-1 shadow-sm w-full max-w-full">
        <div className="flex flex-row items-center justify-center gap-2">
          <button
            type="button"
            aria-label="Hari sebelumnya"
            className="p-2 rounded-lg hover:bg-amber-100 text-amber-700"
            onClick={() => moveDay(-1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-2 py-2 min-w-[120px] sm:min-w-[160px] text-center font-semibold text-amber-800 text-sm sm:text-base overflow-x-auto whitespace-nowrap">
            {label}
          </div>
          <button
            type="button"
            aria-label="Hari berikutnya"
            className="p-2 rounded-lg hover:bg-amber-100 text-amber-700"
            onClick={() => moveDay(1)}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-center mt-1 sm:mt-0">
          <input
            type="date"
            value={date}
            onChange={(e) => onChange?.(e.target.value)}
            className="border border-amber-200 rounded px-2 py-1 text-xs sm:text-sm text-amber-800 bg-white min-w-[110px] w-auto"
            aria-label="Pilih tanggal"
          />
        </div>
      </div>
    </div>
  );
}

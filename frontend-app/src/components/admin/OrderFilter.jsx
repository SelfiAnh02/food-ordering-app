import { useEffect, useState } from "react";

export default function OrderFilter({ initial = {}, onApply }) {
  const [status, setStatus] = useState(initial.status || "");
  const [startDate, setStartDate] = useState(initial.startDate || "");
  const [endDate, setEndDate] = useState(initial.endDate || "");

  useEffect(() => {
    // sinkronkan nilai awal ketika initial berubah
    setStatus(initial.status || initial.orderStatus || "");
    setStartDate(initial.startDate || "");
    setEndDate(initial.endDate || "");
  }, [initial]);

  // ✅ fungsi apply yang benar
  const apply = () => {
    const payload = {
      orderStatus: status || "",
      startDate: startDate || "",
      endDate: endDate || "",
      page: 1,
    };

    console.log("OrderFilter apply ->", payload);
    onApply?.(payload);
  };

  return (
    <div className="w-full flex flex-col sm:flex-row flex-wrap gap-2 sm:items-end">
      <div className="flex-1 min-w-[140px]">
        <label className="text-sm text-gray-600">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="text-sm text-gray-600">From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm"
        />
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="text-sm text-gray-600">To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm"
        />
      </div>

      <div className="flex items-end sm:ml-auto">
        <button
          onClick={apply}
          className="px-3 py-2 bg-amber-600 text-white rounded-md text-sm hover:bg-amber-700 transition"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

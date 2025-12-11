import React from "react";

export default function ReportsFilter({ date, onChange }) {
  return (
    <div className="flex items-center mb-4">
      <div className="flex items-center gap-2">
        <label className="text-amber-800">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="border border-amber-400 text-amber-800 rounded-lg px-2 py-1 text-sm"
        />
        <p className="text-gray-500 text-sm">Filter by day</p>
      </div>
    </div>
  );
}

import React from "react";

export default function TotalSalesCard({ total = 0 }) {
  return (
    <div className="bg-white border border-amber-400 rounded-lg p-4 shadow-sm min-h-[6.5rem] flex items-center">
      <div className="w-full">
        <h3 className="text-sm font-medium mb-3 text-amber-800">Total Sales</h3>
        <div className="text-xl font-bold text-amber-600 mt-2">
          Rp {Number(total || 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

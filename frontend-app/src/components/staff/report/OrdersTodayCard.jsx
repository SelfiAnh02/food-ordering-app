import React from "react";

export default function OrdersTodayCard({ orders = [] }) {
  const count = Array.isArray(orders) ? orders.length : 0;
  return (
    <div className="bg-white border border-amber-400 rounded-lg p-4 shadow-sm min-h-[6.5rem] flex items-center">
      <div className="w-full">
        <h3 className="text-sm font-medium mb-3 text-amber-800">
          Orders (selected day)
        </h3>
        <div className="text-xl font-bold text-amber-600 mt-2">{count}</div>
      </div>
    </div>
  );
}

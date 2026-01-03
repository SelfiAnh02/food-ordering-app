import React, { useMemo } from "react";

const TYPE_MAP = {
  "dine-in": "Dine-in",
  dine_in: "Dine-in",
  dinein: "Dine-in",
  dine: "Dine-in",
  takeaway: "Takeaway",
  "take-away": "Takeaway",
  take_away: "Takeaway",
  take: "Takeaway",
  delivery: "Delivery",
  delivered: "Delivery",
};

export default function OrderTypeSummary({ orders = [] }) {
  const counts = useMemo(() => {
    const m = { "Dine-in": 0, Takeaway: 0, Delivery: 0 };
    (orders || []).forEach((o) => {
      const raw = (o.orderType ?? o.type ?? o.order_type ?? o.type_name ?? "")
        .toString()
        .toLowerCase();
      const norm = raw.replace(/[\s]/g, "-");
      let label = TYPE_MAP[norm] || TYPE_MAP[raw] || null;
      if (!label) {
        if (raw.includes("dine")) label = "Dine-in";
        else if (raw.includes("take")) label = "Takeaway";
        else if (raw.includes("deliver")) label = "Delivery";
      }
      if (label && label in m) m[label] += 1;
    });
    return m;
  }, [orders]);

  return (
    <div className="bg-white border border-amber-400 rounded-lg p-4 shadow-sm min-h-[6.5rem]">
      <h3 className="text-sm font-semibold mb-3 text-amber-800">Order Types</h3>
      <div className="space-y-2 text-sm">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <div className="text-gray-700">{k}</div>
            <div className="font-medium text-amber-800">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

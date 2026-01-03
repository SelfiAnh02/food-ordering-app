import React, { useMemo } from "react";

function extractPaymentMethod(o) {
  return (
    o.paymentDetails?.method ||
    o.payment?.method ||
    o.paymentMethod ||
    o.payment_method ||
    "unknown"
  );
}

export default function PaymentMethodSummary({ orders = [], products = [] }) {
  // build product map for fallback price
  const productMap = useMemo(() => {
    const map = {};
    (products || []).forEach((p) => {
      if (!p) return;
      map[String(p._id ?? p.id)] = p;
    });
    return map;
  }, [products]);

  const summary = useMemo(() => {
    const byMethod = {};
    (orders || []).forEach((o) => {
      let amt =
        Number(o.totalAmount ?? o.total ?? o.totalPrice ?? o.grandTotal ?? 0) ||
        0;
      if (!amt) {
        const items = o.items || o.orderItems || o.products || [];
        amt = items.reduce((s, it) => {
          const prod =
            it.product && typeof it.product === "object"
              ? it.product
              : productMap[String(it.product ?? it.productId ?? "")];
          const price =
            Number(
              it.price ?? it.unitPrice ?? it.productPrice ?? prod?.price ?? 0
            ) || 0;
          const qty = Number(it.quantity ?? it.qty ?? 0) || 0;
          return s + price * qty;
        }, 0);
      }
      const method = extractPaymentMethod(o) || "unknown";
      byMethod[method] = (byMethod[method] || 0) + amt;
    });
    return byMethod;
  }, [orders, productMap]);

  return (
    <div className="bg-white border border-amber-400 rounded-lg p-4 shadow-sm min-h-[6.5rem]">
      <h3 className="text-sm font-semibold mb-3 text-amber-800">
        Sales by Payment Method
      </h3>
      <div className="space-y-2 text-sm">
        {Object.keys(summary).length === 0 && (
          <div className="text-gray-500">No sales</div>
        )}
        {Object.entries(summary).map(([m, amt]) => (
          <div key={m} className="flex justify-between">
            <div className="capitalize">{m}</div>
            <div className="font-medium">Rp {Number(amt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

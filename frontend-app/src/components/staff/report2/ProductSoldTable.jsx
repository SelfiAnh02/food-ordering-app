import React, { useMemo } from "react";

export default function ProductSoldTable({ orders = [], products = [] }) {
  // build product lookup map
  const productMap = useMemo(() => {
    const map = {};
    (products || []).forEach((p) => {
      if (!p) return;
      map[String(p._id ?? p.id)] = p;
    });
    return map;
  }, [products]);

  const rows = useMemo(() => {
    const map = {};
    (orders || []).forEach((o) => {
      const items = o.items || o.orderItems || o.products || [];
      items.forEach((it) => {
        // attempt to normalize using product map when item doesn't have price
        const prodRef = it.product ?? it.productId ?? it.product_id ?? null;
        const prodObj =
          typeof prodRef === "object"
            ? prodRef
            : productMap[String(prodRef ?? "")];
        const id =
          prodObj?._id ??
          prodObj?.id ??
          prodRef ??
          it.productId ??
          it.product_id ??
          it._id ??
          it.id ??
          "unknown";
        const name =
          prodObj?.name ?? it.name ?? it.productName ?? "Unknown Product";
        const qty = Number(it.quantity ?? it.qty ?? 0) || 0;
        const price =
          Number(
            it.price ?? it.unitPrice ?? it.productPrice ?? prodObj?.price ?? 0
          ) || 0;

        if (!map[id]) map[id] = { id, name, qty: 0, revenue: 0 };
        map[id].qty += qty;
        map[id].revenue += qty * price;
      });
    });
    const arr = Object.values(map).sort((a, b) => b.qty - a.qty);
    return arr;
  }, [orders, productMap]);

  return (
    <div className="bg-white border border-amber-400 rounded-lg p-3 shadow-sm">
      <h3 className="text-sm font-semibold mb-3 text-amber-800">
        Products Sold
      </h3>
      <div className="overflow-auto max-h-64">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="py-1">Product</th>
              <th className="py-1">Qty</th>
              <th className="py-1 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="text-gray-500 py-2">
                  No products sold in range
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2 text-sm">{r.name}</td>
                <td className="py-2 w-16">{r.qty}</td>
                <td className="py-2 text-right">
                  Rp {Number(r.revenue).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

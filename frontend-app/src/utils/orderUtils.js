// src/utils/orderUtils.js
export const formatPrice = (value) => {
  if (value == null || value === "") return "-";
  // Ensure it's a number
  const v = typeof value === "number" ? value : Number(value || 0);
  return v.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
};

export const formatDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", { hour12: false });
};

export const shortItemsSummary = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return "-";
  return items
    .map((it) => {
      const name = it.product?.name ?? it.productName ?? "Product";
      const qty = it.quantity ?? it.qty ?? 0;
      return `${name} (${qty})`;
    })
    .join(", ");
};

// src/utils/productUtils.js
export function formatPrice(v) {
  if (v == null || v === "") return "-";
  const n = Number(v) || 0;
  return "Rp. " + n.toLocaleString("id-ID");
}

export function formatNumberToLocale(v) {
  if (v == null || v === "") return "";
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("id-ID");
}

export function parseDigits(s) {
  if (!s) return 0;
  const digits = String(s).replace(/[^\d]/g, "");
  return digits === "" ? 0 : Number(digits);
}

export function nextId(list) {
  return list.length === 0 ? 1 : Math.max(...list.map((x) => x.id)) + 1;
}

// src/utils/normalizeProduct.js

/**
 * Normalisasi minimal product.
 * - Pastikan ada id (prefer _id)
 * - Ambil categoryId (string) dan categoryName (string) jika populated
 * - Ambil image dari beberapa field umum
 */
export default function normalizeProduct(raw = {}) {
  if (!raw) return null;
  const id = raw._id ?? raw.id ?? String(Math.random()).slice(2);
  const name = raw.name ?? raw.title ?? "Unnamed";
  const description = raw.description ?? raw.desc ?? "";
  const price = Number(raw.price ?? raw.harga ?? 0) || 0;
  const stock = Number(raw.stock ?? raw.qty ?? raw.quantity ?? 0) || 0;

  // categoryId may be object { _id, name } or string
  let categoryId = "";
  let categoryName = "-";
  if (raw.categoryId) {
    if (typeof raw.categoryId === "object") {
      categoryId = raw.categoryId._id ?? raw.categoryId.id ?? "";
      categoryName = raw.categoryId.name ?? raw.categoryId.title ?? categoryName;
    } else {
      categoryId = String(raw.categoryId);
      categoryName = raw.category ?? raw.categoryName ?? categoryName;
    }
  } else if (raw.category) {
    if (typeof raw.category === "object") {
      categoryId = raw.category._id ?? raw.category.id ?? "";
      categoryName = raw.category.name ?? raw.category.title ?? categoryName;
    } else {
      categoryName = String(raw.category);
    }
  }

  // images
  let image = "";
  if (raw.image) image = typeof raw.image === "string" ? raw.image : raw.image.url ?? "";
  else if (raw.imageUrl) image = raw.imageUrl;
  else if (Array.isArray(raw.images) && raw.images.length) image = raw.images[0];
  else if (raw.img) image = raw.img;

  return {
    ...raw,
    id,
    name,
    description,
    price,
    stock,
    categoryId: categoryId || "",
    categoryName: categoryName || "-",
    image,
  };
}

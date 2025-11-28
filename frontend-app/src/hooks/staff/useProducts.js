// src/hooks/staff/useProducts.js
import { useEffect, useState } from "react";
import { getProducts } from "../../services/staff/productService";
import useCategories from "./useCategories";

/**
 * Normalize product shape to: { _id, name, price:Number, stock:Number, image, categoryId }
 */
function normalizeProduct(p) {
  if (!p) return null;
  const _id = p._id ?? p.id ?? String(Math.random()).slice(2);
  const name = p.name ?? p.title ?? "Unnamed";
  const price = Number(p.price ?? 0) || 0;
  // backend now sends stock; fallback to 0 if missing
  const stock = Number(p.stock ?? 0) || 0;
  const image =
    p.image ?? p.imageUrl ?? (Array.isArray(p.images) ? p.images[0] : "") ?? "";
  const categoryId =
    p.categoryId ?? (p.category && (p.category._id ?? p.category.id)) ?? null;

  return { ...p, _id, name, price, stock, image, categoryId };
}

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loadingProducts, setLoadingProducts] = useState(true);

  const { categories, loadingCategories } = useCategories();

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      // For POS, request many items
      const res = await getProducts("?limit=1000");
      const payload = res?.data ?? res;
      let arr = [];
      if (Array.isArray(payload.products)) arr = payload.products;
      else if (Array.isArray(payload.data)) arr = payload.data;
      else if (Array.isArray(payload)) arr = payload;
      else arr = [];

      const normalized = arr.map(normalizeProduct).filter(Boolean);
      setProducts(normalized);
    } catch (err) {
      console.error("Error loading products:", err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => {
          return (
            p.categoryId && String(p.categoryId) === String(activeCategory)
          );
        });

  return {
    products: filteredProducts,
    allProducts: products,
    categories,
    activeCategory,
    setActiveCategory,
    loading: loadingProducts || loadingCategories,
    refreshProducts: fetchProducts,
  };
}

// src/hooks/staff/useProducts.js
import { useEffect, useState } from "react";
import { getProducts } from "../../services/staff/productService";
import { getCategories } from "../../services/staff/categoryService";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  // Normalize response -> always return array
  const normalizeArray = (res) => {
    if (!res) return [];
    // Prefer res.data.data, then res.data, then res
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  };

  // Load products + categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      const prodList = normalizeArray(prodRes);
      const catList = normalizeArray(catRes);

      setProducts(prodList);
      setCategories(catList);
    } catch (err) {
      console.error("Error loading products:", err);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper untuk mendapatkan id kategori dari product (support object or string)
  const getProductCategoryId = (p) => {
    // possible shapes: p.categoryId (string), p.categoryId._id, p.category (string), p.categoryId.id
    return (
      p?.categoryId?._id ??
      p?.categoryId?.id ??
      p?.categoryId ??
      p?.category ??
      null
    );
  };

  // Filter produk berdasarkan kategori (robust terhadap berbagai shape)
  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => {
          const catId = getProductCategoryId(p);
          return catId !== null && String(catId) === String(activeCategory);
        });

  // Refresh (misalnya setelah checkout)
  const refreshProducts = () => fetchData();

  return {
    products: filteredProducts,
    allProducts: products,
    categories,
    activeCategory,
    setActiveCategory,
    refreshProducts,
    loading,
  };
}

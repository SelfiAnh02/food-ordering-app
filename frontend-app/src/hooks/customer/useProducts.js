// src/hooks/customer/useProducts.js
import { useEffect, useState } from "react";
import { getProducts } from "../../services/customer/productService";

function normalizeProduct(p) {
  if (!p) return null;
  const _id = p._id ?? p.id ?? String(Math.random()).slice(2);
  const name = p.name ?? p.title ?? "Unnamed";
  const price = Number(p.price ?? 0) || 0;
  const description = p.description ?? "";
  const stock = Number(p.stock ?? 0) || 0;
  const image = p.image ?? p.imageUrl ?? "";
  return { ...p, _id, name, price, description, stock, image };
}

export default function useProducts({ query = "" } = {}) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await getProducts(query);
      const payload = res?.data ?? res;
      let arr = [];
      if (Array.isArray(payload.products)) arr = payload.products;
      else if (Array.isArray(payload.data)) arr = payload.data;
      else if (Array.isArray(payload)) arr = payload;
      const normalized = arr.map(normalizeProduct).filter(Boolean);
      setProducts(normalized);
    } catch (err) {
      console.error("Error loading products (customer):", err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return {
    products,
    loadingProducts,
    refreshProducts: fetchProducts,
  };
}

// src/hooks/useProducts.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { getProducts as apiGetProducts } from "../services/productService";
import normalizeProduct from "../utils/normalizeProduct";

/**
 * useProducts
 * - page, limit, categoryId, q (search)
 * - returns: products (normalized), loading, error, pagination metadata, actions
 */
export default function useProducts({ initialPage = 1, initialLimit = 9 } = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [categoryId, setCategoryId] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productsRaw, setProductsRaw] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const fetch = useCallback(
    async ({ page: p = page, limit: l = limit, categoryId: c = categoryId, q: qq = q } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGetProducts({ page: p, limit: l, categoryId: c, q: qq });
        // data may be { success, message, products, totalItems } or other shapes
        const rawList = data?.products ?? data?.data ?? data ?? [];
        const list = Array.isArray(rawList) ? rawList : [];
        setProductsRaw(list);
        setTotalItems(Number(data?.totalItems ?? data?.total ?? list.length));
      } catch (err) {
        console.error("fetch products err:", err);
        setError(err);
        setProductsRaw([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    [page, limit, categoryId, q]
  );

  // initial & when filters change
  useEffect(() => {
    fetch({ page, limit, categoryId, q });
  }, [fetch, page, limit, categoryId, q]);

  const products = useMemo(() => productsRaw.map(normalizeProduct), [productsRaw]);

  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / (limit || 1)));

  return {
    products,
    loading,
    error,
    page,
    limit,
    totalItems,
    totalPages,
    categoryId,
    q,
    setPage,
    setLimit,
    setCategoryId,
    setQ,
    refresh: () => fetch({ page, limit, categoryId, q }),
    fetch, // lower-level
  };
}

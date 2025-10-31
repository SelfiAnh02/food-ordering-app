// src/hooks/useCategories.js
import { useCallback, useEffect, useState } from "react";
import { getCategories as apiGetCategories } from "../services/categoryService";

/**
 * useCategories
 * - Fetch categories from backend and normalize to { id, name }
 * - Returns: { categories, loading, error, refresh }
 */
export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGetCategories();
      // backend may return { success, data: [...] } or array directly
      const raw = res?.data?.data ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      const norm = list.map((c) => {
        const id = c._id ?? c.id ?? String(c);
        const name = c.name ?? c.title ?? String(c);
        return { id, name, raw: c };
      });
      setCategories(norm);
    } catch (err) {
      console.error("useCategories fetch error", err);
      setError(err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refresh: fetchCategories };
}

// src/hooks/customer/useCategories.js
import { useEffect, useState } from "react";
import { getCategories } from "../../services/customer/categoryService";

function normalizeCategory(c) {
  if (!c) return null;
  const rawId = c._id ?? c.id ?? String(Math.random()).slice(2);
  const _id = String(rawId);
  const name = c.name ?? c.title ?? "Unnamed";
  return { ...c, _id, name };
}

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await getCategories();
      const payload = res?.data ?? res;
      let arr = [];
      if (Array.isArray(payload)) arr = payload;
      else if (Array.isArray(payload.data)) arr = payload.data;
      else if (Array.isArray(payload.categories)) arr = payload.categories;
      const normalized = arr.map(normalizeCategory).filter(Boolean);
      setCategories(normalized);
    } catch (err) {
      console.error("Error loading categories (customer):", err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loadingCategories, refreshCategories: fetchCategories };
}

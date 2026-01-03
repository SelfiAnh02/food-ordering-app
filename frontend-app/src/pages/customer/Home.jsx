// src/pages/customer/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useProducts from "../../hooks/customer/useProducts";
import useCategories from "../../hooks/customer/useCategories";
import CategoryTabs from "../../components/customer/CategoryTabs";
import ProductList from "../../components/customer/ProductList";
import useCartCustomer from "../../hooks/customer/useCartCustomer";

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const activeCategory = params.get("categoryId") || "all";
  const q = (params.get("q") || "").toLowerCase();
  const tableKey = params.has("tableNumber")
    ? "tableNumber"
    : params.has("table")
    ? "table"
    : null;
  const tableVal = tableKey ? params.get(tableKey) : "";

  const { categories } = useCategories();
  const [search, setSearch] = useState(params.get("q") || "");

  const query = useMemo(() => {
    if (!activeCategory || activeCategory === "all") return "?limit=1000";
    return `?categoryId=${activeCategory}&limit=1000`;
  }, [activeCategory]);

  const { products, loadingProducts } = useProducts({ query });
  const filteredProducts = useMemo(() => {
    if (!q) return products;
    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [products, q]);
  const loading = loadingProducts;
  const { addToCart } = useCartCustomer();

  // keep local search state in sync with URL changes
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setSearch(p.get("q") || "");
  }, [location.search]);

  const onTabChange = (val) => {
    const next = new URLSearchParams(location.search || "");
    if (val && val !== "all") next.set("categoryId", val);
    else next.delete("categoryId");
    if (search) next.set("q", search);
    else next.delete("q");
    if (tableKey && tableVal) next.set(tableKey, tableVal);
    navigate({
      pathname: "/customer",
      search: next.toString() ? `?${next.toString()}` : "",
    });
  };

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const next = new URLSearchParams(location.search || "");
    if (activeCategory && activeCategory !== "all")
      next.set("categoryId", activeCategory);
    else next.delete("categoryId");
    if (value) next.set("q", value);
    else next.delete("q");
    if (tableKey && tableVal) next.set(tableKey, tableVal);
    navigate({
      pathname: "/customer",
      search: next.toString() ? `?${next.toString()}` : "",
    });
  };

  // Single container under navbar with sticky header inside
  const NAVBAR_HEIGHT = 112; // match CustomersLayout pt-28

  return (
    <div className="bg-white min-h-screen overflow-hidden">
      {/* Single fixed container: header (sticky) + list (scrollable) */}
      <div
        className="fixed left-0 right-0 bottom-0"
        style={{ top: NAVBAR_HEIGHT, WebkitOverflowScrolling: "touch" }}
      >
        <div className="w-full px-0 sm:px-2 md:px-4 h-full flex flex-col">
          {/* Sticky header inside scroll container */}
          <div className="z-40 border-amber-200 flex-shrink-0">
            <div className="p-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <CategoryTabs
                categories={categories}
                active={activeCategory}
                onChange={onTabChange}
                search={search}
                onSearchChange={onSearchChange}
                position="sticky"
                offsetTop={0}
              />
            </div>
          </div>

          {/* Product list below header; padding-bottom to avoid bottom navbar overlap */}
          <div
            className="px-2 md:px-2 pt-0 pb-20 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-40 text-gray-600">
                Loading...
              </div>
            ) : (
              <ProductList products={filteredProducts} onSelect={addToCart} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

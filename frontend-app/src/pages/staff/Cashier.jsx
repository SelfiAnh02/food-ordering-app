// src/pages/staff/Cashies.jsx

import useProducts from "../../hooks/staff/useProducts";
import useCart from "../../hooks/staff/useCart";

import CategoryTabs from "../../components/staff/cashier/CategoryTabs";
import ProductList from "../../components/staff/cashier/ProductList";
import Cart from "../../components/staff/cashier/Cart";
import CartSummary from "../../components/staff/cashier/CartSummary";

export default function Cashies() {
  const { products, categories, activeCategory, setActiveCategory, loading } =
    useProducts();

  const {
    items,
    addToCart,
    decreaseQty,
    increaseQty,
    removeItem,
    clearCart,
    total,
  } = useCart();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      {/* Left: List Produk */}
      <div className="flex-1 border-r border-gray-200 p-4 overflow-auto">
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />

        <ProductList products={products} onAddToCart={addToCart} />
      </div>

      {/* Right: Cart */}
      <div className="w-[380px] bg-white shadow-lg flex flex-col p-4">
        <Cart
          cart={items}
          onIncrease={increaseQty}
          onDecrease={decreaseQty}
          onRemove={removeItem}
        />

        <CartSummary total={total} onClear={clearCart} />
      </div>
    </div>
  );
}

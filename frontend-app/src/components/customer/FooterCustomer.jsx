import React from "react";
import { Home, ShoppingCart, List } from "lucide-react";

export default function FooterCustomer({
  active = "home", // 'home' | 'cart' | 'orders'
  cartCount = 0,
  onHome = () => {},
  onCart = () => {},
  onOrders = () => {},
}) {
  const iconClass = (name) =>
    `transition-colors ${active === name ? "text-amber-600" : "text-gray-400"}`;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-400 shadow-amber-100 z-50 md:hidden rounded-t-xl">
      <div className="max-w-3xl mx-auto flex justify-between items-center px-6 py-2">
        <button
          onClick={onHome}
          aria-label="Home"
          className="flex flex-col items-center gap-1 focus:outline-none"
        >
          <Home size={20} className={iconClass("home")} />
          <span
            className={`text-xs ${
              active === "home" ? "text-amber-600" : "text-gray-500"
            }`}
          >
            Home
          </span>
        </button>

        <button
          onClick={onCart}
          aria-label="Cart"
          className="relative flex flex-col items-center gap-1 focus:outline-none"
        >
          <ShoppingCart size={20} className={iconClass("cart")} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-none text-white bg-amber-600 rounded-full">
              {cartCount}
            </span>
          )}
          <span
            className={`text-xs ${
              active === "cart" ? "text-amber-600" : "text-gray-500"
            }`}
          >
            Cart
          </span>
        </button>

        <button
          onClick={onOrders}
          aria-label="My Orders"
          className="flex flex-col items-center gap-1 focus:outline-none"
        >
          <List size={20} className={iconClass("orders")} />
          <span
            className={`text-xs ${
              active === "orders" ? "text-amber-600" : "text-gray-500"
            }`}
          >
            My Order
          </span>
        </button>
      </div>
    </footer>
  );
}

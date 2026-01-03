import { Home, ShoppingCart, List } from "lucide-react";

export default function BottomNavbar({
  active = "home", // 'home' | 'cart' | 'orders'
  cartCount = 0,
  onHome = () => {},
  onCart = () => {},
  onOrders = () => {},
}) {
  const buttonClasses = (name) => {
    const isActive = active === name;
    return [
      "relative flex items-center justify-center focus:outline-none",
      "text-amber-600 rounded-full px-3 py-2",
      isActive ? "bg-amber-600 text-white shadow-md" : "text-amber-600",
    ].join(" ");
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-600 shadow-sm z-50 rounded-t-xl">
      <div className="flex justify-between items-center px-6 sm:px-8 md:max-w-4xl lg:max-w-5xl md:mx-auto min-h-[50px] sm:min-h-[56px] md:min-h-[60px]">
        {/** determine if cart is active for badge styling */}
        {/** keeping button/icon logic as-is, only badge changes */}
        <button
          onClick={onHome}
          aria-label="Home"
          className={buttonClasses("home")}
        >
          <Home size={25} />
        </button>

        <button
          onClick={onCart}
          aria-label="Cart"
          className={buttonClasses("cart")}
        >
          <ShoppingCart size={25} />
          {cartCount > 0 && (
            <span
              className={[
                "absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-semibold leading-none rounded-full transition-colors",
                active === "cart"
                  ? "text-white bg-amber-600 border border-gray-200"
                  : "text-white bg-amber-600 border border-amber-500",
              ].join(" ")}
            >
              {cartCount}
            </span>
          )}
        </button>

        <button
          onClick={onOrders}
          aria-label="My Orders"
          className={buttonClasses("orders")}
        >
          <List size={25} />
        </button>
      </div>
    </footer>
  );
}

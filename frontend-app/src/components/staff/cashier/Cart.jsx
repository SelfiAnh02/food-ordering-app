// src/components/staff/cashier/Cart.jsx

import CartItem from "./CartItem";
import CartSummary from "./CartSummary";

export default function Cart({ cart, onAdd, onMinus, onRemove, onSubmit }) {
  const items = Object.values(cart || {});
  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);

  return (
    <div className="w-full sm:w-80 bg-white border border-amber-100 rounded-2xl shadow-sm p-4 flex flex-col">
      <h2 className="text-lg font-semibold text-amber-800 mb-3">Keranjang</h2>

      <div className="flex-1 space-y-2 overflow-y-auto hide-scrollbar">
        {items.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-4">
            Keranjang kosong
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onAdd={() => onAdd(item)}
              onMinus={() => onMinus(item)}
              onRemove={() => onRemove(item)}
            />
          ))
        )}
      </div>

      <CartSummary
        total={total}
        onSubmit={onSubmit}
        disabled={items.length === 0}
      />
    </div>
  );
}

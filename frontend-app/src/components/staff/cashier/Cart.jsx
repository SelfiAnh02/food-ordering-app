// src/components/staff/cashier/Cart.jsx
import { useState } from "react";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function Cart({
  cart,
  onAdd,
  onMinus,
  onRemove,
  onSubmit,
  total,
  submitting = false,
}) {
  // mobile: collapsed by default
  const [open, setOpen] = useState(false);

  // compact total for bottom bar
  const compactTotal = total ?? 0;

  return (
    <>
      {/* Desktop: static sidebar */}
      <div className="hidden md:flex md:flex-col md:w-[380px] bg-white shadow-lg p-4">
        <h2 className="text-lg font-semibold text-amber-800">Keranjang</h2>

        <div className="flex-1 overflow-y-auto mt-3 space-y-3">
          {cart.length === 0 ? (
            <div className="text-gray-400 text-sm text-center">
              Keranjang kosong
            </div>
          ) : (
            cart.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onAdd={() => onAdd(item._id)}
                onMinus={() => onMinus(item._id)}
                onRemove={() => onRemove(item._id)}
              />
            ))
          )}
        </div>

        <CartSummary
          total={total}
          onSubmit={onSubmit}
          disabled={cart.length === 0 || submitting}
        />
      </div>

      {/* Mobile: fixed bottom compact bar + expandable panel */}
      <div className="md:hidden">
        {/* Compact bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-2 bg-white border-t shadow-inner flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-amber-800">
              Keranjang
            </div>
            <div className="text-xs text-gray-600">({cart.length})</div>
            <div className="ml-3 text-sm font-bold text-[#FF8A00]">
              Rp {Number(compactTotal).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen((s) => !s)}
              type="button"
              className="p-2 rounded bg-amber-600 text-white"
              aria-expanded={open}
            >
              {open ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>

        {/* Expandable panel */}
        <div
          className={`fixed left-0 right-0 bottom-14 z-40 transition-transform duration-200 ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-3 mb-3 bg-white rounded-t-xl shadow-lg p-4 max-h-[60vh] overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-amber-800">
                Keranjang
              </h3>
              <button
                onClick={() => setOpen(false)}
                type="button"
                className="text-gray-600"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3">
              {cart.length === 0 ? (
                <div className="text-gray-400 text-sm text-center">
                  Keranjang kosong
                </div>
              ) : (
                cart.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onAdd={() => onAdd(item._id)}
                    onMinus={() => onMinus(item._id)}
                    onRemove={() => onRemove(item._id)}
                  />
                ))
              )}
            </div>

            <div className="mt-4">
              <CartSummary
                total={total}
                onSubmit={() => {
                  onSubmit();
                  setOpen(false);
                }}
                disabled={cart.length === 0 || submitting}
              />
            </div>
          </div>
        </div>

        {/* spacing so page content not hidden behind fixed bar */}
        <div className="h-20" />
      </div>
    </>
  );
}

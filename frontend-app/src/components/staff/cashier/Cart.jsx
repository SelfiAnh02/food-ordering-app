import { useState } from "react";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import { ShoppingCart } from "lucide-react";

export default function Cart({
  cart,
  onAdd,
  onMinus,
  onRemove,
  onSubmit,
  total,
  submitting = false,
}) {
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <>
      {/* DESKTOP & TABLET */}
      <div className="hidden md:flex flex-col h-full w-[320px] lg:w-[360px] bg-white shadow-md relative">
        {/* HEADER */}
        <div className="p-4 pb-2 bg-white sticky top-0 z-20 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-800 text-center">
            Keranjang
          </h2>
        </div>

        {/* LIST — SCROLL */}
        <div className="flex-1 overflow-y-auto px-4 space-y-3 py-4 pb-28">
          {cart.length ? (
            cart.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onAdd={() => onAdd(item._id)}
                onMinus={() => onMinus(item._id)}
                onRemove={() => onRemove(item._id)}
              />
            ))
          ) : (
            <div className="text-gray-400 text-center mt-4">
              Keranjang kosong
            </div>
          )}
        </div>

        {/* FIXED SUMMARY BUTTON */}
        <div className="sticky bottom-0 bg-white p-2 shadow-lg z-30">
          <CartSummary
            total={total}
            disabled={!cart.length || submitting}
            onSubmit={onSubmit}
          />
        </div>
      </div>

      {/* MOBILE BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-4 py-2 flex items-center justify-between z-40">
        <button
          className="flex items-center gap-2 text-amber-800 font-semibold"
          onClick={() => setOpenMobile(true)}
        >
          <ShoppingCart size={20} /> ({cart.length})
        </button>

        <button
          className="bg-amber-600 text-white px-3 py-2 rounded-lg text-sm"
          disabled={!cart.length || submitting}
          onClick={onSubmit}
        >
          Simpan
        </button>
      </div>

      {/* MOBILE MODAL CART */}
      {openMobile && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="w-72 bg-white h-full p-4 shadow-xl flex flex-col">
            <button
              className="text-gray-500 mb-3 text-sm"
              onClick={() => setOpenMobile(false)}
            >
              Tutup
            </button>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onAdd={() => onAdd(item._id)}
                  onMinus={() => onMinus(item._id)}
                  onRemove={() => onRemove(item._id)}
                />
              ))}
            </div>

            <div className="pt-3 border-t mt-3 bg-white sticky bottom-0">
              <CartSummary
                total={total}
                disabled={!cart.length || submitting}
                onSubmit={() => {
                  setOpenMobile(false);
                  onSubmit();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

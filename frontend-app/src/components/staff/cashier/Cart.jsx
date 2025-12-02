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

  // Default dine-in
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState("dine-in");

  // Validasi tombol bayar
  const isSubmitDisabled =
    submitting ||
    !cart.length ||
    (orderType === "dine-in" && tableNumber.trim() === "");

  const handleSubmit = () => {
    if (isSubmitDisabled) return;

    onSubmit({
      tableNumber: orderType === "dine-in" ? tableNumber : null,
      orderType,
    });
  };

  return (
    <>
      {/* DESKTOP & TABLET */}
      <div className="hidden md:flex flex-col h-full w-[320px] lg:w-[360px] bg-white shadow-md relative">
        {/* HEADER */}
        <div className="p-4 pb-2 bg-white sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-amber-800">Keranjang</h2>

            {/* Order Controls */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="No Meja"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                disabled={orderType !== "dine-in"}
                className={`
                  w-20 px-2 py-1 rounded-lg border text-sm
                  ${
                    orderType === "dine-in"
                      ? "border-amber-300 focus:border-amber-500"
                      : "bg-gray-100 border-gray-200 cursor-not-allowed"
                  }
                `}
              />

              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="
                  px-2 py-1 rounded-lg border border-amber-300 
                  focus:outline-none focus:border-amber-500
                  text-sm bg-white
                "
              >
                <option value="dine-in">Dine-In</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* LIST */}
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

        {/* SUMMARY DESKTOP */}
        <div className="sticky bottom-0 bg-white p-2 shadow-lg z-30">
          <CartSummary
            total={total}
            disabled={isSubmitDisabled}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden">
        {/* 🔥 MOBILE BOTTOM BAR — muncul sebelum modal dibuka */}
        {cart.length > 0 && (
          <div
            className="
              md:hidden fixed bottom-0 left-0 right-0
            bg-white shadow-md z-40
              px-4 py-2 flex items-center justify-between
            "
          >
            {/* ICON BUBBLE ORANGE */}
            <button onClick={() => setOpenMobile(true)} className="relative">
              <div
                className="
                  w-10 h-10 rounded-full 
                  bg-amber-600 flex items-center justify-center
                  shadow-md
                "
              >
                <ShoppingCart size={20} className="text-white" />
              </div>

              {/* BADGE KECIL */}
              {cart.length > 0 && (
                <span
                  className="
                    absolute -top-1 -right-1
                    bg-amber-600 text-white 
                    text-[10px] font-semibold
                    px-1.5 py-[1px] rounded-full
                    shadow
                  "
                >
                  {cart.length}
                </span>
              )}
            </button>

            {/* TOTAL HARGA */}
            <div className="font-bold text-amber-800 text-base">
              Rp {total.toLocaleString()}
            </div>

            {/* TOMBOL BAYAR */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="
                bg-amber-600 text-white px-4 py-2 rounded-lg text-sm
                font-semibold shadow
                disabled:bg-gray-300 disabled:cursor-not-allowed
                hover:bg-amber-700 transition
              "
            >
              Bayar Sekarang
            </button>
          </div>
        )}

        {/* MOBILE CART MODAL */}
        {openMobile && (
          <div className="fixed inset-0 bg-black/50 z-50">
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold text-amber-800">
                  Keranjang
                </h2>
                <button onClick={() => setOpenMobile(false)}>X</button>
              </div>

              {/* ORDER CONTROLS MOBILE */}
              <div className="p-4 flex gap-3">
                <input
                  type="text"
                  placeholder="No Meja"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  disabled={orderType !== "dine-in"}
                  className={`
                    w-24 px-2 py-1 rounded-lg border text-sm
                    ${
                      orderType === "dine-in"
                        ? "border-amber-300 focus:border-amber-500"
                        : "bg-gray-100 border-gray-200 cursor-not-allowed"
                    }
                  `}
                />

                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="
                    flex-1 px-2 py-1 rounded-lg border border-amber-300 
                    focus:outline-none focus:border-amber-500
                    text-sm bg-white
                  "
                >
                  <option value="dine-in">Dine-In</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>

              {/* LIST */}
              <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-28">
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

              {/* Summary Mobile */}
              <div className="sticky bottom-0 bg-white p-2 shadow-lg">
                <CartSummary
                  total={total}
                  disabled={isSubmitDisabled}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

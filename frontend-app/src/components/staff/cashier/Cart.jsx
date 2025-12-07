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
  // parent must pass this to persist notes
  onUpdateNotes,
}) {
  const [openMobile, setOpenMobile] = useState(false);

  // Default dine-in
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [customerName, setCustomerName] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [notesInput, setNotesInput] = useState("");

  // Validasi tombol bayar
  const isSubmitDisabled =
    submitting ||
    !cart.length ||
    (orderType === "dine-in"
      ? tableNumber.trim() === ""
      : customerName.trim() === "");

  const handleSubmit = () => {
    if (isSubmitDisabled) return;

    onSubmit({
      tableNumber: orderType === "dine-in" ? tableNumber : null,
      orderType,
      customerName: orderType === "dine-in" ? null : customerName,
    });
  };

  const openDetails = (item) => {
    setSelectedItem(item);
    setNotesInput(item?.notes || "");
  };

  const closeDetails = () => {
    setSelectedItem(null);
    setNotesInput("");
  };

  const saveNotes = () => {
    if (!selectedItem) return;

    if (typeof onUpdateNotes === "function") {
      onUpdateNotes(selectedItem._id, notesInput);
    } else {
      console.warn(
        "onUpdateNotes not provided — note won't persist to parent state"
      );
    }

    closeDetails();
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
              {/* Show table input for dine-in, or customer name for takeaway/delivery */}
              {orderType === "dine-in" ? (
                <input
                  type="text"
                  placeholder="No Meja"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className={`w-20 px-2 py-1 rounded-lg border text-sm text-amber-800 border-amber-400 focus:border-amber-500`}
                />
              ) : (
                <input
                  type="text"
                  placeholder="Nama Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-28 md:w-30 max-w-[160px] px-2 py-1 rounded-lg border text-sm border-amber-400 text-amber-800"
                />
              )}

              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="px-2 py-1 rounded-lg border border-amber-400 focus:outline-none focus:border-amber-500 text-sm text-amber-800 bg-white"
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
                onOpenDetails={openDetails} // pass function, CartItem should call onOpenDetails(item)
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

        {/* ---------- DESKTOP FLOATING DETAILS PANEL (melayang di atas keranjang) ---------- */}
        {selectedItem && (
          <div
            className="hidden md:block absolute z-50"
            style={{
              right: "0.75rem", // jarak dari sisi kanan cart container
              top: "3.5rem", // sedikit di bawah header (sesuaikan jika perlu)
              width: "20rem", // w-80 ~ 320px; gunakan angka agar konsisten
            }}
            aria-modal="true"
            role="dialog"
          >
            <div className="bg-white rounded-lg shadow-xl p-4 border">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">
                    {selectedItem.name}
                  </h3>
                  {selectedItem.shortDescription && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedItem.shortDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* NOTES FORM */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Catatan untuk item (opsional)
                </label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Contoh: tanpa bawang, pedas level 2, dsb."
                  className="mt-2 w-full min-h-[80px] px-3 py-2 border rounded-md resize-y"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-3 py-2 rounded-md bg-gray-100"
                  onClick={closeDetails}
                >
                  Batal
                </button>
                <button
                  className="px-3 py-2 rounded-md bg-amber-600 text-white"
                  onClick={saveNotes}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden">
        {/* 🔥 MOBILE BOTTOM BAR — selalu tampil, tapi tombol disabled jika cart kosong */}
        <div
          className="
            bg-white
            fixed bottom-0 left-0 right-0
            p-3 flex items-center justify-between
            shadow-[0_-4px_12px_rgba(0,0,0,0.15)]
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

            {/* BADGE KECIL — tampilkan hanya kalau ada item */}
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

          {/* TOTAL HARGA — tetap tampil (Rp 0 saat kosong) */}
          <div className="font-bold text-amber-800 text-base">
            Rp {Number(total || 0).toLocaleString()}
          </div>

          {/* TOMBOL BAYAR — disabled jika keranjang kosong */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled || cart.length === 0}
            className={`
              bg-amber-600 text-white px-4 py-2 rounded-lg text-sm
              font-semibold shadow
              disabled:bg-gray-300 disabled:cursor-not-allowed
              hover:bg-amber-700 transition
            `}
          >
            Bayar Sekarang
          </button>
        </div>

        {/* spacer supaya list tidak tertutup */}
        <div className="h-16" />

        {/* MOBILE CART MODAL */}
        {openMobile && (
          <div className="fixed inset-0 bg-black/50 z-50">
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col">
              {/* Header */}
              <div className="px-4 py-2 flex items-center justify-between shadow-sm">
                <h2 className="text-lg font-semibold text-amber-800">
                  Keranjang
                </h2>
                <button
                  onClick={() => setOpenMobile(false)}
                  className="sm:w-auto px-3 py-2 rounded-md border bg-amber-600 text-sm text-white"
                >
                  Close
                </button>
              </div>

              {/* ORDER CONTROLS MOBILE */}
              <div className="p-4 flex gap-3">
                {/* MOBILE: show table or customer name */}
                {orderType === "dine-in" ? (
                  <input
                    type="text"
                    placeholder="No Meja"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className={`w-24 px-2 py-1 rounded-lg border text-sm text-amber-800 border-amber-400 focus:border-amber-500`}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Nama Customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1 rounded-lg border text-amber-800 border-amber-400 text-sm"
                  />
                )}

                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="flex-1 px-2 py-1 text-amber-800 rounded-lg border border-amber-400 focus:outline-none focus:border-amber-500 text-sm bg-white"
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
                      onOpenDetails={openDetails} // pass function
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
                  disabled={isSubmitDisabled || cart.length === 0}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          </div>
        )}

        {/* MOBILE selectedItem modal: full-screen overlay so user can edit notes comfortably */}
        {selectedItem && (
          <div
            className="md:hidden fixed inset-0 z-60 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={closeDetails}
            />
            <div className="relative bg-white rounded-lg shadow-xl p-4 z-10 mx-4 w-full max-w-md">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">
                    {selectedItem.name}
                  </h3>
                  {selectedItem.shortDescription && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedItem.shortDescription}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Catatan untuk item (opsional)
                </label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Contoh: tanpa bawang, pedas level 2, dsb."
                  className="mt-2 w-full min-h-[80px] px-3 py-2 border rounded-md resize-y"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-3 py-2 rounded-md bg-gray-100"
                  onClick={closeDetails}
                >
                  Batal
                </button>
                <button
                  className="px-3 py-2 rounded-md bg-amber-600 text-white"
                  onClick={saveNotes}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

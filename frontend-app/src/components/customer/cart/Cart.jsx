import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";

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
  initialTableNumber = "",
  getOrderMeta,
  setOrderMeta,
}) {
  // Default dine-in
  // tableNumber comes from QR flow (not editable here)
  // Order type is fixed to dine-in (QR provides table number)
  const initialMeta =
    typeof getOrderMeta === "function" ? getOrderMeta() : null;
  const [customerName, setCustomerName] = useState(
    (initialMeta && (initialMeta.customerName || "")) || ""
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    (initialMeta &&
      (initialMeta.whatsappNumber || initialMeta.customerWhatsapp || "")) ||
      ""
  );
  const [selectedItem, setSelectedItem] = useState(null);
  const [notesInput, setNotesInput] = useState("");
  const [orderType, setOrderType] = useState("Dine-In");
  // Resolve table number strictly from URL when present; no default to "1"
  const location = useLocation();
  const params = new URLSearchParams(location.search || "");
  const tableFromUrl = params.get("table") || params.get("tableNumber") || "";
  const rawSearch = (location.search || "").toLowerCase();
  const tableKeyPresent =
    /[?&](tablenumber|table)\b/i.test(location.search || "") ||
    rawSearch.includes("tablenumber") ||
    rawSearch.includes("&table=") ||
    rawSearch.includes("?table=");
  const allowedTables = useMemo(
    () => new Set(Array.from({ length: 15 }, (_, i) => String(i + 1))),
    []
  );
  const isTableParamPresent = !!tableFromUrl || tableKeyPresent;
  const isValidTable =
    !isTableParamPresent || allowedTables.has(String(tableFromUrl));
  // Use URL value when present and valid; otherwise use provided initialTableNumber or empty
  const tableResolved = String(
    (isTableParamPresent && isValidTable && tableFromUrl) ||
      initialTableNumber ||
      ""
  );

  // Validasi tombol bayar
  const isSubmitDisabled =
    submitting ||
    !cart.length ||
    customerName.trim() === "" ||
    whatsappNumber.trim() === "" ||
    tableResolved.trim() === "";

  const handleSubmit = () => {
    if (isSubmitDisabled) return;

    onSubmit({
      tableNumber: tableResolved,
      orderType,
      customerName,
      whatsappNumber,
    });
  };
  // Initialize orderType from persisted meta (if any)
  // and persist when changed
  // Note: getOrderMeta/setOrderMeta are optional
  if (
    typeof getOrderMeta === "function" &&
    typeof setOrderMeta === "function"
  ) {
    try {
      const meta = getOrderMeta();
      if (
        meta?.orderType &&
        (meta.orderType === "Dine-In" || meta.orderType === "Takeaway")
      ) {
        if (orderType !== meta.orderType) {
          setOrderType(meta.orderType);
        }
      }
    } catch (e) {
      console.warn("Failed to read order meta", e);
    }
  }

  const onOrderTypeChange = (next) => {
    setOrderType(next);
    if (typeof setOrderMeta === "function") {
      try {
        setOrderMeta({ orderType: next });
      } catch (e) {
        console.warn("Failed to write order meta", e);
      }
    }
  };

  // Persist tableNumber so MyOrder can retrieve it when opened standalone
  if (typeof setOrderMeta === "function") {
    setOrderMeta({ tableNumber: tableResolved });
  }

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
    <div className="flex flex-col h-full w-full bg-white overflow-hidden relative">
      {/* HEADER (fixed) */}
      <div className="fixed left-0 right-0 top-0 z-20 bg-white shadow-sm border-b border-amber-400 rounded-xl">
        <div className="w-full lg:max-w-5xl mx-auto px-4 md:px-6 py-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-lg font-bold text-amber-800">Keranjang</h2>
          </div>
          {/* Controls: Order Type + Table (if dine-in) + Nama + WhatsApp */}
          <div className="m-2 mb-0 grid grid-cols-2 gap-2">
            <select
              value={orderType}
              onChange={(e) => onOrderTypeChange(e.target.value)}
              className="h-8 px-2 rounded-lg border text-sm text-amber-800 border-amber-400 w-full"
            >
              <option value="Dine-In">Dine-In</option>
              <option value="Takeaway">Takeaway</option>
            </select>
            <input
              type="text"
              placeholder="No Meja (dari QR)"
              value={tableResolved}
              readOnly
              className="h-8 px-2 rounded-lg border text-sm text-amber-800 border-amber-400 w-full bg-gray-50"
            />
          </div>

          <div className="m-2 mt-2 grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Nama Customer"
              value={customerName}
              onChange={(e) => {
                const v = e.target.value;
                setCustomerName(v);
                if (typeof setOrderMeta === "function") {
                  try {
                    setOrderMeta({ customerName: v });
                  } catch (err) {
                    console.warn("Failed to persist customerName", err);
                  }
                }
              }}
              className="h-8 px-2 rounded-lg border text-sm text-amber-800 border-amber-400 w-full"
            />
            <input
              type="tel"
              placeholder="No WhatsApp"
              value={whatsappNumber}
              onChange={(e) => {
                const v = e.target.value;
                setWhatsappNumber(v);
                if (typeof setOrderMeta === "function") {
                  try {
                    setOrderMeta({ whatsappNumber: v, customerWhatsapp: v });
                  } catch (err) {
                    console.warn("Failed to persist WhatsApp", err);
                  }
                }
              }}
              className="h-8 px-2 rounded-lg border text-sm text-amber-800 border-amber-400 w-full"
            />
          </div>
        </div>
      </div>

      {/* Spacer equal to header height so content starts below it */}
      <div className="h-[122px]" />

      {/* LIST */}
      <div
        className="w-full lg:max-w-5xl mx-auto px-4 md:px-6 flex-1 overflow-y-auto mt-4 space-y-3 py-2 pb-[100px] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cart.length ? (
          cart.map((item) => (
            <CartItem
              key={item._id}
              item={item}
              onAdd={() => onAdd(item._id)}
              onMinus={() => onMinus(item._id)}
              onRemove={() => onRemove(item._id)}
              onOpenDetails={openDetails}
            />
          ))
        ) : (
          <div className="text-gray-400 text-center mt-4">Keranjang kosong</div>
        )}
      </div>

      {/* SUMMARY fixed just above bottom navbar (no overlap) */}
      <div className="fixed left-0 right-0 bottom-[44px] bg-white p-2 shadow-lg z-40">
        <div className="w-full lg:max-w-5xl mx-auto px-4 md:px-6">
          <CartSummary
            total={total}
            disabled={isSubmitDisabled || cart.length === 0}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* Notes modal: unified for all breakpoints */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center"
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
  );
}

// src/components/staff/cashier/CartSummary.jsx

export default function CartSummary({ total, onSubmit, disabled, submitting }) {
  return (
    <div className="border-t pt-3 mt-3">
      <div className="flex justify-between text-sm mb-3">
        <span className="text-gray-600">Total:</span>
        <span className="font-bold text-[#FF8A00] text-lg">
          Rp {total.toLocaleString()}
        </span>
      </div>

      <button
        disabled={disabled}
        onClick={onSubmit}
        className={`w-full py-3 rounded-xl text-white font-semibold shadow-sm transition ${
          disabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-amber-600 hover:bg-amber-700"
        }`}
      >
        {submitting ? "Menyimpan..." : "Simpan Transaksi"}
      </button>
    </div>
  );
}

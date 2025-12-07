import React, { useState, useEffect } from "react";
import { Wallet, QrCode, CreditCard, Banknote } from "lucide-react";

/**
 * PaymentMethodModal (improved)
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void       // dipanggil ketika pengguna menekan "Kembali"
 *  - onChoose: (methodKey: string) => void // dipanggil hanya ketika user menekan "Bayar"
 *
 * Perubahan penting:
 *  - Klik opsi hanya memilih (highlight) — tidak otomatis submit.
 *  - Tombol "✕" di header dihapus.
 *  - Footer memiliki dua tombol: "Kembali" (panggil onClose) dan "Bayar" (panggil onChoose(selected)).
 */
export default function PaymentMethodModal({ open, onClose, onChoose }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!open) {
      // reset selected ketika modal ditutup
      setSelected(null);
    }
  }, [open]);

  if (!open) return null;

  const methods = [
    { key: "cash", label: "Cash / Tunai", icon: <Banknote size={26} /> },
    { key: "qris", label: "QRIS", icon: <QrCode size={26} /> },
    { key: "edc", label: "Kartu (EDC)", icon: <CreditCard size={26} /> },
    { key: "transfer", label: "Transfer Bank", icon: <Wallet size={26} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-fadeIn">
        {/* HEADER */}
        <div className="flex justify-center text-center items-center mb-4">
          <h2 className="text-xl font-bold  text-amber-800">
            Pilih Metode Pembayaran
          </h2>
        </div>
        {/* GRID OPTIONS */}
        <div className="grid grid-cols-2 gap-4">
          {methods.map((m) => {
            const isActive = selected === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setSelected(m.key)}
                className={`
                  border rounded-xl px-4 py-5 flex flex-col items-center justify-center
                  transition shadow-sm
                  ${
                    isActive
                      ? "bg-amber-50 border-amber-600 shadow-md"
                      : "hover:bg-amber-50 hover:border-amber-300"
                  }
                `}
                aria-pressed={isActive}
              >
                <div className="text-amber-600 mb-3">{m.icon}</div>
                <span className="font-semibold text-gray-800">{m.label}</span>
                {isActive && (
                  <div className="mt-2 text-xs text-amber-700">Terpilih</div>
                )}
              </button>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              // Kembali: tutup modal dan reset (onClose menangani state di parent)
              setSelected(null);
              onClose && onClose();
            }}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
          >
            Back
          </button>

          <button
            onClick={() => {
              if (!selected) return;
              onChoose && onChoose(selected);
            }}
            disabled={!selected}
            className={`
              px-4 py-2 rounded-lg text-sm font-semibold
              ${
                selected
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Charge
          </button>
        </div>
      </div>
    </div>
  );
}

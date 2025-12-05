import { Printer } from "lucide-react";

export default function ReceiptModal({ open, onClose, order }) {
  if (!open) return null;

  const used = order?.data ?? order ?? {};
  const items = Array.isArray(used.items) ? used.items : [];

  const normalize = (it) => {
    const prod = it.product ?? it;
    const name = prod?.name ?? prod?.productName ?? it?.name ?? "Item";
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const price = Number(
      prod?.price ?? it.productPrice ?? it?.price ?? it?.unitPrice ?? 0
    );
    const note = it?.note ?? it?.notes ?? prod?.note ?? null;
    const subtotal = qty * price;
    return { name, qty, price, note, subtotal };
  };

  const normalized = items.map(normalize);
  const totalFromBackend = Number(used.totalPrice ?? used.total ?? 0);
  const computedTotal = normalized.reduce((s, it) => s + it.subtotal, 0);
  // per request: show only subtotal (computed from items). Keep backend total only as fallback when subtotal is missing.
  const subtotalToShow = computedTotal || totalFromBackend;

  function formatRp(n) {
    return "Rp " + Number(n || 0).toLocaleString("id-ID");
  }

  function formatDate(d) {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center px-4 py-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-print-area, #receipt-print-area * { visibility: visible; }
          #receipt-print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <div>
            <div className="text-sm text-gray-500">Sajane Tea & Coffee Bar</div>
            <div className="text-lg font-semibold">
              Order #{String(used._id ?? used.id ?? "").slice(-6)}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(used.createdAt)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded bg-amber-600 text-white text-sm flex items-center gap-2"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        <div id="receipt-print-area">
          <div className="p-3 space-y-1 text-sm text-gray-800">
            {/* show only Table for dine-in, otherwise show Customer */}
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {String(used.orderType ?? used.type ?? "").toLowerCase() ===
                "dine-in"
                  ? "Table"
                  : "Customer"}
              </div>
              <div className="font-semibold mt-0.5">
                {String(used.orderType ?? used.type ?? "").toLowerCase() ===
                "dine-in"
                  ? used.tableNumber ?? used.table ?? "-"
                  : used.customerName ?? used.customer ?? "-"}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">Order Type</div>
              <div className="font-semibold mt-0.5">
                {String(used.orderType ?? used.type ?? "-").toUpperCase()}
              </div>
            </div>

            <div className="border-t pt-2">
              <div className="text-xs text-gray-500 mb-2">Items</div>
              <div className="space-y-2">
                {normalized.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start gap-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{it.name}</div>
                      <div className="text-xs text-gray-500">
                        x{it.qty} • {formatRp(it.price)}
                      </div>
                      {it.note ? (
                        <div className="text-xs text-gray-500 italic">
                          Note: {it.note}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-sm font-semibold whitespace-nowrap">
                      {formatRp(it.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm text-gray-700">
                <div>Subtotal</div>
                <div>{formatRp(subtotalToShow)}</div>
              </div>

              {used.discount && (
                <div className="flex justify-between text-sm text-gray-700">
                  <div>Discount</div>
                  <div>-{formatRp(used.discount)}</div>
                </div>
              )}

              {used.tax && (
                <div className="flex justify-between text-sm text-gray-700">
                  <div>Tax</div>
                  <div>{formatRp(used.tax)}</div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              <div className="text-xs text-gray-500">Payment</div>
              {(() => {
                // Defensive extraction for payment method across different response shapes
                const rawMethod =
                  used?.paymentDetails?.method ??
                  used?.payment?.method ??
                  used?.paymentMethod ??
                  used?.paymentDetails?.paymentMethod ??
                  used?.payment?.paymentMethod ??
                  used?.payment?.payment?.method ??
                  null;
                const methodLabel = rawMethod
                  ? String(rawMethod).toUpperCase()
                  : "-";

                const rawStatus =
                  used?.payment?.status ?? used?.paymentStatus ?? null;
                const statusLabel = rawStatus
                  ? String(rawStatus).toUpperCase()
                  : "-";

                return (
                  <>
                    <div className="text-sm">Method: {methodLabel}</div>
                    <div className="text-sm">Status: {statusLabel}</div>
                    {used.payment?.paymentId && (
                      <div className="text-xs text-gray-500">
                        Payment ID: {used.payment.paymentId}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {used.notes && (
              <div className="pt-2">
                <div className="text-xs text-gray-500">Order Notes</div>
                <div className="text-sm">{used.notes}</div>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded border">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import ReceiptModal from "../cashier/ReceiptModal";

/**
 * Props:
 * - open, onClose, order, onUpdateStatus, loadOrderDetail
 */
export default function OrderDetailModal({
  open,
  onClose,
  order,
  onUpdateStatus,
  loadOrderDetail,
}) {
  const [detail, setDetail] = useState(order || null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => setDetail(order || null), [order]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!open) return;
      const id = order?._id ?? order?.id;
      const needLoad =
        !!id &&
        (!order?.items ||
          (Array.isArray(order.items) &&
            order.items.length &&
            typeof order.items[0].product === "string"));

      if (needLoad && typeof loadOrderDetail === "function") {
        setLoadingDetail(true);
        try {
          const res = await loadOrderDetail(id);
          if (mounted && res) setDetail(res);
        } catch (err) {
          console.error(err);
        } finally {
          if (mounted) setLoadingDetail(false);
        }
      }
    }
    load();
    return () => (mounted = false);
  }, [open, order, loadOrderDetail]);

  if (!open) return null;

  const used = detail || order || {};
  const items = Array.isArray(used.items) ? used.items : [];

  // Normalize item fields and compute subtotal per item
  const normalizedItems = items.map((it) => {
    const prod = it.product ?? it;
    const name = prod?.name ?? prod?.productName ?? it?.name ?? "Item";
    const qty = Number(it.quantity ?? it.qty ?? 1);
    // prefer populated product price, fallback to stored productPrice or item price
    const price = Number(
      prod?.price ?? it.productPrice ?? it?.price ?? it?.unitPrice ?? 0
    );
    const note = it?.note ?? it?.notes ?? prod?.note ?? prod?.notes ?? null;
    const lineTotal = qty * price;
    return { name, qty, price, note, lineTotal };
  });

  // Compute total from normalized items (this ensures accuracy)
  const computedTotal = normalizedItems.reduce(
    (s, it) => s + (Number(it.lineTotal) || 0),
    0
  );

  const id = used._id ?? used.id ?? "unknown";
  const status = (used.orderStatus ?? used.status ?? "")
    .toString()
    .toLowerCase();
  const orderType = (used.orderType ?? used.type ?? "")
    .toString()
    .toLowerCase();

  // Be defensive: backend may return payment info in several shapes.
  const paymentStatus = (
    used.payment?.status ??
    used.paymentStatus ??
    used.payment_status ??
    ""
  )
    .toString()
    .toLowerCase();

  const paymentMethod = (
    used.paymentDetails?.method ??
    used.paymentMethod ??
    used.payment?.method ??
    used.payment?.paymentMethod ??
    used.payment?.payment_method ??
    ""
  )
    .toString()
    .toLowerCase();

  const paymentId =
    used.payment?.paymentId ??
    used.paymentId ??
    used.payment?.id ??
    used.payment_id ??
    null;

  const paymentUrl =
    used.payment?.paymentUrl ??
    used.paymentUrl ??
    used.payment?.url ??
    used.payment?.payment_url ??
    null;

  const statusClasses = (s) => {
    if (s === "pending") return "bg-yellow-100 text-amber-800";
    if (s === "confirmed") return "bg-blue-100 text-blue-700";
    if (s === "delivered") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-700";
  };

  const typeClasses = (t) => {
    if (t === "dine-in")
      return "bg-amber-50 text-amber-800 border border-amber-100";
    if (t === "takeaway")
      return "bg-slate-50 text-slate-800 border border-slate-100";
    if (t === "delivery")
      return "bg-indigo-50 text-indigo-800 border border-indigo-100";
    return "bg-gray-50 text-gray-700 border border-gray-100";
  };

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

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-full max-w-xl bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-3 border-b">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-amber-800 truncate">
              Order #{String(id).slice(-6)}
            </h3>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${statusClasses(
                  status
                )}`}
              >
                {status ? status.toUpperCase() : "—"}
              </span>

              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${typeClasses(
                  orderType
                )}`}
              >
                {orderType ? orderType.toUpperCase() : "—"}
              </span>

              <div className="text-xs text-gray-500 ml-2">
                {used.createdAt
                  ? new Date(used.createdAt).toLocaleString()
                  : ""}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowReceipt(true)}
            className="text-gray-500 ml-4"
            title="Open receipt"
            aria-label="Open receipt"
          ></button>
        </div>

        {/* Body */}
        <div className="p-3 max-h-[70vh] overflow-y-auto space-y-2">
          {/* summary grid: show either Table (for dine-in) or Customer (for others). tighter spacing */}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <div>
              <div className="text-xs text-gray-500">
                {orderType === "dine-in" ? "Table" : "Customer"}
              </div>
              <div className="font-semibold mt-0.5">
                {orderType === "dine-in"
                  ? used.tableNumber ?? "-"
                  : used.customerName ?? "-"}
              </div>
            </div>
            <div />
          </div>

          {/* items */}
          <div>
            <div className="text-sm font-medium mb-3">Items</div>

            {loadingDetail ? (
              <div className="text-sm text-gray-500">Loading items...</div>
            ) : normalizedItems.length ? (
              <div className="space-y-2">
                {normalizedItems.map((it, idx) => (
                  <div
                    key={idx}
                    className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{it.name}</div>
                      <div className="text-xs text-gray-500">
                        x{it.qty} • {formatRp(it.price)}
                      </div>
                      {it.note ? (
                        <div className="mt-0 text-xs text-gray-500 italic truncate">
                          Note: {it.note}
                        </div>
                      ) : null}
                    </div>

                    <div className="text-sm font-semibold">
                      {formatRp(it.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">No items available</div>
            )}
          </div>

          {/* payment info */}
          {(paymentMethod || paymentStatus || paymentId || paymentUrl) && (
            <div>
              <div className="text-xs text-gray-500">Payment</div>
              <div className="mt-1 text-sm text-gray-700 space-y-1">
                <div>
                  <span className="text-xs text-gray-500">Method: </span>
                  <span className="font-semibold">
                    {paymentMethod ? paymentMethod.toUpperCase() : "-"}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Status: </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : paymentStatus === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-amber-800"
                    }`}
                  >
                    {paymentStatus ? paymentStatus.toUpperCase() : "-"}
                  </span>
                </div>

                {paymentId && (
                  <div>
                    <span className="text-xs text-gray-500">Payment ID: </span>
                    <span className="font-mono text-sm">{paymentId}</span>
                  </div>
                )}

                {paymentUrl && (
                  <div>
                    <a
                      className="text-amber-600 underline text-sm"
                      href={paymentUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open payment link
                    </a>
                    <div className="text-xs text-gray-500 mt-1">
                      Paid at:{" "}
                      {formatDate(
                        used.paymentDetails?.paidAt ?? used.payment?.paidAt
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {used.notes && (
            <div>
              <div className="text-xs text-gray-500">Order Notes</div>
              <div className="mt-1 text-sm text-gray-700">{used.notes}</div>
            </div>
          )}
        </div>

        {/* Footer actions (with total) */}
        <div className="p-3 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 bg-white">
          <div className="flex-1 text-sm text-gray-700 font-semibold flex items-center">
            <div className="mr-3">Total:</div>
            <div className="text-[#FF8A00] text-lg">
              {formatRp(used.totalPrice ?? computedTotal)}
            </div>
          </div>
          {status === "pending" && (
            <button
              onClick={() => onUpdateStatus?.(id, "confirmed")}
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-amber-600 text-white"
            >
              Siapkan Pesanan
            </button>
          )}
          {status === "confirmed" && (
            <button
              onClick={() => onUpdateStatus?.(id, "delivered")}
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-green-600 text-white"
            >
              Tandai Selesai
            </button>
          )}
          {/* Print receipt button */}
          <button
            onClick={() => setShowReceipt(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-amber-600 text-white"
          >
            Print Struk
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-3 py-2 rounded-md border"
          >
            Tutup
          </button>
        </div>
        {/* Receipt modal (opened from header button) */}
        <ReceiptModal
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
          order={used}
        />
      </div>
    </div>
  );
}

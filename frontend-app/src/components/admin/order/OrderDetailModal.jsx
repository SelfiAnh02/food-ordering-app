import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import ReceiptModal from "../../staff/cashier/ReceiptModal";

// Admin Order Detail: mirror staff detail view but without status-update actions
export default function OrderDetailModal({
  open,
  onClose,
  order,
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
  const normalizedItems = items.map((it) => {
    const prod = it.product ?? it;
    const name = prod?.name ?? prod?.productName ?? it?.name ?? "Item";
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const price = Number(
      prod?.price ?? it.productPrice ?? it?.price ?? it?.unitPrice ?? 0
    );
    const note = it?.note ?? it?.notes ?? prod?.note ?? prod?.notes ?? null;
    const lineTotal = qty * price;
    return { name, qty, price, note, lineTotal };
  });

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
    ""
  ).toString();

  // Defensive customer label: some orders use different field names for customer
  const customerLabel =
    orderType === "dine-in"
      ? used.tableNumber ?? used.table ?? "-"
      : used.customerName ??
        used.customer ??
        used.customer?.name ??
        used.recipientName ??
        used.deliveryName ??
        used.customer_name ??
        "-";

  // If normalizeOrder stripped customer fields, try to read from raw payload (__raw)
  const raw = used.__raw ?? {};
  const rawCandidate =
    raw.customerName ??
    raw.customer ??
    (raw.customer && raw.customer.name) ??
    raw.recipientName ??
    raw.deliveryName ??
    raw.recipient?.name ??
    raw.delivery?.recipientName ??
    raw.delivery?.customerName ??
    raw.contactName ??
    raw.buyerName ??
    raw.customer_name ??
    raw.name ??
    null;

  const finalCustomerLabel =
    orderType === "dine-in"
      ? used.tableNumber ?? used.table ?? "-"
      : customerLabel !== "-"
      ? customerLabel
      : rawCandidate ?? "-";

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
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-6 pb-24">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex-none flex items-start justify-between p-3 border-b">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-amber-800 truncate">
              Order #{String(id).slice(-6)}
            </h3>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  status === "pending"
                    ? "bg-yellow-100 text-amber-800"
                    : status === "confirmed"
                    ? "bg-blue-100 text-blue-700"
                    : status === "delivered"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {status ? status.toUpperCase() : "—"}
              </span>

              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  orderType === "dine-in"
                    ? "bg-amber-50 text-amber-800 border border-amber-100"
                    : orderType === "takeaway"
                    ? "bg-slate-50 text-slate-800 border border-slate-100"
                    : orderType === "delivery"
                    ? "bg-indigo-50 text-indigo-800 border border-indigo-100"
                    : "bg-gray-50 text-gray-700 border border-gray-100"
                }`}
              >
                {orderType ? orderType.toUpperCase() : "—"}
              </span>

              <div className="text-xs text-gray-500 ml-2">
                {formatDate(used.createdAt)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowReceipt(true)}
            className="ml-4 px-2 py-1 rounded bg-amber-600 text-white flex items-center gap-2 text-sm"
            title="Print receipt"
            aria-label="Print receipt"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-3 flex-1 overflow-auto space-y-1">
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <div>
              <div className="text-xs text-gray-500">
                {orderType === "dine-in" ? "Table" : "Customer"}
              </div>
              <div className="font-semibold mt-0.5">{finalCustomerLabel}</div>
            </div>
            <div />
          </div>

          <div>
            <div className="text-sm font-medium mb-3">Items</div>

            {loadingDetail ? (
              <div className="text-sm text-gray-500">Loading items...</div>
            ) : normalizedItems.length ? (
              <div className="space-y-1">
                {normalizedItems.map((it, idx) => (
                  <div
                    key={idx}
                    className="py-1 flex items-center justify-between gap-1"
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

          {(paymentMethod || paymentStatus) && (
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

        {/* Footer: show total but NO update-status buttons in admin */}
        <div className="flex-none p-3 border-t flex items-center justify-end gap-2 bg-white">
          <div className="flex-1 text-sm text-gray-700 font-semibold flex items-center">
            <div className="mr-3">Total:</div>
            <div className="text-[#FF8A00]">
              {formatRp(used.totalPrice ?? computedTotal)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-3 py-2 rounded-md border bg-amber-600 text-white text-sm"
          >
            Close
          </button>
        </div>

        <ReceiptModal
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
          order={used}
        />
      </div>
    </div>
  );
}

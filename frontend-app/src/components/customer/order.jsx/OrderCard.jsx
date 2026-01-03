import { Package, Clock } from "lucide-react";

/**
 * Customer OrderCard
 *
 * Mirrors staff card layout for My Order page.
 * Props:
 * - order
 * - onOpenDetail(order)
 * - timeAgo
 * - className
 */
export default function OrderCard({
  order,
  onOpenDetail,
  onPayNow,
  timeAgo,
  className = "",
}) {
  const id = order?._id ?? order?.id ?? "unknown";
  const status = (order?.orderStatus ?? order?.status ?? "")
    .toString()
    .toLowerCase();
  const itemsRaw = Array.isArray(order?.items) ? order.items : [];

  const items = itemsRaw.map((it) => {
    const prod = it.product ?? it;
    const name = prod?.name ?? prod?.productName ?? it?.name ?? "Item";
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const price = Number(
      prod?.price ?? it.productPrice ?? it?.price ?? it?.subtotal ?? 0
    );
    const note = (it.note ?? it.notes ?? prod?.note ?? "") || "";
    return { name, qty, price, note };
  });

  const itemsCount =
    items.reduce((s, i) => s + (i.qty || 0), 0) || items.length;
  const formatRp = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const totalOrder = Number(
    order?.totalPrice ??
      items.reduce(
        (s, it) => s + (it.price || 0) * (it.qty || it.qty === 0 ? it.qty : 1),
        0
      )
  );

  const orderTypeRaw = (order?.orderType ?? order?.type ?? "").toString();
  const orderType = orderTypeRaw.toLowerCase();
  const table = order?.tableNumber ?? order?.table ?? "-";
  const customer = order?.customerName ?? order?.customer ?? "-";
  const paymentUrl = order?.paymentUrl ?? order?.payment?.paymentUrl ?? null;
  const paymentStatus = (order?.paymentStatus ?? order?.payment?.status ?? "")
    .toString()
    .toLowerCase();

  const typeColor = (t) => {
    if (t === "dine-in")
      return "bg-amber-50 text-amber-800 border border-amber-100";
    if (t === "takeaway")
      return "bg-slate-50 text-slate-800 border border-slate-100";
    if (t === "delivery")
      return "bg-indigo-50 text-indigo-800 border border-indigo-100";
    return "bg-gray-50 text-gray-700 border border-gray-100";
  };

  const formatHM = (d) => {
    try {
      const dt = new Date(d);
      const hh = dt.getHours().toString().padStart(2, "0");
      const mm = dt.getMinutes().toString().padStart(2, "0");
      return `${hh}.${mm}`;
    } catch {
      return "-";
    }
  };
  const timeDisplay =
    timeAgo ?? (order?.createdAt ? formatHM(order.createdAt) : "-");

  return (
    <article
      className={`bg-white border border-amber-400 rounded-lg sm:rounded-xl p-4 md:p-4 shadow-sm flex flex-col gap-3 h-full min-h-[160px] ${className}`}
    >
      {/* Header: id | type (left) --- time (right) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-sm font-mono text-gray-600 truncate">
            #{String(id).slice(-6)}
          </div>
          <span
            className={`ml-1 px-2 py-0.5 rounded text-xs ${typeColor(
              orderType
            )} whitespace-nowrap`}
          >
            {orderType ? orderType.toUpperCase() : "UNKNOWN"}
          </span>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-2 whitespace-nowrap">
          <Clock size={14} />
          <span>{timeDisplay}</span>
        </div>
      </div>

      {/* Item count */}
      <div className="text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <Package size={16} />
          <div className="font-medium">
            {itemsCount} item{itemsCount !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="text-sm text-gray-700 flex-1 min-w-0">
        <div className="mt-2 space-y-2">
          {items.length ? (
            items.map((it, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1"
              >
                <div className="min-w-0">
                  <div className="text-sm truncate">
                    <span className="mr-2 font-medium">{it.qty}x</span>
                    <span className="text-sm text-gray-700 truncate">
                      {it.name}
                    </span>
                  </div>
                  {it.note ? (
                    <div className="text-xs text-gray-500 italic mt-0.5 truncate">
                      Note: {it.note}
                    </div>
                  ) : null}
                </div>
                <div className="ml-3 text-sm font-medium whitespace-nowrap mt-1 sm:mt-0">
                  {formatRp(it.price)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400">No items</div>
          )}
        </div>
      </div>

      {/* Table / Customer with total */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          {orderType === "dine-in" ? (
            <span>
              Table:{" "}
              <span className="font-semibold text-amber-800">{table}</span>
            </span>
          ) : (
            <span>
              Customer: <span className="font-semibold">{customer}</span>
            </span>
          )}
        </div>
        <div className="font-bold text-[#FF8A00]">{formatRp(totalOrder)}</div>
      </div>

      {/* Actions: Detail only for customer */}
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={() => onOpenDetail?.(order)}
          className="flex-1 px-3 py-2 rounded-md text-sm bg-amber-50 border border-amber-200 text-amber-800"
        >
          Detail
        </button>

        {/* Status / Pay Now */}
        {paymentStatus === "pending" && paymentUrl ? (
          <button
            onClick={() => onPayNow?.(order)}
            className="px-3 py-2 rounded-md text-sm text-white border border-amber-200 bg-amber-600 hover:bg-amber-700"
          >
            Bayar sekarang
          </button>
        ) : (
          <div className="px-3 py-2 rounded-md text-sm text-white border border-gray-100 bg-blue-500">
            {status === "delivered" ? "Completed" : status || "Status"}
          </div>
        )}
      </div>
    </article>
  );
}

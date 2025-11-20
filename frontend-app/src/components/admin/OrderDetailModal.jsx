// src/components/admin/OrderDetailModal.jsx
import { formatPrice, formatDateTime } from "../../utils/orderUtils";

export default function OrderDetailModal({ order, open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-auto z-10">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Order Detail</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Order ID</div>
              <div className="font-medium">{order?._id}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="font-medium">{order?.orderStatus}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Order Type</div>
              <div className="font-medium">{order?.orderType}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Table</div>
              <div className="font-medium">{order?.tableNumber ?? "-"}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">Items</div>
            <div className="space-y-3">
              {(order?.items || []).map((it, idx) => {
                const name = it.product?.name ?? it.productName ?? "Product";
                const price = it.product?.price ?? it.price ?? 0;
                return (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{name} x{it.quantity}</div>
                      {it.note && <div className="text-xs text-gray-500">{it.note}</div>}
                    </div>
                    <div className="text-sm font-semibold">{formatPrice(price * it.quantity)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-3">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-lg font-semibold">{formatPrice(order?.totalPrice)}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-sm text-gray-500">Payment Status</div>
              <div className="font-medium">{order?.payment?.status ?? "-"}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Payment Method</div>
              <div className="font-medium">{order?.paymentDetails?.method ?? "-"}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Created At</div>
              <div className="font-medium">{formatDateTime(order?.createdAt)}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Paid At</div>
              <div className="font-medium">{formatDateTime(order?.paymentDetails?.paidAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

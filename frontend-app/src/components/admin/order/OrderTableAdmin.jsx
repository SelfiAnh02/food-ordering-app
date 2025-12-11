// src/components/admin/OrderTableAdmin.jsx
import { Eye } from "lucide-react";
import IconButton from "../../common/IconButton";
import Pagination from "../../common/pagination";
import {
  formatDateTime,
  formatPrice,
  shortItemsSummary,
} from "../../../utils/orderUtils";

export default function OrderTableAdmin({
  orders = [],
  page = 1,
  limit = 20,
  totalPages = 1,
  onPageChange,
  onView,
  loading = false,
}) {
  // normalize paging values
  const numericPage = Math.max(1, Number(page) || 1);
  const numericLimit = Math.max(1, Number(limit) || 10);

  // compute offset for numbering and slice orders for current page
  const offset = (numericPage - 1) * numericLimit;
  const displayedOrders = Array.isArray(orders)
    ? orders.slice(offset, offset + numericLimit)
    : [];

  // derive total pages: prefer provided `totalPages` if > 1, otherwise compute from orders
  const computedTotalPages =
    Number(totalPages) > 1
      ? Number(totalPages)
      : Math.max(1, Math.ceil((orders?.length || 0) / numericLimit));

  return (
    <div className="rounded-lg bg-white border border-amber-400 shadow-amber-300">
      {/* wrapper untuk membuat tabel bisa discroll horizontal di layar kecil */}
      <div className=" overflow-x-auto rounded-lg">
        <table className="min-w-full table-auto text-center border-collapse overflow-hidden">
          <colgroup>
            <col style={{ width: "5%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead className="bg-amber-50 text-amber-800 text-sm border-b border-amber-400">
            <tr>
              <th className="px-4 py-2 text-center">No</th>
              <th className="px-4 py-2 text-center">Items</th>
              <th className="px-4 py-2 text-center">Total</th>
              <th className="px-4 py-2 text-center">Table</th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-center">Created</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              displayedOrders.length > 0 &&
              displayedOrders.map((order, i) => (
                <tr
                  key={order._id ?? `${i}`}
                  className="border-t border-amber-400 hover:bg-amber-50 text-sm align-top"
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    {offset + i + 1}
                  </td>

                  <td className="px-3 py-2 break-words max-w-[340px]">
                    {/* Use shortItemsSummary util which has safe fallbacks */}
                    <div className="text-sm text-gray-700">
                      {shortItemsSummary(order.items || [])}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatPrice(order.totalPrice ?? 0)}
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap">
                    {order.tableNumber ?? "-"}
                  </td>

                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        order.orderStatus === "pending"
                          ? "bg-yellow-300 text-gray-800"
                          : order.orderStatus === "confirmed"
                          ? "bg-blue-500 text-white"
                          : order.orderStatus === "delivered"
                          ? "bg-green-600 text-white"
                          : "bg-gray-400 text-white"
                      }`}
                    >
                      {order.orderStatus || "-"}
                    </span>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatDateTime(order.createdAt)}
                  </td>

                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <IconButton
                      title="View"
                      onClick={() => onView?.(order._id)}
                      className="bg-white"
                    >
                      <Eye size={16} />
                    </IconButton>
                  </td>
                </tr>
              ))}

            {!loading && displayedOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pb-4 flex justify-center border-t border-amber-400">
        <Pagination
          page={page}
          totalPages={computedTotalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

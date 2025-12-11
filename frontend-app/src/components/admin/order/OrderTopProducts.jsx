// src/components/admin/OrderTopProducts.jsx
import { formatPrice } from "../../../utils/orderUtils";

export default function OrderTopProducts({ topProducts = [] }) {
  return (
    <div className="panel p-4 mt-6 rounded-lg bg-white border border-amber-400 shadow-amber-300">
      <h3 className="text-lg text-amber-800 font-semibold mb-3">
        Top Products
      </h3>
      <ul className="space-y-3">
        {!topProducts || topProducts.length === 0 ? (
          <li className="text-sm text-gray-500">No data</li>
        ) : (
          topProducts.map((tp, idx) => (
            <li
              key={tp.productId ?? tp._id ?? idx}
              className="flex justify-between items-center"
            >
              <div>
                <div className="font-medium text-gray-800">
                  {tp.productName ?? tp.name ?? "Product"}
                </div>
                <div className="text-xs text-gray-500">
                  {tp.totalQuantity ?? tp.salesCount ?? 0} sold
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {formatPrice(tp.totalRevenue ?? 0)}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

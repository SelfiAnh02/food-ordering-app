// src/components/admin/product/ProductCardGrid.jsx
import { formatPrice } from "../../../utils/productUtils";

export default function ProductCardGrid({
  products = [],
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p) => {
        const categoryLabel =
          p.categoryName ??
          p.category ??
          (typeof p.categoryId === "string" ? p.categoryId : "-");
        return (
          <div
            key={p.id}
            className="bg-white border  border-amber-400 rounded-lg shadow-sm overflow-hidden"
          >
            {p.image ? (
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-gray-50 flex items-center justify-center text-gray-400">
                No image
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-medium text-amber-800">
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {p.description}
                  </div>
                </div>

                <div className="text-sm font-semibold text-amber-600">
                  {formatPrice(p.price)}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-gray-600">{categoryLabel}</div>
                <div
                  className={`text-sm ${p.stock <= 5 ? "text-red-600" : ""}`}
                >
                  Stock: {p.stock}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onView(p)}
                  className="flex-1 py-2 border border-amber-400 rounded-lg text-amber-800"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(p)}
                  className="px-3 py-2 border border-amber-400 rounded-lg text-amber-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(p)}
                  className="px-3 py-2 border rounded-lg text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

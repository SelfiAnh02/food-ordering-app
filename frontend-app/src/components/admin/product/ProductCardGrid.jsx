// src/components/admin/product/ProductCardGrid.jsx
import { formatPrice } from "../../../utils/productUtils";
import { Eye, Trash2, Pencil } from "lucide-react";
import IconButton from "../../common/IconButton";

export default function ProductCardGrid({
  products = [],
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {products.map((p) => {
        const categoryLabel =
          p.categoryName ??
          p.category ??
          (typeof p.categoryId === "string" ? p.categoryId : "-");
        return (
          <div
            key={p.id}
            className="bg-white border border-amber-400 rounded-lg shadow-sm overflow-hidden p-3 flex flex-col"
          >
            <div className="w-full aspect-square border border-amber-300 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="text-gray-400 text-sm flex items-center justify-center h-full">
                  No Image
                </div>
              )}
            </div>

            <div className="pt-3 px-1 pb-0">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-1">
                <div>
                  <div className="text-lg font-medium text-amber-800">
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {p.description}
                  </div>
                </div>

                <div className="text-sm font-semibold text-amber-600 mt-1 lg:mt-0">
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

              <div className="mt-2 flex items-center justify-between gap-2">
                <IconButton
                  title="Lihat"
                  onClick={() => onView(p)}
                  className="border border-amber-400 bg-white flex items-center justify-center w-10 h-8 sm:w-14 sm:h-10 md:w-16 md:h-10"
                >
                  <Eye size={14} />
                </IconButton>
                <IconButton
                  title="Edit"
                  onClick={() => onEdit(p)}
                  className="border border-amber-400 bg-white flex items-center justify-center w-10 h-8 sm:w-14 sm:h-10 md:w-16 md:h-10"
                >
                  <Pencil size={14} />
                </IconButton>
                <IconButton
                  title="Hapus"
                  onClick={() => onDelete(p)}
                  className="text-red-600 flex items-center justify-center w-10 h-8 sm:w-14 sm:h-10 md:w-16 md:h-10"
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

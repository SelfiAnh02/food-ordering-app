// src/components/admin/product/ProductTable.jsx
import { Eye, Trash2, Pencil } from "lucide-react";
import IconButton from "../../common/IconButton";
import { formatPrice } from "../../../utils/productUtils";

/**
 * Props:
 * - products (array)
 * - onView/onEdit/onDelete
 * - compact: boolean (smaller paddings)
 */
export default function ProductTable({ products = [], onView, onEdit, onDelete, compact = false }) {
  return (
    <div className="panel p-2 sm:p-4 rounded-lg overflow-x-auto">
      <table className="w-full table-auto min-w-[600px]">
        <thead>
          <tr className="text-sm text-left text-gray-600 bg-gray-100">
            <th className={`p-2 ${compact ? "text-xs" : "p-3"}`}>No</th>
            <th className={compact ? "p-2" : "p-3"}>Product</th>
            <th className={compact ? "p-2" : "p-3"}>Price</th>
            <th className={compact ? "p-2" : "p-3"}>Category</th>
            <th className={compact ? "p-2" : "p-3"}>Stock</th>
            <th className={compact ? "p-2 text-right" : "p-3 text-right"}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-6 text-gray-500">
                Belum ada produk.
              </td>
            </tr>
          ) : (
            products.map((p, idx) => {
              const categoryLabel = p.categoryName ?? p.category ?? (typeof p.categoryId === "string" ? p.categoryId : "-");
              return (
                <tr key={p.id ?? idx} className="border-t hover:bg-gray-50 transition">
                  <td className={`align-top text-sm text-gray-700 ${compact ? "p-2" : "p-3"}`}>{idx + 1}</td>

                  <td className={compact ? "p-2" : "p-3"}>
                    <div className="font-medium text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</div>
                  </td>

                  <td className={compact ? "p-2 font-semibold" : "p-3 font-semibold"}>{formatPrice(p.price)}</td>

                  <td className={compact ? "p-2 text-center" : "px-4 py-2 text-center"}>{categoryLabel}</td>

                  <td className={`text-center ${p.stock <= 5 ? "text-red-600 font-semibold" : ""} ${compact ? "p-2" : "p-3"}`}>
                    {p.stock ?? 0}
                  </td>

                  <td className={compact ? "p-2 text-right" : "p-3 text-right"}>
                    <div className="inline-flex items-center gap-2">
                      <IconButton title="Lihat" onClick={() => onView(p)} className="bg-white">
                        <Eye size={14} />
                      </IconButton>

                      <IconButton title="Edit" onClick={() => onEdit(p)} className="bg-white">
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton title="Hapus" onClick={() => onDelete(p)} className="text-red-600">
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

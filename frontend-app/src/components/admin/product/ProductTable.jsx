// src/components/admin/product/ProductTable.jsx
import { Eye, Trash2, Pencil } from "lucide-react";
import IconButton from "../IconButton";
import { formatPrice } from "../../../utils/productUtils";

export default function ProductTable({ products = [], onView, onEdit, onDelete }) {
  return (
    <div className="panel p-4 rounded-lg overflow-x-auto">
      <table className="w-full table-auto min-w-[600px]">
        <thead>
          <tr className="text-sm text-left text-gray-600 bg-gray-100">
            <th className="p-3">No</th>
            <th className="p-3">Product</th>
            <th className="p-3">Price</th>
            <th className="p-3">Category</th>
            <th className="p-3">Stock</th>
            <th className="p-3 text-right">Actions</th>
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
              // determine category label from several possible shapes
              const categoryLabel =
                p.categoryName ||
                (p.category && typeof p.category === "object" && (p.category.name ?? p.category.title)) ||
                (p.categoryId && typeof p.categoryId === "object" && (p.categoryId.name ?? p.categoryId.title)) ||
                (typeof p.category === "string" && p.category) ||
                (typeof p.categoryId === "string" && p.categoryId) ||
                "-";

              return (
                <tr key={p.id ?? idx} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 align-top text-sm text-gray-700">{idx + 1}</td>

                  <td className="p-3">
                    <div className="font-medium text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{p.description}</div>
                  </td>

                  <td className="p-3 font-semibold">{formatPrice(p.price)}</td>

                  <td className="px-4 py-2 text-center">{categoryLabel}</td>

                  <td className={`p-3 text-center ${p.stock <= 5 ? "text-red-600 font-semibold" : ""}`}>
                    {p.stock ?? 0}
                  </td>

                  <td className="p-3 text-right">
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

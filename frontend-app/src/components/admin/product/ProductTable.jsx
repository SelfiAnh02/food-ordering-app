// src/components/admin/ProductTable.jsx
import { Eye, Trash2, Pencil } from "lucide-react";
import IconButton from "../../common/IconButton";
import { formatPrice } from "../../../utils/productUtils";

export default function ProductTable({
  products = [],
  onView,
  onEdit,
  onDelete,
  compact = false,
  startIndex = 0,
}) {
  const cellPad = compact ? "p-2" : "px-4 py-3";

  return (
    <div className="rounded-lg border border-amber-400 overflow-x-auto bg-white">
      <table className="min-w-full table-auto border-collapse rounded-lg overflow-hidden">
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "30%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>

        <thead>
          <tr className="text-sm text-amber-800 bg-amber-50 border-b border-amber-400">
            <th className={`${cellPad} text-center font-semibold`}>No</th>
            <th className={`${cellPad} text-center font-semibold`}>Product</th>
            <th className={`${cellPad} text-center font-semibold`}>Price</th>
            <th className={`${cellPad} text-center font-semibold`}>Category</th>
            <th className={`${cellPad} text-center font-semibold`}>Stock</th>
            <th className={`${cellPad} text-center font-semibold`}>Actions</th>
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
              const categoryLabel =
                p.categoryName ??
                p.category ??
                (typeof p.categoryId === "string" ? p.categoryId : "-");

              return (
                <tr
                  key={p.id ?? idx}
                  className="border-b border-amber-400 hover:bg-amber-50 transition"
                >
                  <td
                    className={`${cellPad} text-center text-gray-700 text-sm`}
                  >
                    {startIndex + idx + 1}
                  </td>
                  <td className={`${cellPad} text-center align-middle`}>
                    <div className="font-medium text-amber-800">{p.name}</div>
                    {p.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {p.description}
                      </div>
                    )}
                  </td>
                  <td className={`${cellPad} text-center font-semibold`}>
                    {formatPrice(p.price)}
                  </td>
                  <td className={`${cellPad} text-center`}>{categoryLabel}</td>
                  <td
                    className={`${cellPad} text-center ${
                      (p.stock ?? 0) <= 5
                        ? "text-red-600 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {p.stock ?? 0}
                  </td>
                  <td className={`${cellPad} text-center`}>
                    <div className="flex justify-center items-center gap-2">
                      <IconButton
                        title="Lihat"
                        onClick={() => onView(p)}
                        className="border border-amber-400 bg-white"
                      >
                        <Eye size={14} />
                      </IconButton>
                      <IconButton
                        title="Edit"
                        onClick={() => onEdit(p)}
                        className="border border-amber-400 bg-white"
                      >
                        <Pencil size={14} />
                      </IconButton>
                      <IconButton
                        title="Hapus"
                        onClick={() => onDelete(p)}
                        className="text-red-600"
                      >
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

// src/components/staff/cashier/CartItem.jsx
import { Plus, Minus, Trash } from "lucide-react";
import { Edit3 } from "lucide-react";

export default function CartItem({
  item,
  onAdd,
  onMinus,
  onRemove,
  onOpenDetails,
}) {
  const handleOpen = (e) => {
    // jika item row clickable via tombol edit, jangan memicu parent click
    e?.stopPropagation?.();
    if (typeof onOpenDetails === "function") onOpenDetails(item);
  };

  return (
    <div
      className="w-full flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-amber-50/40"
      // jangan buat seluruh row clickable (agar accidental click sedikit berkurang)
      // jika mau tetap clickable, kamu bisa menambahkan onClick={() => onOpenDetails && onOpenDetails(item)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate">
            <div className="text-base font-semibold text-amber-800 truncate">
              {item.name}
            </div>
            <div className="text-sm text-gray-600">
              Rp {Number(item.price ?? 0).toLocaleString()}
            </div>

            {item.notes && (
              <div className="text-xs text-gray-600 italic mt-1 truncate">
                Note: {item.notes}
              </div>
            )}
          </div>

          {/* tombol edit kecil untuk buka detail/notes */}
          <button
            onClick={handleOpen}
            className="ml-2 p-2 rounded hover:bg-amber-100"
            title="Edit catatan item"
            aria-label={`Edit catatan untuk ${item.name}`}
          >
            <Edit3 size={15} />
          </button>
        </div>
      </div>

      <div
        className="flex items-center gap-3 ml-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onMinus}
          className="p-2 rounded border hover:bg-amber-100"
          aria-label={`Kurangi ${item.name}`}
        >
          <Minus size={8} />
        </button>

        <span className="text-base font-semibold min-w-[24px] text-center">
          {item.qty}
        </span>

        <button
          onClick={onAdd}
          className="p-2 rounded border hover:bg-amber-100"
          aria-label={`Tambah ${item.name}`}
        >
          <Plus size={8} />
        </button>

        <button
          onClick={onRemove}
          className="p-2 rounded text-red-500"
          aria-label={`Hapus ${item.name}`}
        >
          <Trash size={18} />
        </button>
      </div>
    </div>
  );
}

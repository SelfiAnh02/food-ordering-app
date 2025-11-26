// src/components/staff/cashier/CartItem.jsx

import { Plus, Minus, Trash } from "lucide-react";

export default function CartItem({ item, onAdd, onMinus, onRemove }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg border border-amber-100 bg-amber-50/40">
      <div>
        <div className="text-sm font-semibold text-amber-800">{item.name}</div>
        <div className="text-xs text-gray-500">
          Rp {item.price.toLocaleString()}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onMinus}
          className="p-1 rounded border hover:bg-amber-100"
        >
          <Minus size={14} />
        </button>

        <span className="text-sm font-semibold min-w-[20px] text-center">
          {item.qty}
        </span>

        <button
          onClick={onAdd}
          className="p-1 rounded border hover:bg-amber-100"
        >
          <Plus size={14} />
        </button>

        <button onClick={onRemove} className="p-1 rounded text-red-500">
          <Trash size={14} />
        </button>
      </div>
    </div>
  );
}

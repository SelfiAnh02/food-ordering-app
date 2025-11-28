// src/components/staff/cashier/ProductCard.jsx
export default function ProductCard({ product, onSelect }) {
  const stockNum = Number(product?.stock ?? 0);
  const isOut = stockNum <= 0;
  const imgSrc = product?.image ?? product?.imageUrl ?? "";

  return (
    <div
      className={`border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-3 flex flex-col ${
        isOut ? "opacity-60" : ""
      }`}
      onClick={() => !isOut && onSelect(product)}
    >
      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product?.name ?? "product"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-sm">No Image</div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-semibold text-amber-800 line-clamp-1">
          {product?.name ?? "Unnamed"}
        </h3>
        <div className="text-xs text-gray-500">Stock: {stockNum}</div>

        <div className="mt-1 font-semibold text-[#FF8A00]">
          Rp {Number(product?.price ?? 0).toLocaleString()}
        </div>
      </div>

      {isOut && (
        <div className="mt-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded text-center">
          Out of Stock
        </div>
      )}
    </div>
  );
}

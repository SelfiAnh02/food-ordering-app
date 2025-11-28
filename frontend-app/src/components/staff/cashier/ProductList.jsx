// src/components/staff/cashier/ProductList.jsx
export default function ProductList({ products = [], onSelect }) {
  const list = Array.isArray(products) ? products : [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
      {list.map((product) => {
        const stockNum = Number(product?.stock ?? 0);
        const isOut = stockNum <= 0;
        const imgSrc = product?.image ?? product?.imageUrl ?? "";
        const keyId =
          product?._id ?? product?.id ?? String(Math.random()).slice(2);

        return (
          <div
            key={keyId}
            className={`border rounded-2xl p-4 shadow-md hover:shadow-lg transition bg-white flex flex-col items-center ${
              isOut ? "opacity-60" : ""
            }`}
            style={{ minHeight: 300 }}
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center mb-3">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={product?.name ?? "product"}
                  className="w-full h-full object-cover object-center"
                  style={{ aspectRatio: "1/1", width: "100%", height: "100%" }}
                  loading="lazy"
                />
              ) : (
                <div className="text-gray-400 text-xs">No Image</div>
              )}
            </div>

            <div className="flex-1 w-full flex flex-col items-center justify-between text-center">
              <div className="font-bold text-amber-800 text-base sm:text-lg line-clamp-2 min-h-[2.5em] mb-1">
                {product?.name ?? "Unnamed"}
              </div>
              <div className="text-xs text-gray-500 mb-1">
                Stock:{" "}
                <span className={isOut ? "text-red-500 font-bold" : ""}>
                  {stockNum}
                </span>
              </div>
              <div className="text-[#FF8A00] font-extrabold text-lg sm:text-xl mb-2">
                Rp {Number(product?.price ?? 0).toLocaleString()}
              </div>
              <button
                className={`w-full py-2 rounded-lg text-white font-semibold text-base shadow-sm transition ${
                  isOut
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
                disabled={isOut}
                onClick={() => !isOut && onSelect(product)}
                type="button"
              >
                {isOut ? "Stok Habis" : "Tambah"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

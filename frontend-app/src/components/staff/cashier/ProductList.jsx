export default function ProductList({ products = [], onSelect }) {
  const list = Array.isArray(products) ? products : [];

  return (
    <div
      className="
        grid
        grid-cols-2 
        sm:grid-cols-2 
        md:grid-cols-3 
        lg:grid-cols-3
        xl:grid-cols-4
        gap-2 sm:gap-3 md:gap-3
        mt-4
      "
    >
      {list.map((product) => {
        const stockNum = Number(product?.stock ?? 0);
        const isOut = stockNum <= 0;
        const imgSrc = product?.image ?? product?.imageUrl ?? "";
        const keyId =
          product?._id ?? product?.id ?? String(Math.random()).slice(2);

        return (
          <div
            key={keyId}
            className={`
              flex flex-col bg-white rounded-2xl shadow-md hover:shadow-lg 
              transition border border-amber-200 p-4 md:p-5
              ${isOut ? "opacity-60" : ""}
            `}
          >
            <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center mb-4">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={product?.name ?? "product"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="text-gray-400 text-sm">No Image</div>
              )}
            </div>

            <div className="w-full text-center min-h-[2.6em]">
              <p className="text-amber-800 font-bold text-base md:text-lg text-center line-clamp-2 min-h-[2.8em]">
                {product?.name}
              </p>
            </div>

            <div className="text-xs text-gray-500 text-center mt-1">
              Stock:{" "}
              <span className={isOut ? "text-red-500 font-bold" : ""}>
                {stockNum}
              </span>
            </div>

            <div className="text-[#FF8A00] font-bold text-lg md:text-xl text-center mt-1">
              Rp {Number(product?.price ?? 0).toLocaleString()}
            </div>

            <button
              className={`
                w-full py-2.5 md:py-3 rounded-xl text-white font-semibold text-sm md:text-base
                ${isOut ? "bg-gray-300" : "bg-amber-600 hover:bg-amber-700"}
              `}
              disabled={isOut}
              onClick={() => !isOut && onSelect(product)}
              type="button"
            >
              {isOut ? "Stok Habis" : "Tambah"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

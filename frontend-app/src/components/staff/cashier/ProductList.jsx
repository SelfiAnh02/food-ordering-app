export default function ProductList({ products = [], onSelect }) {
  return (
    <div
      className="
        grid
        grid-cols-2        /* Mobile */
        mt-2
        sm:grid-cols-3     /* ≥ 640px */
        md:grid-cols-3     /* ≥ 768px - tablet */
        lg:grid-cols-3     /* ≥ 1024px - laptop kecil */
        xl:grid-cols-4     /* ≥ 1280px - desktop */
        gap-3
      "
    >
      {products.map((product) => {
        const imgSrc = product.image ?? "";
        const isOut = Number(product?.stock ?? 0) <= 0;

        return (
          <div
            key={product._id}
            className="
              bg-white rounded-xl shadow-md 
              border border-amber-200
              p-3
              flex flex-col
              hover:shadow-lg transition
              h-full 
            "
          >
            <div className="w-full aspect-square object-cover rounded-lg bg-gray-100 overflow-hidden">
              {imgSrc ? (
                <img src={imgSrc} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 text-sm flex items-center justify-center h-full">
                  No Image
                </div>
              )}
            </div>

            <p className="text-center text-amber-800 font-bold mt-2 line-clamp-2 min-h-[2.4em]">
              {product.name}
            </p>

            <div className="text-center text-sm text-gray-500">
              Stock: {product.stock}
            </div>

            <div className="text-center text-[#FF8A00] font-bold text-lg mt-1">
              Rp {Number(product.price).toLocaleString()}
            </div>

            <button
              className={`
                mt-2 py-2 rounded-lg text-white font-semibold
                ${isOut ? "bg-gray-300" : "bg-amber-600 hover:bg-amber-700"}
              `}
              disabled={isOut}
              onClick={() => onSelect(product)}
            >
              {isOut ? "Stok Habis" : "Tambah"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

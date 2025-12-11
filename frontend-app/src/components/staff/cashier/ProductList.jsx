export default function ProductList({ products = [], onSelect }) {
  return (
    <div className="grid grid-cols-2 mt-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {products.map((product) => {
        const imgSrc = product.image ?? "";
        const isOut = Number(product?.stock ?? 0) <= 0;

        return (
          <div
            key={product._id}
            className="bg-white rounded-xl shadow-md border border-amber-400 p-3 flex flex-col hover:shadow-lg transition min-h-[10rem] lg:min-h-[14.5rem]"
          >
            <div className="w-full h-24 lg:h-36 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  className="w-full h-full object-cover"
                  alt={product.name}
                />
              ) : (
                <div className="text-gray-400 text-sm flex items-center justify-center h-full">
                  No Image
                </div>
              )}
            </div>

            <div className="mt-1">
              <p className="text-center text-amber-800 font-semibold text-sm lg:text-base line-clamp-2 truncate">
                {product.name}
              </p>
              <div className="text-center text-[10px] text-gray-500 mt-0.5">
                Stock: {product.stock}
              </div>

              <div className="text-center text-amber-600 font-semibold text-sm lg:text-base mt-0.5">
                Rp {Number(product.price).toLocaleString()}
              </div>
            </div>

            <div className="mt-auto">
              <button
                className={`w-full py-2 rounded-md text-white text-sm font-semibold ${
                  isOut ? "bg-gray-300" : "bg-amber-600 hover:bg-amber-700"
                }`}
                disabled={isOut}
                onClick={() => onSelect(product)}
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

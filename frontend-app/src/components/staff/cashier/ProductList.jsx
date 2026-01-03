export default function ProductList({
  products = [],
  onSelect,
  cartItems = [],
  onIncrease,
  onDecrease,
  onRemove,
}) {
  return (
    <div className="grid grid-cols-2 mt-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
      {products.map((product) => {
        const imgSrc = product.image ?? "";
        const isOut = Number(product?.stock ?? 0) <= 0;
        const id = product._id || product.id;
        const cartItem = cartItems.find((i) => i._id === id);

        return (
          <div
            key={product._id}
            className="bg-white rounded-xl shadow-md border border-amber-400 p-3 flex flex-col hover:shadow-lg transition min-h-[10rem] lg:min-h-[14.5rem]"
          >
            <div className="w-full aspect-square border border-amber-300 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  className="w-full h-full object-cover object-center"
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
              {cartItem ? (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      cartItem?.qty <= 1
                        ? onRemove && onRemove(id)
                        : onDecrease && onDecrease(id)
                    }
                    className="w-8 h-8 rounded-full bg-amber-600 text-white text-xl font-medium shadow-md hover:bg-amber-700 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 rounded-lg bg-amber-600 text-white text-sm font-semibold shadow-md">
                    {cartItem.qty}
                  </span>
                  <button
                    type="button"
                    disabled={isOut}
                    onClick={() => onIncrease && onIncrease(id)}
                    className={`w-8 h-8 rounded-full text-white text-xl font-medium shadow-md flex items-center justify-center ${
                      isOut
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-amber-600 hover:bg-amber-700"
                    }`}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  className={`w-full py-2 rounded-md text-white text-sm font-semibold ${
                    isOut ? "bg-gray-300" : "bg-amber-600 hover:bg-amber-700"
                  }`}
                  disabled={isOut}
                  onClick={() => onSelect(product)}
                >
                  {isOut ? "Stok Habis" : "Tambah"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import useCartCustomer from "../../hooks/customer/useCartCustomer";

export default function ProductList({ products = [], onSelect }) {
  const { items, addToCart, increaseQty, decreaseQty } = useCartCustomer();
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const imgSrc = product.image ?? product.imageUrl ?? "";
        const isOut = Number(product?.stock ?? 0) <= 0;
        const price = Number(product?.price ?? 0);
        const id = product._id || product.id;
        const cartItem = items.find((i) => i._id === id);

        return (
          <div
            key={id}
            className="rounded-xl shadow-md border border-amber-300 pl-4 pr-2 py-2 flex items-center justify-between"
          >
            {/* Left: name, optional description, stock, price */}
            <div className="pr-3 min-w-0">
              <div className="text-lg md:text-lg font-semibold text-amber-800 truncate">
                {product.name}
              </div>
              {product.description ? (
                <div className="mt-1 text-xs md:text-sm text-gray-500 whitespace-pre-line line-clamp-2">
                  {product.description}
                </div>
              ) : null}
              <div className="mt-2 text-xs text-gray-500">
                Stock: {product.stock ?? 0}
              </div>
              <div className="mt-3 text-amber-600 font-bold text-lg lg:text-base">
                Rp. {price.toLocaleString("id-ID")}
              </div>
            </div>

            {/* Right: image + centered bottom action inside image */}
            <div className="flex-shrink-0">
              <div
                className={`relative w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden bg-amber-50 flex items-center justify-center ${
                  cartItem
                    ? "border border-amber-400"
                    : "border border-amber-200"
                }`}
              >
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No Image</div>
                )}
                {cartItem ? (
                  <div className="absolute bottom-1 md:bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => decreaseQty(id)}
                      className="w-6.5 h-6.5 rounded-full bg-amber-600 text-white text-2xl font-medium shadow-md hover:bg-amber-700 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-6.5 h-6.5 rounded-lg bg-amber-600 text-white text-sm font-medium shadow-md flex items-center justify-center">
                      {cartItem.qty}
                    </span>
                    <button
                      type="button"
                      disabled={isOut}
                      onClick={() => increaseQty(id)}
                      className={`w-6.5 h-6.5 rounded-full text-white text-xl font-medium shadow-md flex items-center justify-center ${
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
                    type="button"
                    disabled={isOut}
                    onClick={() =>
                      onSelect ? onSelect(product) : addToCart(product)
                    }
                    className={`absolute bottom-1 md:bottom-1.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-lg md:text-sm text-sm font-semibold shadow-md transition whitespace-nowrap ${
                      isOut
                        ? "bg-gray-300 text-white cursor-not-allowed"
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                  >
                    {isOut ? "Habis bos" : "Tambah"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

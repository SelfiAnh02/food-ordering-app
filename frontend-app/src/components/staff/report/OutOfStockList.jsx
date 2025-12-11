import useProducts from "../../../hooks/staff/useProducts";

export default function OutOfStockList({ products }) {
  // Prefer reading from the product table via the hook so data is authoritative.
  const { allProducts, loading } = useProducts();
  const source =
    Array.isArray(products) && products.length ? products : allProducts || [];

  if (loading && (!source || source.length === 0)) {
    return (
      <div className="bg-white border border-amber-400 rounded p-3 shadow-sm">
        <h3 className="text-sm font-medium mb-3 text-amber-800">
          Out of Stock
        </h3>
        <div className="text-sm text-gray-500">Loading products...</div>
      </div>
    );
  }

  const out = (source || []).filter((p) => Number(p.stock ?? 0) <= 0);

  return (
    <div className="bg-white border border-amber-400 rounded-lg p-3 shadow-sm">
      <h3 className="text-sm font-medium mb-3 text-amber-800">Out of Stock</h3>
      <div className="text-sm">
        {out.length === 0 && (
          <div className="text-gray-500">No products out of stock</div>
        )}
        {out.map((p) => (
          <div
            key={p._id ?? p.id}
            className="flex items-center justify-between py-1 border-t first:border-t-0"
          >
            <div className="truncate">{p.name}</div>
            <div className="text-sm text-gray-500">Stock: {p.stock ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

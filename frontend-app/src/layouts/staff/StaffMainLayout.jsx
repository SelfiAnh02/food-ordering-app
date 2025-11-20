export default function StaffMainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-xl font-bold text-amber-800 mb-4">Staff Panel</h2>

        <nav className="space-y-2">
          <a
            href="/staff/dashboard"
            className="block text-gray-600 hover:text-amber-600"
          >
            Dashboard
          </a>
          <a
            href="/staff/products"
            className="block text-gray-600 hover:text-amber-600"
          >
            Products
          </a>
          <a
            href="/staff/orders"
            className="block text-gray-600 hover:text-amber-600"
          >
            Orders
          </a>
          <a
            href="/staff/pos"
            className="block text-gray-600 hover:text-amber-600"
          >
            POS (Kasir)
          </a>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

// src/components/admin/AdminOrdersPageHeader.jsx

export default function AdminOrdersPageHeader({ onRefresh, onOpenReports }) {
  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* <div>
        <h1 className="text-2xl font-semibold text-gray-800">Orders - Admin</h1>
        <p className="text-sm text-gray-500">Kelola dan lihat ringkasan order</p>
      </div> */}

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex gap-2">
          <button onClick={() => onRefresh?.()} className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Refresh
          </button>

          <button onClick={() => onOpenReports?.()} className="inline-flex items-center gap-2 bg-amber-600 text-white rounded-md px-3 py-2 text-sm hover:opacity-95">
            Open Reports
          </button>
        </div>

        <button onClick={() => onRefresh?.()} className="sm:hidden bg-white border border-gray-200 rounded-md p-2" title="Refresh">🔄</button>
      </div>
    </div>
  );
}

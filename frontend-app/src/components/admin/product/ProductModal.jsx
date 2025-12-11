// src/components/admin/ProductModal.jsx

export default function ProductModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl z-10 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-amber-800">{title}</h3>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-amber-400 text-amber-800 bg-white hover:bg-amber-50 mr-3"
          >
            Close
          </button>
        </div>
        <div className="rounded-lg ">{children}</div>
      </div>
    </div>
  );
}

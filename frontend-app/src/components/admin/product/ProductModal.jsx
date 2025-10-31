// src/components/admin/ProductModal.jsx

export default function ProductModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl z-10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="px-2 py-1 rounded-md border">
            Close
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

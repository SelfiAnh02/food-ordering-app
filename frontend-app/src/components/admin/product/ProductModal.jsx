// src/components/admin/ProductModal.jsx

export default function ProductModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl z-10 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-amber-800">{title}</h3>
        </div>
        <div className="rounded-lg ">{children}</div>
      </div>
    </div>
  );
}

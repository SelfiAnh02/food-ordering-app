// src/components/common/Pagination.jsx

/**
 * Simple pagination control matching admin category style.
 * Props:
 * - page (number)
 * - totalPages (number)
 * - onPageChange (fn)
 */
export default function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange = () => {},
}) {
  if (!totalPages || totalPages < 1) return null;

  const to = (p) => {
    const next = Math.max(1, Math.min(totalPages, p));
    if (next !== page) onPageChange(next);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-end items-center gap-3 mt-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => to(page - 1)}
          disabled={page === 1}
          className={`px-3 py-1 rounded-lg border border-amber-400 text-amber-800 text-sm font-bold ${
            page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-amber-50"
          }`}
        >
          Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => to(page + 1)}
          disabled={page === totalPages}
          className={`px-3 py-1 rounded-lg border border-amber-400 text-amber-800 text-sm font-bold ${
            page === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-amber-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

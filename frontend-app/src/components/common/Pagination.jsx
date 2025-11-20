// src/components/common/Pagination.jsx

/**
 * props:
 * - page, totalPages, onPageChange
 * - showNumbers (optional)
 */
export default function Pagination({ page = 1, totalPages = 1, onPageChange = () => {}, showNumbers = true }) {
  if (totalPages <= 1) return null;

  const to = (p) => {
    const next = Math.max(1, Math.min(totalPages, p));
    if (next !== page) onPageChange(next);
  };

  const pagesToShow = () => {
    // show small window around current page
    const window = 2;
    const start = Math.max(1, page - window);
    const end = Math.min(totalPages, page + window);
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <button onClick={() => to(page - 1)} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">
        Prev
      </button>

      {showNumbers && (
        <>
          {page > 3 && (
            <>
              <button onClick={() => to(1)} className="px-2 py-1 border rounded">1</button>
              {page > 4 && <span className="px-2">…</span>}
            </>
          )}

          {pagesToShow().map((p) => (
            <button
              key={p}
              onClick={() => to(p)}
              className={`px-3 py-1 border rounded ${p === page ? "bg-gray-100 font-semibold" : ""}`}
            >
              {p}
            </button>
          ))}

          {page < totalPages - 2 && (
            <>
              {page < totalPages - 3 && <span className="px-2">…</span>}
              <button onClick={() => to(totalPages)} className="px-2 py-1 border rounded">
                {totalPages}
              </button>
            </>
          )}
        </>
      )}

      <button onClick={() => to(page + 1)} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">
        Next
      </button>
    </div>
  );
}

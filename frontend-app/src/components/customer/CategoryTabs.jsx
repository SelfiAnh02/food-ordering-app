// src/components/customer/CategoryTabs.jsx
export default function CategoryTabs({
  categories = [],
  active,
  onChange,
  // search controls
  search = "",
  onSearchChange,
  // layout controls
  position = "sticky", // 'sticky' | 'fixed'
  offsetTop = 0,
  className = "",
}) {
  const wrapperClass = `${
    position === "fixed" ? "fixed left-0 right-0" : "sticky"
  } z-40 mt-0 ${className}`;

  return (
    <div className={wrapperClass} style={{ top: offsetTop }}>
      <div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 px-0">
          {/* Search (stacked on mobile, inline on desktop) */}
          <div className="w-full md:max-w-sm">
            <input
              value={search}
              onChange={onSearchChange}
              type="text"
              placeholder="Cari menu disini kawan..."
              className="w-full px-4 py-2 text-sm rounded-xl border border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-300"
            />
          </div>

          {/* Scrollable tabs (hide horizontal scrollbar) */}
          <div
            className="flex gap-2 overflow-x-auto flex-nowrap px-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              onClick={() => onChange("all")}
              type="button"
              className={`px-4 py-2 rounded-xl border text-sm whitespace-nowrap transition ${
                active === "all"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white border-amber-200 text-amber-800 hover:bg-amber-50"
              }`}
            >
              All
            </button>

            {Array.isArray(categories) &&
              categories.map((c) => (
                <button
                  key={String(c._id)}
                  onClick={() => onChange(String(c._id))}
                  type="button"
                  className={`px-4 py-2 rounded-xl border text-sm whitespace-nowrap transition ${
                    String(active) === String(c._id)
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white border-amber-400 text-amber-800 hover:bg-amber-50"
                  }`}
                >
                  {c.name}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

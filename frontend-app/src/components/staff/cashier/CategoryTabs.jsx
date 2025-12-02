// src/components/staff/cashier/CategoryTabs.jsx
export default function CategoryTabs({ categories = [], active, onChange }) {
  return (
    // sticky wrapper: menempel di atas scroll container
    <div className="sticky top-0 z-20 mt-0 ">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar px-1 bg-transparent">
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
                  : "bg-white border-amber-200 text-amber-800 hover:bg-amber-50"
              }`}
            >
              {c.name}
            </button>
          ))}
      </div>
    </div>
  );
}

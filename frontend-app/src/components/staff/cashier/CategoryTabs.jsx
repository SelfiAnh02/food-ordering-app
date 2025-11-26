// src/components/staff/cashier/CategoryTabs.jsx

export default function CategoryTabs({ categories = [], active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
      <button
        onClick={() => onChange("all")}
        className={`px-4 py-2 rounded-xl border text-sm whitespace-nowrap transition ${
          active === "all"
            ? "bg-amber-600 text-white border-amber-600"
            : "bg-white border-amber-200 text-amber-800 hover:bg-amber-50"
        }`}
      >
        All
      </button>

      {categories.map((c) => {
        const catId = c._id; // backend kamu pakai `_id`

        return (
          <button
            key={catId}
            onClick={() => onChange(catId)}
            className={`px-4 py-2 rounded-xl border text-sm whitespace-nowrap transition ${
              active === catId
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-white border-amber-200 text-amber-800 hover:bg-amber-50"
            }`}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}

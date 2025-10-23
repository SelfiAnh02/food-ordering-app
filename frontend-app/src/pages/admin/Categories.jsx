// src/pages/admin/Categories.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";

/**
 * UI-only Categories page
 * - Left and Right panels are siblings (NOT wrapped in a single panel div)
 * - Left: table list (name, description, action icons) with right border
 * - Right: Add / Edit form (same form) as its own panel
 */

const MOCK_CATEGORIES = [
  { id: 1, name: "Coffee", description: "Minuman kopi, espresso, latte" },
  { id: 2, name: "Tea", description: "Minuman teh: matcha, black, green" },
  { id: 3, name: "Bakery", description: "Roti & pastry" },
  { id: 4, name: "Beverages", description: "Minuman dingin & panas" },
  { id: 5, name: "Snacks", description: "Makanan ringan" },
  { id: 6, name: "Desserts", description: "Kue & makanan penutup" },
  { id: 7, name: "Meals", description: "Makanan berat dan lauk" },
];

function nextId(list) {
  return list.length === 0 ? 1 : Math.max(...list.map((x) => x.id)) + 1;
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [mode, setMode] = useState("add");
  const [form, setForm] = useState({ id: null, name: "", description: "" });

  useEffect(() => {
    // simulate load
    const t = setTimeout(() => {
      setCategories(MOCK_CATEGORIES);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        String(c.id).includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [categories, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const displayed = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  function resetForm() {
    setMode("add");
    setForm({ id: null, name: "", description: "" });
  }

  function fillFormForEdit(cat) {
    setMode("edit");
    setForm({ id: cat.id, name: cat.name ?? "", description: cat.description ?? "" });
    document.getElementById("category-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return alert("Nama kategori wajib diisi.");

    if (mode === "add") {
      const id = nextId(categories);
      const newCat = { id, name, description: form.description || "" };
      setCategories((s) => [newCat, ...s]);
      resetForm();
      setCurrentPage(1);
    } else {
      setCategories((s) => s.map((c) => (c.id === form.id ? { ...c, name, description: form.description || "" } : c)));
      resetForm();
    }
  }

  function handleDelete(cat) {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    setCategories((s) => {
      const next = s.filter((x) => x.id !== cat.id);
      const newPages = Math.max(1, Math.ceil(next.length / itemsPerPage));
      if (currentPage > newPages) setCurrentPage(newPages);
      return next;
    });
    if (mode === "edit" && form.id === cat.id) resetForm();
  }

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <p className="text-sm text-gray-500">Manage your product categories</p>
      </div>

      <div className="flex gap-6">
        {/* LEFT panel (separate sibling) */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 pr-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search categories..."
                  className="border rounded px-3 py-2 text-sm w-64"
                />
                <button
                  onClick={() => {
                    setQuery("");
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border rounded text-sm"
                >
                  Clear
                </button>
              </div>

              <div className="text-sm text-gray-500">{categories.length} total</div>
            </div>

            {loading ? (
              <div className="p-6 text-gray-500">Loading categories...</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-sm text-gray-500 italic">No categories found.</div>
            ) : (
              <>
                <div className="rounded-lg overflow-hidden border border-gray-100">
                  <table className="w-full text-sm bg-white">
                    <thead>
                      <tr className="text-left text-gray-600 border-b bg-gray-50">
                        <th className="p-4">Name</th>
                        <th className="p-4">Description</th>
                        <th className="p-4 text-center w-32">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {displayed.map((c) => (
                        <tr key={c.id} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="p-4 align-top">
                            <div className="font-medium text-gray-800">{c.name}</div>
                            <div className="text-xs text-gray-500 mt-1">ID: {c.id}</div>
                          </td>
                          <td className="p-4 align-top text-gray-700">{c.description}</td>
                          <td className="p-4 align-top text-center">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => fillFormForEdit(c)}
                                className="p-2 rounded-md border hover:shadow-sm bg-white"
                                title="View / Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(c)}
                                className="p-2 rounded-md border hover:shadow-sm bg-white text-red-600"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls (right-aligned) */}
                <div className="flex justify-end items-center gap-3 mt-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded border text-sm ${
                      currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                    }`}
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded border text-sm ${
                      currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT panel (separate sibling) */}
        <div className="w-96 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6" id="category-form">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {mode === "add" ? "Add Category" : `Edit Category (#${form.id})`}
              </h3>
              {mode === "edit" && (
                <button
                  onClick={resetForm}
                  className="px-2 py-1 border rounded text-sm flex items-center gap-1"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm block mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Category name"
                  required
                />
              </div>

              <div>
                <label className="text-sm block mb-1">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  rows={4}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Short description..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="px-3 py-2 border rounded text-sm">
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 rounded bg-[var(--brown-700)] hover:bg-[var(--brown-800)] text-white text-sm"
                >
                  {mode === "add" ? (
                    <span className="flex items-center gap-2"><Plus size={14} /> Add Category</span>
                  ) : (
                    <span className="flex items-center gap-2"><Pencil size={14} /> Update Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

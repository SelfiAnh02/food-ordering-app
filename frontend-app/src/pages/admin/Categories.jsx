// src/pages/admin/Categories.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../services/categoryService";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [mode, setMode] = useState("add");
  const [form, setForm] = useState({ id: null, name: "", description: "" });

  // Load categories from API
  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      // sesuaikan jika API merespons dengan data field berbeda
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat kategori.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        String(c.id ?? c._id).includes(q) ||
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
    setForm({ id: cat._id, name: cat.name ?? "", description: cat.description ?? "" });
    document.getElementById("category-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return alert("Nama kategori wajib diisi.");

    try {
      if (mode === "add") {
        const res = await createCategory({ name, description: form.description });
        setCategories((s) => [res.data, ...s]);
      } else {
        const res = await updateCategory(form.id, { name, description: form.description });
        setCategories((s) => s.map((c) => (c._id === form.id ? res.data : c)));
      }
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan kategori.");
    }
  }

  async function handleDelete(cat) {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat._id);
      setCategories((s) => {
        const next = s.filter((x) => x._id !== cat._id);
        const newPages = Math.max(1, Math.ceil(next.length / itemsPerPage));
        if (currentPage > newPages) setCurrentPage(newPages);
        return next;
      });
      if (mode === "edit" && form.id === cat._id) resetForm();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus kategori.");
    }
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
        {/* LEFT panel */}
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
                        <tr key={c._id} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="p-4 align-top">
                            <div className="font-medium text-gray-800">{c.name}</div>
                            <div className="text-xs text-gray-500 mt-1">ID: {c._id}</div>
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

                {/* Pagination controls */}
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

        {/* RIGHT panel */}
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

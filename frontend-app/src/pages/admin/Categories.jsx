// src/pages/admin/Categories.jsx
import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";


/**
 * Categories page:
 * - Left: table list (fetch from API)
 * - Right: Add/Edit form (submits to API)
 * - Pagination, search, responsive
 * - Normalize backend _id -> id
 */

function normalizeCategory(raw) {
  if (!raw) return null;
  const id = raw._id ?? raw.id ?? String(Math.random()).slice(2);
  const name = raw.name ?? raw.title ?? "Unnamed";
  const description = raw.description ?? raw.desc ?? "";
  return { ...raw, id, name, description };
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // form state
  const [mode, setMode] = useState("add"); // 'add' | 'edit'
  const [form, setForm] = useState({ id: null, name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // fetch categories from API
  async function fetchCategories() {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getCategories();
      // backend returns { success: true, data: categories }
      const raw = res?.data?.data ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw.map(normalizeCategory) : [];
      setCategories(list);
    } catch (err) {
      console.error("getCategories error", err);
      setFetchError(err?.message ?? "Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  // filter & pagination
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        String(c.id).toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const displayed = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  // form helpers
  function resetForm() {
    setMode("add");
    setForm({ id: null, name: "", description: "" });
  }

  function fillFormForEdit(cat) {
    setMode("edit");
    setForm({ id: cat.id, name: cat.name ?? "", description: cat.description ?? "" });
    // scroll into view (optional)
    document.getElementById("category-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // create or update
  async function handleSubmit(e) {
    e.preventDefault();
    const name = (form.name || "").trim();
    if (!name) return alert("Nama kategori wajib diisi.");

    setSaving(true);
    try {
      if (mode === "add") {
        const res = await createCategory({ name, description: form.description || "" });
        // backend: { success: true, data: category }
        const createdRaw = res?.data?.data ?? res?.data ?? res;
        const created = normalizeCategory(createdRaw);
        if (created && created.id) {
          setCategories((s) => [created, ...s]);
        } else {
          // fallback to refetch
          await fetchCategories();
        }
        setCurrentPage(1);
      } else {
        // edit
        const idToSend = form.id; // this should be _id or id; productService uses id
        const res = await updateCategory(idToSend, { name, description: form.description || "" });
        const updatedRaw = res?.data?.data ?? res?.data ?? res;
        const updated = normalizeCategory(updatedRaw);
        if (updated && updated.id) {
          setCategories((s) => s.map((c) => (String(c.id) === String(updated.id) ? updated : c)));
        } else {
          await fetchCategories();
        }
        resetForm();
      }
    } catch (err) {
      console.error("save category error", err);
      alert(err?.response?.data?.message ?? "Gagal menyimpan kategori.");
    } finally {
      setSaving(false);
    }
  }

  // delete
  async function handleDelete(cat) {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    setDeletingId(cat.id);
    try {
      const idToSend = cat._id ?? cat.id;
      await deleteCategory(idToSend);
      setCategories((s) => {
        const next = s.filter((x) => String(x.id) !== String(cat.id));
        // adjust page if needed
        const newPages = Math.max(1, Math.ceil(next.length / itemsPerPage));
        if (currentPage > newPages) setCurrentPage(newPages);
        return next;
      });
      if (mode === "edit" && form.id === cat.id) resetForm();
    } catch (err) {
      console.error("delete category error", err);
      alert(err?.response?.data?.message ?? "Gagal menghapus kategori.");
    } finally {
      setDeletingId(null);
    }
  }

  // small helper to render ID shorter on UI
  function shortId(id) {
    const s = String(id);
    return s.length > 12 ? `${s.slice(0, 8)}…` : s;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: table list */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 pr-0 lg:pr-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
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
            ) : fetchError ? (
              <div className="p-6 text-red-500">Error: {fetchError}</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-sm text-gray-500 italic">No categories found.</div>
            ) : (
              <>
                <div className="rounded-lg overflow-hidden border border-gray-100">
                  <table className="w-full text-sm bg-white">
                    <thead>
                      <tr className="text-sm text-left text-gray-600 bg-gray-100">
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
                            <div className="text-xs text-gray-500 mt-1">ID: {shortId(c.id)}</div>
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
                                disabled={deletingId === c.id}
                              >
                                {deletingId === c.id ? "..." : <Trash2 size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-end items-center gap-3 mt-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded border text-sm ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded border text-sm ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: add / edit form */}
        <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6" id="category-form">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{mode === "add" ? "Add Category" : `Edit Category (#${shortId(form.id)})`}</h3>
              {mode === "edit" && (
                <button onClick={resetForm} className="px-2 py-1 border rounded text-sm flex items-center gap-1">
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
                  disabled={saving}
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
                  disabled={saving}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="px-3 py-2 border rounded text-sm" disabled={saving}>
                  Reset
                </button>
                <button type="submit" className="px-3 py-2 rounded bg-[var(--brown-700)]  text-white text-sm" disabled={saving}>
                  {saving ? (mode === "add" ? "Adding..." : "Updating...") : (
                    mode === "add" ? <span className="flex items-center gap-2"><Plus size={14} /> Add Category</span> : <span className="flex items-center gap-2"><Pencil size={14} /> Update Category</span>
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

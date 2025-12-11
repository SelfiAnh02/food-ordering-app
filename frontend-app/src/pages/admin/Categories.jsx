// src/pages/admin/Categories.jsx
import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import Pagination from "../../components/common/pagination";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/admin/categoryService";

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
  const itemsPerPage = 5;

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
    setForm({
      id: cat.id,
      name: cat.name ?? "",
      description: cat.description ?? "",
    });
    // scroll into view (optional)
    document
      .getElementById("category-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // create or update
  async function handleSubmit(e) {
    e.preventDefault();
    const name = (form.name || "").trim();
    if (!name) return alert("Nama kategori wajib diisi.");

    setSaving(true);
    try {
      if (mode === "add") {
        const res = await createCategory({
          name,
          description: form.description || "",
        });
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
        resetForm();
      } else {
        // edit
        const idToSend = form.id; // this should be _id or id; productService uses id
        const res = await updateCategory(idToSend, {
          name,
          description: form.description || "",
        });
        const updatedRaw = res?.data?.data ?? res?.data ?? res;
        const updated = normalizeCategory(updatedRaw);
        if (updated && updated.id) {
          setCategories((s) =>
            s.map((c) => (String(c.id) === String(updated.id) ? updated : c))
          );
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
    <div className="flex-1 h-full flex flex-col min-h-0">
      <div className="flex-1 flex flex-col lg:flex-row gap-4 items-stretch">
        {/* LEFT: table list (3/5) */}
        <div className="w-full lg:w-3/5 flex flex-col min-h-0 bg-white rounded-lg shadow-sm border border-amber-200 shadow-amber-300 pr-0">
          <div className="p-6 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search categories..."
                  className="border rounded-lg border-amber-400 px-3 py-2 text-sm w-full sm:w-64"
                />
                <button
                  onClick={() => {
                    setQuery("");
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border rounded-lg border-amber-400 bg-amber-600 text-white text-sm"
                >
                  Clear
                </button>
              </div>

              <div className="text-sm text-gray-500 ml-auto">
                {categories.length} total
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-gray-500">Loading categories...</div>
            ) : fetchError ? (
              <div className="p-6 text-red-500">Error: {fetchError}</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-sm text-gray-500 italic">
                No categories found.
              </div>
            ) : (
              <>
                {/* Table area: scrollable internally so page doesn't scroll */}
                <div className="flex-1 overflow-auto hide-scrollbar">
                  <div className="rounded-lg overflow-x-auto bg-white border border-amber-400">
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="min-w-full tsext-sm bg-white">
                        <thead>
                          <tr className="text-sm text-left text-amber-800 bg-amber-50 border-b border-amber-400">
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Description</th>
                            <th className="px-4 py-2 text-center w-32">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {displayed.map((c) => (
                            <tr
                              key={c.id}
                              className="border-b border-amber-400 last:border-b-0 hover:bg-amber-50"
                            >
                              <td className="p-4 align-top">
                                <div className="font-medium text-gray-800">
                                  {c.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  ID: {shortId(c.id)}
                                </div>
                              </td>
                              <td className="p-4 align-top text-gray-700">
                                {c.description}
                              </td>
                              <td className="p-4 align-top text-center">
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => fillFormForEdit(c)}
                                    className="p-2 rounded-lg border border-amber-400 text-amber-800 hover:shadow-sm bg-white"
                                    title="View / Edit"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(c)}
                                    className="p-2 rounded-lg border hover:shadow-sm bg-white text-red-600"
                                    title="Delete"
                                    disabled={deletingId === c.id}
                                  >
                                    {deletingId === c.id ? (
                                      "..."
                                    ) : (
                                      <Trash2 size={16} />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile header for card list (visible on small screens) */}
                    <div className="sm:hidden block sticky top-0 z-10 bg-amber-50 border-b border-amber-200">
                      <div className="flex items-center px-4 py-2 text-amber-800 text-sm font-semibold">
                        <div className="flex-1">Name</div>
                        <div className="w-20 text-center">Action</div>
                      </div>
                    </div>

                    {/* CARD list for mobile (sm-) */}
                    <div className="sm:hidden divide-y">
                      {displayed.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 bg-white border-b border-amber-400"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-amber-800">
                                {c.name}
                              </div>
                              <div className="text-xs text-amber-600 mt-1">
                                ID: {shortId(c.id)}
                              </div>
                              <div className="text-sm text-gray-700 mt-2">
                                {c.description}
                              </div>
                            </div>

                            <div className="flex-shrink-0 ml-2 flex items-start gap-2">
                              <button
                                onClick={() => fillFormForEdit(c)}
                                className="p-2 rounded-lg border border-amber-400 text-amber-800 hover:shadow-sm bg-white"
                                title="View / Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(c)}
                                className="p-2 rounded-lg hover:shadow-sm border bg-white text-red-600"
                                title="Delete"
                                disabled={deletingId === c.id}
                              >
                                {deletingId === c.id ? (
                                  "..."
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pagination (still based on server pages) */}
                <div className="mt-2">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => setCurrentPage(p)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: add / edit form */}
        <div className="w-full lg:w-2/5 flex flex-col min-h-0 bg-white rounded-lg shadow-sm border border-amber-200 shadow-amber-300">
          <div className="p-6 flex-1 overflow-auto" id="category-form">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-amber-800 text-lg font-semibold">
                {mode === "add"
                  ? "Add Category"
                  : `Edit Category (#${shortId(form.id)})`}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-amber-800 text-sm block mb-1">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                  className="border border-amber-400 rounded-lg px-3 py-2"
                  placeholder="Category name"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label className="text-amber-800 text-sm block mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, description: e.target.value }))
                  }
                  rows={4}
                  className="w-full border border-amber-400 rounded-lg px-3 py-2 text-sm"
                  placeholder="Short description..."
                  disabled={saving}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 border rounded-lg text-sm border-amber-400 bg-white text-amber-800"
                  disabled={saving}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition shadow-sm"
                  disabled={saving}
                >
                  {saving ? (
                    mode === "add" ? (
                      "Adding..."
                    ) : (
                      "Updating..."
                    )
                  ) : mode === "add" ? (
                    <span className="flex items-center gap-2">
                      <Plus size={14} /> Add Category
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Pencil size={14} /> Update Category
                    </span>
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

// src/pages/admin/Products.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Eye, Trash2, Pencil, Grid, List } from "lucide-react";

/* ----------------------------- Mock data ----------------------------- */
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Cappuccino",
    description: "Rich espresso with steamed milk foam",
    price: 35000,
    category: "Coffee",
    stock: 12,
    image: "",
  },
  {
    id: 2,
    name: "Green Tea Latte",
    description: "Smooth matcha latte with milk",
    price: 28000,
    category: "Tea",
    stock: 5,
    image: "",
  },
  {
    id: 3,
    name: "Blueberry Muffin",
    description: "Freshly baked muffin with blueberries",
    price: 22000,
    category: "Bakery",
    stock: 20,
    image: "",
  },
];

/* derive categories from mock data (unique) */
const CATEGORIES = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category))).filter(Boolean);

/* -------------------------- Helper utilities ------------------------- */
function formatPrice(v) {
  if (v == null || v === "") return "-";
  if (typeof v !== "number") v = Number(v) || 0;
  return "Rp. " + v.toLocaleString("id-ID");
}

function formatNumberToLocale(v) {
  if (v == null || v === "") return "";
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("id-ID");
}

function parseDigits(s) {
  if (!s) return 0;
  // keep only digits
  const digits = String(s).replace(/[^\d]/g, "");
  return digits === "" ? 0 : Number(digits);
}

function nextId(list) {
  return list.length === 0 ? 1 : Math.max(...list.map((x) => x.id)) + 1;
}

/* ---------------------------- Small UI parts -------------------------- */
function IconButton({ title, onClick, children, className = "" }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`px-2 py-1 border rounded-md hover:shadow-sm ${className}`}
    >
      {children}
    </button>
  );
}

/* ----------------------------- Modal/Form ---------------------------- */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl z-10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="px-2 py-1 rounded-md border">
            Close
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

/* ProductForm with: - formatted price input (text) - category select - image upload (local file preview) */
function ProductForm({ initial = {}, categories = [], onCancel, onSubmit }) {
  // priceNumber holds raw numeric value, priceText holds formatted string shown in input
  const [form, setForm] = useState({
    name: initial.name ?? "",
    description: initial.description ?? "",
    priceNumber: initial.price ?? 0,
    priceText: initial.price ? formatNumberToLocale(initial.price) : "",
    category: initial.category ?? (categories[0] ?? ""),
    stock: initial.stock ?? 0,
    image: initial.image ?? "", // dataURL or empty
  });

  // When initial changes (edit mode), sync
  useEffect(() => {
    setForm({
      name: initial.name ?? "",
      description: initial.description ?? "",
      priceNumber: initial.price ?? 0,
      priceText: initial.price ? formatNumberToLocale(initial.price) : "",
      category: initial.category ?? (categories[0] ?? ""),
      stock: initial.stock ?? 0,
      image: initial.image ?? "",
    });
  }, [initial, categories]);

  function change(field, value) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  /* Price input handler: accept any text, keep only digits for number, but show formatted text */
  function handlePriceTextChange(e) {
    const txt = e.target.value;
    const num = parseDigits(txt);
    change("priceNumber", num);
    change("priceText", formatNumberToLocale(num));
  }

  /* File upload: read as data URL for preview (UI-only). Accept single image. */
  function handleImageFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      change("image", ev.target.result);
    };
    reader.readAsDataURL(f);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description,
      price: Number(form.priceNumber) || 0,
      category: form.category,
      stock: Number(form.stock) || 0,
      image: form.image || "",
    };

    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm block mb-1">Name</label>
          <input
            value={form.name}
            onChange={(e) => change("name", e.target.value)}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => change("category", e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">-- Select category --</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">Price (IDR)</label>
          {/* text input to avoid spinner; formatted on change */}
          <input
            type="text"
            inputMode="numeric"
            value={form.priceText}
            onChange={handlePriceTextChange}
            placeholder="e.g. 35.000"
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => change("stock", Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="text-sm block mb-1">Image</label>
        <div className="flex gap-3 items-center">
          <input type="file" accept="image/*" onChange={handleImageFile} />
          {form.image ? (
            <div className="w-20 h-20 border rounded overflow-hidden">
              <img src={form.image} alt="preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 border rounded flex items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm block mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => change("description", e.target.value)}
          className="w-full border rounded px-2 py-1"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-2 border rounded">
          Cancel
        </button>
        <button type="submit" className="px-3 py-2 rounded bg-[var(--brown-700)] text-white">
          Save
        </button>
      </div>
    </form>
  );
}

/* ----------------------------- Main Page ----------------------------- */
export default function Products() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("table"); // "table" | "card"
  const [loading, setLoading] = useState(true);

  // modal state
  const [modal, setModal] = useState({
    open: false,
    mode: null, // 'view' | 'edit' | 'add'
    product: null,
  });

  useEffect(() => {
    // simulate load
    const t = setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, []);

  // categories live from products (keeps sync if products change)
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      return (
        String(p.id).includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    });
  }, [products, query]);

  /* ------------------------ CRUD (UI only) ------------------------ */

  function openModal(mode, product = null) {
    setModal({ open: true, mode, product });
  }

  function closeModal() {
    setModal({ open: false, mode: null, product: null });
  }

  function handleAdd(newData) {
    const id = nextId(products);
    const newProduct = { id, ...newData };
    setProducts((s) => [newProduct, ...s]);
    closeModal();
  }

  function handleEdit(updatedData) {
    const id = modal.product?.id;
    if (!id) return;
    setProducts((s) => s.map((p) => (p.id === id ? { ...p, ...updatedData } : p)));
    closeModal();
  }

  function handleDelete(p) {
    const ok = confirm(`Delete product "${p.name}"? This only removes it locally.`);
    if (!ok) return;
    setProducts((s) => s.filter((x) => x.id !== p.id));
  }

  /* --------------------------- Render UI --------------------------- */
  return (
    <div className="flex flex-col h-full">
      {/* Header + controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Products</h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border rounded-md px-2 py-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, id, category..."
              className="outline-none text-sm w-64 px-2 py-1"
            />
          </div>

          <button
            onClick={() => setView("table")}
            className={`p-2 rounded-md border ${view === "table" ? "bg-gray-100" : "bg-white"}`}
            title="Table view"
          >
            <List size={16} />
          </button>

          <button
            onClick={() => setView("card")}
            className={`p-2 rounded-md border ${view === "card" ? "bg-gray-100" : "bg-white"}`}
            title="Card view"
          >
            <Grid size={16} />
          </button>

          <button
            onClick={() => openModal("add")}
            className="ml-2 px-3 py-2 rounded-md bg-[var(--brown-700)] text-white text-sm"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {loading ? (
          <div className="panel p-6 rounded-md">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="panel p-6 rounded-md">No products found.</div>
        ) : view === "table" ? (
          <div className="panel p-4 rounded-lg overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-sm text-left text-gray-600">
                  <th className="p-3">ID</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3 align-top">{p.id}</td>

                    <td className="p-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{p.description}</div>
                    </td>

                    <td className="p-3 font-semibold">{formatPrice(p.price)}</td>

                    <td className="p-3">{p.category}</td>

                    <td className={`p-3 ${p.stock <= 5 ? "text-red-600" : ""}`}>{p.stock}</td>

                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <IconButton
                          title="View"
                          onClick={() => openModal("view", p)}
                          className="bg-white"
                        >
                          <Eye size={14} />
                        </IconButton>

                        <IconButton
                          title="Edit"
                          onClick={() => openModal("edit", p)}
                          className="bg-white"
                        >
                          <Pencil size={14} />
                        </IconButton>

                        <IconButton
                          title="Delete"
                          onClick={() => handleDelete(p)}
                          className="text-red-600"
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Card view (grid) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-50 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{p.description}</div>
                    </div>

                    <div className="text-sm font-semibold">{formatPrice(p.price)}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-600">{p.category}</div>
                    <div className={`text-sm ${p.stock <= 5 ? "text-red-600" : ""}`}>Stock: {p.stock}</div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openModal("view", p)} className="flex-1 py-2 border rounded-md">
                      View
                    </button>
                    <button onClick={() => openModal("edit", p)} className="px-3 py-2 border rounded-md">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="px-3 py-2 border rounded-md text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal area */}
      {modal.open && modal.mode === "view" && modal.product && (
        <Modal title={`Product #${modal.product.id}`} onClose={closeModal}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              {modal.product.image ? (
                <img src={modal.product.image} alt={modal.product.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-50 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <h4 className="text-lg font-semibold mb-1">{modal.product.name}</h4>
              <div className="text-sm text-gray-600 mb-2">{modal.product.category}</div>
              <div className="font-semibold mb-2">{formatPrice(modal.product.price)}</div>
              <div className="text-sm mb-3">Stock: {modal.product.stock}</div>
              <div className="text-sm text-gray-700">{modal.product.description}</div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button onClick={closeModal} className="px-3 py-2 border rounded">
              Close
            </button>
            <button
              onClick={() => {
                closeModal();
                openModal("edit", modal.product);
              }}
              className="px-3 py-2 border rounded bg-yellow-100"
            >
              Edit
            </button>
            <button
              onClick={() => {
                closeModal();
                const ok = confirm(`Delete product "${modal.product.name}"?`);
                if (ok) handleDelete(modal.product);
              }}
              className="px-3 py-2 border rounded text-red-600"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {modal.open && modal.mode === "add" && (
        <Modal title="Add Product" onClose={closeModal}>
          <ProductForm
            initial={{}}
            categories={categories.length ? categories : CATEGORIES}
            onCancel={closeModal}
            onSubmit={(data) => handleAdd(data)}
          />
        </Modal>
      )}

      {modal.open && modal.mode === "edit" && modal.product && (
        <Modal title={`Edit Product #${modal.product.id}`} onClose={closeModal}>
          <ProductForm
            initial={modal.product}
            categories={categories.length ? categories : CATEGORIES}
            onCancel={closeModal}
            onSubmit={(data) => handleEdit(data)}
          />
        </Modal>
      )}
    </div>
  );
}

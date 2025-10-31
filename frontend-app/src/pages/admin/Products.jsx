// src/pages/admin/Products.jsx
import { useEffect, useMemo, useState } from "react";
import { Grid, List } from "lucide-react";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";

import { getCategories } from "../../services/categoryService";

import ProductTable from "../../components/admin/product/ProductTable";
import ProductCardGrid from "../../components/admin/product/ProductCardGrid";
import Modal from "../../components/admin/product/ProductModal";
import ProductForm from "../../components/admin/product/ProductForm";
import { formatPrice } from "../../utils/productUtils";

/* normalize helpers */
function normalizeProduct(raw) {
  if (!raw) return null;

  const id = raw.id ?? raw._id ?? String(Math.random()).slice(2);
  const name = raw.name ?? raw.title ?? raw.productName ?? "Unnamed";
  const description = raw.description ?? raw.desc ?? raw.keterangan ?? raw.detail ?? "";
  const price = Number(raw.price ?? raw.harga ?? raw.cost ?? 0) || 0;
  const stock = Number(raw.stock ?? raw.qty ?? raw.quantity ?? raw.stok ?? 0) || 0;

  // IMPORTANT: keep both categoryId and categoryName (don't collapse to single string)
  let categoryId = raw.categoryId ?? raw.category?._id ?? raw.categoryId ?? raw.category ?? null;
  if (typeof categoryId === "object") {
    // if backend populated categoryId as object { _id, name }
    categoryId = categoryId._id ?? categoryId.id ?? null;
  }

  let categoryName = "-";
  if (raw.categoryId && typeof raw.categoryId === "object") {
    categoryName = raw.categoryId.name ?? raw.categoryId.title ?? String(raw.categoryId._id ?? "");
  } else if (raw.category && typeof raw.category === "object") {
    categoryName = raw.category.name ?? raw.category.title ?? String(raw.category._id ?? "");
  } else if (raw.categoryName) {
    categoryName = raw.categoryName;
  } else if (typeof raw.category === "string") {
    categoryName = raw.category;
  } else if (raw.type) {
    categoryName = raw.type;
  }

  let image = "";
  if (raw.image) image = typeof raw.image === "string" ? raw.image : raw.image.url ?? "";
  else if (raw.imageUrl) image = raw.imageUrl;
  else if (Array.isArray(raw.images) && raw.images.length) image = raw.images[0];
  else if (raw.img) image = raw.img;

  return {
    ...raw,
    id,
    name,
    description,
    price,
    stock,
    // keep both fields for UI + for sending update/create (we will send categoryId)
    categoryId: categoryId ?? "",
    categoryName: categoryName ?? "-",
    image,
  };
}

function normalizeProducts(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeProduct).filter(Boolean);
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]); // [{ id, name }]
  const [query, setQuery] = useState("");
  const [view, setView] = useState("table"); // "table" | "card"
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({ open: false, mode: null, product: null });

  async function fetchAll() {
    setLoading(true);
    try {
      // fetch products and categories in parallel
      const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);

      // products tolerant shapes:
      const rawProducts = prodRes?.data?.products ?? prodRes?.data ?? prodRes ?? [];
      const list = Array.isArray(rawProducts) ? rawProducts : [];
      const normalized = normalizeProducts(list);
      setProducts(normalized);

      // normalize categories (expecting backend returns { success, data: [...] } or array)
      const rawCats = catRes?.data?.data ?? catRes?.data ?? catRes ?? [];
      const catsArray = Array.isArray(rawCats) ? rawCats : [];
      const catsNormalized = catsArray.map((c) => {
        const id = c._id ?? c.id ?? String(c);
        const name = c.name ?? c.title ?? String(c);
        return { id, name };
      });
      setCategoriesList(catsNormalized);
    } catch (err) {
      console.error("failed load products/categories", err);
      alert("Gagal memuat data dari server. Cek console untuk detail.");
      setProducts([]);
      setCategoriesList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      return (
        String(p.id ?? "").toLowerCase().includes(q) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    });
  }, [products, query]);

  function openModal(mode, product = null) {
    // ensure modal.product includes categoryId for edit
    setModal({ open: true, mode, product });
  }

  function closeModal() {
    setModal({ open: false, mode: null, product: null });
  }

  async function handleAdd(data) {
    /* data should include categoryId (ProductForm now sends categoryId) */
    try {
      const res = await createProduct(data);
      const createdRaw = res?.data?.product ?? res?.data ?? res;
      const created = normalizeProduct(createdRaw);
      if (created && created.id) {
        setProducts((s) => [created, ...s]);
      } else {
        await fetchAll();
      }
      closeModal();
    } catch (err) {
      console.error("create error", err);
      alert("Gagal menambah produk. Periksa koneksi atau server.");
    }
  }

  async function handleEdit(data) {
    try {
      const id = modal.product?.id;
      if (!id) return;
      const res = await updateProduct(id, data);
      const updatedRaw = res?.data?.product ?? res?.data ?? res;
      const updated = normalizeProduct(updatedRaw);
      if (updated && updated.id) {
        setProducts((s) => s.map((p) => (String(p.id) === String(updated.id) ? updated : p)));
      } else {
        await fetchAll();
      }
      closeModal();
    } catch (err) {
      console.error("update error", err);
      alert("Gagal mengubah produk.");
    }
  }

  async function handleDelete(p) {
    const ok = confirm(`Delete product "${p.name}"?`);
    if (!ok) return;
    try {
      const idToSend = p._id ?? p.id;
      await deleteProduct(idToSend);
      setProducts((s) => s.filter((x) => String(x.id) !== String(p.id)));
    } catch (err) {
      console.error("delete error", err);
      alert("Gagal menghapus produk.");
    }
  }

  function shortId(id) {
    const s = String(id);
    return s.length > 12 ? `${s.slice(0, 8)}…` : s;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center bg-white border rounded-md px-2 py-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, id, category..."
                className="outline-none text-sm w-full px-2 py-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setView("table")} className={`p-2 rounded-md border ${view === "table" ? "bg-gray-100" : "bg-white"}`} title="Table view">
              <List size={16} />
            </button>

            <button onClick={() => setView("card")} className={`p-2 rounded-md border ${view === "card" ? "bg-gray-100" : "bg-white"}`} title="Card view">
              <Grid size={16} />
            </button>
          </div>

          <div className="ml-auto sm:ml-0">
            <button onClick={() => openModal("add")} className="px-3 py-2 rounded-md bg-[var(--brown-700)] text-white text-sm shadow-sm">
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {loading ? (
          <div className="panel p-6 rounded-md">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="panel p-6 rounded-md">No products found.</div>
        ) : view === "table" ? (
          <div className="px-0 sm:px-2">
            <ProductTable
              products={filtered}
              onView={(p) => openModal("view", p)}
              onEdit={(p) => openModal("edit", p)}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="px-0 sm:px-2">
            <ProductCardGrid products={filtered} onView={(p) => openModal("view", p)} onEdit={(p) => openModal("edit", p)} onDelete={handleDelete} />
          </div>
        )}
      </div>

      {/* Modal area */}
      {modal.open && modal.mode === "view" && modal.product && (
        <Modal title={`Product #${shortId(modal.product.id)}`} onClose={closeModal}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              {modal.product.image ? (
                <img src={modal.product.image} alt={modal.product.name} className="w-full h-40 object-cover rounded" />
              ) : (
                <div className="w-full h-40 bg-gray-50 flex items-center justify-center text-gray-400 rounded">No image</div>
              )}
            </div>

            <div className="sm:col-span-2">
              <h4 className="text-lg font-semibold mb-1">{modal.product.name}</h4>
              <div className="text-sm text-gray-600 mb-2">{modal.product.categoryName}</div>
              <div className="font-semibold mb-2">{formatPrice(modal.product.price)}</div>
              <div className="text-sm mb-3">Stock: {modal.product.stock ?? 0}</div>
              <div className="text-sm text-gray-700">{modal.product.description}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
            <button onClick={closeModal} className="px-3 py-2 border rounded">Close</button>
            <button onClick={() => { closeModal(); openModal("edit", modal.product); }} className="px-3 py-2 border rounded bg-yellow-100">Edit</button>
            <button onClick={() => { closeModal(); const ok = confirm(`Delete product "${modal.product.name}"?`); if (ok) handleDelete(modal.product); }} className="px-3 py-2 border rounded text-red-600">Delete</button>
          </div>
        </Modal>
      )}

      {modal.open && modal.mode === "add" && (
        <Modal title="Add Product" onClose={closeModal}>
          <div className="max-w-lg w-full">
            <ProductForm initial={{}} categories={categoriesList} onCancel={closeModal} onSubmit={(data) => handleAdd(data)} />
          </div>
        </Modal>
      )}

      {modal.open && modal.mode === "edit" && modal.product && (
        <Modal title={`Edit Product #${shortId(modal.product.id)}`} onClose={closeModal}>
          <div className="max-w-lg w-full">
            {/* pass initial.category as categoryId so ProductForm will set select correctly */}
            <ProductForm
              initial={{ ...modal.product, category: modal.product.categoryId ?? modal.product.categoryName }}
              categories={categoriesList}
              onCancel={closeModal}
              onSubmit={(data) => handleEdit(data)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

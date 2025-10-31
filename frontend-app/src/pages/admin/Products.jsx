// src/pages/admin/Products.jsx
import { useState, useMemo } from "react";
import { Grid, List } from "lucide-react";

import useProducts from "../../hooks/useProducts";
import useCategories from "../../hooks/useCategories";
import ProductTable from "../../components/admin/product/ProductTable";
import ProductCardGrid from "../../components/admin/product/ProductCardGrid";
import Modal from "../../components/admin/product/ProductModal";
import ProductForm from "../../components/admin/product/ProductForm";
import Pagination from "../../components/common/pagination";
import { formatPrice } from "../../utils/productUtils";

export default function Products() {
  const [view, setView] = useState("table");
  const [modal, setModal] = useState({ open: false, mode: null, product: null });

  // useProducts tetap fetching pages from server (tidak dipicu oleh searchTerm)
  const {
    products, // produk yang diambil dari server (current page)
    error,
    page,
    totalPages,
    setPage,
    refresh,
  } = useProducts({ initialPage: 1, initialLimit: 9 });

  // categories (untuk form)
  const { categories, refresh: refreshCategories } = useCategories();

  // local search state (TIDAK memicu network requests)
  const [searchTerm, setSearchTerm] = useState("");

  function openModal(mode, product = null) {
    setModal({ open: true, mode, product });
  }
  function closeModal() {
    setModal({ open: false, mode: null, product: null });
  }

  async function onDelete(p) {
    if (!confirm(`Delete product "${p.name}"?`)) return;
    try {
      const { deleteProduct } = await import("../../services/productService");
      await deleteProduct(p._id ?? p.id);
      refresh();
    } catch (err) {
      console.error("delete failed", err);
      alert("Gagal menghapus produk.");
    }
  }

  // ------------ client-side filtering ------------
  // normalize search string once
  const q = String(searchTerm || "").trim().toLowerCase();

  // filteredProducts will be derived from products already fetched
  const filteredProducts = useMemo(() => {
    if (!q) return products;
    return (products || []).filter((p) => {
      const idStr = String(p.id ?? p._id ?? "").toLowerCase();
      const name = String(p.name ?? "").toLowerCase();
      const desc = String(p.description ?? "").toLowerCase();
      const cat =
        (p.categoryName ?? (p.categoryId && p.categoryId.name) ?? p.category ?? "")
          .toString()
          .toLowerCase();
      return idStr.includes(q) || name.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }, [products, q]);
  // ------------------------------------------------

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center bg-white border rounded-md px-2 py-1">
              {/* NOTE: use local searchTerm so we don't trigger useProducts fetch */}
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
        {error ? (
          <div className="panel p-6 rounded-md text-red-600">Gagal memuat produk.</div>
        ) : filteredProducts.length === 0 ? (
          <div className="panel p-6 rounded-md">No products found.</div>
        ) : view === "table" ? (
          <div className="px-0 sm:px-2">
            <ProductTable
              products={filteredProducts}
              onView={(p) => openModal("view", p)}
              onEdit={(p) => openModal("edit", p)}
              onDelete={onDelete}
            />
          </div>
        ) : (
          <div className="px-0 sm:px-2">
            <ProductCardGrid
              products={filteredProducts}
              onView={(p) => openModal("view", p)}
              onEdit={(p) => openModal("edit", p)}
              onDelete={onDelete}
            />
          </div>
        )}
      </div>

      {/* Pagination (still based on server pages) */}
      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Modal area (view/add/edit) */}
      {modal.open && modal.mode === "view" && modal.product && (
        <Modal title={`Product #${String(modal.product.id).slice(0, 8)}`} onClose={closeModal}>
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
              <div className="text-sm text-gray-600 mb-2">{modal.product.categoryId?.name ?? "No category"}</div>
              <div className="font-semibold mb-2">{formatPrice(modal.product.price)}</div>
              <div className="text-sm mb-3">Stock: {modal.product.stock ?? 0}</div>
              <div className="text-sm text-gray-700">{modal.product.description}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
            <button onClick={closeModal} className="px-3 py-2 border rounded">Close</button>
            <button onClick={() => { closeModal(); openModal("edit", modal.product); }} className="px-3 py-2 border rounded bg-yellow-100">Edit</button>
            <button onClick={() => { closeModal(); const ok = confirm(`Delete product "${modal.product.name}"?`); if (ok) onDelete(modal.product); }} className="px-3 py-2 border rounded text-red-600">Delete</button>
          </div>
        </Modal>
      )}

      {modal.open && modal.mode === "add" && (
        <Modal title="Add Product" onClose={closeModal}>
          <div className="max-w-lg w-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm text-gray-700">Choose Category</h3>
              <button onClick={refreshCategories} className="text-xs text-blue-600 hover:underline">🔄 Refresh Categories</button>
            </div>

            <ProductForm initial={{}} categories={categories} onCancel={closeModal} onSubmit={async (data) => { const { createProduct } = await import("../../services/productService"); await createProduct(data); refresh(); closeModal(); }} />
          </div>
        </Modal>
      )}

      {modal.open && modal.mode === "edit" && modal.product && (
        <Modal title={`Edit Product #${String(modal.product.id).slice(0, 8)}`} onClose={closeModal}>
          <div className="max-w-lg w-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm text-gray-700">Choose Category</h3>
              <button onClick={refreshCategories} className="text-xs text-blue-600 hover:underline">🔄 Refresh Categories</button>
            </div>

            <ProductForm initial={modal.product} categories={categories} onCancel={closeModal} onSubmit={async (data) => { const { updateProduct } = await import("../../services/productService"); await updateProduct(modal.product._id ?? modal.product.id, data); refresh(); closeModal(); }} />
          </div>
        </Modal>
      )}
    </div>
  );
}

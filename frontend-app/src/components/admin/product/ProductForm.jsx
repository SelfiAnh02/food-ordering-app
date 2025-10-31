// src/components/admin/product/ProductForm.jsx
import { useEffect, useState } from "react";
import { parseDigits, formatNumberToLocale } from "../../../utils/productUtils";

export default function ProductForm({ initial = {}, categories = [], onCancel, onSubmit }) {
  const [form, setForm] = useState({
    name: initial.name ?? "",
    description: initial.description ?? "",
    priceNumber: initial.price ?? 0,
    priceText: initial.price ? formatNumberToLocale(initial.price) : "",
    // ✅ pastikan ambil _id (bukan id) dari categories karena populate pakai _id
    categoryId:
      initial.categoryId?._id ??
      initial.categoryId ??
      initial.category ??
      initial.categoryName ??
      (categories[0]?._id ?? categories[0]?.id ?? ""),
    stock: initial.stock ?? 0,
    image: initial.image ?? "",
  });

  // ✅ Reset ulang form jika props berubah (edit/add)
  useEffect(() => {
    setForm({
      name: initial.name ?? "",
      description: initial.description ?? "",
      priceNumber: initial.price ?? 0,
      priceText: initial.price ? formatNumberToLocale(initial.price) : "",
      categoryId:
        initial.categoryId?._id ??
        initial.categoryId ??
        initial.category ??
        initial.categoryName ??
        (categories[0]?._id ?? categories[0]?.id ?? ""),
      stock: initial.stock ?? 0,
      image: initial.image ?? "",
    });
  }, [initial, categories]);

  function change(field, value) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  function handlePriceTextChange(e) {
    const txt = e.target.value;
    const num = parseDigits(txt);
    change("priceNumber", num);
    change("priceText", formatNumberToLocale(num));
  }

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
      categoryId: form.categoryId || "", // ✅ kirim categoryId sesuai backend
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
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={form.categoryId ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id ?? c.id} value={c._id ?? c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">Price (IDR)</label>
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
              <img
                src={form.image}
                alt="preview"
                className="w-full h-full object-cover"
              />
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
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-2 rounded bg-[var(--brown-700)] text-white"
        >
          Save
        </button>
      </div>
    </form>
  );
}

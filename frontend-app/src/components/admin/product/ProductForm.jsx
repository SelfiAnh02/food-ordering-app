// src/components/admin/product/ProductForm.jsx
import { useEffect, useState } from "react";
import { parseDigits, formatNumberToLocale } from "../../../utils/productUtils";

export default function ProductForm({
  initial = {},
  categories = [],
  onCancel,
  onSubmit,
}) {
  const [saving, setSaving] = useState(false);
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
      categories[0]?._id ??
      categories[0]?.id ??
      "",
    stock: initial.stock ?? 0,
    image: initial.image ?? "",
    imageFile: null,
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
        categories[0]?._id ??
        categories[0]?.id ??
        "",
      stock: initial.stock ?? 0,
      image: initial.image ?? "",
      imageFile: null,
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
      setForm((s) => ({ ...s, image: ev.target.result, imageFile: f }));
    };
    reader.readAsDataURL(f);
  }

  // Validate file size client-side (2 MB max)
  function validateFileSize(file) {
    const max = 2 * 1024 * 1024; // 2 MB
    return file && file.size <= max;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    // default: no image upload
    let imageUrl = "";
    let imageBase64 = null;

    // if a new file was selected, `form.image` already contains data URL from FileReader
    if (form.imageFile) {
      if (!validateFileSize(form.imageFile)) {
        alert("Image too large. Max 2 MB allowed.");
        return;
      }
      imageBase64 = form.image; // data URL (e.g. data:image/jpeg;base64,...)
    } else {
      // if no new file but existing image is a URL, keep it
      if (form.image && String(form.image).startsWith("http"))
        imageUrl = form.image;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description,
      price: Number(form.priceNumber) || 0,
      categoryId: form.categoryId || "",
      stock: Number(form.stock) || 0,
      imageUrl,
      imageBase64,
    };
    try {
      setSaving(true);
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-amber-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm block mb-1 text-amber-800 font-medium">
            Name
          </label>
          <input
            value={form.name}
            onChange={(e) => change("name", e.target.value)}
            className="w-full border border-amber-400 rounded px-3 py-2 text-amber-800"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-amber-800">
            Category
          </label>
          <select
            value={form.categoryId ?? ""}
            onChange={(e) =>
              setForm((s) => ({ ...s, categoryId: e.target.value }))
            }
            className="w-full border border-amber-400 rounded px-3 py-2 text-amber-800"
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
          <label className="text-sm block mb-1 text-amber-800 font-medium">
            Price (IDR)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={form.priceText}
            onChange={handlePriceTextChange}
            placeholder="e.g. 35.000"
            className="w-full border border-amber-400 rounded px-3 py-2 text-amber-800"
          />
        </div>

        <div>
          <label className="text-sm block mb-1 text-amber-800 font-medium">
            Stock
          </label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => change("stock", Number(e.target.value))}
            className="w-full border border-amber-400 rounded px-3 py-2 text-amber-800"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="text-sm block mb-1 text-amber-800 font-medium">
          Image
        </label>
        <div className="flex gap-3 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFile}
            className="text-amber-800"
          />
          {form.image ? (
            <div className="w-24 h-24 border border-amber-400 rounded overflow-hidden">
              <img
                src={form.image}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 border border-amber-400 rounded flex items-center justify-center text-sm text-amber-400">
              No image
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm block mb-1 text-amber-800 font-medium">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => change("description", e.target.value)}
          className="w-full border border-amber-400 rounded-lg px-3 py-2 text-amber-800"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border border-amber-400 rounded-lg text-amber-800 bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

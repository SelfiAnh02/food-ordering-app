// src/components/admin/CreateStaffModal.jsx
import { useEffect, useState } from "react";

export default function CreateStaffModal({ open = false, onClose = () => {}, onCreate = async () => ({ success: false }) }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) setForm({ name: "", email: "", password: "" });
  }, [open]);

  const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!form.name || !form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await onCreate(form);
      if (res?.success) {
        onClose();
      } else {
        alert(res?.message || "Create failed");
      }
    } catch (err) {
      alert(err?.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-[#7a4528] mb-4">Create Staff</h3>
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Name</label>
            <input className="w-full border rounded px-3 py-2" value={form.name} onChange={onChange("name")} />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" autoComplete="new-email" value={form.email} onChange={onChange("email")} />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Password</label>
            <input type="password" className="w-full border rounded px-3 py-2" autoComplete="new-password" value={form.password} onChange={onChange("password")} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
            <button type="submit" disabled={submitting} className="px-3 py-1 bg-[#FF8A00] text-white rounded">
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

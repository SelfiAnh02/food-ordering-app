// src/components/admin/UsersTable.jsx
import { Eye, Pencil, Trash2 } from "lucide-react";
import IconButton from "../../common/IconButton";

export default function UsersTable({
  users = [],
  loading = false,
  onDelete = () => {},
  onEdit,
  startIndex = 0,
}) {
  const cellPad = "px-4 py-3";

  if (loading) {
    return (
      <div className="panel p-6 rounded-md bg-white border text-center text-gray-600">
        Loading users...
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="panel p-6 rounded-md bg-white border text-center text-gray-500">
        Belum ada user.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white border border-amber-400">
      <table className="min-w-full table-auto border-collapse rounded-lg overflow-hidden">
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "25%" }} />
          <col style={{ width: "25%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>

        <thead>
          <tr className="text-sm text-amber-800 bg-amber-50 border-b border-amber-400">
            <th className={`${cellPad} text-center font-semibold`}>No</th>
            <th className={`${cellPad} text-center font-semibold`}>Name</th>
            <th className={`${cellPad} text-center font-semibold`}>Email</th>
            <th className={`${cellPad} text-center font-semibold`}>Role</th>
            <th className={`${cellPad} text-center font-semibold`}>Created</th>
            <th className={`${cellPad} text-center font-semibold`}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u, i) => (
            <tr
              key={u._id || u.id || i}
              className="border-b border-amber-400 hover:bg-amber-50 transition text-sm text-gray-700"
            >
              {/* No */}
              <td className={`${cellPad} text-center`}>{startIndex + i + 1}</td>

              {/* Name */}
              <td className={`${cellPad} text-center align-middle`}>
                <div className="font-medium text-amber-800">{u.name}</div>
              </td>

              {/* Email */}
              <td className={`${cellPad} text-center text-gray-600`}>
                {u.email}
              </td>

              {/* Role */}
              <td
                className={`${cellPad} text-center capitalize text-amber-800`}
              >
                {u.role}
              </td>

              {/* Created */}
              <td className={`${cellPad} text-center text-gray-600`}>
                {(() => {
                  const d = new Date(u.createdAt || Date.now());
                  const day = String(d.getDate()).padStart(2, "0");
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const year = d.getFullYear();
                  return `${day}/${month}/${year}`;
                })()}
              </td>

              {/* Actions */}
              <td className={`${cellPad} text-center`}>
                <div className="flex justify-center items-center gap-2">
                  <IconButton
                    title={`View ${u.name}`}
                    onClick={() => console.log("view", u._id ?? u.id)}
                    className="bg-white"
                  >
                    <Eye size={14} />
                  </IconButton>

                  {onEdit && (
                    <IconButton
                      title={`Edit ${u.name}`}
                      onClick={() => onEdit(u._id ?? u.id)}
                      className="bg-white"
                    >
                      <Pencil size={14} />
                    </IconButton>
                  )}

                  <IconButton
                    title={`Delete ${u.name}`}
                    onClick={() => onDelete(u._id ?? u.id)}
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
  );
}

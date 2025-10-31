// src/components/admin/UsersTable.jsx
import { Eye, Pencil, Trash2 } from "lucide-react";
import IconButton from "../../common/IconButton";

/**
 * UsersTable
 * - Reuses IconButton the same way ProductTable does (children = icon)
 * - Keeps paddings / compact logic similar to ProductTable
 */
export default function UsersTable({ users = [], loading = false, onDelete = () => {}, onEdit }) {
  if (loading) {
    return (
      <div className="panel p-6 rounded-md bg-white border">
        Loading users...
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="panel p-6 rounded-md bg-white border text-gray-500">
        No users available.
      </div>
    );
  }

  return (
    <div className="panel p-2 sm:p-4 rounded-lg overflow-x-auto bg-white border">
      <table className="w-full table-auto min-w-[600px]">
        <thead>
          <tr className="text-sm text-left text-gray-600 bg-gray-100">
            <th className="p-3">No</th>
            <th className="p-3">Name</th>
            <th className="p-3 hidden sm:table-cell">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3 hidden md:table-cell">Created</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u, i) => (
            <tr key={u._id || u.id || i} className="border-t hover:bg-gray-50 transition">
              <td className="align-top text-sm text-gray-700 p-3">{i + 1}</td>

              <td className="p-3">
                <div className="font-medium text-gray-800">{u.name}</div>
                <div className="text-xs text-gray-500 sm:hidden">{u.email}</div>
              </td>

              <td className="p-3 hidden sm:table-cell text-gray-700">{u.email}</td>

              <td className="p-3 text-gray-700">{u.role}</td>

              <td className="p-3 hidden md:table-cell text-gray-600">
                {new Date(u.createdAt || Date.now()).toLocaleString()}
              </td>

              <td className="p-3 text-right">
                <div className="inline-flex items-center gap-2">
                  {/* view (optional)
                  <IconButton title={`View ${u.name}`} onClick={() => console.log("view", u._id ?? u.id)} className="bg-white">
                    <Eye size={14} />
                  </IconButton> */}

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

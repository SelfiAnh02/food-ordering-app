// src/components/admin/UsersTable.jsx

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
    <div className="panel p-4 rounded-lg overflow-x-auto bg-white border">
      <table className="w-full table-auto min-w-[600px]">
        <thead>
          <tr className="text-sm text-left text-gray-600 bg-gray-100">
            <th className="p-3">ID</th>
            <th className="p-3">Name</th>
            <th className="p-3 hidden sm:table-cell">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3 hidden md:table-cell">Created</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u, i) => (
            <tr key={u._id || u.id || i} className="border-t hover:bg-gray-50">
              <td className="p-3 align-top">{i + 1}</td>

              <td className="p-3">
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-gray-500 sm:hidden">{u.email}</div>
              </td>

              <td className="p-3 hidden sm:table-cell">{u.email}</td>
              <td className="p-3">{u.role}</td>

              <td className="p-3 hidden md:table-cell text-gray-600">
                {new Date(u.createdAt || Date.now()).toLocaleString()}
              </td>

              <td className="p-3 text-right">
                <div className="inline-flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(u._id || u.id)}
                      className="px-2 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100"
                      aria-label={`Edit ${u.name}`}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(u._id || u.id)}
                    className="px-2 py-1 border rounded text-sm text-red-600 hover:bg-red-50"
                    aria-label={`Delete ${u.name}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

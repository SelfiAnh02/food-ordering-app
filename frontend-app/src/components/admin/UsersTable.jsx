// src/components/admin/UsersTable.jsx

/**
 * Props:
 * - users: array (the paged/filtered list to display)
 * - loading: boolean
 * - onDelete: function(id)
 * - onEdit: optional function(id)
 */
export default function UsersTable({ users = [], loading = false, onDelete = () => {}, onEdit }) {
  if (loading) {
    return (
      <div className="bg-white border border-amber-100 rounded shadow-sm p-4">
        <div>Loading users...</div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white border border-amber-100 rounded shadow-sm p-6 text-gray-500">
        No users available.
      </div>
    );
  }

  return (
    <div className="bg-white border border-amber-100 rounded shadow-sm overflow-x-auto">
      {/* table container will scroll horizontally on small screens */}
      <table className="min-w-full table-auto">
        <thead className="bg-amber-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600">#</th>
            <th className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600">Name</th>
            <th className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 hidden sm:table-cell">Email</th>
            <th className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600">Role</th>
            <th className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600 hidden md:table-cell">Created</th>
            <th className="px-3 py-3 text-left text-xs sm:text-sm text-gray-600">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {users.map((u, i) => (
            <tr key={u._id || u.id || i} className="hover:bg-amber-50/30">
              <td className="px-3 py-3 text-sm">{i + 1}</td>

              {/* name cell: show name and on small screens show email as subtext */}
              <td className="px-3 py-3">
                <div className="text-sm font-medium text-gray-800">{u.name}</div>
                <div className="text-xs text-gray-500 sm:hidden">{u.email}</div>
              </td>

              {/* email column hidden on xs */}
              <td className="px-3 py-3 text-sm hidden sm:table-cell">{u.email}</td>

              <td className="px-3 py-3 text-sm">{u.role}</td>

              <td className="px-3 py-3 text-sm hidden md:table-cell">
                {new Date(u.createdAt || Date.now()).toLocaleString()}
              </td>

              <td className="px-3 py-3 text-sm">
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(u._id || u.id)}
                      className="text-sm text-[#7a4528] hover:underline"
                      aria-label={`Edit ${u.name}`}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(u._id || u.id)}
                    className="text-sm text-red-600 hover:underline"
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

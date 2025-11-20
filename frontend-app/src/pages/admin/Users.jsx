// src/pages/admin/Users.jsx
import { useMemo, useState } from "react";
import useUsers from "../../hooks/admin/useUsers";
import UsersTable from "../../components/admin/user/UsersTable";
import CreateStaffModal from "../../components/admin/user/CreateStaffModal";

export default function Users() {
  const { users, loading, error, create, remove } = useUsers();

  // pagination state
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // you can change default
  const [filter, setFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // client-side filtering
  const filtered = useMemo(() => {
    if (!filter) return users;
    const q = filter.toLowerCase();
    return users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q));
  }, [users, filter]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // ensure current page within range when itemsPerPage/filter changes
  if (page > totalPages) setPage(totalPages);

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, page, itemsPerPage]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await remove(id);
    if (!res.success) alert(res.message || "Delete failed");
  };

  const handleCreate = async (payload) => {
    const res = await create(payload);
    if (!res.success) return res;
    return res;
  };

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-screen flex flex-col">
      {/* Wrapper utama */}
      <div className="flex-1 flex flex-col p-4 sm:p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-1 items-center flex-wrap gap-3">
            {/* Search bar */}
            <div className="flex-1 min-w-[180px] sm:min-w-[250px]">
              <div className="flex items-center bg-white border rounded-md px-2 py-1">
                <input
                  aria-label="Search users"
                  placeholder="Search by name or email..."
                  className="outline-none text-sm w-full px-2 py-1"
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="border rounded-md px-2 py-2 text-sm bg-white"
              aria-label="Items per page"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>

            {/* Add Staff button */}
            <button
              onClick={() => setShowCreate(true)}
              className="px-3 py-2 bg-amber-600 text-white rounded-md text-sm hover:bg-amber-700 transition shadow-sm"
            >
              Add Staff
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && <div className="text-red-600 mb-3">{error}</div>}

        {/* Table */}
        <div className="min-w-full flex-1 overflow-x-auto">
          <UsersTable users={pagedUsers} loading={loading} onDelete={handleDelete} />
        </div>

        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 border-t pt-4">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            Showing{" "}
            <span className="font-medium">
              {Math.min((page - 1) * itemsPerPage + 1, totalItems || 0)}
            </span>{" "}
            -{" "}
            <span className="font-medium">
              {Math.min(page * itemsPerPage, totalItems)}
            </span>{" "}
            of <span className="font-medium">{totalItems}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2 py-1 rounded border disabled:opacity-50"
              aria-label="First page"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border disabled:opacity-50"
              aria-label="Previous page"
            >
              Prev
            </button>

            <div className="px-3 py-1 border rounded text-sm bg-gray-50">
              Page <span className="font-medium">{page}</span> /{" "}
              <span>{totalPages}</span>
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border disabled:opacity-50"
              aria-label="Next page"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 rounded border disabled:opacity-50"
              aria-label="Last page"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateStaffModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
    </div>
  );

}

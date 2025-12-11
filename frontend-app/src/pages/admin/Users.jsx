// src/pages/admin/Users.jsx
import { useMemo, useState } from "react";
import useUsers from "../../hooks/admin/useUsers";
import Pagination from "../../components/common/pagination";
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
    return users.filter((u) =>
      `${u.name} ${u.email}`.toLowerCase().includes(q)
    );
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
    <div className="flex-1 h-full bg-white rounded-lg shadow-sm border border-amber-200 shadow-amber-300 flex flex-col min-h-0">
      {/* Wrapper utama */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 min-h-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex flex-1 items-center flex-wrap gap-2">
            {/* Search bar */}
            <div className="flex-1 min-w-[180px]">
              <div className="flex items-center bg-white border rounded-lg border-amber-400 px-2 py-1">
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
              className="border rounded-lg border-amber-400 px-2 py-2 text-sm text-amber-800 bg-white"
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
        <div className="min-w-full flex-1 overflow-y-auto hide-scrollbar min-h-0">
          <UsersTable
            users={pagedUsers}
            loading={loading}
            onDelete={handleDelete}
            startIndex={(page - 1) * itemsPerPage}
          />
        </div>

        {/* Pagination (still based on server pages) */}
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
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

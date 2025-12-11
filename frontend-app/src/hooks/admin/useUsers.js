// src/hooks/useUsers.js
import { useCallback, useEffect, useState } from "react";
import * as usersAPI from "../../services/admin/userService";

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersAPI.fetchAllUsers(); // res === response.data (object)
      // support beberapa kemungkinan shape
      const usersList = res?.data ?? res?.data?.data ?? res ?? [];
      setUsers(Array.isArray(usersList) ? usersList : []);
    } catch (err) {
      // Normalize error message
      const msg =
        err?.response?.data?.message || err?.message || "Gagal memuat users";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const remove = async (id) => {
    try {
      setLoading(true);
      await usersAPI.deleteStaff(id);
      refresh();
      return { success: true };
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Gagal menghapus";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const create = async (payload) => {
    try {
      setLoading(true);
      await usersAPI.createStaff(payload);
      refresh();
      return { success: true };
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Gagal membuat staff";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, refresh, remove, create };
}

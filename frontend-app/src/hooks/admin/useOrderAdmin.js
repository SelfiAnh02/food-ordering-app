// src/hooks/useOrderAdmin.js
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  getOrderStatsAdmin,
} from "../../services/admin/orderAdminService";

/** --- Helpers --- */
function safeToNum(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

function toLocalDateKey(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeOrder(raw) {
  if (!raw) return null;
  const items = Array.isArray(raw.items)
    ? raw.items.map((it) => ({
        quantity: it.quantity ?? it.qty ?? 0,
        note: it.note ?? it.notes ?? "",
        product: it.product ?? (it.productId ? { _id: it.productId, name: it.productName, price: it.price } : undefined),
        productName: it.productName ?? it.product?.name ?? (it.name ?? "Product"),
        price: it.product?.price ?? it.price ?? 0,
      }))
    : [];

  return {
    _id: raw._id ?? raw.id ?? raw.orderId ?? null,
    items,
    totalPrice: safeToNum(raw.totalPrice ?? raw.total ?? raw.amount ?? 0),
    tableNumber: raw.tableNumber ?? raw.table ?? raw.tableNo ?? raw.table_name ?? "-",
    orderStatus: (raw.orderStatus ?? raw.status ?? "").toString(),
    orderType: raw.orderType ?? raw.type ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? raw.created ?? null,
    payment: raw.payment ?? raw.paymentDetails ?? raw.paymentStatus ?? null,
    paymentDetails: raw.paymentDetails ?? raw.payment_info ?? null,
    __raw: raw,
  };
}

function normalizeStats(raw) {
  if (!raw) return null;
  const payload = raw.data ?? raw;
  const totalRevenue = payload.totalRevenue ?? payload.revenue ?? payload.total ?? 0;
  const totalOrders = payload.totalOrders ?? payload.totalOrder ?? payload.totalCompletedOrders ?? payload.count ?? 0;

  let byStatus = [];
  if (Array.isArray(payload.byStatus)) {
    byStatus = payload.byStatus.map((b) => ({ _id: b._id ?? b.status ?? b.name, count: b.count ?? b.total ?? 0 }));
  } else if (payload.byStatus && typeof payload.byStatus === "object") {
    byStatus = Object.keys(payload.byStatus).map((k) => ({ _id: k, count: payload.byStatus[k] || 0 }));
  }

  return { totalRevenue: safeToNum(totalRevenue), totalOrders: safeToNum(totalOrders), byStatus, topProducts: payload.topProducts ?? [] };
}

/** --- Hook --- */
export default function useOrderAdmin(initialFilters = {}) {
  const [allOrders, setAllOrders] = useState([]); // ALL orders returned by API (unfiltered)
  const [orders, setOrders] = useState([]); // visible orders after client filter
  const [stats, setStats] = useState(null); // server stats or merged
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    orderStatus: "",
    orderType: "",
    startDate: "",
    endDate: "",
    totalPages: 1,
    ...initialFilters,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);

  // Fetch orders from server (params come from customFilters or current filters)
  const fetchOrders = useCallback(
    async (customFilters = null) => {
      setLoadingOrders(true);
      setError(null);
      try {
        const params = customFilters ?? {
          page: filters.page,
          limit: filters.limit,
          orderStatus: filters.orderStatus || undefined,
          orderType: filters.orderType || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        };

        const res = await getAllOrdersAdmin(params);
        // server returns { success, message, count, data: [...] }
        const payload = res?.data?.data ?? res?.data ?? res ?? {};
        let rawArray = [];
        if (Array.isArray(payload)) rawArray = payload;
        else if (Array.isArray(res?.data?.data)) rawArray = res.data.data;
        else if (Array.isArray(res?.data)) rawArray = res.data;
        else if (Array.isArray(payload.data)) rawArray = payload.data;
        else if (Array.isArray(payload.orders)) rawArray = payload.orders;
        else rawArray = [];

        // normalize all orders
        const normalizedAll = rawArray.map(normalizeOrder);

        // store ALL orders (for stats computation)
        setAllOrders(normalizedAll);

        // apply client-side filters to get visible orders
        const effStatus = (customFilters?.orderStatus ?? filters.orderStatus ?? "")?.toString()?.toLowerCase?.();
        const effStart = (customFilters?.startDate ?? filters.startDate) || "";
        const effEnd = (customFilters?.endDate ?? filters.endDate) || "";

        let visible = normalizedAll.slice();

        if (effStatus) {
          visible = visible.filter((o) => (o.orderStatus ?? "").toString().toLowerCase() === effStatus);
        }
        if (effStart) {
          visible = visible.filter((o) => {
            const k = toLocalDateKey(o.createdAt);
            return k && k >= effStart;
          });
        }
        if (effEnd) {
          visible = visible.filter((o) => {
            const k = toLocalDateKey(o.createdAt);
            return k && k <= effEnd;
          });
        }

        setOrders(visible);

        // update pagination if server gave it
        setFilters((prev) => ({
          ...prev,
          totalPages: payload.totalPages ?? payload.total_pages ?? payload.totalPagesCount ?? prev.totalPages,
          page: payload.page ?? payload.currentPage ?? prev.page,
          limit: payload.limit ?? prev.limit,
        }));
      } catch (err) {
        console.error("useOrderAdmin.fetchOrders error:", err);
        setError(err);
        setAllOrders([]);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    },
    // include filters in dep so we capture latest filters when no customFilters passed
    [filters.page, filters.limit, filters.orderStatus, filters.orderType, filters.startDate, filters.endDate]
  );

  // Fetch server stats (if available)
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setError(null);
    try {
      const res = await getOrderStatsAdmin();
      const payload = res?.data ?? res ?? null;
      const normalized = normalizeStats(payload);
      setStats(normalized);
    } catch (err) {
      console.error("useOrderAdmin.fetchStats error:", err);
      setStats(null);
      setError(err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Open order detail
  const openOrderDetail = useCallback(async (id) => {
    try {
      const res = await getOrderByIdAdmin(id);
      const payload = res?.data?.data ?? res?.data ?? res ?? null;
      setSelectedOrder(normalizeOrder(payload));
    } catch (err) {
      console.error("useOrderAdmin.openOrderDetail error:", err);
      setError(err);
    }
  }, []);

  const closeOrderDetail = useCallback(() => setSelectedOrder(null), []);

  // Auto fetch orders when filter keys change
  useEffect(() => {
    const params = {
      page: filters.page,
      limit: filters.limit,
    };
    if (filters.orderStatus) params.orderStatus = filters.orderStatus;
    if (filters.orderType) params.orderType = filters.orderType;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    fetchOrders(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.orderStatus, filters.orderType, filters.startDate, filters.endDate]);

  // initial stats
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /** Derived stats computed from ALL orders (not only visible) */
  const derivedStats = useMemo(() => {
    const all = allOrders || [];

    // totalRevenue: sum(totalPrice OR payment.amount) for orders with payment.status === 'paid'
    const totalRevenue = all.reduce((acc, o) => {
      const payStatus = (o.payment?.status ?? o.paymentDetails?.status ?? "").toString().toLowerCase();
      if (payStatus === "paid") {
        // prefer payment.amount if provided
        const payAmount = safeToNum(o.payment?.amount ?? o.paymentDetails?.amount);
        const amount = payAmount > 0 ? payAmount : safeToNum(o.totalPrice);
        return acc + amount;
      }
      return acc;
    }, 0);

    // totalOrders: count of orders with createdAt == today (local)
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayKey = `${y}-${m}-${d}`;

    const totalOrdersToday = all.reduce((acc, o) => {
      const k = toLocalDateKey(o.createdAt);
      return acc + (k === todayKey ? 1 : 0);
    }, 0);

    // delivered count
    const deliveredCount = all.reduce((acc, o) => {
      const st = (o.orderStatus ?? "").toString().toLowerCase();
      return acc + (st === "confirmed" ? 1 : 0);
    }, 0);

    return { totalRevenue, totalOrdersToday, deliveredCount };
  }, [allOrders]);

  // Merge server stats (if present) with derived stats; prefer server for fields that exist,
  // but for the specific definitions you requested we prefer derived values where appropriate:
  const effectiveStats = useMemo(() => {
    // use server stats if present, but replace/ensure:
    // - totalRevenue should reflect sum of paid payments -> use derivedStats.totalRevenue
    // - totalOrders should be today's orders -> use derivedStats.totalOrdersToday
    // - delivered count should be count of delivered orders -> use derivedStats.deliveredCount
    const server = stats ?? {};
    return {
      totalRevenue: derivedStats.totalRevenue,
      totalOrders: derivedStats.totalOrdersToday,
      byStatus: server.byStatus && server.byStatus.length > 0 ? server.byStatus : [{ _id: "confirmed", count: derivedStats.deliveredCount }],
      topProducts: server.topProducts ?? [],
    };
  }, [stats, derivedStats]);

  // Top products (from ALL orders) based on current filters (date range + status)
  const topProducts = useMemo(() => {
    const all = allOrders || [];

    // determine date window
    let startKey;
    let endKey;

    if (filters.startDate || filters.endDate) {
      // if provided and in YYYY-MM-DD, use directly; else convert to yyyy-mm-dd
      startKey = filters.startDate
        ? (filters.startDate.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(filters.startDate)
            ? filters.startDate
            : toLocalDateKey(filters.startDate))
        : null;
      endKey = filters.endDate
        ? (filters.endDate.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(filters.endDate)
            ? filters.endDate
            : toLocalDateKey(filters.endDate))
        : null;
    } else {
      // DEFAULT: today only (local)
      const t = new Date();
      const y = t.getFullYear();
      const m = String(t.getMonth() + 1).padStart(2, "0");
      const d = String(t.getDate()).padStart(2, "0");
      startKey = `${y}-${m}-${d}`;
      endKey = startKey;
    }

    const effStatus = (filters.orderStatus ?? "")?.toString()?.toLowerCase() ?? "";

    const map = new Map();

    all.forEach((o) => {
      const k = toLocalDateKey(o.createdAt);
      if (!k) return;
      if (startKey && k < startKey) return;
      if (endKey && k > endKey) return;

      if (effStatus && effStatus !== "") {
        if ((o.orderStatus ?? "").toString().toLowerCase() !== effStatus) return;
      }

      (o.items || []).forEach((it) => {
        const pid = it.product?._id ?? it.productId ?? it.productName ?? `unknown:${it.productName ?? ""}`;
        const pname = it.product?.name ?? it.productName ?? "Product";
        const qty = safeToNum(it.quantity);
        const price = safeToNum(it.price);
        if (!map.has(pid)) map.set(pid, { productId: pid, productName: pname, totalQuantity: 0, totalRevenue: 0 });
        const cur = map.get(pid);
        cur.totalQuantity += qty;
        cur.totalRevenue += qty * price;
        map.set(pid, cur);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);
  }, [allOrders, filters.startDate, filters.endDate, filters.orderStatus]);

  // export these in return


  return {
    orders, // visible (filtered)
    stats: effectiveStats,
    loadingOrders,
    loadingStats,
    filters,
    setFilters,
    fetchOrders,
    fetchStats,
    selectedOrder,
    openOrderDetail,
    closeOrderDetail,
    error,
    topProducts,           // default (weekly unless server provided)

  };
}

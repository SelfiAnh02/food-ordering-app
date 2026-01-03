// src/hooks/staff/useOrderStaff.js
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getOrders,
  getOrderById,
  // getOrderStats, // Uncomment if you have stats endpoint for staff
} from "../../services/staff/orderService";

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
        product:
          it.product ??
          (it.productId
            ? { _id: it.productId, name: it.productName, price: it.price }
            : undefined),
        productName: it.productName ?? it.product?.name ?? it.name ?? "Product",
        price: it.product?.price ?? it.price ?? 0,
      }))
    : [];

  return {
    _id: raw._id ?? raw.id ?? raw.orderId ?? null,
    items,
    totalPrice: safeToNum(raw.totalPrice ?? raw.total ?? raw.amount ?? 0),
    tableNumber:
      raw.tableNumber ?? raw.table ?? raw.tableNo ?? raw.table_name ?? "-",
    orderStatus: (raw.orderStatus ?? raw.status ?? "").toString(),
    orderType: raw.orderType ?? raw.type ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? raw.created ?? null,
    payment: raw.payment ?? raw.paymentDetails ?? raw.paymentStatus ?? null,
    paymentDetails: raw.paymentDetails ?? raw.payment_info ?? null,
    __raw: raw,
  };
}

export default function useOrderStaff(initialFilters = {}) {
  const [allOrders, setAllOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
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

  // Fetch orders from server
  // Helper: convert params object to query string
  function toQueryString(params) {
    const esc = encodeURIComponent;
    return (
      "?" +
      Object.keys(params)
        .filter((k) => params[k] !== undefined && params[k] !== "")
        .map((k) => `${esc(k)}=${esc(params[k])}`)
        .join("&")
    );
  }

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
        const query = toQueryString(params);
        const res = await getOrders(query);
        const payload = res?.data?.data ?? res?.data ?? res ?? {};
        let rawArray = [];
        if (Array.isArray(payload)) rawArray = payload;
        else if (Array.isArray(res?.data?.data)) rawArray = res.data.data;
        else if (Array.isArray(res?.data)) rawArray = res.data;
        else if (Array.isArray(payload.data)) rawArray = payload.data;
        else if (Array.isArray(payload.orders)) rawArray = payload.orders;
        else rawArray = [];
        const normalizedAll = rawArray.map(normalizeOrder);
        setAllOrders(normalizedAll);
        // Client-side filters
        const effStatus = (
          customFilters?.orderStatus ??
          filters.orderStatus ??
          ""
        )
          ?.toString()
          ?.toLowerCase?.();
        const effStart = (customFilters?.startDate ?? filters.startDate) || "";
        const effEnd = (customFilters?.endDate ?? filters.endDate) || "";
        let visible = normalizedAll.slice();
        if (effStatus) {
          visible = visible.filter(
            (o) => (o.orderStatus ?? "").toString().toLowerCase() === effStatus
          );
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
        setFilters((prev) => ({
          ...prev,
          totalPages:
            payload.totalPages ??
            payload.total_pages ??
            payload.totalPagesCount ??
            prev.totalPages,
          page: payload.page ?? payload.currentPage ?? prev.page,
          limit: payload.limit ?? prev.limit,
        }));
      } catch (err) {
        console.error("useOrderStaff.fetchOrders error:", err);
        setError(err);
        setAllOrders([]);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    },
    [
      filters.page,
      filters.limit,
      filters.orderStatus,
      filters.orderType,
      filters.startDate,
      filters.endDate,
    ]
  );

  // Open order detail
  const openOrderDetail = useCallback(async (id) => {
    try {
      const res = await getOrderById(id);
      const payload = res?.data?.data ?? res?.data ?? res ?? null;
      setSelectedOrder(normalizeOrder(payload));
    } catch (err) {
      console.error("useOrderStaff.openOrderDetail error:", err);
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
  }, [
    filters.page,
    filters.limit,
    filters.orderStatus,
    filters.orderType,
    filters.startDate,
    filters.endDate,
  ]);

  // Top products (from ALL orders) based on current filters (date range + status)
  const topProducts = useMemo(() => {
    const all = allOrders || [];
    let startKey;
    let endKey;
    if (filters.startDate || filters.endDate) {
      startKey = filters.startDate
        ? filters.startDate.length === 10 &&
          /^\d{4}-\d{2}-\d{2}$/.test(filters.startDate)
          ? filters.startDate
          : toLocalDateKey(filters.startDate)
        : null;
      endKey = filters.endDate
        ? filters.endDate.length === 10 &&
          /^\d{4}-\d{2}-\d{2}$/.test(filters.endDate)
          ? filters.endDate
          : toLocalDateKey(filters.endDate)
        : null;
    } else {
      const t = new Date();
      const y = t.getFullYear();
      const m = String(t.getMonth() + 1).padStart(2, "0");
      const d = String(t.getDate()).padStart(2, "0");
      startKey = `${y}-${m}-${d}`;
      endKey = startKey;
    }
    const effStatus =
      (filters.orderStatus ?? "")?.toString()?.toLowerCase() ?? "";
    const map = new Map();
    all.forEach((o) => {
      const k = toLocalDateKey(o.createdAt);
      if (!k) return;
      if (startKey && k < startKey) return;
      if (endKey && k > endKey) return;
      if (effStatus && effStatus !== "") {
        if ((o.orderStatus ?? "").toString().toLowerCase() !== effStatus)
          return;
      }
      (o.items || []).forEach((it) => {
        const pid =
          it.product?._id ??
          it.productId ??
          it.productName ??
          `unknown:${it.productName ?? ""}`;
        const pname = it.product?.name ?? it.productName ?? "Product";
        const qty = safeToNum(it.quantity);
        const price = safeToNum(it.price);
        if (!map.has(pid))
          map.set(pid, {
            productId: pid,
            productName: pname,
            totalQuantity: 0,
            totalRevenue: 0,
          });
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

  return {
    orders,
    loadingOrders,
    filters,
    setFilters,
    fetchOrders,
    selectedOrder,
    openOrderDetail,
    closeOrderDetail,
    error,
    topProducts,
  };
}

import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export default function RequireValidTable({ children }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search || "");
  const tableFromUrl = params.get("table") || params.get("tableNumber") || "";
  const rawSearch = (location.search || "").toLowerCase();
  const isTableParamPresent =
    !!tableFromUrl ||
    /[?&](tablenumber|table)\b/i.test(location.search || "") ||
    rawSearch.includes("tablenumber") ||
    rawSearch.includes("&table=") ||
    rawSearch.includes("?table=");

  const allowedTables = useMemo(() => {
    return new Set(Array.from({ length: 15 }, (_, i) => String(i + 1)));
  }, []);

  const isValidTable = useMemo(() => {
    return allowedTables.has(String(tableFromUrl));
  }, [tableFromUrl, allowedTables]);

  const shouldBlock = !isTableParamPresent || !isValidTable;

  if (shouldBlock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">
          Silakan akses via QR di meja.
        </div>
      </div>
    );
  }

  return children;
}

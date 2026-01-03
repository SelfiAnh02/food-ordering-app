import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import logo from "../../assets/logo.png"; // pastikan path benar
import NavbarCustomer from "../../components/customer/NavbarCustomer";
import BottomNavbar from "../../components/customer/BottomNavbar";
import useCartCustomer from "../../hooks/customer/useCartCustomer";

export default function CustomersLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getOrderMeta, setOrderMeta } = useCartCustomer();

  const active = location.pathname.includes("/customer/cart")
    ? "cart"
    : location.pathname.includes("/customer/orders")
    ? "orders"
    : "home";
  const cartCount = items.reduce((acc, i) => acc + (i.qty || 0), 0);

  // Resolve table number: prefer URL (?tableNumber= or ?table=), fallback to meta storage
  const params = new URLSearchParams(location.search || "");
  const tableFromUrl = params.get("table") || params.get("tableNumber") || "";
  const rawSearch = (location.search || "").toLowerCase();
  const tableKeyPresent =
    /[?&](tablenumber|table)\b/i.test(location.search || "") ||
    rawSearch.includes("tablenumber") ||
    rawSearch.includes("&table=") ||
    rawSearch.includes("?table=");
  const tableFromMeta =
    typeof getOrderMeta === "function" ? getOrderMeta()?.tableNumber : "";

  // Build whitelist 1..15
  const allowedTables = useMemo(() => {
    const set = new Set(Array.from({ length: 15 }, (_, i) => String(i + 1)));
    return set;
  }, []);

  const isTableParamPresent = !!tableFromUrl || tableKeyPresent;
  const isValidTable = useMemo(() => {
    if (!isTableParamPresent) return true; // no param -> allow generic access
    return allowedTables.has(String(tableFromUrl));
  }, [isTableParamPresent, tableFromUrl, allowedTables]);

  // decide number to show:
  // - If URL key present: show URL value when valid, otherwise '-'
  // - If no URL key: fallback to stored meta or '-'
  const tableToShow = String(
    isTableParamPresent
      ? isValidTable
        ? tableFromUrl || "-"
        : "-"
      : tableFromMeta || "-"
  );

  // If URL provides table number, persist it so other pages (Cart/MyOrder) can reuse
  useEffect(() => {
    if (!tableFromUrl || typeof setOrderMeta !== "function") return;
    try {
      if (isValidTable) setOrderMeta({ tableNumber: tableFromUrl });
      else setOrderMeta({ tableNumber: "" });
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableFromUrl, isValidTable]);

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      <NavbarCustomer
        logo={logo}
        brandLine1="Sa'jane"
        brandLine2="Tea & Coffee Bar"
        tableNumber={tableToShow}
        onLogoClick={() =>
          navigate(`/customer${isTableParamPresent ? location.search : ""}`)
        }
      />

      {/* Layout hanya menyimpan Outlet; header dan footer fixed di luar */}

      {/* Content area fills remaining height; padding accounts for fixed header & bottom navbar */}
      <main className="flex-1 max-w-5xl mx-auto px-2 pt-28 pb-24 overflow-hidden">
        {isTableParamPresent && !isValidTable ? (
          <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">
            Nomor meja tidak valid. Silakan scan QR resmi di meja.
          </div>
        ) : children ? (
          children
        ) : (
          <Outlet />
        )}
      </main>

      <BottomNavbar
        className="min-h-screen"
        active={active}
        cartCount={cartCount}
        onHome={() =>
          navigate(`/customer${isTableParamPresent ? location.search : ""}`)
        }
        onCart={() =>
          navigate(
            `/customer/cart${isTableParamPresent ? location.search : ""}`
          )
        }
        onOrders={() =>
          navigate(
            `/customer/orders${isTableParamPresent ? location.search : ""}`
          )
        }
      />
    </div>
  );
}

// src/components/Navbar.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Menu, Search, UserRound } from "lucide-react";

/**
 * Props:
 *  - onToggleSidebar
 *  - onLogout (optional) -> function provided by parent to handle logout
 */
export default function Navbar({ onToggleSidebar, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const brandText = "text-[#7a4528]"; // coklat

  const pageTitle = useMemo(() => {
    const map = {
      "/admin": "Dashboard",
      "/admin/products": "Products",
      "/admin/categories": "Categories",
      "/admin/users": "Users",
      "/admin/orders": "All Orders",
      "/admin/reports": "Reports",
      "/admin/table-numbers": "Table Numbers",
    };
    const path = location.pathname.replace(/\/+$/, "");
    const titleBase =
      map[path] ??
      (() => {
        const seg = path.split("/").filter(Boolean).pop() || "Dashboard";
        return seg
          .split("-")
          .map((s) => (s[0] ? s[0].toUpperCase() + s.slice(1) : s))
          .join(" ");
      })();
    return `${titleBase} - Admin`;
  }, [location.pathname]);

  // centralized handler: prefer parent's onLogout if provided; otherwise fallback
  const handleLogout = () => {
    if (typeof onLogout === "function") {
      try {
        onLogout();
      } catch (e) {
        // if parent's handler throws, still do fallback cleanup
        console.error("onLogout error:", e);
        try {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          localStorage.removeItem("user");
        } catch (err) {
          console.error("Error clearing storage:", err);
        }
        navigate("/login");
      }
      return;
    }

    // fallback: clear local/session storage and navigate to login
    try {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {
      console.error("Error clearing storage:", e);
    }
    navigate("/login");
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 lg:px-10 bg-white border-b border-amber-100 z-40">
      {/* left: toggle + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 rounded-md hover:bg-amber-50 md:hidden"
        >
          <Menu className="w-5 h-5 text-[#7a4528]" />
        </button>

        <div className="flex flex-col">
          <div className={`text-base md:text-lg font-semibold ${brandText} truncate`}>
            {pageTitle}
          </div>
        </div>
      </div>

      {/* right: search, logout, profile icon */}
      <div className="flex items-center gap-3">
        {/* search (hidden on xs) */}
        <div className="hidden sm:flex items-center border rounded-full px-3 py-1 text-sm text-gray-600 bg-[#ffffff] border-[#FF8A00]">
          <Search size={18} className="text-[#FF8A00] opacity-80" />
          <input
            className="bg-transparent outline-none w-23 sm:w-40 md:w-46 text-sm placeholder-gray-400 ml-2"
            placeholder="Search..."
            aria-label="Search"
          />
        </div>

        {/* logout (hidden on xs) */}
        <button
          onClick={handleLogout}
          className="hidden sm:inline-block text-sm px-3 py-1 rounded-md border border-[#FF8A00] hover:bg-[#FF8A0033] text-[#FF8A00] font-medium"
          title="Logout"
        >
          Logout
        </button>

        {/* profile icon only */}
        <button
          onClick={() => {
            /* optional dropdown */
          }}
          className="p-2 rounded-full bg-[#7a4528] text-white hover:bg-[#FF8A00] transition-colors"
          title="Profile"
        >
          <UserRound size={18} />
        </button>

        {/* small logout icon for xs */}
        <button
          onClick={handleLogout}
          className="sm:hidden ml-1 p-2 rounded-md hover:bg-amber-50"
          title="Logout"
        >
          <svg className="w-5 h-5 text-[#FF8A00]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 8v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}

import { Menu, Search, UserRound } from "lucide-react";

/**
 * Props:
 *  - onToggleSidebar
 *  - onLogout (optional) -> function provided by parent to handle logout
 */
import { useEffect, useRef, useState } from "react";

export default function Navbar({
  onToggleSidebar,
  onLogout,
  pageTitle,
  currentPanel,
}) {
  const brandText = "text-[#7a4528]"; // coklat

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // try to detect whether user is in staff or admin panel from pageTitle
  const title = (pageTitle || "").toString().toLowerCase();
  // Prefer explicit `currentPanel` prop if provided; fallback to title heuristics
  const panel = currentPanel
    ? String(currentPanel).toLowerCase()
    : /staff|cashier|kasir|orders - staff/.test(title)
    ? "staff"
    : "admin";
  const isStaff = panel === "staff";

  useEffect(() => {
    function onDocClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function handleSwitch() {
    setProfileOpen(false);
    // redirect to the appropriate login page
    const origin = window.location?.origin || "";
    if (isStaff) {
      // currently in staff panel -> go to admin login page (app's admin login path is `/login`)
      window.location.href = `${origin}/login`;
    } else {
      // currently in admin (or unknown) -> go to staff login page
      window.location.href = `${origin}/staff/login`;
    }
  }

  return (
    // header styling only; position handled by layout
    <header className="h-16 flex items-center justify-between px-4 md:px-6 lg:px-10 bg-white border-b border-amber-100 max-w-full">
      {" "}
      {/* left: toggle + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md text-amber-800 hover:bg-amber-100"
        >
          <Menu size={22} />
        </button>

        <div className="flex flex-col">
          <div
            className={`text-base md:text-lg font-semibold ${brandText} truncate`}
          >
            {pageTitle}
          </div>
        </div>
      </div>
      {/* right: search, logout, profile icon */}
      <div className="flex items-center gap-3">
        {/* logout (hidden on xs) */}
        <button
          onClick={onLogout}
          className="hidden sm:inline-block text-sm px-3 py-1 rounded-md border border-amber-600 hover:bg-amber-50 text-amber-600 font-medium"
          title="Logout"
        >
          Logout
        </button>

        {/* profile icon with dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((s) => !s)}
            className="p-2 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            title="Profile"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <UserRound size={18} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-35">
              <div className="p-2">
                <button
                  onClick={handleSwitch}
                  className="w-full text-left px-3 py-1 border rounded-md hover:bg-amber-700 bg-amber-600 text-white text-sm font-medium"
                >
                  {isStaff ? "Switch to Admin" : "Switch to Staff"}
                </button> 
              </div>
            </div>
          )}
        </div>

        {/* small logout icon for xs */}
        <button
          onClick={onLogout}
          className="sm:hidden ml-1 p-2 rounded-md hover:bg-amber-50"
          title="Logout"
        >
          <svg
            className="w-5 h-5 text-[#FF8A00]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M17 16l4-4m0 0l-4-4m4 4H7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 8v8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

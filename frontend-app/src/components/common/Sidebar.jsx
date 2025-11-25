import { NavLink } from "react-router-dom";

import logo from "../../assets/logo.png"; // pastikan path benar

export default function Sidebar({ menu }) {
  const brandText = "text-[#7a4528]"; // coklat
  const accent = "#FF8A00";

  const navItemBase =
    "flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-150 text-sm";

  return (
    // Desktop sidebar: fixed and full height; hidden on small screens (mobile overlay used)
    <aside className="fixed top-0 left-0 h-screen w-60 bg-white border-r border-amber-100 z-40 flex flex-col">
      {/* Top: Logo + Brand */}
      <div className="px-6 py-5 border-b border-amber-100 flex items-center gap-4 bg-gradient-to-r from-[#fff7ef] to-white">
        <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center">
          <img
            src={logo}
            alt="Logo Toko"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col leading-tight">
          <h1 className={`text-lg font-bold ${brandText} tracking-tight`}>
            Saja'ne
          </h1>
          <span className="text-sm text-gray-600">Tea & Coffee Bar</span>
          <span
            className="text-xs mt-0.5 font-medium"
            style={{ color: accent }}
          >
            Admin Panel
          </span>
        </div>
      </div>

      {/* Nav: scrollable area. flex-1 ensures it expands and footer stays below */}
      <nav className="p-4 flex-1 overflow-auto space-y-1">
        {menu.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? "bg-amber-50 text-amber-800 font-semibold ring-1 ring-amber-100"
                  : "text-gray-700 hover:bg-amber-50 hover:text-[#7a4528]"
              }`
            }
          >
            <span className="opacity-90">{m.icon}</span>
            <span>{m.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer tetap di bawah */}
      <div className="mt-auto px-4 py-3 border-t border-amber-50 text-xs text-gray-500">
        <div>Version 1.0</div>
      </div>
    </aside>
  );
}

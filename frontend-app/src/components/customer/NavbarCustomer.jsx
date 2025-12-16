import { MapPin } from "lucide-react";

export default function NavbarCustomer({
  logo,
  brandLine1 = "Sa'jane",
  brandLine2 = "Tea & Coffee Bar",
  tableNumber = "3",
  showHome = true,
  onLogoClick,
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent px-0 pt-0 pb-0">
      <div className="max-w-4xl mx-auto">
        <div
          className="relative bg-white border-b border-amber-400 shadow-md p-5 flex items-center gap-5 overflow-hidden rounded-b-2xl"
          style={{ minHeight: 110 }}
        >
          {/* HOME label placed inside card so header is flush to top */}
          {showHome && (
            <div className="absolute left-4 top-3 text-xs text-gray-500">
              HOME
            </div>
          )}
          <button
            type="button"
            onClick={onLogoClick}
            className="flex-shrink-0 rounded-full p-2 bg-white hover:opacity-95"
            aria-label="Logo"
          >
            <img src={logo} alt="logo" className="w-20 h-20 object-contain" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="text-3xl md:text-4xl leading-tight font-semibold text-[#7a4528] truncate">
              {brandLine1}
            </div>
            <div className="text-base md:text-lg text-amber-600 font-semibold mt-1">
              {brandLine2}
            </div>
          </div>

          <div className="absolute right-4 top-4">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-md px-3 py-2 shadow-sm">
              <MapPin size={18} className="text-amber-700" />
              <div className="text-sm leading-none">
                <div className="text-xs text-gray-500">Meja</div>
                <div className="font-medium">No. {tableNumber}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

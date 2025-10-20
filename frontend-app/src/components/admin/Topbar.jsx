import React from "react";
import logo from "../../assets/logo.png";
import { Search, UserCircle2 } from "lucide-react"; // ikon lucide-react

const Topbar = () => {
  return (
    <header className="w-full bg-[#b5adaa] flex items-center justify-between px-6 py-3 shadow-md rounded-b-[18px]">
      {/* Kiri: Logo dan Nama */}
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="Sa'jane Logo"
          className="w-20 h-20 object-contain rounded-full"
        />
        <div>
          <h1 className="text-lg font-semibold text-[#2b2b2b] leading-none">
            Sa’jane
          </h1>
          <p className="text-sm text-gray-700 -mt-1">Tea & Coffee Bar</p>
        </div>
      </div>

      {/* Tengah: Search bar */}
      <div className="flex items-center bg-white rounded-full px-3 py-1 w-[250px] border border-gray-300">
        <input
          type="text"
          placeholder="search"
          className="flex-1 outline-none text-sm text-gray-700"
        />
        <Search size={18} className="text-gray-500" />
      </div>

      {/* Kanan: Ikon profil */}
      <div className="flex items-center justify-center bg-white rounded-full w-10 h-10 border border-gray-300">
        <UserCircle2 size={22} className="text-gray-600" />
      </div>
    </header>
  );
};

export default Topbar;

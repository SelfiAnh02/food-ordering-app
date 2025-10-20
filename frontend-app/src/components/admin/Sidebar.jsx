import React from "react";
import { Link } from "react-router-dom";

const menu = [
  { name: "Dashboard", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Category Products", path: "/categories" },
  { name: "Users", path: "/users" },
  { name: "All Orders", path: "/orders" },
  { name: "Sales Report", path: "/sales-report" },
  { name: "Table Numbers", path: "/tables" },
];

const Sidebar = () => {
  return (
    <div className="panel p-4 rounded-xl">
      {menu.map((item, idx) => (
        <Link
          key={item.name}
          to={item.path}
          className={`block w-full text-left px-3 py-2 mb-3 rounded-md border border-[rgba(0,0,0,0.12)] 
                      text-sm bg-white hover:bg-gray-50 transition 
                      ${idx === 0 ? "bg-gray-100" : ""}`}
        >
          {item.name}
        </Link>
      ))}

      <div className="mt-4 h-[220px] border border-[rgba(0,0,0,0.04)] rounded-lg" />
    </div>
  );
};

export default Sidebar;

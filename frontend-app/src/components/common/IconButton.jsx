// src/components/admin/IconButton.jsx

export default function IconButton({ title, onClick, children, className = "" }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`px-2 py-1 border rounded-md hover:shadow-sm ${className}`}
    >
      {children}
    </button>
  );
}

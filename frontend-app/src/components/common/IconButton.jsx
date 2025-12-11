// src/components/admin/IconButton.jsx

export default function IconButton({
  title,
  onClick,
  children,
  className = "",
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`text-amber-800 px-2 py-1 border border-amber-400 rounded-lg hover:shadow-sm ${className}`}
    >
      {children}
    </button>
  );
}

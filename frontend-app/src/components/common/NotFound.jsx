import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-800">
      <AlertTriangle className="text-red-500 w-16 h-16 mb-4" />
      <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Halaman yang kamu cari tidak ditemukan atau belum tersedia.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
};

export default NotFound;

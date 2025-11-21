import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../api/axios";

export default function RequireStaff() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.get("/staff/me", { withCredentials: true });
        if (res?.data?.success && res.data.user?.role === "staff") {
          setAuthed(true);
        }
      } finally {
        setChecking(false);
      }
    };

    check();
  }, []); // ← hanya sekali

  if (checking) return <div>Loading...</div>;
  if (!authed) return <Navigate to="/staff/login" replace />;

  return <Outlet />;
}

import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../api/axios";

export default function RequireStaff({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await api.get("/staff/me", { withCredentials: true });
        if (!mounted) return;
        if (res?.data?.success && res.data.user?.role === "staff") {
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      } catch (err) {
        setAuthed(err?.response?.data?.success || false);
      } finally {
        if (mounted) setChecking(false);
      }
    };
    check();
    return () => (mounted = false);
  }, []);

  if (checking) return <div>Loading...</div>;
  if (!authed) return <Navigate to="/staff/login" replace />;

  if (children) return children;
  return <Outlet />;
}

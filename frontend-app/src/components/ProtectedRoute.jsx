import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getUser, fetchCurrentUser } from "../services/authService";

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setChecking(true);

      // optimistic: cek local dulu
      const local = getUser();
      if (local && (!role || local.role === role)) {
        if (mounted) setAuthorized(true);
      } else {
        if (mounted) setAuthorized(false);
      }

      // always verify with server
      const serverUser = await fetchCurrentUser();
      if (!mounted) return;
      if (serverUser && (!role || serverUser.role === role)) setAuthorized(true);
      else setAuthorized(false);

      setChecking(false);
    })();

    return () => { mounted = false; };
  }, [role]);

  if (checking) return <div className="min-h-screen flex items-center justify-center">Memeriksa autentikasi...</div>;
  if (!authorized) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

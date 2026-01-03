import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../../services/admin/authService";

export default function ProtectedAdmin({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getMe();
        if (active && res?.data?.success) {
          document.title = "Sajane Admin Panel";
          setStatus("ok");
        } else if (active) {
          setStatus("fail");
        }
      } catch (err) {
        if (active) setStatus("fail");
        return err;
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "ok") return children;
  return <Navigate to="/login" replace />;
}

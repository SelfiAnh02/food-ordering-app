import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe as getMeStaff } from "../../services/staff/authService";

export default function ProtectedStaff({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getMeStaff();
        if (active && res?.data?.success) {
          document.title = "Sajane Cashier";
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
  return <Navigate to="/staff/login" replace />;
}

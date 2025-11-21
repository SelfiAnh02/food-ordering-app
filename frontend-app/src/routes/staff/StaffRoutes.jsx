// src/routes/staff/StaffRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Login from "../../pages/Login";
import RequireStaff from "../../utils/RequireStaff";
import StaffMainLayout from "../../layouts/staff/StaffMainLayout";
import Dashboard from "../../pages/staff/Dashboard";

export default function StaffRoutes() {
  return (
    <Routes>
      {/* /staff/login */}
      <Route path="login" element={<Login mode="staff" />} />

      {/* PROTECTED ROUTES */}
      <Route
        element={
          <RequireStaff>
            <StaffMainLayout />
          </RequireStaff>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

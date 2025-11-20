// src/routes/staff/StaffRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Login from "../../pages/Login";
import RequireStaff from "../../utils/RequireStaff"; // lihat bagian 3
import StaffMainLayout from "../../layouts/staff/StaffMainLayout";

// import halaman staffmu bila perlu

export default function StaffRoutes() {
  return (
    <Routes>
      <Route path="/staff/login" element={<Login mode="staff" />} />

      <Route
        path="/staff/*"
        element={
          <RequireStaff>
            <StaffMainLayout />
          </RequireStaff>
        }
      >
        {/* nested staff routes di sini: contoh
        <Route path="dashboard" element={<StaffDashboardPage />} />
        */}
      </Route>
    </Routes>
  );
}

import {
  loginStaff,
  logoutStaff,
  getStaffMe,
} from "../../controllers/staff/authController.js";
import { authStaff } from "../../middleware/staff/auth.js";
import express from "express";

const router = express.Router();

router.post("/login", loginStaff);
router.post("/logout", logoutStaff);

router.get("/me", authStaff, getStaffMe); // ⬅ WAJIB

export default router;

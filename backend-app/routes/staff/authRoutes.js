import { loginStaff, logoutStaff } from "../../controllers/staff/authController.js";
import express from "express";

const router = express.Router();

// login staff
router.post("/login", loginStaff);
router.post("/logout", logoutStaff);

export default router;

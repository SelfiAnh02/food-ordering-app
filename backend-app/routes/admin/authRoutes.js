// routes/admin/authRoutes.js
import express from "express";
import { loginAdmin, logoutAdmin, meAdmin } from "../../controllers/admin/authController.js";
import { authAdmin } from "../../middleware/admin/auth.js";

const router = express.Router();

// login tidak perlu middleware
router.post("/login", loginAdmin);

// route di bawah ini perlu middleware (user harus sudah login & admin)
router.post("/logout", authAdmin, logoutAdmin);
router.get("/me", authAdmin, meAdmin);

export default router;

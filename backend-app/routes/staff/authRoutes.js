import { loginStaff } from "../../controllers/staff/authController.js";
import express from "express";

const router = express.Router();

// login staff
router.post("/login", loginStaff);

export default router;

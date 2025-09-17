import express from "express";
import { getCategories, getCategoryById } from "../../controllers/admin/categoryController.js";
import { authStaff } from "../../middleware/staff/auth.js";

const router = express.Router();

// hanya admin yang boleh manage kategori
router.get("/", authStaff, getCategories); // public, biar user bisa lihat kategori
router.get("/:id", authStaff, getCategoryById);

export default router;


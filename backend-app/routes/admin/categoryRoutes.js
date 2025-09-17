import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../../controllers/admin/categoryController.js";
import { authAdmin } from "../../middleware/admin/auth.js";
import { authStaff } from "../../middleware/staff/auth.js";

const router = express.Router();

// hanya admin yang boleh manage kategori
router.post("/create", authAdmin, createCategory);
router.get("/", authStaff, getCategories); // public, biar user bisa lihat kategori
router.get("/:id", authStaff, getCategoryById);
router.put("/:id", authAdmin, updateCategory);
router.delete("/:id", authAdmin, deleteCategory);

export default router;


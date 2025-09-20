import express from "express";
import { getCategories, getCategoryById } from "../../controllers/admin/categoryController.js";

const router = express.Router();

// hanya admin yang boleh manage kategori
router.get("/", getCategories); // public, biar user bisa lihat kategori
router.get("/:id", getCategoryById);

export default router;


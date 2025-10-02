import express from "express";
import { getCategories, getCategoryById } from "../../controllers/staff/categoryController.js";
import { authStaff } from "../../middleware/staff/auth.js";

const router = express.Router();

router.get("/", authStaff, getCategories);
router.get("/:id", authStaff, getCategoryById);

export default router;


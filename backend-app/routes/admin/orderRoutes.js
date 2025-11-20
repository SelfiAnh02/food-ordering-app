import express from "express";
import {
  getOrderStatsAdmin,
  getAllOrdersAdmin,
  getOrderByIdAdmin
} from "../../controllers/admin/orderController.js";

const router = express.Router();

// STATIC routes first
router.get("/stats", getOrderStatsAdmin);
router.get("/", getAllOrdersAdmin);

// DYNAMIC route last
router.get("/:id", getOrderByIdAdmin);

export default router;

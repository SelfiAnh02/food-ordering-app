import express from "express";
import {
  createOrderKasir,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../../controllers/staff/orderController.js";
import { authStaff } from "../../middleware/staff/auth.js";

const staffOrderRouter = express.Router();

staffOrderRouter.post("/create", authStaff, createOrderKasir);
staffOrderRouter.get("/", authStaff, getAllOrders);
staffOrderRouter.get("/:id", authStaff, getOrderById);
staffOrderRouter.put("/:id/status", authStaff, updateOrderStatus);

export default staffOrderRouter;

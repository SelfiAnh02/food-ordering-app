import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelUnpaidOrder,
} from "../../controllers/user/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/create", createOrder);
orderRouter.get("/", getMyOrders);
orderRouter.get("/:id", getOrderById);
orderRouter.delete("/:id/cancel", cancelUnpaidOrder);

export default orderRouter;

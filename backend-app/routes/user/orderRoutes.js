import express from "express";
import { createOrder, getMyOrders, getOrderById } from "../../controllers/user/orderController.js";


const orderRouter = express.Router();

orderRouter.post("/create", createOrder);
orderRouter.get("/", getMyOrders);
orderRouter.get("/:id", getOrderById);

export default orderRouter;
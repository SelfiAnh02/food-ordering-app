import express from "express";
import { placeOrder } from "../../controllers/admin/orderController.js";


const orderRouter = express.Router();
// routes order (user)
orderRouter.post("/place", placeOrder);



export default orderRouter;

import express from "express";
import { getProducts,getProductById } from "../../controllers/staff/productController.js";
import { authStaff } from "../../middleware/staff/auth.js";


const productRouter = express.Router();


productRouter.get("/", authStaff, getProducts);
productRouter.get("/:id", authStaff, getProductById);

export default productRouter;


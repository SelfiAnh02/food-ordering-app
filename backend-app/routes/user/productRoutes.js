import express from "express";
import { getProducts ,getProductById } from "../../controllers/user/productController.js";


const productRouter = express.Router();

// routes product(admin only)
productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);

export default productRouter;


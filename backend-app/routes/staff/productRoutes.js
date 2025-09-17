import express from "express";
import { listProducts,getProductsByCategory } from "../../controllers/admin/productController.js";
import { authStaff } from "../../middleware/staff/auth.js";


const productRouter = express.Router();

// routes product(admin only)
productRouter.get("/", authStaff, listProducts);
productRouter.get("/:categoryId", authStaff, getProductsByCategory);

export default productRouter;


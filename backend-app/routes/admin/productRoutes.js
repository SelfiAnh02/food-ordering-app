import express from "express";
import { createProduct, listProducts,getProductsByCategory, editProduct, deleteProduct } from "../../controllers/admin/productController.js";
import { authAdmin } from "../../middleware/admin/auth.js";
import { authStaff } from "../../middleware/staff/auth.js";


const productRouter = express.Router();

// routes product(admin only)
productRouter.post("/create", authAdmin, createProduct);
productRouter.get("/", authStaff, listProducts);
productRouter.get("/:categoryId", authStaff, getProductsByCategory);
productRouter.put("/:id", authAdmin, editProduct);
productRouter.delete("/:id", authAdmin, deleteProduct);



export default productRouter;


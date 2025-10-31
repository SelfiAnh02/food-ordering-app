import express from "express";
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../../controllers/admin/productController.js";
import { authAdmin } from "../../middleware/admin/auth.js";
import { authStaff } from "../../middleware/staff/auth.js";


const productRouter = express.Router();

// routes product(admin only)
// servis.js /api/admin/products/
productRouter.post("/create", authAdmin, createProduct);
productRouter.get("/", authStaff, getProducts);
productRouter.get("/:id", authStaff, getProductById);
productRouter.put("/update/:id", authAdmin, updateProduct);
productRouter.delete("/delete/:id", authAdmin, deleteProduct);



export default productRouter;


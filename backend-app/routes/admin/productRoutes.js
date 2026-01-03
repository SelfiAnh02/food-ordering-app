import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../controllers/admin/productController.js";
import { authAdmin } from "../../middleware/admin/auth.js";
import { authStaff } from "../../middleware/staff/auth.js";

const productRouter = express.Router();

// Note: file uploads removed. API accepts JSON with `imageUrl`.

// routes product (admin only for admin namespace)
// servis.js /api/admin/products/
productRouter.get("/", authAdmin, getProducts);
productRouter.get("/:id", authAdmin, getProductById);
productRouter.post("/create", authAdmin, createProduct);
productRouter.put("/update/:id", authAdmin, updateProduct);
productRouter.delete("/delete/:id", authAdmin, deleteProduct);

export default productRouter;

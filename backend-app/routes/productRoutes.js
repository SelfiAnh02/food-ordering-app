import express from "express";
import multer from "multer";
import { addProduct, listProducts, editProduct, removeProduct } from "../controllers/productController.js";

const productRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// routes product(admin only)
productRouter.post("/add", upload.single("image"), addProduct);
productRouter.get("/list", listProducts);
productRouter.post("/remove", removeProduct);
productRouter.post("/edit", upload.single("image"), editProduct);




export default productRouter;

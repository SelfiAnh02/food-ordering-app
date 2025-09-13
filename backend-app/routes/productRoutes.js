import express from "express";
import multer from "multer";
import { addProduct, listProducts, removeProduct, setProductStatus } from "../controllers/productController.js";

const productRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// routes product
productRouter.post("/add", upload.single("image"), addProduct);
productRouter.get("/list", listProducts);
productRouter.post("/remove", removeProduct);
productRouter.post("/status", setProductStatus);




export default productRouter;

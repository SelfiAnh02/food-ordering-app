import { loginAdmin } from "../../controllers/admin/authController.js";
import express from "express";

const router = express.Router();
    
// login admin
router.post("/login", loginAdmin);

export default router;

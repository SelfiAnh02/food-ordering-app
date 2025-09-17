import express from "express";
import { createStaff, deleteStaff } from "../../controllers/admin/userController.js";
import { authAdmin } from "../../middleware/admin/auth.js";


const userRouter = express.Router();

// Register Staff
userRouter.post("/create-staff", authAdmin, createStaff);  // hanya Admin yang bisa register Staff
userRouter.delete("/delete-staff/:id", authAdmin, deleteStaff); // hanya Admin yang bisa menghapus Staff


export default userRouter;
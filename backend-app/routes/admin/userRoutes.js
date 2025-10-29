import express from "express";
import { createStaff, deleteStaff, getAllUsers } from "../../controllers/admin/userController.js";
import { authAdmin } from "../../middleware/admin/auth.js";


const userRouter = express.Router();

userRouter.post("/create-staff", authAdmin, createStaff);  
userRouter.delete("/delete-staff/:id", authAdmin, deleteStaff); 
userRouter.get("/all-users", authAdmin, getAllUsers); 

export default userRouter;
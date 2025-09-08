// config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect("mongodb+srv://seanh-db-user:Seanh234*@cluster0.ysurnht.mongodb.net/food-ordering-app").then(()=>console.log("DB Connected"))
};

export default connectDB;

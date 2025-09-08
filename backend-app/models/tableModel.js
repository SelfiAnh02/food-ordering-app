import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      unique: true, // biar tidak ada duplikat meja
    },
    qrCode: {
      type: String, // bisa URL atau base64 image
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "disabled"],
      default: "available",
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // order yang sedang berjalan di meja
    },
  },
  { timestamps: true }
);

const Table = mongoose.model("Table", tableSchema);
export default Table;

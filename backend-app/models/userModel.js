// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true, // wajib isi no WA
      unique: true,   // no WA tidak boleh duplikat
      match: [/^[0-9]{10,15}$/, "Nomor WA tidak valid"] // validasi sederhana
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,  // biar gak duplikat
      match: [/^\S+@\S+\.\S+$/, "Email tidak valid"]
    },

    password: {
      type: String,
      required: true, // wajib untuk login
      minlength: 6,   // biar gak terlalu pendek
    },
    role: {
      type: String,
      enum: ["customer", "admin", "staff"],
      default: "customer",
    },

    cartDate: {
      type: Object,
      default: {}, // tanggal terakhir update cart
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.models.user || mongoose.model("User", userSchema);

export default userModel;

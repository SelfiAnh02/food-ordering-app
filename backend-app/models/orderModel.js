import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // relasi ke schema User.js
      required: true,
    },
    
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // relasi ke schema Product.js
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        note: {
          type: String, // catatan tambahan dari customer
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "completed", "cancelled"],
      default: "pending",
    },

    tableNumber: {
        type: String,
        required: true,
    },

    payment: {
      type: Boolean,
      default: false // relasi ke schema Payment
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.models.order || mongoose.model("Order", orderSchema);
export default OrderModel;

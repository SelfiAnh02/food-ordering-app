import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // relasi ke schema User.js
      required: false,
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
      enum: ["pending", "confirmed", "delivered"],
      default: "pending",
    },

    customerName: {
      type: String,
      required: false,
    },

    tableNumber: {
      type: String,
      required: false,
    },

    orderType: {
      type: String,
      enum: ["Dine-In", "Takeaway", "Delivery"],
      default: "Dine-In", // Dine-In, Takeaway, Delivery
    },

    payment: {
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
      paymentId: String,
      paymentUrl: String,
    },

    paymentDetails: {
      method: { type: String, enum: ["cash", "qris", "edc", "transfer"] },
      paidAt: { type: Date },
    },
  },
  { timestamps: true }
);

const OrderModel =
  mongoose.models.order || mongoose.model("Order", orderSchema);
export default OrderModel;

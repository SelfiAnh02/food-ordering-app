import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // wajib isi nama
      trim: true,
    },
    description: {
      type: String,
      default: "", // opsional
    },
    price: {
      type: Number,
      required: true, // harga wajib diisi
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: {
      type: Number,
      default: 0, // stok default 0
    },
    salesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // otomatis tambahkan createdAt & updatedAt
);

const Product =
  mongoose.models.product || mongoose.model("Product", productSchema);

export default Product;

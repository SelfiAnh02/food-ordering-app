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
    category: {
      type: String, // relasi ke Category
      //ref: "Category",
      required: true,
    },
    stock: {
      type: Number,
      default: 0, // stok default 0
    },
    image: {
      type: String, // simpan URL/path gambar produk
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // by default produk aktif
    },
  },
  { timestamps: true } // otomatis tambahkan createdAt & updatedAt
);

const Product = mongoose.models.product ||mongoose.model("Product", productSchema);

export default Product;

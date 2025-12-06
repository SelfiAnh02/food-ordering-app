import Product from "../../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";

// configure cloudinary from env (backend has secrets)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Note: API expects JSON with `imageUrl` or `imageBase64` (data URL). If `imageBase64` is provided,
// upload to Cloudinary in background and update the product record asynchronously so the create/update
// request returns immediately (faster UX).

// add product (tanpa handle file)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      stock,
      imageUrl,
      imageBase64,
    } = req.body;

    console.log("--- admin.createProduct (json) ---");
    console.log("body keys:", Object.keys(req.body || {}));

    if (!name || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required",
      });
    }

    const product = new Product({
      name,
      description,
      price,
      categoryId,
      stock: stock || 0,
      imageUrl: imageUrl || "",
    });

    // If imageBase64 provided, validate size and upload synchronously so frontend
    // receives product with imageUrl immediately (no reload required).
    if (imageBase64) {
      // extract base64 payload (data:<mime>;base64,<data>)
      const parts = String(imageBase64).split(",");
      const b64 = parts.length > 1 ? parts[1] : parts[0];
      const buf = Buffer.from(b64, "base64");
      const maxBytes = 2 * 1024 * 1024; // 2 MB
      if (buf.length > maxBytes) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Image payload too large (max 2 MB)",
          });
      }

      try {
        console.log("admin.createProduct: uploading image synchronously...");
        const up = await cloudinary.uploader.upload(imageBase64, {
          folder: "products",
        });
        product.imageUrl = up.secure_url || product.imageUrl;
        console.log(
          "admin.createProduct: uploaded image, public_id:",
          up.public_id
        );
      } catch (err) {
        console.warn(
          "admin.createProduct: upload failed:",
          err?.message || err
        );
        // continue and save product without imageUrl
      }
    }

    await product.save();
    console.log("admin.createProduct: saved product (id):", product._id);

    return res
      .status(200)
      .json({
        success: true,
        message: "Product added successfully",
        data: product,
      });
  } catch (error) {
    console.error("Error adding product:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// all product list
export const getProducts = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit ?? "10", 10));
    const filter = categoryId ? { categoryId } : {};

    const products = await Product.find(filter)
      .select(
        "_id name price categoryId stock description imageUrl createdAt updatedAt"
      )
      .populate("categoryId", "name") // ambil nama kategori jika populated
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: categoryId
        ? `Products in category ${categoryId} fetched`
        : "All products fetched",
      products,
      totalItems: total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
    });
  }
};

// get product by id
export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    // ambil field lengkap yang frontend biasanya butuhkan; populate categoryId agar ada nama kategori
    const product = await Product.findById(id)
      .select(
        "_id name description price categoryId stock imageUrl createdAt updatedAt"
      )
      .populate("categoryId", "name")
      .lean();

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Product fetched", product });
  } catch (error) {
    console.error("error fetching product by id:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve product" });
  }
};

// edit product
export const updateProduct = async (req, res) => {
  try {
    console.log("--- admin.updateProduct request ---");
    console.log(
      "headers:",
      req.headers && {
        "content-type": req.headers["content-type"],
        cookie: req.headers["cookie"] ? "[cookie]" : undefined,
      }
    );
    console.log("--- admin.updateProduct (json) ---");
    console.log("body keys:", Object.keys(req.body || {}));

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // update hanya field yang ada
    if (req.body.name) product.name = req.body.name;
    if (req.body.price) product.price = Number(req.body.price);
    if (req.body.description) product.description = req.body.description;
    if (req.body.categoryId) product.categoryId = req.body.categoryId;
    product.stock =
      req.body.stock !== undefined ? Number(req.body.stock) : product.stock;
    // If imageBase64 provided, validate size and upload synchronously so frontend
    // gets updated imageUrl in response immediately.
    if (req.body.imageBase64) {
      const imageBase64 = req.body.imageBase64;
      const parts = String(imageBase64).split(",");
      const b64 = parts.length > 1 ? parts[1] : parts[0];
      const buf = Buffer.from(b64, "base64");
      const maxBytes = 2 * 1024 * 1024; // 2 MB
      if (buf.length > maxBytes) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Image payload too large (max 2 MB)",
          });
      }
      try {
        console.log(
          "admin.updateProduct: uploading image synchronously for:",
          product._id
        );
        const up = await cloudinary.uploader.upload(imageBase64, {
          folder: "products",
        });
        product.imageUrl = up.secure_url || product.imageUrl;
        console.log(
          "admin.updateProduct: uploaded image, public_id:",
          up.public_id
        );
      } catch (err) {
        console.warn(
          "admin.updateProduct: upload failed:",
          err?.message || err
        );
      }
    } else if (req.body.imageUrl) {
      // accept imageUrl if frontend uploaded directly to Cloudinary
      product.imageUrl = req.body.imageUrl;
    }

    await product.save();
    console.log("admin.updateProduct: saved product image fields:", {
      imageUrl: product.imageUrl,
    });

    res.json({ success: true, message: "Product updated", product });
  } catch (error) {
    console.error(">>> ERROR editProduct:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product" });
  }
};

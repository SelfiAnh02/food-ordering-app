import Product from "../../models/productModel.js";

// add product (tanpa handle file)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required",
      });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock: stock || 0,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// all product list
export const listProducts = async (req, res) => {
    try { 
        const products = await Product.find().sort({ createdAt: -1 }); // terbaru dulu
        res.status(200).json({ success: true, message: "Products fetched", products });
    } catch (error) {
        console.error("error:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve products" });
    }
};

// get product by category
export const getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.categoryId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, message: "Products fetched", products });
    } catch (error) {
        console.error("error:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve products" });
    }
};

// edit product 
export const editProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // update hanya field yang ada
        if (req.body.name) product.name = req.body.name;
        if (req.body.price) product.price = Number(req.body.price);
        if (req.body.description) product.description = req.body.description;
        if (req.body.category) product.category = req.body.category;
        product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;

        await product.save();

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
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({success:true,message:"Product deleted successfully"});
    }catch (error) {
        console.log( error);
        res.status(500).json({ success: false, message: "Failed to delete product" });
    }
};




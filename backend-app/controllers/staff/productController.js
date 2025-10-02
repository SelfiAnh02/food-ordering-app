import Product from "../../models/productModel.js";


// all product list
export const getProducts = async (req, res) => {
  try {
    const { categoryId, page = 1, limit = 10 } = req.query;
    const filter = categoryId ? { categoryId } : {};

    const products = await Product.find(filter)
      .select("_id name price")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: categoryId
        ? `Products in category ${categoryId} fetched`
        : "All products fetched",
      // currentPage: parseInt(page),
      // totalPages: Math.ceil(total / limit),
      // totalItems: total,
      products,
    });
  } catch (error) {
    console.error("error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve products"
    });
  }
};

// get product by category
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select("id name description price ");
        res.status(200).json({ success: true, message: "Product fetched", product });
    } catch (error) {
        console.error("error:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve product" });
    }
};
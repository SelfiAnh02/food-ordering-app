import Product from "../models/productModel.js";
import fs from "fs";

//add product item
const addProduct = async(req,res)=>{

    let image_filename = req.file ? req.file.filename:"";

    const product = new Product({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,   
        category:req.body.category,
        image:image_filename
    })
    try {
        await product.save();
        res.json({success:true,message:"Product added"})
    }catch (error){
        console.log(error);
        res.json({success:false,message:"Product not added"})
    }

}

// all product list
const listProducts = async (req, res) => {
    try { 
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }); // terbaru dulu
        res.status(200).json({ success: true, message: "Products fetched", products });
    } catch (error) {
        console.error("error:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve products" });
    }
};

const editProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.body.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // update hanya field yang ada
        if (req.body.name) product.name = req.body.name;
        if (req.body.price) product.price = Number(req.body.price);
        if (req.body.description) product.description = req.body.description;
        if (req.body.category) product.category = req.body.category;
        product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;

        // kalau ada file baru
        if (req.file) {
            if (product.image) {
                fs.unlink(`uploads/${product.image}`, (err) => {
                    if (err) console.error("Gagal hapus file lama:", err.message);
                });
            }
            product.image = req.file.filename;
        }

        await product.save();

        res.json({ success: true, message: "Product updated", product });
    } catch (error) {
        console.error(">>> ERROR editProduct:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// remove product
const removeProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.body.id);
        fs.unlink(`uploads/${product.image}`, ()=>{})

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        await Product.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product removed"})
    }catch (error) {
        console.log( error);
        res.status(500).json({ success: false, message: "Failed to remove product" });
    }
};



export { addProduct, listProducts, editProduct, removeProduct };
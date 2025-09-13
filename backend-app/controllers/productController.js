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

// set aktif / nonaktif produk secara langsung
const setProductStatus = async (req, res) => {
    try {
        const { productId, isActive } = req.body; // ambil id & status dari body
        // validasi input
        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive harus berupa true atau false",
            });
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            { isActive },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({
            success: true,
            message: `Product berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}`,
            productId,
        });
    } catch (error) {
        console.error(">>> ERROR setProductStatus:", error);
        res.status(500).json({ success: false, message: "Failed to update product status" });
    }
};



export { addProduct, listProducts, removeProduct, setProductStatus };
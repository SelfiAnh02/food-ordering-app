import Category from "../../models/categoryModel.js";  

// Create new category
export const createCategory = async (req, res)=> {
    try {
        const { name, description } = req.body;
        const exists = await Category.findOne({ name });
        if (exists) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const category = await Category.create({ name, description });
        res.status(201).json({ success: true, message: "Category created", data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// List all categories
export const getCategories = async (req, res)=> {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// get By ID
export const getCategoryById = async (req, res)=> {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Update category
export const updateCategory = async (req, res)=> {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, message: "Category updated", data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
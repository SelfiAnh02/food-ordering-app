import userModel from "../models/userModel.js";

// add item to user cart
const addToCart = async (req, res) => {
    try {
        let userData = await userModel.findOne({_id: req.body.userId});
        let cartData = userData.cart || {};
        if (!cartData[req.body.productId]) {
            cartData[req.body.productId] = 1;
        } else {
            cartData[req.body.productId] += 1;
        }

        await userModel.findByIdAndUpdate(
            req.body.userId,
            { cartData},
            { new: true }
        );  
        return res.status(200).json({success: true, message: "Item added to cart successfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Internal Server Error"});
    }

}

// remove item from user cart
const removeFromCart = async (req, res) => {

}

// fetch user cart data 
const getCart = async (req, res) => {

}

export { addToCart, removeFromCart, getCart };
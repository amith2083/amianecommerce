import asyncHandler from "express-async-handler";
import Wishlist from "../models/wishlist.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";


export const getWishlist = asyncHandler(async(req,res)=>{
    try{
    const user = await User.findById(req.userAuthId);
    const categories = await Category.find();
    // Find the wishlist for the logged-in user and populate the associated products
    const wishlist = await Wishlist.findOne({ user: req.userAuthId }).populate('products');
        
    // If no wishlist found or empty, send an empty array for products
    const products = wishlist ? wishlist.products : [];

    res.render('wishlist',{user,products,categories})
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error rendering wishlist page.");
    }
});

export const createWishlist = asyncHandler(async(req,res)=>{
    try {
        const userId = req.userAuthId; // Assuming the user is authenticated and available in req.user
        const productId = req.params.id;

        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            // If wishlist doesn't exist, create a new one
            wishlist = new Wishlist({ user: userId, products: [productId] });
            await wishlist.save();
            return res.json({ success: true, message: " product added to wishlist!" });
        } else {
            // If the product is not already in the wishlist, add it
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
                return res.json({ success: true, message: "Product added to wishlist!" });
            }
        }

       
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.userAuthId; // Assuming the user ID is stored in req.userAuthId
        const productId = req.params.id;

        // Find the user's wishlist
        const wishlist = await Wishlist.findOne({ user: userId });

        if (wishlist) {
            // Remove the product from the wishlist's products array
            wishlist.products = wishlist.products.filter(
                (product) => product.toString() !== productId
            );

            // Save the updated wishlist
            await wishlist.save();

            return res.json({ success: true, message: 'Product removed from wishlist' });
        } else {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error removing product from wishlist' });
    }
});
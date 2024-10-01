import Wishlist from "../models/wishlist.js";
import Cart from "../models/Cart.js";
import Category from "../models/Category.js";


const wishlistCartCategoryMiddleware = async (req, res, next) => {
  try {
    // Check if the user is authenticated
    
    if (req.userAuthId) {
      // Fetch wishlist and cart count for the authenticated user
      const wishlist = await Wishlist.findOne({ user: req.userAuthId });

      // Calculate the number of products in the wishlist
      const wishlistCount = wishlist ? wishlist.products.length : 0;
      const cartCount = await Cart.countDocuments({ userId: req.userAuthId });

      // Store counts in res.locals to make them available in all views
      res.locals.wishlistCount = wishlistCount;
      res.locals.cartCount = cartCount;
    } else {
      // If the user is not logged in, set counts to 0
      res.locals.wishlistCount = 0;
      res.locals.cartCount = 0;
    }

    // Fetch categories
    const categories = await Category.find();
    res.locals.categories = categories;

  } catch (error) {
    console.error('Error fetching wishlist/cart/categories:', error.message);
    // In case of any error, set defaults
    res.locals.wishlistCount = 0;
    res.locals.cartCount = 0;
    res.locals.categories = [];
  }

  // Proceed to the next middleware or route
  next();
};

export default wishlistCartCategoryMiddleware;

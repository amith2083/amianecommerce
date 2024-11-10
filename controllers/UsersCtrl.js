import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import { getUserTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";
import nodemailer from "nodemailer";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Wallet from "../models/wallet.js";
import Wishlist from "../models/wishlist.js";
import Offer from "../models/offer.js";
import Review from "../models/review.js";
import { calculateAndUpdateSalesPrice } from "../utils/offerHelper.js";

let tempUserStore = {}; // Temporary store for user data
let otpStore = {}; // Temporary store for OTPs
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

export const loadRegister = asyncHandler(async (req, res) => {
  try {
    if (req.cookies.userToken) {
      res.redirect("/home");
    } else res.render("account"); // Ensure this path is correct
  } catch (error) {
    console.log(error.message);
  }
});
export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, mobno, referralCode } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.render("account", { message: "user already exists" });
      // throw new Error('user already exists');
    }

    // If referral code is provided, validate it
    let referrer = null;
    if (referralCode) {
      referrer = await User.findByReferralCode(referralCode);
      if (!referrer) {
        return res.render("account", { message: "Invalid referral code" });
      }
    }
    // Generate OTP
    // const otp = Math.floor(100000 + Math.random() * 900000);
    const otp = generateOtp();
    otpStore[email] = otp;
    tempUserStore[email] = {
      name,
      email,
      password,
      mobno,
      referredBy: referrer?.referralCode || null,
    };
    sendVerificationEmail(email, otp);

    return res.render("otp", { email }); // Pass email to the OTP view
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).render("error", {
      message: "An error occurred during registration. Please try again later.",
    });
  }
});

// return res.render('otp')
// return res.status(201).json({
//     status:'success',
//     msg:'user registered',
//     data:user
// })

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] && otpStore[email] === parseInt(otp, 10)) {
    const { name, password, mobno, referredBy } = tempUserStore[email];
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user data to database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mobno,
      referredBy,
    });
    // Check if the user was referred
    if (referredBy) {
      // Find the referrer by the referral code
      const referrer = await User.findOne({ referralCode: referredBy });

      if (referrer) {
        // Find the referrer's wallet
        let wallet = await Wallet.findOne({ userId: referrer._id });
        if (!wallet) {
          // If the wallet doesn't exist, create one
          wallet = new Wallet({
            userId: referrer._id,
            amount: 0,
            walletHistory: [],
          });
        }

        // Add Rs. 50 to the referrer's wallet
        await wallet.addTransaction(
          "credit",
          50,
          "Referral bonus for referring a new user"
        );
        await wallet.save();
      }
    }

    // Clear temporary stores
    delete otpStore[email];
    delete tempUserStore[email];

    // return res.render('account', { message: 'User registered successfully' });
    return res.json({ success: true, redirectUrl: "/register" });
  } else {
    // res.json({
    //     success:false,
    //     message:"invalid"
    // })
    // return res.json('otp', { email, message: 'Invalid OTP, please try again' });
    return res.json({ success: false, message: "Invalid or expired OTP" });
  }
});
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if the email exists in the temporary user store
  if (tempUserStore[email]) {
    // Generate a new OTP
    const otp = generateOtp();
    otpStore[email] = otp;

    // Send new OTP to user's email
    sendVerificationEmail(email, otp);

    return res.json({
      success: true,
      message: "OTP resent successfully",
    });
  } else {
    return res.json({
      success: false,
      message: "Email not found in temporary store",
    });
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  const userFound = await User.findOne({ email });
  console.log(userFound);
  if (userFound && (await bcrypt.compare(password, userFound?.password))) {
    if (userFound.isBlocked) {
      // res.cookie('userToken', '', { maxAge: 1 });
      return res.render("account", {
        message: "Your account is blocked. Please contact admin.",
      });
    }

    const token = generateToken(userFound?._id);
    console.log(token);

    // Store token in a cookie
    res.cookie("userToken", token, {
      httpOnly: true, // Accessible only by web server
      secure: false, // Set to false for local development
      maxAge: 3600000, // 1 hour
    });

    // return res.render('index', {
    //     status: 'success',
    //     msg: 'User logged in',
    //     user: userFound,
    //     token: token
    // });

    return res.redirect("/home");
  }

  return res.render("account", { message: "Invalid login details" });
});

export const loadHome = asyncHandler(async (req, res) => {
  try {
    // const user = await User.findOne({email})
    const user = await User.findById(req.userAuthId);

    // Fetch featured products (top 10 by totalQty)
    // const featuredProducts = await Product.find()
    //   .sort({ totalQty: -1 })
    //   .limit(10);

    // Fetch newly added products (top 10 by createdAt)
    // const newProducts = await Product.find().sort({ createdAt: -1 }).limit(10);
    // const categories = await Category.find();
    const [featuredProducts, newProducts, categories] = await Promise.all([
      Product.find().sort({ totalQty: -1 }).limit(6),
      Product.find().sort({ createdAt: -1 }).limit(6),
      Category.find()
    ]);
    const wishlist = await Wishlist.findOne({ user: req.userAuthId }).populate(
      "products"
    );
    const userWishlist = wishlist
    ? wishlist.products.map((product) => product._id.toString())
    : [];
    res.render("index", { user, featuredProducts, newProducts, categories,userWishlist }); // Ensure this path is correct
  } catch (error) {
    console.log(error.message);
  }
});

export const allProducts = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.userAuthId);
    const categories = await Category.find({}); // Adjust query as needed
    const wishlist = await Wishlist.findOne({ user: req.userAuthId }).populate(
      "products"
    );
    const userWishlist = wishlist
      ? wishlist.products.map((product) => product._id.toString())
      : [];

    // Fetch latest 3 products for the "New Products" section
    const latestProducts = await Product.find({})
      .sort({ createdAt: -1 }) // Sort by creation date in descending order (latest first)
      .limit(3); // Limit to 3 products

    const selectedCategory = req.query.category; // Get selected category from query parameters
    const minPrice = parseInt(req.query["price-min"]) || 0;
    const maxPrice = parseInt(req.query["price-max"]) || Infinity;
    const searchQuery = req.query.search || "";
    // const products = await Product.find({});
    // Get sorting criteria from query parameters
    const sort = req.query.sort || "popularity"; // Default to popularity if no sort parameter is provided;
    let sortCriteria;

    switch (sort) {
      case "NewArrivals":
        sortCriteria = { createdAt: -1, _id: 1 }; // Adjust as per your popularity criteria
        break;
      case "priceLowToHigh":
        sortCriteria = { salesPrice: 1, _id: 1 };
        break;
      case "priceHighToLow":
        sortCriteria = { salesPrice: -1, _id: 1 };
        break;
      case "AToZ":
        sortCriteria = { name: 1, _id: 1 }; // Sort by name A-Z
        break;
      case "ZToA":
        sortCriteria = { name: -1, _id: 1 }; // Sort by name Z-A
        break;
      default:
        // sortCriteria = {}; // Default sorting (e.g., by name)
        sortCriteria = { totalQty: -1, _id: 1 }; // Default to popularity
        break;
    }

    // Construct the query based on filters
    const query = {};
    if (selectedCategory) {
      query.category = selectedCategory;
    }
    if (minPrice > 0 || maxPrice < Infinity) {
      query.salesPrice = { $gte: minPrice, $lte: maxPrice };
    }
    if (searchQuery) {
      query.name = new RegExp(searchQuery, "i");
    }
    console.log("Query:", query); // Debugging
    //pagination
    const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 6;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // const total = await Product.countDocuments();
    // const query = selectedCategory ? { category: selectedCategory } : {};
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortCriteria)
      .skip(startIndex)
      .limit(limit);

    // Ensure the latest sales price is calculated for each product
    for (const product of products) {
      if (!product) {
        console.error("Encountered null product in products list");
        continue; // Skip to the next product
        // await calculateAndUpdateSalesPrice(product._id);  // Update sales price
      }
      console.log(`Processing product ID: ${product._id}`);
      try {
        const updatedSalesPrice = await calculateAndUpdateSalesPrice(
          product._id
        );
        product.salesPrice = updatedSalesPrice;
      } catch (error) {
        console.error(
          `Error updating product ID ${product._id}:`,
          error.message
        );
      }
    }

    res.render("products", {
      categories,
      products,
      user,
      latestProducts,
      searchQuery,
      currentSort: sort,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      userWishlist,
      selectedCategory, // Pass the current page to the frontend
    }); // Pass the current sort option to the frontend
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export const singleProduct = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userAuthId);
  const product = await Product.findById(req.params.id).populate("category");
  const categories = await Category.find();
  const wishlist = await Wishlist.findOne({ user: req.userAuthId }).populate(
    "products"
  );
  const userWishlist = wishlist
    ? wishlist.products.map((product) => product._id.toString())
    : [];
    const reviews = await Review.find({ productId: product._id });
  // Fetch related products based on the same category but exclude the current product
  const relatedProducts = await Product.find({
    category: product.category._id,
    _id: { $ne: req.params.id }, // Exclude the current product
  }).limit(4); // Limit the number of related products

  // Check if the product is in the user's cart
  const cartItem = await Cart.findOne({
    userId: req.userAuthId,
    productId: req.params.id,
  });

  console.log(product);
  if (!product) {
    throw new Error("product not found");
  }
  const currentSort = req.query.sort || "popularity";
  const isInCart = !!cartItem; // true if product is in the cart, false otherwise
  // res.json({
  //     status:'success',
  //     msg:'single product fetched successfully',
  //     product
  // })
  res.render("singleProduct", {
    product,
    user,
    categories,
    isInCart,
    relatedProducts,
    cart: cartItem,
    currentSort,
    userWishlist,
    reviews,
    reviewsCount: product.reviewCount
  });
});

export const submitReview = asyncHandler(async(req,res)=>{
  const { productId, name, email, comment, rating } = req.body;

  try {
    // Create a new review
    const newReview = new Review({
      productId,
      name,
      email,
      comment,
      rating,
    });

    await newReview.save();

    // Optionally, you can update the product's  review count
   // Find the product and increment the review count
   const product = await Product.findById(productId);

   if (product) {
     product.reviewCount = product.reviewCount + 1; // Increment the review count
     await product.save(); // Save the updated product
   }
    res.status(201).json({ success: true, message: 'Review submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
})

export const getForgotPassword = asyncHandler(async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log(error.message);
  }
});

export const forgotpasswordLink = asyncHandler(async (req, res) => {
  try {
    const userEmail = req.body.email;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).render("forgotPassword", { userNotFound: true });
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Set token and expiration on the user's record
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    const resetLink = `${process.env.BASE_URL}/resetpassword?token=${resetToken}`;
    sendVerificationEmail(userEmail, null, resetLink);

    res.render("forgotPassword", { success: true });
  } catch (error) {
    res.render("forgotPassword", { error: true });
  }
});
export const resetPassword = asyncHandler(async (req, res) => {
  const token = req.query.token; // Extract the token from the URL
  try {
    // Find the user by the token and ensure it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure the token has not expired
    });

    if (!user) {
      // If no user is found, or the token has expired
      return res.status(400).send("Invalid or expired token");
    }

    // If the token is valid, render the reset password form
    res.render("resetpassword", { token });
  } catch (error) {
    console.error("Error finding user by token:", error);
    res.status(500).send("Server error");
  }
});
export const newPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find the user by the token and ensure it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.render("resetPassword", { invalidToken: true });
    }

    // Update the user's password
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword; // Assuming password hashing is handled in the User model
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpires = undefined; // Clear the expiration time
    await user.save();

    // Redirect to login or another success page
    res.render("account", { success: true });
  } catch (error) {
    console.error("Error resetting password:", error);
    // res.status(500).send('Server error');
    return res.render("resetPassword", { serverError: true });
  }
});
//---------------------------------------------------------------------------------------------------------------------------------------

export const userProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.userAuthId);
    // Fetch the user's orders
    // Pagination variables
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    const orders = await Order.find({ user: req.userAuthId })
      .skip(skip)
      .limit(limit)
      .populate("orderItems.productId", "name price") // Populate order items with product name and price
      .sort({ createdAt: -1 }); // Sort orders by creation date (most recent first)
    console.log(orders);
    // Count total number of orders for pagination
    const totalOrders = await Order.countDocuments({ user: req.userAuthId });
    const totalPages = Math.ceil(totalOrders / limit);
    const wallet = await Wallet.findOne({ userId: req.userAuthId });
    if (wallet && wallet.walletHistory) {
      // Sort the transaction history by creation date (latest first)
      wallet.walletHistory.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    res.render("userProfile", {
      user,
      orders,
      wallet,
      currentPage: page,
      totalPages,
      limit,
    }); // Ensure this path is correct
  } catch (error) {
    console.log(error.message);
  }
});
export const updateUserShippingAddress = asyncHandler(async (req, res) => {
  try {
    const userId = req.userAuthId; // Assuming user is logged in and you have access to req.user
    const {
      index,
      firstName,
      lastName,
      address,
      city,
      country,
      postalCode,
      phone,
      email,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.shippingAddress && user.shippingAddress.length > index) {
      // Update the specific shipping address
      user.shippingAddress[index] = {
        firstName,
        lastName,
        address,
        city,
        country,
        postalCode,
        phone,
        email,
      };

      await user.save();
      res.redirect("/profile"); // Redirect to the profile page after saving
    } else {
      res.status(400).send("Invalid address index");
    }
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).send("Server error");
  }
});
export const deleteUserAddress = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.userAuthId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { index } = req.params;
    user.shippingAddress.splice(index, 1);
    user.hasShippingAddress = user.shippingAddress.length > 0;

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
export const userprofileOrders = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.userAuthId);
    // Fetch the user's orders
    // Pagination variables
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    const orders = await Order.find({ user: req.userAuthId })
      .skip(skip)
      .limit(limit)
      .populate("orderItems.productId", "name price images ") // Populate order items with product name and price
      .sort({ createdAt: -1 }); // Sort orders by creation date (most recent first)
    console.log(orders);
    // Count total number of orders for pagination
    const totalOrders = await Order.countDocuments({ user: req.userAuthId });
    const totalPages = Math.ceil(totalOrders / limit);

    res.render("userProfileOrders", {
      orders,
      user,
      currentPage: page,
      totalPages,
      limit,
    }); // Ensure this path is correct
  } catch (error) {
    console.log(error.message);
    // Render an error page in case of server error
  }
});

export const userAccountDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userAuthId);
  return res.render("userAccountDetails", { user });
});
export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { name, password, confirmPassword } = req.body;

  // Find the user by their ID (assumed req.userAuthId is set by your authentication middleware)
  const user = await User.findById(req.userAuthId);

  if (!user) {
    return res.status(404).render("error", { message: "User not found" });
  }

  // Update the name
  if (name) {
    user.name = name;
  }

  // Check if the user wants to update their password
  if (password) {
    if (password !== confirmPassword) {
      return res.render("userAccountDetails", {
        user,
        message: "Passwords do not match",
      });
    }

    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  // Save updated user details
  await user.save();

  return res.render("userAccountDetails", {
    user,
    message: "Account details updated successfully",
  });
});
export const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Invalidate the token by removing it from the client
    res.cookie("userToken", "", { maxAge: 1 }); // This sets the token cookie to expire immediately

    res.redirect("/register"); // Redirect to account.ejs (registration page)
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({
      message: "An error occurred during logout. Please try again later.",
    });
  }
});

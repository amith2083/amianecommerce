import express from "express";

const userRoutes = express.Router();
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import wishlistCartCategoryMiddleware from "../middlewares/wishlistCartCategory.js";
import {
  registerUser,
  loginUser,
  loadRegister,
  loadHome,
  verifyOtp,
  resendOtp,
  getForgotPassword,
  forgotpasswordLink,
  resetPassword,
  newPassword,
  logoutUser,
  allProducts,
  singleProduct,
  userProfile,
  updateUserShippingAddress,
  deleteUserAddress,
  userprofileOrders,
} from "../controllers/usersCtrl.js";
import {
  loadCart,
  addToCart,
  updateCart,
  removeFromCart,
} from "../controllers/cartCtrl.js";
import { getCheckout } from "../controllers/checkoutCtrl.js";
import {
  userOrderDetails,
  getOrderConfirmation,
  createOrder,
  cancelOrder,
  returnOrder,
  verifyPayment,
  updatePaymentFailure,
  retryPayment,retryPaymentVerification
} from "../controllers/orderCtrl.js";
import { isLogout } from "../middlewares/isLogout.js";
import passport from "passport";
import { addFunds, verifyWalletPayment } from "../controllers/walletCtrl.js";
import {
  getWishlist,
  createWishlist,
  removeFromWishlist,
} from "../controllers/wishlistCtrl.js";

//user registeration
userRoutes.get("/register", isLogout, loadRegister);
userRoutes.post("/register", registerUser);
userRoutes.post("/verify-otp", verifyOtp);
userRoutes.post("/resend-otp", resendOtp);
userRoutes.post("/login", loginUser);
userRoutes.get("/home", isLoggedIn, wishlistCartCategoryMiddleware,loadHome);
userRoutes.get("/forgotpassword", getForgotPassword);
userRoutes.post("/forgotpassword", forgotpasswordLink);
userRoutes.get("/resetPassword", resetPassword);
userRoutes.post("/resetpassword/:token", newPassword);
// userRoutes.get("/profile", isLoggedIn,getUserProfile);
userRoutes.get("/logout", logoutUser);
userRoutes.get("/products", isLoggedIn, wishlistCartCategoryMiddleware, allProducts);
userRoutes.get("/product/:id", isLoggedIn, wishlistCartCategoryMiddleware,singleProduct);
userRoutes.get("/profile", isLoggedIn, wishlistCartCategoryMiddleware,userProfile);
userRoutes.get("/profile/orders", isLoggedIn, wishlistCartCategoryMiddleware,userprofileOrders);
// userRoutes.get("/search", productSearch);
userRoutes.post(
  "/profile/update-address",
  isLoggedIn,
  updateUserShippingAddress
);
userRoutes.delete(
  "/profile/delete-address/:index",
  isLoggedIn,
  deleteUserAddress
);

userRoutes.post("/order/:id/cancel", cancelOrder);
userRoutes.get("/order/:id", isLoggedIn,  wishlistCartCategoryMiddleware,userOrderDetails);
userRoutes.post("/order/:id/return", isLoggedIn, returnOrder);

userRoutes.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
userRoutes.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/register",
    session: false,
  }),
  (req, res) => {
    const token = req.user.token;
    // Set JWT token in cookies
    res.cookie("userToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      maxAge: 3600000, // 1 hour
    });
    res.redirect("/home");
  }
);
//cart actions
userRoutes.get("/cart", isLoggedIn, wishlistCartCategoryMiddleware,  loadCart);
userRoutes.post("/cart", isLoggedIn, addToCart);
userRoutes.post("/cart/update/:itemId", isLoggedIn, updateCart);
userRoutes.delete("/cart/remove/:id", isLoggedIn, removeFromCart);

userRoutes.get("/checkout", isLoggedIn, wishlistCartCategoryMiddleware, getCheckout);
userRoutes.get("/orderconfirmation", isLoggedIn, wishlistCartCategoryMiddleware, getOrderConfirmation);
userRoutes.post("/placeorder", isLoggedIn, createOrder);
userRoutes.post("/verify-payment", verifyPayment);
userRoutes.post("/update-payment-failure", updatePaymentFailure);
userRoutes.put("/order/:orderId/retry-payment", isLoggedIn,retryPayment);

userRoutes.post('/order/:orderId/verify-payment', retryPaymentVerification);
//wallet
userRoutes.post("/profile/add-funds", isLoggedIn, addFunds);
userRoutes.post("/profile/verify-payment", isLoggedIn, verifyWalletPayment);

//wishlist
userRoutes.get("/wishlist", isLoggedIn,wishlistCartCategoryMiddleware, getWishlist);
userRoutes.post("/wishlist/add/:id", isLoggedIn, createWishlist);
userRoutes.delete("/wishlist/remove/:id", isLoggedIn, removeFromWishlist);

export default userRoutes;

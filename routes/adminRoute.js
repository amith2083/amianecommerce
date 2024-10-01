import express from "express";
const adminRoutes = express.Router();
import { isLoggedAdmin } from "../middlewares/isLoggedIn.js";
import upload from "../config/fileUpload.js";
import categoryFileUpload from "../config/categoryFileUpload.js";
import {
  adminRegister,
  adminLogin,
  adminDashboard,
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  generateSalesReport,
  bestSelling,
} from "../controllers/adminCtrl.js";
import { getCustomers, blockCustomer } from "../controllers/CustomersCtrl.js";
import {
  addProduct,
  productsList,
  createProduct,
  editProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsCtrl.js";
import {
  createCategory,
  getCategories,
  editCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/CategoryCtrl.js";
import {
  getOrderlists,
  editOrderStatus,
  orderDetail,
} from "../controllers/orderCtrl.js";
import {
  createCoupon,
  getCouponlist,
  addCoupon,
  getEditCoupon,
  updateCoupon,
} from "../controllers/couponCtrl.js";
import {
  getOfferList,
  createOffer,
  blockOffer,
  unblockOffer,
} from "../controllers/offerCtrl.js";

// import { addProduct,productsList,createProduct } from '../controllers/productsCtrl.js'

//Admin Actions
// adminRoutes.get("/adminregister", adminRegister);
adminRoutes.get("/adminlogin", adminLogin);
adminRoutes.post("/adminregister", registerAdmin);
adminRoutes.post("/adminlogin", loginAdmin);
adminRoutes.get("/admindashboard", isLoggedAdmin, adminDashboard);
adminRoutes.get("/adminlogout", logoutAdmin);
//adminDashboard
// adminRoutes.get("/download/pdf", isLoggedAdmin,generatePdfReport);
// adminRoutes.get("/download/excel",isLoggedAdmin, generateExcelReport);
adminRoutes.post("/orders/report", isLoggedAdmin, generateSalesReport);
adminRoutes.get("/best-selling", isLoggedAdmin, bestSelling);

//usermanagement

adminRoutes.get("/customerslist", isLoggedAdmin, getCustomers);
adminRoutes.put("/blockcustomer/:id", isLoggedAdmin, blockCustomer);

//product actions
adminRoutes.get("/addproduct", isLoggedAdmin, addProduct);
adminRoutes.post(
  "/addproduct",
  isLoggedAdmin,
  upload.array("files"),
  createProduct
);
adminRoutes.get("/productslist", isLoggedAdmin, productsList);
adminRoutes.get("/editproduct/:id", isLoggedAdmin, editProduct);
// adminRoutes.put(
//   "/editproduct/:id",
//   isLoggedAdmin,
//   upload.array("files"),
//   updateProduct
// );
adminRoutes.put(
  "/editproduct/:id",
  isLoggedAdmin,
  upload.fields([{ name: "files" }, { name: /^croppedImage-/ }]), // Adjust here
  updateProduct
);
adminRoutes.delete("/deleteproduct/:id", isLoggedAdmin, deleteProduct);

//category actions
adminRoutes.get("/addcategories", isLoggedAdmin, getCategories);
adminRoutes.post(
  "/addcategory",
  isLoggedAdmin,
  categoryFileUpload.single("file"),
  createCategory
);
adminRoutes.get("/editcategory/:id", isLoggedAdmin, editCategory);
adminRoutes.put(
  "/editcategory/:id",
  isLoggedAdmin,
  categoryFileUpload.single("file"),
  updateCategory
);
adminRoutes.delete("/deletecategory/:id", isLoggedAdmin, deleteCategory);

//order actions
adminRoutes.get("/order", isLoggedAdmin, getOrderlists);
// adminRoutes.get("/orderstatus/:id", isLoggedAdmin, getOrderStatus);
adminRoutes.put("/orderstatus/:id", isLoggedAdmin, editOrderStatus);
adminRoutes.get("/order/:id", isLoggedAdmin, orderDetail);

//coupons
adminRoutes.get("/coupon", isLoggedAdmin, getCouponlist);
adminRoutes.get("/addcoupon", isLoggedAdmin, addCoupon);
adminRoutes.post("/coupon", isLoggedAdmin, createCoupon);
adminRoutes.get("/editcoupon/:id", isLoggedAdmin, getEditCoupon);
adminRoutes.put("/updatecoupon/:id", isLoggedAdmin, updateCoupon);

//offers
adminRoutes.get("/offer", isLoggedAdmin, getOfferList);
adminRoutes.post("/offer", isLoggedAdmin, createOffer);
adminRoutes.put("/block-offer/:id", isLoggedAdmin, blockOffer);
adminRoutes.put("/unblock-offer/:id", isLoggedAdmin, unblockOffer);
// adminRoutes.get("/add-offer-category", isLoggedAdmin, addCategoryOffer);
// adminRoutes.post("/add-offer-category", isLoggedAdmin, createCategoryOffer);
// adminRoutes.delete( "/delete-offer-category/:id", isLoggedAdmin, deleteCategoryOffer);
export default adminRoutes;

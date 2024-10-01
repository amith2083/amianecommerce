import asyncHandler from "express-async-handler";
import Admin from "../models/admin.js";
import Coupon from "../models/Coupon.js";

export const getCouponlist = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.adminAuthId);
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit) || 10; // Number of items per page
  const skip = (page - 1) * limit; // Number of items to skip
  const coupons = await Coupon.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  // Count total coupons for pagination
  const totalCoupons = await Coupon.countDocuments();

  res.render("couponsList", {
    admin,
    coupons,
    currentPage: page,
    totalPages: Math.ceil(totalCoupons / limit),
  });
});
export const addCoupon = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.adminAuthId);
  res.render("addCoupon", { admin });
});
export const getEditCoupon = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.adminAuthId);
  const couponId = req.params.id;
  try {
    const coupon = await Coupon.findById(couponId);
    res.render("editCoupon", { admin, coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json("500", { message: "Server error" });
  }
});

// export const createCoupon = asyncHandler(async (req, res) => {
//   const { code, startDate, endDate, discount,description } = req.body;
//   const couponExists = await Coupon.findOne({ code });
//   if (couponExists) {
//     throw new Error("coupon already exists");
//   }
//   // if(NaN(discount)){
//   //     throw new Error ('discount value must be a Number');
//   // }
//   const coupon = await Coupon.create({
//     code:code.toUpperCase(),
//     startDate,
//     endDate,
//     discount,
//     description,
//     user: req.userAuthId,
//   });
//   res.redirect("/admin/coupon");
// });
export const createCoupon = asyncHandler(async (req, res) => {
  try {
    const {
      code,
      startDate,
      endDate,
      discount,
      description,
      usageLimit,
      maximumPurchaseAmount,
    } = req.body;

    // Validate inputs
    if (
      !code ||
      !startDate ||
      !endDate ||
      !discount ||
      !usageLimit ||
      !maximumPurchaseAmount
    ) {
      return res.status(400).json({
        status: "error",
        message: "All required fields must be filled",
      });
    }

    // Convert code to uppercase
    const upperCaseCode = code.toUpperCase();

    // Check if coupon already exists
    const couponExists = await Coupon.findOne({ code: upperCaseCode });
    if (couponExists) {
      return res
        .status(400)
        .json({ status: "error", message: "Coupon already exists" });
    }

    // Create a new coupon
    const newCoupon = await Coupon.create({
      code: upperCaseCode,
      startDate,
      endDate,
      discount,
      description: description || "",
      usageLimit: usageLimit || 0,
      maximumPurchaseAmount,
      user: req.userAuthId, // Assuming you want to track who created the coupon
    });

    // Send success response
    res.status(201).json({
      status: "success",
      message: "Coupon created successfully",
      coupon: newCoupon,
    });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ status: "error", message: messages.join(", ") });
    } else if (error.code === 11000) {
      // Handle duplicate code error
      return res
        .status(400)
        .json({ status: "error", message: "Coupon code already exists" });
    } else if (error.message) {
      // Catch error from pre('validate') hook
      return res.status(400).json({ status: "error", message: error.message });
    } else {
      return res.status(500).json({ status: "error", message: "Server error" });
    }
  }
});
export const updateCoupon = asyncHandler(async (req, res) => {
  const couponId = req.params.id;

  const {
    startDate,
    endDate,
    discount,
    description,
    maximumPurchaseAmount,
    usageLimit,
  } = req.body;

  try {
    // const updatedCoupon = await Coupon.findByIdAndUpdate(
    //     couponId,
    //     {
    //         startDate,
    //         endDate,
    //         discount,
    //         description,
    //         maximumPurchaseAmount,
    //         usageLimit
    //     },
    //     { new: true, runValidators: true, } // This ensures that the schema validators are run
    // );
    const updatedCoupon = await Coupon.findById(couponId);

    if (!updatedCoupon) {
      return res
        .status(404)
        .json({ status: "error", message: "Coupon not found" });
    }

    // Update the coupon fields
    updatedCoupon.startDate = startDate;
    updatedCoupon.endDate = endDate;
    updatedCoupon.discount = discount;
    updatedCoupon.description = description;
    updatedCoupon.maximumPurchaseAmount = maximumPurchaseAmount;
    updatedCoupon.usageLimit = usageLimit;

    // Save the coupon, this will trigger the pre('save') middleware
    await updatedCoupon.save();

    res.status(200).json({
      status: "success",
      message: "Coupon updated successfully",
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ status: "error", message: messages.join(", ") });
    } else if (error.code === 11000) {
      // Handle duplicate code error
      return res
        .status(400)
        .json({ status: "error", message: "Coupon code already exists" });
    } else if (error.message) {
      // Catch error from pre('validate') hook
      return res.status(400).json({ status: "error", message: error.message });
    } else {
      return res.status(500).json({ status: "error", message: "Server error" });
    }
  }
});

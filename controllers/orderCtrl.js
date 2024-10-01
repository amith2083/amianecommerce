import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Admin from "../models/admin.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import Wallet from "../models/wallet.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "../utils/razorpayService.js";
import mongoose from "mongoose";

// Function to generate unique order number
async function generateUniqueOrderNumber() {
  let unique = false;
  let orderNumber = "";

  while (!unique) {
    const randomTxt = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generates random string
    const randomNumber = Math.floor(1000 + Math.random() * 90000); // Random number between 1000 and 99999
    orderNumber = randomTxt + randomNumber;

    // Check if the order number already exists
    const existingOrder = await Order.findOne({ orderNumber });
    if (!existingOrder) {
      unique = true; // Exit the loop if the number is unique
    }
  }

  return orderNumber;
}

//for user

export const createOrder = asyncHandler(async (req, res) => {
  // const existingOrder = await Order.findOne({
  //   user: req.userAuthId,
  //   paymentStatus: "Not Paid" || "Failed",
  //   paymentMethod: "Razorpay",
  // });
  // if (existingOrder) {
  //   // If an unpaid order exists, reuse that order and return the Razorpay details
  //   const razorpayOrder = await createRazorpayOrder(
  //     existingOrder._id,
  //     existingOrder.totalPrice
  //   );
  //   return res.json({
  //     razorpayOrderId: razorpayOrder.id,
  //     razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  //     totalPrice: existingOrder.totalPrice,
  //     order: existingOrder._id,
  //   });
  // }
  const { coupon } = req.body;
  // console.log("query:", coupon);

  const couponFound = await Coupon.findOne({ code: coupon });
  // console.log(couponFound);

  // if (couponFound?.isExpired) {
  //   throw new Error("coupon expired");
  // }
  // if (!couponFound) {
  //   throw new Error("coupon does nor exists");
  // }
  // const discount = couponFound?.discount / 100;
  // const { orderId } = req.query
  const { shippingAddress, paymentMethod, totalPrice } = req.body;
  const userId = req.userAuthId;
  //   const parsedOrderItems = JSON.parse(orderItems);
  const orderItems = JSON.parse(decodeURIComponent(req.body.orderItems));

  console.log("Order Items:", orderItems);
  // console.log('Payment Option:', payment_option);
  const user = await User.findById(req.userAuthId);

  if (orderItems?.length <= 0) {
    throw new Error("No order items found");
  }
  //   const totalPrice = orderItems.reduce((acc, item) => acc + item.productId.salesPrice * item.quantity, 0);
  // If an order ID is provided, retry failed payments
  // if (orderId) {
  //   const existingOrder = await Order.findById(orderId);
  //   if (!existingOrder)
  //     return res.status(404).json({ message: "Order not found." });

  //   // If the payment failed and retrying Razorpay payment
  //   if (existingOrder.paymentStatus === "Failed" && existingOrder.paymentMethod === "Razorpay") {
  //     const razorpayPayment = await createRazorpayOrder(existingOrder._id, existingOrder.totalPrice);
  //     return res.json({
  //       razorpayOrderId: razorpayPayment.id,
  //       razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  //       totalPrice: existingOrder.totalPrice,
  //       order: existingOrder._id,
  //     });
  //   }
  // }
   
  
  const productIds = orderItems.map((item) => item.productId._id);
  const products = await Product.find({ _id: { $in: productIds } });
  console.log("Fetched Products:", products);

  for (const orderItem of orderItems) {
    const productId = orderItem.productId._id.toString();
    const product = products.find(
      //   (product) => product._id.toString() === orderItem.productId.toString()
      (product) => product._id.toString() === productId
    );
    if (!product) {
      throw new Error(`Product with ID ${orderItem.productId} not found`);
    }
    console.log(
      `Product before update: ${product.name}, Quantity: ${product.totalQty}`
    );
  }
  // Prevent COD for orders above ₹1000
  if (paymentMethod === "COD" && totalPrice > 1000) {
    return res.status(400).json({
      success: false,
      message: "Cash on Delivery is not available for orders above ₹1000.",
    });
  }
  // Generate a unique order number
  const orderNumber = await generateUniqueOrderNumber();

  const order = await Order.create({
    user: user?._id,
    orderItems,
    shippingAddress,
    // totalPrice: couponFound
    //   ? parseFloat(totalPrice) - parseFloat(totalPrice) * discount
    //   : totalPrice,
    totalPrice:totalPrice<500?totalPrice+100:totalPrice,
    paymentMethod,
    couponCode: couponFound ? couponFound.code : "",
    orderNumber,
  });
  await order.save();

  if (shippingAddress) {
    // Normalize addresses for comparison
    const normalizeAddress = (address) => {
      return JSON.stringify({
        firstName: address.firstName?.toLowerCase().trim(),
        lastName: address.lastName?.toLowerCase().trim(),
        address: address.address?.toLowerCase().trim(),
        city: address.city?.toLowerCase().trim(),
        country: address.country?.toLowerCase().trim(),
        postalCode: address.postalCode?.toLowerCase().trim(),
        phone: address.phone?.toLowerCase().trim(),
        email: address.email?.toLowerCase().trim(),
      });
    };

    const existingAddresses = user.shippingAddress.map((address) =>
      normalizeAddress(address)
    );
    const newAddressString = normalizeAddress(shippingAddress);

    // Check if new address is already present
    if (!existingAddresses.includes(newAddressString)) {
      user.shippingAddress.push(shippingAddress); // Append new address
      user.hasShippingAddress = true;
    } else {
      console.log("Address already exists and was not added.");
    }
  }
  user.orders.push(order?._id);
  await user.save();

  // delete cart after placing order
  await Cart.deleteMany({ userId });
  // Handle Razorpay payment
  if (paymentMethod === "Wallet") {
    // Handle wallet payment
    const wallet = await Wallet.findOne({ userId });

    if (wallet.amount >= order.totalPrice) {
      // Deduct the amount from the wallet
      await wallet.addTransaction(
        "debit",
        order.totalPrice,
        `Order #${order._id}`
      );

      // Update order status to "Paid"
      order.paymentStatus = "Paid";
      await order.save();

      // Send response to the client
      return res.json({
        success: true,
        message: "Payment successfully deducted from wallet",
        order: order._id,
      });
    } else {
      // order.status = "Pending"; // Set the order status to Pending
      // Insufficient funds
      return res.json({
        success: false,
        message: "Insufficient funds in wallet",
      });
    }
  } else if (paymentMethod === "Razorpay") {
    try {
      const razorpayOrder = await createRazorpayOrder(
        order._id,
        order.totalPrice
      ); // Convert to paise (smallest unit of INR)
      console.log("razorpayorder:", razorpayOrder);
      // Send Razorpay details to the client for the modal
      //  return res.redirect(`/checkout?razorpayOrderId=${razorpayOrder.id}&razorpayKeyId=${process.env.RAZORPAY_KEY_ID}&totalPrice=${totalPrice}`);

      // return res.redirect(`/checkout?razorpayOrderId=${razorpayOrder.id}&razorpayKeyId=${process.env.RAZORPAY_KEY_ID}&totalPrice=${totalPrice}`);
      // Send Razorpay details to the client for the modal
      return res.json({
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        totalprice: order.totalPrice,
        order: order._id,
      });
    } catch (error) {
      console.error("Razorpay order creation failed:", error);
      return res.status(500).send("Razorpay order creation failed.");
    }
  } else {
    // Redirect for non-Razorpay payments (e.g., COD)

    return res.redirect("/orderconfirmation");
  }
});
// export const retryPayment =  asyncHandler(async (req, res) => {
//   const { orderId } = req.params;

//   const existingOrder = await Order.findById(orderId);
//   if (!existingOrder) {
//     return res.status(404).json({ message: "Order not found." });
//   }

//   // Recreate the Razorpay order
//   const razorpayOrder = await createRazorpayOrder(existingOrder._id, existingOrder.totalPrice);

//   // Send the order details to the client
//   return res.json({
//     razorpayOrderId: razorpayOrder.id,
//     razorpayKeyId: process.env.RAZORPAY_KEY_ID,
//     totalPrice: existingOrder.totalPrice,
//     order: existingOrder._id,
//   });
// });
// paymentController.js

// Route to create a new Razorpay order for retrying payment
export const retryPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
  console.log(orderId)
    try {
        // Fetch the order from the database
        const order = await Order.findById(orderId);
  
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
  
        // Create a new Razorpay order using the existing totalPrice
        const razorpayOrder = await createRazorpayOrder(order._id, order.totalPrice);
  
        res.json({
            success: true,
            razorpayKey: process.env.RAZORPAY_KEY_ID, // Razorpay key to be used in frontend
            amount: razorpayOrder.amount, // Amount in paise
            orderId: razorpayOrder.id, // New Razorpay order ID
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to retry payment' });
    }
  }
) 
// Route to verify Razorpay payment for retry
export const retryPaymentVerification= asyncHandler(async (req, res) => {
  const { paymentId, orderId, signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  // Verify Razorpay signature
  const isValid = verifyRazorpaySignature(orderId, paymentId, signature, secret);

  if (!isValid) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  // Update order status and payment status
  try {
      const order = await Order.findById(req.params.orderId);
      if (order) {
          order.paymentStatus = 'Paid';
          order.status = 'Processing'; // Update order status accordingly
          await order.save();

          res.json({ success: true });
      } else {
          res.status(404).json({ success: false, message: 'Order not found' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
})



export const getOrderConfirmation = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.userAuthId);
    // Find the most recent order for the user
    const order = await Order.findOne({ user: user._id }).sort({
      createdAt: -1,
    }); // Sort by creation date in descending order

    res.render("orderConfirmation", { user, orderNumber: order.orderNumber });
  } catch (error) {
    console.log(error.message);
  }
});
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find the order and get its details
    const order = await Order.findById(orderId).populate(
      "orderItems.productId"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status to 'cancelled'
    if (order.status !== "Cancelled") {
      await Order.findByIdAndUpdate(
        orderId,
        { status: "Cancelled" },
        { new: true }
      );

      // Retrieve product IDs from order items
      const productIds = order.orderItems.map((item) => item.productId._id);

      // Retrieve all products at once
      const products = await Product.find({ _id: { $in: productIds } });

      // Update quantities for each product
      for (const orderItem of order.orderItems) {
        const product = products.find(
          (product) =>
            product._id.toString() === orderItem.productId._id.toString()
        );

        if (product) {
          product.totalQty += orderItem.quantity;
          await product.save();
        } else {
          console.warn(`Product with ID ${orderItem.productId._id} not found`);
        }
      }
    }

    // Redirect or respond with a success message
    res.redirect("/profile"); // Adjust the redirect URL as needed
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const returnOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.status !== "Delivered") {
      return res.status(400).json({
        success: false,
        message:
          "Order cannot be returned. It is not delivered yet or has already been returned.",
      });
    }
    const wallet = await Wallet.findOne({ userId: order.user });
    if (!wallet) {
      return res
        .status(404)
        .json({ success: false, message: "Wallet not found" });
    }
    await wallet.addTransaction(
      "credit",
      order.totalPrice,
      `Refund for order ${order.orderNumber}`
    );
    order.status = "Returned";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order returned and amount credited to wallet",
    });
  } catch (error) {
    console.error("Return order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const userOrderDetails = asyncHandler(async (req, res) => {
  try {
    // const order = await Order.findById(req.params.id).populate('orderItems.product'); // Adjust according to your schema
    const user = await User.findById(req.userAuthId);
    const order = await Order.findById(req.params.id)
      .populate("user")
      .populate({
        path: "orderItems.productId", // Populate the productId field within orderItems
        select: " salesPrice name ", // Select only the fields you need
      });

    if (!order) return res.status(404).send("Order not found");
    res.render("orderDetail", { order, user });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

//admin
export const getOrderlists = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminAuthId);
    const { search } = req.query; 
    // Pagination logic
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 5; // Number of orders per page
     // Calculate the startIndex for pagination
     const startIndex = (page - 1) * limit;

    // Check if there is a search query and add it to the MongoDB query object
    let query = {};
    if (search) {
      query = { orderNumber: { $regex: search, $options: "i" } }; // Search for order by orderNumber
    }
    const totalOrders = await Order.countDocuments(query); // Total number of orders

    // Fetch the orders from the database
    const orders = await Order.find(query)
      .populate("user", "name email") // Populate user with name and email
      .populate("orderItems.productId", "name") // Populate order items with product name
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.render("order", {
      admin,
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      searchQuery: search || "" // Pass the search query back to the EJS for retaining the search input
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});
// export const getOrderStatus = asyncHandler(async (req, res) => {
//   try {
//     const admin = await Admin.findById(req.adminAuthId);
//     const orderId = req.params.id;
//     const order = await Order.findById(orderId);
//     res.render("editOrderStatus", { admin, order });
//   } catch (error) {
//     console.log(error.message);
//   }
// });
export const editOrderStatus = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Validate the status value
    if (
      ![
        "Pending",
        "Processing",
        "Cancelled",
        "Shipped",
        "Delivered",
        "Returned",
      ].includes(status)
    ) {
      return res.status(400).send("Invalid status");
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send("Order not found");
    }
    // Update the order status
    order.status = status;
    await order.save();
    // If the order status is "Delivered" and payment method is COD, set payment status to "Paid"
    if (status === "Delivered" && order.paymentMethod === "COD") {
      order.paymentStatus = "Paid";
    }

    await order.save();

    // Update product quantities
    if (order.status === "Cancelled") {
      const productIds = order.orderItems.map((item) => item.productId._id);
      const products = await Product.find({ _id: { $in: productIds } });

      for (const orderItem of order.orderItems) {
        const product = products.find(
          (product) =>
            product._id.toString() === orderItem.productId._id.toString()
        );
        if (product) {
          product.totalQty += orderItem.quantity;
          await product.save();
        } else {
          console.warn(`Product with ID ${orderItem.productId._id} not found`);
        }
      }
    }

    // Redirect back to the orders list or a success page
    // return res.redirect("/admin/order");
    return res
      .status(200)
      .json({ success: true, message: "Order status updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
export const orderDetail = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminAuthId);
    const order = await Order.findById(req.params.id)
      .populate("user")
      .populate({
        path: "orderItems.productId", // Populate the productId field within orderItems
        select: " salesPrice ", // Select only the fields you need
      });
    console.log(order);
    if (!order) {
      return res.status(404).send("Order not found");
    }
    res.render("orderDetail", { order, admin });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// export const verifyPayment = asyncHandler(async (req, res) => {
//   const { orderId, paymentId, signature, order } = req.body;
//   console.log("Request Body:", req.body);
//   console.log("Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET);

//   try {
//     const isValid = verifyRazorpaySignature(
//       orderId,
//       paymentId,
//       signature,
//       process.env.RAZORPAY_KEY_SECRET
//     );
//     console.log(isValid);

//     // if (!isValid) {
//     //   return res
//     //     .status(400)
//     //     .json({ success: false, message: "Invalid payment signature" });
//     // }

//     // Mark the order as paid
//     // const order = await Order.findOneAndUpdate(
//     //   { razorpayOrderId: orderId },
//     //   { paymentStatus: 'Paid', paymentId: paymentId },
//     //   { new: true }
//     // );
//     // const order = await Order.findOneAndUpdate(orderId,{paymentStatus:'paid'})
//     //     if (!order) {
//     //       return res.status(404).json({ success: false, message: 'Order not found' });
//     //     }

//     const orderObjectId = new mongoose.Types.ObjectId(order); // Convert order to ObjectId

//     if (isValid) {
//       await Order.findByIdAndUpdate(orderObjectId, {
//         paymentStatus: "paid",
//         status: "completed",
//       });
//       // Return success response
//       return res.status(200).json({ success: true });
//     } else {
//       await Order.findByIdAndUpdate(orderObjectId, {
//         paymentStatus: "Failed",
//         status:'Not completed'
//       });
//       res
//       .status(400)
//       .json({
//         success:false});
//       // res
//       //   .status(400)
//       //   .json({
//       //     message:
//       //       "Payment verification failed. Order status updated to failed.",
//       //   });
//       // Send a JSON response indicating failure and redirection
//       // return res.status(400).json({
//       //   success: false,
//       //   redirectUrl: '/profile', // Send the redirect URL
//       //   message: "Payment verification failed. Order status updated to failed.",
//       // });;
//     }
//   } catch (error) {
//     console.error("Payment verification failed:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Payment verification failed" });
//   }
// });
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, order } = req.body;

  try {
    const isValid = verifyRazorpaySignature(
      orderId,
      paymentId,
      signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    const orderObjectId = new mongoose.Types.ObjectId(order); // Convert order to ObjectId

    if (isValid) {
      const orderDetails = await Order.findById(orderObjectId);

      // If payment method is "Wallet", deduct amount from wallet
      if (orderDetails.paymentMethod === "Wallet") {
        const wallet = await Wallet.findOne({ userId: orderDetails.user });
        if (!wallet) {
          return res
            .status(404)
            .json({ success: false, message: "Wallet not found" });
        }

        try {
          // Deduct the total price from the wallet and update the wallet history
          await wallet.addTransaction(
            "debit",
            orderDetails.totalPrice,
            "Order payment via wallet"
          );
        } catch (error) {
          console.error("Failed to deduct from wallet:", error);
          return res
            .status(500)
            .json({ success: false, message: "Failed to deduct from wallet" });
        }
      }

      // Update order payment status to 'paid'
      await Order.findByIdAndUpdate(orderObjectId, {
        paymentStatus: "Paid",
        status: "Processing",
      });

      // Return success response
      return res.status(200).json({ success: true });
    } else {
      await Order.findByIdAndUpdate(orderObjectId, {
        paymentStatus: "Failed",
        status: "Pending",
      });
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Order status updated to failed.",
      });
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    return res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
});
export const updatePaymentFailure = asyncHandler(async (req, res) => {
  const { orderId, order } = req.body;

  try {
    const orderObjectId = new mongoose.Types.ObjectId(order); // Convert order to ObjectId
    await Order.findByIdAndUpdate(orderObjectId, {
      paymentStatus: "Failed",
      status: "Pending",
    });

    return res
      .status(200)
      .json({ success: true, message: 'Payment status updated to "Failed"' });
  } catch (error) {
    console.error("Failed to update payment status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update payment status" });
  }
});

import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";

export const getCheckout = asyncHandler(async(req,res)=>{
    try {
        const user = await User.findById(req.userAuthId);
        const userId = req.userAuthId;
        
        const orderItems = await Cart.find({ userId }).populate('productId')
        let subtotal = 0;
        orderItems.forEach(item => {
          subtotal += item.productId.salesPrice * item.quantity;
        });
        console.log('Subtotal:', subtotal);
        
        const validActiveCoupons = await Coupon.find({ endDate: { $gte: new Date() } }); // Fetch active coupons
        console.log('activecoupons',validActiveCoupons)
        const coupons= validActiveCoupons.filter(coupon => subtotal >= coupon.maximumPurchaseAmount);
        console.log('coupons',coupons)
        console.log(orderItems)
        // console.log(orderItems)
        
       
        res.render('checkout', {user,
          orderItems,
          subtotal,
          coupons
        });
      } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
      }
    
})
// export const getCheckout = asyncHandler(async (req, res) => {
//   try {
//       const user = await User.findById(req.userAuthId);
//       const userId = req.userAuthId;
//       const { orderId,couponCode } = req.query; // Get orderId from query parameters
//       console.log('orderId:',orderId);
//       console.log('couponCode:', couponCode);

//       let orderItems = [];
//       let subtotal = 0;
//       let coupons = [];

//       // If orderId is present, fetch the order details
//       if (orderId) {
//           const order = await Order.findById(orderId).populate('orderItems.productId');
//           if (!order) {
//               return res.status(404).send('Order not found');
//           }

//           // Fetch the cart items related to the order
//           orderItems = order.orderItems;
//           subtotal = order.totalPrice;

//           // Fetch active coupons
//           coupons = await Coupon.find({ endDate: { $gte: new Date() } });
//       } else {
//           // If no orderId, fetch cart items
//           orderItems = await Cart.find({ userId }).populate('productId');
//           coupons = await Coupon.find({ endDate: { $gte: new Date() } });

//           // Calculate subtotal
//           orderItems.forEach(item => {
//               subtotal += item.productId.salesPrice * item.quantity;
//           });
//       }

//       // Render the checkout page with the relevant data
//       res.render('checkout', { user, orderItems, subtotal, coupons });
//   } catch (error) {
//       console.error(error);
//       res.status(500).send('Server Error');
//   }
// });
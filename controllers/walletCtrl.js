import Wallet from "../models/wallet.js";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import { createRazorpayOrder,verifyRazorpaySignature } from "../utils/razorpayService.js";


export const addFunds = async (req, res) => {
    const { amount } = req.body;
    const userId = req.userAuthId // Assuming you have user data in req.user
    console.log('addfunds:',userId)
    console.log(amount)
  
    try {
      const razorpayOrder = await createRazorpayOrder(userId.toString(), amount);
      console.log('walletrazorpayorder:',razorpayOrder)
  
      res.json({
        success: true,
        orderId: razorpayOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ success: false, message: 'Error creating Razorpay order' });
    }
  };

  export const verifyWalletPayment = async (req, res) => {
    const { orderId, paymentId, signature, amount,  } = req.body;
    const userId = req.userAuthId
    console.log('reqbody:',req.body)
    console.log(userId)
  
    try {
      // Verify the Razorpay signature
      const isSignatureValid = verifyRazorpaySignature(orderId, paymentId, signature, process.env.RAZORPAY_KEY_SECRET);
      console.log('isSignatureValid:',isSignatureValid)
  
      if (!isSignatureValid) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
  
      // Fetch or create the user's wallet
      let wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        wallet = new Wallet({ userId, amount: 0, walletHistory: [] });
      }
  
      // Add the transaction to the wallet history
      await wallet.addTransaction('credit', amount, 'Funds added via Razorpay');
  
      // Return success response
      return res.json({ success: true, message: 'Payment verified and wallet updated' });
  
    } catch (error) {
      console.error('Error verifying payment:', error);
      return res.status(500).json({ success: false, message: 'Error verifying payment' });
    }
  };
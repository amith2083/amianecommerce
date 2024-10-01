// razorpayService.js
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,        // Razorpay Key ID from environment variables
  key_secret: process.env.RAZORPAY_KEY_SECRET // Razorpay Key Secret from environment variables
});

// Function to create a Razorpay order
export const createRazorpayOrder = async (orderId, amount) => {
  const options = {
    amount: Math.round(amount*100) , // Convert totalPrice to smallest currency unit (e.g., paise)
    currency: "INR",
    // receipt: `order_${orderId}`, // Custom receipt string
    receipt:""+orderId
  };

  try {
    // Create the Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create(options);
    return razorpayOrder;
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    throw new Error("Razorpay order creation failed");
  }
};

// Function to verify Razorpay signature
export const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  console.log(secret)
  const generatedSignature = crypto.createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  
  return generatedSignature === signature;
};

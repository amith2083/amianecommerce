import mongoose from "mongoose";
const Schema = mongoose.Schema;
//Generate random Nummbers for order
// const randomTxt = Math.random().toString(36).substring(7).toLocaleUpperCase();
// const randomNumber = Math.floor(1000+Math.random()*90000)
// Function to generate unique order number

const OrderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        type: Object,
        required: true,
      },
    ],
    // billingAddress:{
    //     type:Object,
    //     required:true
    // },
    shippingAddress: {
      type: Object,
      required: true,
    },
    orderNumber: {
      type: String,
      // default: randomTxt + randomNumber,
      required: true,
      unique: true,
    },
    couponCode: { type: String },
    //stripe payment
    paymentStatus: {
      type: String,
      default: "Not Paid",
      enum: ["Not Paid", "Paid", "Failed"],
    },

    paymentMethod: {
      type: String,
      default: "COD",
      enum: ["Razorpay", "COD", "Wallet"],
    },
    totalPrice: {
      type: Number,
      default: 0.0,
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Total price must be a non-negative number",
      },
    },
    // currency:{
    //     type:String,
    //     default:'Not specified'
    // },
    //for admin
    status: {
      type: String,
      default: "Processing",
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", OrderSchema);
export default Order;

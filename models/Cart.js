import mongoose from "mongoose";
const Schema = mongoose.Schema;
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    //   variant: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "product.variants",
    //     required: true,
    //   },
    //   color: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Color",
    //   },
    //   size: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Size",
    //     required: true,
    //   },
    quantity: {
      type: Number,
      required: true,
      // default:1
      // min: [1, `Quantity Can't be less than 1`],
    },
    size: {
      type: String,
    },
    //   itemTotal: {
    //     type: Number,
    //   },

    //   totalPrice: {
    //     type: Number,
    //   },
    //   coupon: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Coupon",
    //   },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    //   payable: {
    //     type: Number,
    //   },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;

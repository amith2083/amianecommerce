
import mongoose from "mongoose";
const Schema = mongoose.Schema;
const reviewSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true },
 
},{
    timestamps: true,  
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;

import mongoose from "mongoose";
const Schema = mongoose.Schema;
const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Enforces unique category names
      trim: true,
    },
    // admin:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'admin',
    //     required:true

    // },
    // status:{
    //     type:String,
    //     required:false

    // },
    status: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      // default:'http://picsum.photos/200/300',
      required: true,
    },
    offers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer",
      },
    ],
    // products:[{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'Product',
    //     // required:true

    // }],
  },
  { timestamps: true }
);
CategorySchema.pre("save", async function (next) {
  const categoryExists = await Category.findOne({ name: this.name });
  if (categoryExists) {
    const error = new Error("Category name must be unique");
    return next(error);
  }
  next();
});
const Category = mongoose.model("Category", CategorySchema);
export default Category;

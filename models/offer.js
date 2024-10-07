import mongoose from "mongoose";
import Product from "./Product.js";

const offerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    offerType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    offerValue: {
      type: Number,
      required: true,
      min: 0,
    },

    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
    },
    applicableToProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    applicableToCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "inactive",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtuals
// offerSchema.virtual('isExpired').get(function () {
//   return this.endDate < Date.now();
// });

// offerSchema.virtual('daysLeft').get(function () {
//   const daysLeft = Math.ceil((this.endDate - Date.now()) / (1000 * 60 * 60 * 24));
//   return daysLeft > 0 ? daysLeft : 0;
// });

// // Pre-save hooks for validation
// offerSchema.pre('validate', function (next) {
//   if (this.endDate < this.startDate) {
//     next(new Error('End date cannot be before start date'));
//   } else {
//     next();
//   }
// });
// // Ensure start date is not in the past
// offerSchema.pre('validate', function(next) {
//   if (this.startDate < Date.now()) {
//       next(new Error('Start date cannot be in the past'));
//   } else {
//       next();
//   }
// });

// // Ensure end date is not in the past
// offerSchema.pre('validate', function(next) {
//   if (this.endDate < Date.now()) {
//       next(new Error('End date cannot be in the past'));
//   } else {
//       next();
//   }
// });
// // Ensure offer value is valid based on the offer type
// offerSchema.pre('validate', function(next) {
//   if (this.offerType === 'percentage' && (this.offerValue <= 0 || this.offerValue > 100)) {
//       next(new Error('Offer value for percentage must be between 1 and 100'));
//   } else if (this.offerType === 'price' && this.offerValue <= 0) {
//       next(new Error('Offer value for price must be greater than 0'));
//   } else {
//       next();
//   }
// });
offerSchema.pre("save", function (next) {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set to the start of the day
  if (this.endDate < this.startDate) {
    return next(new Error("End date cannot be before start date"));
  }
  if (this.startDate < currentDate) {
    return next(new Error("Start date cannot be in the past"));
  }
  if (
    this.offerType === "percentage" &&
    (this.offerValue <= 0 || this.offerValue > 80)
  ) {
    return next(
      new Error("Offer value for percentage must be between 1 and 80")
    );
  }
  if (this.offerType === "fixed" && this.offerValue <= 0) {
    return next(
      new Error("Offer value for fixed amount must be greater than 0")
    );
  }
  next();
});

const Offer = mongoose.model("Offer", offerSchema);
export default Offer;

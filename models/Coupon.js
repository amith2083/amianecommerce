import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const couponSchema = new mongoose.Schema(
    {
        
        code: {
            type: String,
            required: true,
             unique: true,
              trim: true,

          },
          
          startDate: {
            type: Date,
            required: true,

          },
          endDate: {
            type: Date,
            required: true,

          },
          discount: {
            type: Number,
            required: true,
            min: 1, // Ensures discount is greater than 0
            max: 100, // Ensures discount is not greater than 100

          },
          description: {
            type: String,
        },
      userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      maximumPurchaseAmount: {
        type: Number,
        required:true
      },
      usageLimit: {
        type: Number,
        default: null,
      },
      count: {
        type: Number,
        default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
     
   
    },
    { timestamps: true,
        toJSON:{virtuals:true}
     }
  );
  
// Virtuals for expiry status and days left
// couponSchema.virtual('isExpired').get(function () {
//   return this.endDate < Date.now();
// });

// couponSchema.virtual('daysLeft').get(function () {
//   const daysLeft = Math.ceil((this.endDate - Date.now()) / (1000 * 60 * 60 * 24));
//   return daysLeft > 0 ? daysLeft : 0;
// });

// Validation Pre-save hooks
couponSchema.pre('save', function (next) {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set to the start of the day

  if (this.endDate < this.startDate) {
    return next(new Error('End date cannot be before start date'));
  }

  // Ensure start date is today or later
  if (this.startDate < currentDate) {
    return next(new Error('Start date cannot be in the past'));
  }

  // Set coupon status to expired if the end date has passed
  if (this.endDate < currentDate) {
    this.status = 'expired';
  }

  // Ensure discount is valid
  if (this.discount <= 0 || this.discount > 100) {
    return next(new Error('Discount must be between 1 and 100'));
  }

  next();
});
  //coupon expired
  // couponSchema.virtual('isExpired').get(function(){
  //   return this.endDate < Date.now()
  // });
  // couponSchema.virtual('daysLeft').get(function(){
  //   const daysLeft = Math.ceil((this.endDate-Date.now())/(1000*60*60*24) +" " +"daysLeft")
  //   return daysLeft > 0 ? daysLeft : 0;
  // });

  // //validation
  // couponSchema.pre('validate',function(next){
  //   if(this.endDate < this.startDate){
  //       next(new Error('enddate is cannot be less than startdate '))
  //   }
  //   next()
  // });
  // couponSchema.pre('validate',function(next){
  //   if(this.startDate < Date.now()){
  //       next(new Error('startdate is cannot be less than today'))
  //   }
  //   next()
  // });
  // couponSchema.pre('validate',function(next){
  //   if(this.endDate < Date.now()){
  //       next(new Error('enddate is cannot be less than today'))
  //   }
  //   next()
  // });

  // couponSchema.pre('validate',function(next){
  //   if(this.discount<=0||this.discount>100 ){
  //       next(new Error('discount cannot be lessthan 1 or greater than 100 '))
  //   }
  //   next()
  // });

  const Coupon = mongoose.model('Coupon',couponSchema);
export default Coupon;
  
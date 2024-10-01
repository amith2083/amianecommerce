import mongoose from 'mongoose';
import crypto from 'crypto';
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:false
    },
    googleId:{
        type:String,
        unique:true,
        // sparse: true // Allows for the googleId field to be missing (non-Google users),

    },
    mobno:{
        type:String,
        required:false,
        sparse:true,
        default:null
    },
    orders:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Order'
    }],
    wishList:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'wishList'
    }],
    isBlocked:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    hasShippingAddress:{
        type:Boolean,
        default:false
    },
    shippingAddress:[{
        firstName:{
            type:String

        },
        lastName:{
            type:String

        },
        address:{
            type:String

        },
        city:{
            type:String

        },
        postalCode:{
            type:String

        },
        // province:{
        //     type:String

        // },
        country:{
            type:String

        },
        phone:{
            type:String

        },
        email:{
            type:String

        },
        
        
      
    }],
    // Fields for Password Reset Functionality
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true // Allows for referralCode to be missing if not set
    },
    // Optional field to track who referred this user
    referredBy: {
        type: String // Store the referral code of the referrer
    }
    
    
    
},
{
    timestamps:true
});
// Function to generate a unique referral code
UserSchema.methods.generateReferralCode = function() {
    return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8-character hex code
};

// Middleware to generate a referral code before saving the user (if not already set)
UserSchema.pre('save', async function(next) {
    if (this.isNew && !this.referralCode) {
        let codeExists = true;
        while (codeExists) {
            const newCode = this.generateReferralCode();
            const existingUser = await mongoose.model('User').findOne({ referralCode: newCode });
            if (!existingUser) {
                this.referralCode = newCode;
                codeExists = false;
            }
        }
    }
    next();
});

// Static method to find a user by referral code
UserSchema.statics.findByReferralCode = async function(referralCode) {
    return this.findOne({ referralCode });
};


//compile schema to model
const User  = mongoose.model('User',UserSchema);
export default User;
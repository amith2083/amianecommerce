import mongoose from "mongoose";
const Schema = mongoose.Schema;

const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures each user has only one wallet
      index: true, // Indexing for better performance
    },
    amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
    walletHistory: [
      {
        transactionType: {
          type: String,
          enum: ["credit", "debit"],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: [0, "Transaction amount cannot be negative"], // Validation
        },
        balance: {
          type: Number,
          required: true,
          min: [0, "Balance cannot be negative"], // Validation
        },
        description: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);
WalletSchema.methods.addTransaction = async function (
  transactionType,
  amount,
  description
) {
  // const newBalance = this.amount + (transactionType === 'credit' ? amount : -amount);
  console.log("Type of this.amount:", typeof this.amount); // Should be 'number'
  console.log("Type of amount:", typeof amount); // Should be 'number
  const newBalance =
    transactionType === "credit"
      ? parseFloat(this.amount) + parseFloat(amount)
      : parseFloat(this.amount) - parseFloat(amount);

  if (newBalance < 0) {
    throw new Error("Insufficient funds");
  }

  this.walletHistory.push({
    transactionType,
    amount,
    balance: newBalance,
    description,
  });

  this.amount = newBalance;
  await this.save();
};

const Wallet = mongoose.model("Wallet", WalletSchema);
export default Wallet;

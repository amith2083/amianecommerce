import mongoose from "mongoose";
const Schema = mongoose.Schema;
const AdminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobno: {
      type: String,
      required: true,
    },

    isAdmin: {
      type: Boolean,
      default: true,
    },
    address: {
      name: {
        type: String,
      },
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      postalCode: {
        type: String,
      },

      country: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

//compile schema to model
const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import passport from "../config/passport.js";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import nocache from "nocache";

import path from "path";
import { fileURLToPath } from "url";
// import expressLayouts from 'express-ejs-layouts';
import dbConnect from "../config/dbConnect.js";
import { globalErrHandler, notFound } from "../middlewares/globalErrHandler.js";
import userRoutes from "../routes/usersRoute.js";
import adminRoutes from "../routes/adminRoute.js";

import cron from "node-cron";
import Offer from "../models/offer.js";
import Coupon from "../models/Coupon.js";
// import productRoutes from '../routes/productRoute.js';
// import categoryRoutes from '../routes/categoryRoute.js';

dbConnect();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(nocache());

// Middleware to prevent caching
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
app.use(methodOverride("_method"));
// Initialize Passport without sessions
app.use(passport.initialize());

// Serve static files
app.use(express.static(path.join(__dirname, "..", "public")));
// Use express-ejs-layouts
// app.use(expressLayouts)
app.set("view engine", "ejs");
// app.set('views', path.join(__dirname, '..', 'views/user'));

// Middleware to set the correct view directory based on the route
app.use((req, res, next) => {
  if (req.path.startsWith("/admin")) {
    app.set("views", path.join(__dirname, "..", "views/admin"));
    // res.locals.layout = path.join(__dirname, '..', 'views/layout/adminHeader');
  } else {
    app.set("views", path.join(__dirname, "..", "views/user"));
  }
  next();
});
// Apply wishlistCartCategoryMiddleware before routes
// app.use(wishlistCartCategoryMiddleware)
// Routes
app.use("/admin", adminRoutes);
app.use("/", userRoutes);

// Not found middleware
app.use(notFound);

// Error handling middleware
app.use(globalErrHandler);
// Set up a scheduled job using node-cron to update expired offers
cron.schedule("0 0 * * *", async () => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to the start of the day
    // Set expired offers if their end date has passed
    await Offer.updateMany(
      { endDate: { $lt: currentDate }, status: { $ne: "expired" } },
      { $set: { status: "expired" } }
    );
    console.log("Expired offers updated successfully");
  } catch (error) {
    console.error("Error updating expired offers:", error);
  }
});

// Schedule a job to update expired coupons at midnight
cron.schedule("* * * * *", async () => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to the start of the day

    // Set expired coupons if their end date has passed
    await Coupon.updateMany(
      { endDate: { $lt: currentDate }, status: { $ne: "expired" } },
      { $set: { status: "expired" } }
    );
    console.log("Expired coupons updated successfully");
  } catch (error) {
    console.error("Error updating expired coupons:", error);
  }
});
const PORT = process.env.PORT || 3000;
// const server = http.createServer(app)

app.listen(PORT, () => {
  console.log(`Server is running on port no: ${PORT}`);
});

// export default app;

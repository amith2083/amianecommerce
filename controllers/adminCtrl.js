import Admin from "../models/admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import { getAdminTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";
import {
  getTopSellingProducts,
  getTopSellingCategories,
} from "../utils/bestseller.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

let tempUserStore = {};

export const adminRegister = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch {
    console.log(error.message);
  }
};
export const adminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch {
    console.log(error.message);
  }
};
export const registerAdmin = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, mobno } = req.body;
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.render("adminLogin", { message: "admin already exists" });
      // throw new Error('user already exists');
    }
    // tempUserStore[email] = { name, email, password, mobno };
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Save admin data to database
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      mobno,
    });
    res.redirect("/admin/adminlogin");
  } catch (error) {
    console.log(error.message);
  }
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const adminFound = await Admin.findOne({ email });
  if (adminFound && (await bcrypt.compare(password, adminFound?.password))) {
    // return res.json({
    //     status:'success',
    //     msg:'user logged in',
    //     userFound,
    //     token: generateToken(userFound?._id)
    // })
    //     }
    //   throw new Error ('invalid login details')
    const token = generateToken(adminFound?._id);
    console.log(token);

    // Store token in a cookie
    res.cookie("adminToken", token, {
      httpOnly: false, // Accessible only by the web server
      secure: false, // Set to false for local development
      maxAge: 3600000, // 1 hour
    });
    return res.redirect("/admin/admindashboard");
    // return res.render('adminDashboard', {
    //     status: 'success',
    //     msg: 'Admin logged in',
    //     admin: adminFound,
    //     token: token
    // });
  }

  return res.render("adminLogin", { message: "Invalid login details" });
});

// export const verifyAdmin = async(req,res)=>{
//     try{
//         console.log(req.body.email)
//    const data = await Admin.findOne({email:req.body.email,isAdmin:true})
//    console.log(data)
//    if(data){
//        const matchedPassword = await bcrypt.compare(req.body.password,data.password)
//        if(matchedPassword){
//            req.session.adminData = {
//                id: data._id,
//                name:data._name,
//                email:data._email
//            }
//            return res.render('adminDashboard')
//        }
//        else{
//            console.log('password is wrong')
//            return res.render('adminLogin',{message:'email and password is not matching'})
//        }

//    }
//    else{
//        console.log('email is not found')
//        return res.render('adminLogin',{message: 'email is not found'})
//     }
//    }catch(error){
//        console.log(error.message)
//     }
//    }

export const adminDashboard = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminAuthId);
    const orders = await Order.find({ paymentStatus: "Paid" })
      .populate("user")
      .populate("orderItems.productId");
    const categories = await Category.find();
    // const revenue = await Order.aggregate([
    //     { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
    //   ]);
    const revenue = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } }, // Ensure aggregation only includes paid orders
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);

    const orderCount = await Order.countDocuments({ paymentStatus: "Paid" });
    const productCount = await Product.countDocuments({});
    const categoryCount = await Category.countDocuments({});
    const monthlyEarnings = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          monthlyEarnings: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // **Daily Sales for the last 7 days**
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          createdAt: { $gte: new Date(today - 6 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyLabels = [];
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split("T")[0];
      dailyLabels.push(dateString);
      const salesRecord = dailySalesData.find(
        (record) => record._id === dateString
      );
      dailyData.push(salesRecord ? salesRecord.totalSales : 0);
    }
    // for (let i = 6; i >= 0; i--) {
    //   const date = new Date(today - i * 24 * 60 * 60 * 1000);
    //   const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    //   dailyLabels.push(timeString); // X-axis will show time
    //   const salesRecord = dailySalesData.find(record => record._id === date.toISOString().split('T')[0]);
    //   dailyData.push(salesRecord ? salesRecord.totalSales : 0);
    // }
    // **Weekly Sales for the last 12 weeks**
    const weeklySalesData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          createdAt: { $gte: new Date(today - 12 * 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $isoWeek: "$createdAt" },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const weeklyLabels = [];
    const weeklyData = [];
    for (let i = 12; i >= 0; i--) {
      const weekDate = new Date(today - i * 7 * 24 * 60 * 60 * 1000);
      const weekNumber = getWeekNumber(weekDate);
      weeklyLabels.push(`Week ${weekNumber}`);
      const salesRecord = weeklySalesData.find(
        (record) => record._id === weekNumber
      );
      weeklyData.push(salesRecord ? salesRecord.totalSales : 0);
    }

    // Helper function to get week number
    function getWeekNumber(d) {
      const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
      const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    // **Monthly Sales for the last 12 months**
    const monthlySalesData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          createdAt: {
            $gte: new Date(today.getFullYear(), today.getMonth() - 11, 1),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyLabels = [];
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthNumber = monthDate.getMonth() + 1;
      const monthName = monthDate.toLocaleString("default", { month: "short" });
      monthlyLabels.push(monthName);
      const salesRecord = monthlySalesData.find(
        (record) => record._id === monthNumber
      );
      monthlyData.push(salesRecord ? salesRecord.totalSales : 0);
    }

    // **Yearly Sales for the last 5 years**
    const yearlySalesData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          createdAt: { $gte: new Date(today.getFullYear() - 5, 0, 1) },
        },
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const yearlyLabels = [];
    const yearlyData = [];
    for (let i = 5; i >= 0; i--) {
      const year = today.getFullYear() - i;
      yearlyLabels.push(`${year}`);
      const salesRecord = yearlySalesData.find((record) => record._id === year);
      yearlyData.push(salesRecord ? salesRecord.totalSales : 0);
    }

    res.render("adminDashboard", {
      admin,
      orders,
      categories,
      revenue: revenue[0]?.totalRevenue || 0,

      orderCount,
      productCount,
      categoryCount,
      monthlyEarnings: monthlyEarnings[0]?.monthlyEarnings || 0,
      dailyLabels,
      dailyData,
      weeklyLabels,
      weeklyData,
      monthlyLabels,
      monthlyData,
      yearlyLabels,
      yearlyData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// Controller function to generate sales report
// export const generateSalesReport = async (req, res) => {
//     try {
//       const { startDate, endDate } = req.body;

//       const orders = await Order.find({
//         createdAt: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate)
//         },
//         paymentStatus: 'Paid'
//       }).populate('user').populate('orderItems.productId');

//       res.json({ orders });
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send('Server error');
//     }
//   };
//   export const generateSalesReport = async (req, res) => {
//     try {
//         const { startDate, endDate } = req.body;

//         // Build the query based on whether startDate and endDate are provided
//         const query = {
//             paymentStatus: 'Paid'
//         };

//         if (startDate && endDate) {
//             query.createdAt = {
//                 $gte: new Date(startDate),
//                 $lte: new Date(endDate)
//             };
//         }

//         const orders = await Order.find(query).populate('user').populate('orderItems.productId');

//         res.json({ orders });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server error');
//     }
// };
// Route to render dashboard overview with best-selling products and categories
export const bestSelling = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminAuthId);

    const bestSellingProducts = await getTopSellingProducts();
    const bestSellingCategories = await getTopSellingCategories();

    res.render("bestSelling", {
      bestSellingProducts,
      bestSellingCategories,
      admin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export const generateSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.body;

    // Build the query based on whether startDate and endDate are provided
    const query = {
      paymentStatus: "Paid",
    };

    // if (startDate && endDate) {
    //     query.createdAt = {
    //         $gte: new Date(startDate),
    //         $lte: new Date(endDate)
    //     };
    // }
    //   if (startDate && endDate) {
    //     const start = new Date(startDate);
    //     const end = new Date(endDate);
    //     end.setHours(23, 59, 59, 999);  // Set end date to the end of the day

    //     query.createdAt = {
    //         $gte: start,
    //         $lte: end
    //     };
    // }

    const skip = (page - 1) * limit;

    const orders = await Order.find({
      createdAt: {
        $gte: new Date(startDate), // Start date is as-is
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)), // Set end date to the end of the day
      },
      paymentStatus: "Paid", // Filter for paid orders
    })
      .populate("user")
      .populate("orderItems.productId")
      .skip(skip)
      .limit(limit);
    // Populate coupon details for each order
    
    console.log("orders", orders);
   
    const ordersWithDiscount = await Promise.all(
      orders.map(async (order) => {
        let couponDiscount = 0;
        if (order.couponCode) {
          const coupon = await Coupon.findOne({ code: order.couponCode });
          if (coupon) {
            couponDiscount = (order.totalPrice * coupon.discount) / 100;
          }
        }
        console.log("Calculated couponDiscount:", couponDiscount);
        return {
          ...order.toObject(), // Convert mongoose document to plain object
          couponDiscount: couponDiscount,
        };
      })
    );
    console.log("f", ordersWithDiscount);

    // Count total documents for pagination
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({ orders: ordersWithDiscount, totalOrders, totalPages });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

// export const generatePdfReport = (req, res) => {
//     const doc = new PDFDocument();
//     let filename = 'report.pdf';
//     res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
//     res.setHeader('Content-type', 'application/pdf');
//     doc.pipe(res);

//     // Example content
//     doc.fontSize(25).text('Sales Report', {
//       align: 'center'
//     });

//     doc.text(`Date: ${new Date().toLocaleDateString()}`, {
//       align: 'right'
//     });

//     doc.moveDown();
//     doc.fontSize(14).text('Revenue: Rs 5000');
//     doc.text('Orders: 100');
//     doc.text('Products Sold: 250');

//     doc.end();
//   };

//   export const generateExcelReport = async (req, res) => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Sales Report');

//     // Example content
//     worksheet.columns = [
//       { header: 'Metric', key: 'metric', width: 30 },
//       { header: 'Value', key: 'value', width: 30 }
//     ];

//     worksheet.addRow({ metric: 'Revenue', value: 'Rs 5000' });
//     worksheet.addRow({ metric: 'Orders', value: '100' });
//     worksheet.addRow({ metric: 'Products Sold', value: '250' });

//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');

//     await workbook.xlsx.write(res);
//     res.end();
//   };

// export const getInvoice= asyncHandler(async(req,res)=>{
//   const admin = await Admin.findById(req.adminAuthId);
//   res.render('invoice',{admin})
// })

export const logoutAdmin = asyncHandler(async (req, res) => {
  try {
    // Invalidate the token by removing it from the client
    res.cookie("adminToken", "", { maxAge: 1 }); // This sets the token cookie to expire immediately

    // If you have a token store or blacklist, add the token to it
    // const token = req.cookies.token || req.header('Authorization').replace('Bearer ', '');
    // tokenBlacklist.add(token);

    // Respond with a success message
    res.redirect("/admin/adminlogin");
  } catch (error) {
    console.error("Error during logout:", error);
    res
      .status(500)
      .json({
        message: "An error occurred during logout. Please try again later.",
      });
  }
});

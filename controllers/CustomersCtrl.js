import User from "../models/User.js";
import Admin from "../models/admin.js";
import asyncHandler from "express-async-handler";
export const getCustomers = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminAuthId);

    const { page = 1, limit = 2, search = "" } = req.query;

    // Filter customers based on the search query
    const query = search
      ? { name: { $regex: search, $options: "i" } } // case-insensitive search
      : {};

    // Paginate customers
    const customers = await User.find(query)
      .skip((page - 1) * limit) // Skip the previous pages
      .limit(parseInt(limit)) // Limit the number of customers per page
      .exec();
    // Count the total number of documents for pagination
    const totalCustomers = await User.countDocuments(query);

    // Render the view with customers, current page, total pages, and search term
    res.render("getCustomers", {
      customers,
      admin,
      currentPage: page,
      totalPages: Math.ceil(totalCustomers / limit),
      searchTerm: search,
    });
  } catch (error) {
    console.log(error.message);
  }
};
// Edit user
// export const editCustomer= async (req, res) => {

//     try {

//         const user = await User.findById(req.params.id);

//         res.render('editUsers', { user });
//     } catch (error) {
//         console.log(error.message);
//     }
// };
// export const blockCustomer= asyncHandler(async(req, res) => {
//     try {
//         const customer = await User.findByIdAndUpdate(req.params.id,{isBlocked:true},{new:true});
//         // users.name = req.body.name;
//         // users.email = req.body.email;
//         // users.mobno = req.body.mobno;
//         // if (req.body.status==='block') {
//         //     users.isBlocked = true;
//         // } else if (req.body.status==='unblock') {
//         //     users.isBlocked = false;
//         // }

//         await customer.save();
//         res.redirect('/admin/customerslist');
//     } catch (error) {
//         console.log(error.message);
//     }
// }) ;
export const blockCustomer = asyncHandler(async (req, res) => {
  console.log("Request received to update customer:", req.params.id, req.body);
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const customer = await User.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.isBlocked = isBlocked;
    await customer.save();

    // res.status(200).json({ message: 'Customer status updated', isBlocked: customer.isBlocked });
    res.redirect("/admin/customerslist");
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

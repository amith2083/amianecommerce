import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Admin from "../models/admin.js";
import { escapeXML } from "ejs";

export const getCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5; // Default limit per page
  const startIndex = (page - 1) * limit;
  const total = await Category.countDocuments();
  const admin = await Admin.findById(req.adminAuthId);

  const categories = await Category.find()
    .skip(startIndex)
    .limit(limit)
    .sort({ createdAt: -1 });
  // res.json({
  //     status:'success',
  //     msg:'All categories fetched successfully',
  //     categories
  // })
  return res.render("addCategories", {
    categories,
    admin,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    limit,
    error: req.query.error || null,
    success: req.query.success || null,
  });
});

// export const addCategories = asyncHandler(async(req,res)=>{
//     try{

//        return res.render('addCategories',{categories})
//     }catch(error){
//     console.log(error.message)
//     }

// })
export const editCategory = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminAuthId);
    const category = await Category.findById(req.params.id);
    return res.render("editCategories", { category, admin });
  } catch (error) {
    console.log(error.message);
  }
});
export const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    const imageURL = req.file.path;

    // Validate input
    if (!name || !req.file) {
      return res.status(400).json({
        status: "error",
        message: "Name and Image are required to create a category.",
      });
    }

    // const upperCaseName = name.toUpperCase();
    // Capitalize the first letter and make the rest lowercase
    const formattedName =
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    console.log(formattedName);

    // Create a new category
    const newCategory = new Category({
      name: formattedName,
      // admin: req.adminAuthId, // Assuming `req.adminAuthId` holds the admin ID
      image: imageURL,
    });

    // Save category
    const savedCategory = await newCategory.save();

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      category: savedCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate name error
      return res
        .status(400)
        .json({ status: "error", message: "Category name already exists" });
    } else if (error.message) {
      return res.status(400).json({ status: "error", message: error.message });
    } else {
      console.error("Error creating category:", error);
      return res.status(500).json({ status: "error", message: "Server error" });
    }
  }
});
// export const createCategory = asyncHandler(async (req, res) => {
//   try {
//     const { name } = req.body;
//     // const imageURL = req.file.path;
//     const imageURL = `/uploads/${req.file.filename.replace(/\\/g, '/')}`; // Ensure forward slashes

//     // Validate input
//     if (!name || !req.file) {
//       return res.status(400).json({
//         status: "error",
//         message: "Name and Image are required to create a category.",
//       });
//     }

//     // const upperCaseName = name.toUpperCase();
//     // Capitalize the first letter and make the rest lowercase
//     const formattedName =
//       name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
//     console.log(formattedName);

//     // Create a new category
//     const newCategory = new Category({
//       name: formattedName,
//       // admin: req.adminAuthId, // Assuming `req.adminAuthId` holds the admin ID
//       image: imageURL,
//     });

//     // Save category
//     const savedCategory = await newCategory.save();

//     res.status(201).json({
//       status: "success",
//       message: "Category created successfully",
//       category: savedCategory,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       // Handle duplicate name error
//       return res
//         .status(400)
//         .json({ status: "error", message: "Category name already exists" });
//     } else if (error.message) {
//       return res.status(400).json({ status: "error", message: error.message });
//     } else {
//       console.error("Error creating category:", error);
//       return res.status(500).json({ status: "error", message: "Server error" });
//     }
//   }
// });

export const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    let updateData = { name };

    if (req.file) {
      updateData.image = req.file.path; // Assuming the path of the uploaded file is stored in the database
    }

    // const category = await Category.findByIdAndUpdate(req.params.id,{name,image},{new:true});
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    );
    res.json({
      status: "success",
      msg: " category updated successfully",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate name error
      return res
        .status(400)
        .json({ status: "error", message: "Category name already exists" });
    }
  }
  // return res.redirect("/admin/addcategories");
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);

  // res.json({
  //     status:'success',
  //     msg:' category deleted successfully',
  //     category
  // })
  return res.redirect("/admin/addcategories");
});

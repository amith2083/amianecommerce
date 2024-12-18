import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Admin from "../models/admin.js";

export const addProduct = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminAuthId);
    const categories = await Category.find();

    return res.render("addProducts", { categories, admin });
  } catch (error) {
    console.log(error.message);
  }
});
export const productsList = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminAuthId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6; // Set the default limit per page
    const startIndex = (page - 1) * limit;
    const total = await Product.countDocuments();
    const products = await Product.find()
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.render("productsList", {
      products,
      admin,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.log(error.message);
  }
});
export const editProduct = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminAuthId);
    const product = await Product.findById(req.params.id);
    const categories = await Category.find();
    return res.render("editProduct", { product, categories, admin });
  } catch (error) {
    console.log(error.message);
  }
});
export const createProduct = asyncHandler(async (req, res) => {
  try {
    // console.log(req.files);
    //find the category
    // Find the category by ID or name
    const categoryName = req.body.category; // Assuming 'category' is the name in the form
    const categoryFound = await Category.findOne({ name: categoryName });

    if (!categoryFound) {
      throw new Error("Category not found");
    }

    // Define default sizes
    const defaultSizes = ["S", "M", "L", "XL", "XXL"];
    const {
      name,
      description,
      brand,
      category,
      sizes,
      normalPrice,
      salesPrice,
      totalQty,
    } = req.body;
    const productExists = await Product.findOne({ name });
    console.log(productExists);
    if (productExists) {
      throw new Error("product already exists");
    }
    //create product
    const convertedImages = req.files.map((file) => file.path);
    console.log(convertedImages);
    const product = await Product.create({
      name,
      description,
      brand,
      category: categoryFound._id,
      sizes: defaultSizes,
      // colors,

      normalPrice,
      salesPrice,
      totalQty,
      images: convertedImages,
    });
    console.log(product);
    //push product into category
    // categoryFound.products.push(product._id)
    // await categoryFound.save()

    // return  res.redirect('/admin/productslist')
    // res.status(201).json({
    //     status:'success',
    //     msg:'product created successfully',
    //     product

    // })
    res.status(200).json({ success: true, message: 'Product added successfully',product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Product creation failed', error: error.message });
  }
});
//get all products

// export const getProducts = asyncHandler(async(req,res)=>{
//     const  products = await Product.find();
//     console.log(products)
//     res.json({
//         status:'success',
//         products
//     })
// });
//fetching single product
// export const singleProduct = asyncHandler(async(req,res)=>{
//     const product = await Product.findById(req.params.id)
//     console.log(product)
//     if(!product){
//         throw new Error('product not found');
//     }
//         res.json({
//             status:'success',
//             msg:'single product fetched successfully',
//             product
//         })

// });

export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, brand, category, price, totalQty, removedImages } =
    req.body;

  console.log("req.body", req.body);
  console.log("req.files", req.files);
  // Find the product by its ID
  const product = await Product.findById(req.params.id);

  // let updateData = { name,description,brand,category,price,totalQty };

  // if (req.files) {
  //   updateData.images = req.files.path; // Assuming the path of the uploaded file is stored in the database
  // }
  // const updatedProduct = await Product.findByIdAndUpdate(req.params.id,updateData,
  //     {new:true}

  // )

  // Check if there are new images
  // let updatedImages = [];
  // if (req.files && req.files.length > 0) {
  //   updatedImages = req.files.map((file) => file.path);
  // }

  // Prepare new images array
  // Handle removed images
  let removedImagesArray = removedImages ? JSON.parse(removedImages) : [];

  // Update the images field by filtering out the removed images
  product.images = product.images.filter(
    (img) => !removedImagesArray.includes(img)
  );

  // Handle new images
  //  const croppedImages = req.files['croppedImage-0']; // Access the cropped images
  let newImages = [];
  if (Array.isArray(req.files)) {
    // If files are in an array
    newImages = req.files.map((file) => file.path);
  } else if (req.files && typeof req.files === "object") {
    // If files are an object (e.g., {'croppedImage-0': {...}})
    for (const key in req.files) {
      newImages.push(req.files[key].path);
    }
  }

  // Add new images to the existing ones
  product.images = product.images.concat(newImages);

  //  // Handle removed images
  //  let removedImages = [];
  //  if (req.body.removedImages) {
  //    removedImages = req.body.removedImages.split(',');
  //  }
  //  // Handle new images
  // const newImages = req.files ? req.files.map(file => file.path) : [];
  // Handle removed images
  //  let removedImagesArray = [];
  //

  // Update product fields
  product.name = name || product.name;
  product.description = description || product.description;
  product.brand = brand || product.brand;
  product.category = category || product.category;
  product.price = price || product.price;
  product.totalQty = totalQty || product.totalQty;
  // product.images = removedImagesArray.length > 0 ? updatedImages.concat(newImages) : updatedImages;

  // If there are new images, update the images field
  // if (updatedImages.length > 0) {
  //   product.images = updatedImages;
  // }

  // Save the updated product
  // const updatedProduct = await product.save();
  await product.save();
  // return res.redirect("/admin/productslist");
  res.json({
    status: "success",
    msg: "Product updated successfully",
  });
});
// export const updateProduct = asyncHandler(async (req, res) => {
//   try {
//     const { name, description, brand, category, price, totalQty, removedImages } = req.body;

//     // Find the product by its ID
//     const product = await Product.findById(req.params.id);
//     if (!product) throw new Error("Product not found");

//     // Process images: Remove the images that the user has marked for removal
//     const removedImagesArray = removedImages ? JSON.parse(removedImages) : [];
//     product.images = product.images.filter(img => !removedImagesArray.includes(img));

//     // Add any new uploaded images
//     let newImages = [];
//     if (req.files && Array.isArray(req.files)) {
//       newImages = req.files.map((file) => `/uploads/${file.filename}`);
//     } else if (req.files && typeof req.files === "object") {
//       // Handle when `req.files` is an object, as in the case of multiple named fields
//       for (const key in req.files) {
//         if (Array.isArray(req.files[key])) {
//           newImages = req.files[key].map((file) => `/uploads/${file.filename}`);
//         } else {
//           newImages.push(`/uploads/${req.files[key].filename}`);
//         }
//       }
//     }

//     // Append new images to the product
//     product.images = product.images.concat(newImages);

//     // Update other product details
//     product.name = name || product.name;
//     product.description = description || product.description;
//     product.brand = brand || product.brand;
//     product.category = category || product.category;
//     product.price = price || product.price;
//     product.totalQty = totalQty || product.totalQty;

//     // Save the updated product
//     const updatedProduct = await product.save();

//     res.status(200).json({ status: 'success', msg: "Product updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: 'error', msg: "Product update failed", error: error.message });
//   }
// });

export const deleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);

  // res.json({
  //     status:'success',
  //     msg:'single product deleted successfully',
  //     product
  // })
  res.redirect("/admin/productslist");
});

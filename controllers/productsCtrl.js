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
    const products = await Product.find().skip(startIndex).limit(limit).sort({ createdAt: -1 });
    
    return res.render("productsList", { products, admin ,currentPage: page,
        totalPages: Math.ceil(total / limit),limit});
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
     throw new Error('Category not found');
   }
   
    // Define default sizes
    const defaultSizes = ["S", "M", "L", "XL", "XXL"];
    const {
      name,
      description,
      brand,
      category,
      sizes,
      admin,
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
      category:categoryFound._id,
      sizes: defaultSizes,
      // colors,
      admin: req.adminAuthId,
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
    res
      .status(201)
      .json({ success: true, msg: "Product created successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
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
  const { name, description, brand, category, price, totalQty,removedImages } = req.body;
 
  console.log('req.body', req.body);
  console.log('req.files', req.files);
 
 

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
 product.images = product.images.filter(img => !removedImagesArray.includes(img));

 // Handle new images
 const croppedImages = req.files['croppedImage-0']; // Access the cropped images
 const newImages = req.files ? req.files.map(file => file.path) : [];

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
    status: 'success',
    msg: 'Product updated successfully'
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);

  // res.json({
  //     status:'success',
  //     msg:'single product deleted successfully',
  //     product
  // })
  res.redirect("/admin/productslist");
});

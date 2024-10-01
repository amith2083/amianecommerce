import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

// Fetch top 3 selling products
export async function getTopSellingProducts() {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.productId._id", // Use the nested _id field
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      { $limit: 5 },
    ]);
    console.log("topproducts", topProducts);

    // Extract product IDs
    const topProductIds = topProducts.map((product) => product._id);
    // Check if they are ObjectIds or strings
    // topProductIds.forEach(id => {
    //   console.log(`ID: ${id}, Type: ${typeof id}`);
    //   console.log(`Is ObjectId: ${id instanceof mongoose.Types.ObjectId}`);
    // });

    // Step 2: Find products based on IDs
    const products = await Product.find({
      _id: { $in: topProductIds },
    }).populate({
      path: "category",
      select: "name", // Only select the name field from the category
    });

    console.log(products);

    // Merge topProducts count into products array
    const mergedProducts = products.map((product) => {
      // Convert ObjectId to string for comparison
      const productIdString = product._id.toString();

      // Find the matching topProduct by _id (as a string)
      const topProduct = topProducts.find(
        (tp) => tp._id.toString() === productIdString
      );

      // If found, add the count to the product object
      if (topProduct) {
        return { ...product.toObject(), count: topProduct.count }; // Use toObject() to convert Mongoose document to plain object
      }

      // If not found, return the product as is
      return product.toObject();
    });

    // Sort merged products by count in descending order
    const sortedProducts = mergedProducts.sort((a, b) => b.count - a.count);

    return sortedProducts;
  } catch (error) {
    console.error("Error fetching top-selling products:", error);
    throw error;
  }
}

//-------------------------------------------------------------------------------------------------------------------------------------

export async function getTopSellingCategories() {
  const topCategories = await Order.aggregate([
    { $unwind: "$orderItems" },

    {
      $group: {
        _id: "$orderItems.productId._id", // Use the nested _id field
        count: { $sum: 1 },
      },
    },

    // { $unwind: "$product" },
  ]);
  const topProductIds = topCategories.map((product) => product._id);

  // Find products that match the top product IDs and get only the categoryId
  const productsWithCategories = await Product.find(
    {
      _id: { $in: topProductIds }, // Match products with the top product IDs
    },
    { category: 1, _id: 1 }
  ); // Only select the categoryId and _id
  console.log("dog", productsWithCategories);
  // return topCategories;
  console.log("cat", topCategories);

  // Step 4: Create a map to accumulate counts by category
  const categoryCounts = productsWithCategories.reduce((acc, product) => {
    const categoryId = product.category.toString(); // Get categoryId as a string
    const productCount = topCategories.find(
      (p) => p._id.toString() === product._id.toString()
    ).count; // Find count of this product

    if (acc[categoryId]) {
      acc[categoryId] += productCount; // Add the count if category already exists
    } else {
      acc[categoryId] = productCount; // Initialize the count for a new category
    }
    return acc;
  }, {});

  // Step 5: Sort and get top categories
  const sortedCategories = Object.entries(categoryCounts)
    .sort(([, countA], [, countB]) => countB - countA) // Sort categories by count in descending order
    .slice(0, 3); // Limit to top 3 categories

  // Step 6: Fetch the full details for the top categories
  const categoryIds = sortedCategories.map(([categoryId]) => categoryId);
  const fullCategoryDetails = await Category.find({
    _id: { $in: categoryIds },
  });

  // Combine the count and category details
  const topCategoriesWithDetails = sortedCategories.map(
    ([categoryId, count]) => {
      const category = fullCategoryDetails.find(
        (c) => c._id.toString() === categoryId
      );
      return {
        ...category.toObject(),
        count, // Add the count to the category details
      };
    }
  );

  console.log(
    "Top 3 Best-Selling Categories with Details:",
    topCategoriesWithDetails
  );
  return topCategoriesWithDetails;
}

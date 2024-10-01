import Cart from "../models/Cart.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import asyncHandler from "express-async-handler";

export const loadCart = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.userAuthId);
    const userId = req.userAuthId;
    const categories = await Category.find();
    // Find the cart for the user and populate the product details
    const cart = await Cart.find({ userId }).populate("productId");
    console.log(cart);
    let subtotal = 0;
    cart.forEach((item) => {
      subtotal += item.quantity * item.productId.salesPrice;
    });

    res.render("cart", { user, cart, subtotal, categories });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.userAuthId;
  const { productId, quantity, size } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Convert quantity to a number
    // const quantityToAdd = parseInt(quantity, 10);
    // Log for debugging
    //   console.log(`Received quantity: ${quantity}, Parsed quantity: ${quantityToAdd}`);

    // if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
    //     return res.status(400).json({ message: 'Invalid quantity' });
    // }
    const quantity = 1;
    let cart = await Cart.findOne({ userId, productId });

    if (!cart) {
      // Create a new cart if none exists
      cart = new Cart({ userId, productId, quantity, size });
      product.totalQty -= quantity;
    } else {
      cart.quantity += parseInt(quantity);
    }

    await cart.save();
    await product.save();
    res.redirect("/cart"); // Redirect to the cart page or any other pag
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
});
// export const addToCart = asyncHandler(async (req, res) => {
//     try {
//         const userId = req.userAuthId;
//         const { productId, quantity } = req.body;

//         // Find the product
//         const product = await Product.findById(productId);

//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         // Check if the product is already in the user's cart
//         let cartItem = await Cart.findOne({ userId, productId });

//         if (cartItem) {
//             // If the product is already in the cart, update the quantity
//             cartItem.quantity += quantity;
//         } else {
//             // If not, create a new cart item
//             cartItem = new Cart({
//                 userId,
//                 productId,
//                 quantity
//             });
//         }

//         // Save the cart item
//         await cartItem.save();

//         // Decrease the totalQty in the Product collection only if it's being added for the first time
//         product.totalQty -= quantity;
//         await product.save();

//        return res.redirect('/cart');
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

// export const updateCart = asyncHandler(async(req, res) => {
//     const { itemId } = req.params;
//     const { quantity } = req.body;
//     console.log(quantity)

//     try {

//         // Find the cart item by ID and update quantity
//         const cartItem = await Cart.findById(itemId).populate('productId')
//         if (cartItem) {

//             const product = await Product.findById(cartItem.productId._id);

//             // if (!product) {
//             //     return res.status(404).json({ success: false, message: 'Product not found' });
//             // }
//             // const product = cartItem.productId;
//             const previousQuantity = cartItem.quantity;
//         const difference = quantity - previousQuantity;
//         if (product.totalQty <= 0) {
//             return res.status(400).json({ success: false, message: 'No stock available' });
//         }
//             // // Ensure the requested quantity does not exceed available stock
//             // if ( product.totalQty < difference) {
//             //     return res.status(400).json({ success: false,message: 'Not enough stock available' });
//             // }

//             cartItem.quantity = quantity;
//             await cartItem.save();
//             //    // Update product stock
//                product.totalQty -= difference;
//                if (product.totalQty < 0) product.totalQty = 0; // Ensure totalQty doesn't go below zero
//                await product.save();

//             // Recalculate cart subtotal and total
//             const userCartItems = await Cart.find({ userId: cartItem.userId }).populate('productId');
//             const subtotal = userCartItems.reduce((acc, item) => acc + (item.quantity * item.productId.salesPrice), 0);

//             res.json({ success: true, subtotal,products: userCartItems.map(item => ({
//                 itemId: item._id,
//                 totalQty: item.productId.totalQty
//             })) });
//         } else {
//             res.status(404).json({ success: false, message: 'Item not found' });

//         }
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// });

export const updateCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    // Find the cart item by ID
    const cartItem = await Cart.findById(itemId).populate("productId");
    if (cartItem) {
      const product = cartItem.productId;
      const previousQuantity = cartItem.quantity;
      const difference = quantity - previousQuantity;

      // Ensure totalQty doesn't go below zero
      if (product.totalQty <= 0 && difference > 0) {
        return res
          .status(400)
          .json({ success: false, message: "No stock available" });
      }

      // Update the cart quantity and adjust the product's totalQty accordingly
      if (difference > 0) {
        // User is increasing quantity
        if (product.totalQty < difference) {
          return res
            .status(400)
            .json({ success: false, message: "Not enough stock available" });
        }
        cartItem.quantity += difference;
        product.totalQty -= difference;
      } else if (difference < 0) {
        // User is decreasing quantity
        cartItem.quantity += difference;
        product.totalQty -= difference; // This will add the difference to totalQty
      }

      // Save the cart item and product
      await cartItem.save();
      await product.save();

      // Recalculate the cart subtotal
      const userCartItems = await Cart.find({
        userId: cartItem.userId,
      }).populate("productId");
      const subtotal = userCartItems.reduce(
        (acc, item) => acc + item.quantity * item.productId.salesPrice,
        0
      );

      return res.json({
        success: true,
        subtotal,
        products: userCartItems.map((item) => ({
          itemId: item._id,
          totalQty: item.productId.totalQty,
        })),
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export const removeFromCart = asyncHandler(async (req, res) => {
  // const userId = req.userAuthId;
  // const productId = req.params.productId;
  const cartItemId = req.params.id;
  console.log(req.params.id);

  try {
    // Find the user's cart
    //  await Cart.findByIdAndDelete(req.params.id);
    // Find the cart item by its ID and populate the product details
    const cartItem = await Cart.findById(cartItemId);

    // If the cart item is not found, respond with a 404 status
    if (!cartItem) {
      return res.status(404).send("Cart item not found");
    }
    // Find the associated product
    const productId = cartItem.productId;
    const quantity = cartItem.quantity;
    // Locate the item within the cart items array

    // Update the totalQty of the associated product by incrementing it with the item's quantity
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { totalQty: quantity } } // Increase the totalQty by the quantity of the removed item
    );

    // Delete the cart item from the cart collection
    await Cart.findByIdAndDelete(cartItemId);

    // if (cart) {
    //     // Find the index of the item to be removed
    //     const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    //     if (itemIndex > -1) {
    //         // Remove the item from the cart
    //         cart.items.splice(itemIndex, 1);

    //         await cart.save();
    //         res.redirect('/cart'); // Redirect to the cart page or any other page
    //     } else {
    //         res.status(404).send('Item not found in cart');
    //     }
    // } else {
    //     res.status(404).send('Cart not found');
    // }
    return res.redirect("/cart");
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
});

import Sale from "../models/Sale.model.js";
import Product from "../models/product.model.js";

export const createSale = async (req, res) => {
  try {
    let { items, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items are required" });
    }

    // If totalAmount is not provided, calculate it from items
    if (!totalAmount || totalAmount <= 0) {
      // Fetch product prices and calculate total
      let calculatedTotal = 0;
      const processedItems = [];

      for (const item of items) {
        const productId = item.productId || item.product;
        const qty = item.qty || item.quantity || 1;

        if (!productId) {
          return res.status(400).json({ success: false, message: "Invalid item: missing product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
          return res.status(400).json({ success: false, message: `Product not found: ${productId}` });
        }

        calculatedTotal += product.price * qty;
        processedItems.push({
          product: productId,
          quantity: qty,
          price: product.price
        });
      }

      totalAmount = calculatedTotal;
      items = processedItems;
    } else {
      // Ensure items have the correct structure
      items = items.map(item => ({
        product: item.productId || item.product,
        quantity: item.qty || item.quantity || 1,
        price: item.price || 0
      }));
    }

    const sale = await Sale.create({
      user: req.user._id,
      items,
      totalAmount,
      status: "completed"
    });

    const populatedSale = await Sale.findById(sale._id)
      .populate("user", "name email")
      .populate("items.product", "name price");

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: populatedSale
    });
  } catch (error) {
    console.error("Error in createSale:", error.message);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// Get user's own purchase history
export const getUserSales = async (req, res) => {
  try {
    const userId = req.user._id;
    const sales = await Sale.find({ user: userId })
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: sales
    });
  } catch (error) {
    console.error("Error in getUserSales:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all sales (admin only)
export const listSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("user", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: sales
    });
  } catch (error) {
    console.error("Error in listSales:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findByIdAndDelete(id);
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    res.status(200).json({
      success: true,
      message: "Sale deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteSale:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findById(id)
      .populate("user", "name email")
      .populate("items.product", "name price image");

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    // Check if user is authorized to view this sale
    if (sale.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error("Error in getSaleById:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

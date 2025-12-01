import Sale from "../models/Sale.model.js";
import Product from "../models/product.model.js";
import Order from "../models/Order.model.js";

// Get user dashboard stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total orders (from Order model)
    const totalOrders = await Order.countDocuments({ user: userId });

    // Total sales/purchases (from Sale model)
    const totalSales = await Sale.countDocuments({ user: userId });

    // Total spent (from both Order and Sale)
    const orderSpentData = await Order.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const orderSpent = orderSpentData.length > 0 ? orderSpentData[0].total : 0;

    const saleSpentData = await Sale.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const saleSpent = saleSpentData.length > 0 ? saleSpentData[0].total : 0;

    const totalSpent = orderSpent + saleSpent;

    // Recent orders (combine both Order and Sale)
    const recentOrders = await Order.find({ user: userId })
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentSales = await Sale.find({ user: userId })
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 })
      .limit(5);

    // Combine and sort by date
    const allRecent = [...recentOrders, ...recentSales]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Orders this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const ordersThisMonth = await Order.countDocuments({
      user: userId,
      createdAt: { $gte: startOfMonth }
    });

    // Spending this month
    const monthOrderSpending = await Order.aggregate([
      { $match: { user: userId, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const orderSpentThisMonth = monthOrderSpending.length > 0 ? monthOrderSpending[0].total : 0;

    const monthSaleSpending = await Sale.aggregate([
      { $match: { user: userId, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const saleSpentThisMonth = monthSaleSpending.length > 0 ? monthSaleSpending[0].total : 0;

    const spentThisMonth = orderSpentThisMonth + saleSpentThisMonth;

    // Order status breakdown (from Order model)
    const statusBreakdown = await Order.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalSales,
        totalSpent,
        ordersThisMonth,
        spentThisMonth,
        recentOrders: allRecent,
        statusBreakdown
      }
    });
  } catch (error) {
    console.error("Error in getUserStats:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user's order history
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get orders from Order model
    const orders = await Order.find({ user: userId })
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    // Get sales/purchases from Sale model
    const sales = await Sale.find({ user: userId })
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    // Combine both
    const allOrders = [...orders, ...sales]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      data: allOrders
    });
  } catch (error) {
    console.error("Error in getUserOrders:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

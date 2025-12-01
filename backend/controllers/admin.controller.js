import User from "../models/User.model.js";
import Product from "../models/product.model.js";
import Sale from "../models/Sale.model.js";
import Order from "../models/Order.model.js";

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent self-demotion
    if (req.user._id.toString() === id && role === "user") {
      return res.status(403).json({ success: false, message: "Cannot remove your own admin privileges" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error in updateUserRole:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user._id.toString() === id) {
      return res.status(403).json({ success: false, message: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteUser:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get dashboard stats (admin only)
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments({ approved: true });
    const totalSales = await Sale.countDocuments();
    const totalOrders = await Order.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    // Total revenue from Sales
    const salesData = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    const salesRevenue = salesData.length > 0 ? salesData[0].totalRevenue : 0;

    // Total revenue from Orders
    const ordersData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    const ordersRevenue = ordersData.length > 0 ? ordersData[0].totalRevenue : 0;

    // Combined total revenue
    const totalRevenue = salesRevenue + ordersRevenue;

    // Revenue this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const monthSalesRevenue = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const salesRevenueThisMonth = monthSalesRevenue.length > 0 ? monthSalesRevenue[0].total : 0;

    const monthOrdersRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const ordersRevenueThisMonth = monthOrdersRevenue.length > 0 ? monthOrdersRevenue[0].total : 0;

    const revenueThisMonth = salesRevenueThisMonth + ordersRevenueThisMonth;

    // Sales this month
    const salesThisMonth = await Sale.countDocuments({ createdAt: { $gte: startOfMonth } });
    
    // Orders this month
    const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });
    
    // Pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Recent sales (last 7 days with daily breakdown) - combine both Sale and Order
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const recentSalesData = await Sale.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const recentOrdersData = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Merge the data by date
    const dateMap = new Map();
    [...recentSalesData, ...recentOrdersData].forEach(item => {
      if (dateMap.has(item._id)) {
        const existing = dateMap.get(item._id);
        existing.count += item.count;
        existing.revenue += item.revenue;
      } else {
        dateMap.set(item._id, { _id: item._id, count: item.count, revenue: item.revenue });
      }
    });
    const combinedRecentSalesData = Array.from(dateMap.values()).sort((a, b) => a._id.localeCompare(b._id));

    // Recent sales list - combine both Sale and Order
    const recentSalesList = await Sale.find()
      .populate("user", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 })
      .limit(3);

    const recentOrdersList = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 })
      .limit(3);

    // Combine and sort by date, limit to 5
    const recentSales = [...recentSalesList, ...recentOrdersList]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Recent users
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalSales,
        totalOrders,
        totalRevenue,
        adminCount,
        verifiedUsers,
        revenueThisMonth,
        salesThisMonth,
        ordersThisMonth,
        pendingOrders,
        recentSalesData: combinedRecentSalesData,
        recentSales,
        recentUsers
      }
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

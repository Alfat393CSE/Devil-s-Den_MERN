import Order from "../models/Order.model.js";
import Product from "../models/product.model.js";
import User from "../models/User.model.js";
import Notification from "../models/notification.model.js";
import mongoose from "mongoose";

// Create a new order (user)
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentDetails } = req.body;
    const userId = req.user._id || req.user.id;

    console.log('Creating order:', { items: items?.length, paymentMethod, userId });

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({ 
        success: false, 
        message: "Complete shipping address is required" 
      });
    }

    // Validate payment method
    if (!paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment method is required" 
      });
    }

    // Validate transaction ID for non-COD payments
    if (paymentMethod !== 'Cash on Delivery' && (!paymentDetails || !paymentDetails.transactionId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Transaction ID is required for online payments" 
      });
    }

    // Validate and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        console.log('Product not found:', item.product);
        return res.status(404).json({ 
          success: false, 
          message: `Product not found: ${item.product}` 
        });
      }

      // Check if product is approved (skip if no approved field exists)
      if (product.approved === false) {
        console.log('Product not approved:', product.name);
        return res.status(400).json({ 
          success: false, 
          message: `Product "${product.name}" is not available for purchase` 
        });
      }

      // Check stock availability at order creation
      if (product.stock < item.quantity) {
        console.log('Insufficient stock:', product.name, 'Available:', product.stock, 'Requested:', item.quantity);
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}` 
        });
      }

      // Don't reduce stock yet - wait for admin approval
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: item.price || product.price
      });

      totalAmount += (item.price || product.price) * item.quantity;
    }

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentDetails: paymentDetails || {},
      status: 'pending',
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'pending' : 'pending'
    });

    await order.save();

    // Notify user
    await Notification.create({
      user: userId,
      message: `Your order #${order._id.toString().slice(-6)} has been placed successfully. Awaiting admin approval.`,
      type: "info",
      relatedProduct: orderItems[0].product
    });

    // Notify all admins about new order
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        message: `New order #${order._id.toString().slice(-6)} received from ${req.user.name || req.user.username || 'a user'}. Payment: ${paymentMethod}. Total: $${totalAmount.toFixed(2)}`,
        type: "info"
      });
    }

    res.status(201).json({ 
      success: true, 
      message: "Order placed successfully. Awaiting admin approval.",
      data: order 
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get orders for logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { startDate, endDate, status } = req.query;
    
    // Build filter
    const filter = { user: userId };
    
    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to endDate to include the entire end date
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        filter.createdAt.$lt = end;
      }
    }
    
    // Add status filter
    if (status) {
      filter.status = status;
    }
    
    const orders = await Order.find(filter)
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const filter = {};
    
    // Add status filter
    if (status) {
      filter.status = status;
    }
    
    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to endDate to include the entire end date
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        filter.createdAt.$lt = end;
      }
    }
    
    const orders = await Order.find(filter)
      .populate('user', 'name email username')
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching all orders:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get single order details
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid Order ID" });
    }

    const order = await Order.findById(id)
      .populate('user', 'name email username')
      .populate('items.product');
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if user is authorized to view this order
    const userId = (req.user._id || req.user.id).toString();
    const orderUserId = order.user._id.toString();
    if (orderUserId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized to view this order" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Cancel order (user can cancel their own pending orders)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid Order ID" });
    }

    const order = await Order.findById(id).populate('user', 'name email username');
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only cancel your own orders" 
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel order. Order is already ${order.status}` 
      });
    }

    // Restore stock for all items in the cancelled order
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ 
      success: true, 
      message: "Order cancelled successfully. Stock has been restored.",
      data: order 
    });
  } catch (error) {
    console.error("Error cancelling order:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete a single order (user can delete their own completed/cancelled orders)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid Order ID" });
    }

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own orders" 
      });
    }

    // Only allow deletion of completed, cancelled, or rejected orders (not pending or approved)
    if (order.status === 'pending' || order.status === 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete ${order.status} orders. Please cancel the order first.` 
      });
    }

    await Order.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true, 
      message: "Order deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting order:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete multiple orders (bulk delete for user's own orders)
export const deleteMultipleOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;
    const userId = req.user._id;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide order IDs to delete" 
      });
    }

    // Validate all order IDs
    const invalidIds = orderIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid order IDs provided" 
      });
    }

    // Find all orders and verify ownership
    const orders = await Order.find({ _id: { $in: orderIds } });
    
    // Check if all orders belong to the user
    const notOwnedOrders = orders.filter(order => order.user.toString() !== userId.toString());
    if (notOwnedOrders.length > 0) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own orders" 
      });
    }

    // Check if any orders are pending or approved (cannot delete these)
    const nonDeletableOrders = orders.filter(
      order => order.status === 'pending' || order.status === 'approved'
    );
    if (nonDeletableOrders.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete pending or approved orders. Please cancel them first." 
      });
    }

    // Delete all valid orders
    const result = await Order.deleteMany({ 
      _id: { $in: orderIds },
      user: userId,
      status: { $in: ['completed', 'cancelled', 'rejected'] }
    });

    res.status(200).json({ 
      success: true, 
      message: `Successfully deleted ${result.deletedCount} order(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting multiple orders:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get order statistics (admin only)
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const approvedOrders = await Order.countDocuments({ status: 'approved' });
    const rejectedOrders = await Order.countDocuments({ status: 'rejected' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    const revenueData = await Order.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        approvedOrders,
        rejectedOrders,
        cancelledOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error("Error fetching order stats:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Approve order (admin only)
export const approveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user._id || req.user.id;

    const order = await Order.findById(id).populate('items.product user');

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Order is already ${order.status}. Only pending orders can be approved.` 
      });
    }

    // Check stock availability and reduce stock
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product ${item.product.name} not found` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Required: ${item.quantity}` 
        });
      }

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Update order
    order.status = 'approved';
    order.paymentStatus = order.paymentMethod === 'Cash on Delivery' ? 'pending' : 'verified';
    order.approvedBy = adminId;
    order.approvedAt = new Date();
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    await order.save();

    // Notify user
    await Notification.create({
      user: order.user._id,
      message: `Great news! Your order #${order._id.toString().slice(-6)} has been approved and is being processed.`,
      type: "success"
    });

    res.status(200).json({ 
      success: true, 
      message: "Order approved successfully",
      data: order 
    });
  } catch (error) {
    console.error("Error approving order:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Reject order (admin only)
export const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ 
        success: false, 
        message: "Rejection reason is required" 
      });
    }

    const order = await Order.findById(id).populate('user');

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Order is already ${order.status}. Only pending orders can be rejected.` 
      });
    }

    // Update order
    order.status = 'rejected';
    order.paymentStatus = 'failed';
    order.rejectionReason = rejectionReason;
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    await order.save();

    // Notify user
    await Notification.create({
      user: order.user._id,
      message: `Your order #${order._id.toString().slice(-6)} has been rejected. Reason: ${rejectionReason}`,
      type: "error"
    });

    res.status(200).json({ 
      success: true, 
      message: "Order rejected successfully",
      data: order 
    });
  } catch (error) {
    console.error("Error rejecting order:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

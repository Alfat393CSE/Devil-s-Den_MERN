import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'approved', 'rejected', 'cancelled', 'completed', 'shipped'],
    default: 'pending'
  },
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'Bangladesh'
    }
  },
  paymentMethod: {
    type: String,
    enum: ['bKash', 'Nagad', 'Rocket', 'Card', 'Cash on Delivery'],
    required: true
  },
  paymentDetails: {
    transactionId: String,
    senderNumber: String,
    receiverNumber: String,
    paymentNote: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'verified', 'paid', 'failed'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  rejectionReason: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;

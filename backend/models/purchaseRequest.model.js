import mongoose from 'mongoose';

const purchaseRequestSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  qty: { type: Number, default: 1 },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  reason: { type: String },
}, { timestamps: true });

const PurchaseRequest = mongoose.model('PurchaseRequest', purchaseRequestSchema);
export default PurchaseRequest;

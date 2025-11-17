import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  qty: { type: Number, default: 1 },
  price: { type: Number, required: true }, // unit price
}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;

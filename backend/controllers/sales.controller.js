import Sale from '../models/sale.model.js';
import Product from '../models/product.model.js';
import mongoose from 'mongoose';

export const createSale = async (req, res) => {
  // Accept either single { productId } or batch { productIds } or new format { items: [{ productId, qty }] }
  const { productId, productIds, items } = req.body;
  try {
    // New format: items with qty
    if (items && Array.isArray(items)) {
      const created = [];
      for (const it of items) {
        const pid = it.productId || it.id || it._id;
        const qty = Math.max(1, Number(it.qty) || 1);
        if (!pid || !mongoose.Types.ObjectId.isValid(pid)) continue;
        const product = await Product.findById(pid);
        if (!product || !product.approved) continue;
        product.sales = (product.sales || 0) + qty;
        await product.save();
        const sale = new Sale({ product: pid, buyer: req.user._id || req.user.id, price: product.price, qty });
        await sale.save();
        created.push(sale);
      }
      return res.status(201).json({ success: true, data: created });
    }

    if (productIds && Array.isArray(productIds)) {
      // legacy batch checkout (no quantities) - treat qty as 1 each
      const createdSales = [];
      for (const pid of productIds) {
        if (!mongoose.Types.ObjectId.isValid(pid)) continue;
        const product = await Product.findById(pid);
        if (!product || !product.approved) continue;
        product.sales = (product.sales || 0) + 1;
        await product.save();
        const sale = new Sale({ product: pid, buyer: req.user._id || req.user.id, price: product.price, qty: 1 });
        await sale.save();
        createdSales.push(sale);
      }
      return res.status(201).json({ success: true, data: createdSales });
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.approved) return res.status(404).json({ success: false, message: 'Product not available' });

    // increment sales
    product.sales = (product.sales || 0) + 1;
    await product.save();

    const sale = new Sale({ product: productId, buyer: req.user._id || req.user.id, price: product.price, qty: 1 });
    await sale.save();

    res.status(201).json({ success: true, data: sale });
  } catch (err) {
    console.error('Error creating sale', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}

export const listSales = async (req, res) => {
  try {
    const q = Sale.find({}).populate('product', 'name price').populate('buyer', 'name email username');
    const sales = await q.exec();
    res.status(200).json({ success: true, data: sales });
  } catch (err) {
    console.error('Error listing sales', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}

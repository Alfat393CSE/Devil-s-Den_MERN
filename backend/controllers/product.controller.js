import mongoose from "mongoose";
import Product from "../models/product.model.js";
import User from "../models/User.model.js";
import Notification from "../models/notification.model.js";

export const getProducts = async (req, res) => {
	try {
		// Public: only approved products
		const products = await Product.find({ approved: true });
		res.status(200).json({ success: true, data: products });
	} catch (error) {
		console.log("error in fetching products:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const getProduct = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(404).json({ success: false, message: "Invalid Product ID" });
		}

		const product = await Product.findById(id);

		if (!product) {
			return res.status(404).json({ success: false, message: "Product not found" });
		}

		// Only show approved products to public (unless admin)
		if (!product.approved) {
			return res.status(404).json({ success: false, message: "Product not found" });
		}

		res.status(200).json({ success: true, data: product });
	} catch (error) {
		console.log("error in fetching product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const createProduct = async (req, res) => {
	const product = req.body; // user will send this data

	if (!product.name || !product.price || !product.image) {
		return res.status(400).json({ success: false, message: "Please provide all fields" });
	}

	// If request made by authenticated user (not admin) and is marked as 'submit', create as submitted product
	const newProduct = new Product(product);
	// ensure defaults: if created without explicit approval, keep approved as true when admin creates via admin route
	if (req.user && req.user.role !== 'admin') {
		newProduct.approved = false;
		newProduct.isSubmitted = true;
		newProduct.submittedBy = req.user._id || req.user.id;
		// User submissions default to stock = 1
		if (newProduct.stock === undefined || newProduct.stock === null) {
			newProduct.stock = 1;
		}
	} else {
		// Admin products default to stock = 0 (must be set manually)
		if (newProduct.stock === undefined || newProduct.stock === null) {
			newProduct.stock = 0;
		}
	}

	try {
		await newProduct.save();
		
		// If user submitted product for approval, notify user and all admins
		if (req.user && req.user.role !== 'admin') {
			// Notify user that their product is pending approval
			await Notification.create({
				user: req.user._id || req.user.id,
				message: `Your product "${newProduct.name}" has been submitted for approval and is pending review.`,
				type: "info",
				relatedProduct: newProduct._id
			});

			// Notify all admins about new product submission
			const admins = await User.find({ role: 'admin' });
			for (const admin of admins) {
				await Notification.create({
					user: admin._id,
					message: `New product "${newProduct.name}" submitted by ${req.user.name || req.user.username || 'a user'} for approval.`,
					type: "info",
					relatedProduct: newProduct._id
				});
			}
		}
		
		res.status(201).json({ success: true, data: newProduct });
	} catch (error) {
		console.error("Error in Create product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const updateProduct = async (req, res) => {
	const { id } = req.params;

	const product = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Product Id" });
	}

	try {
		const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true });
		res.status(200).json({ success: true, data: updatedProduct });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const deleteProduct = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Product Id" });
	}

	try {
		await Product.findByIdAndDelete(id);
		res.status(200).json({ success: true, message: "Product deleted" });
	} catch (error) {
		console.log("error in deleting product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const getSubmissions = async (req, res) => {
	try {
		const submissions = await Product.find({ approved: false, isSubmitted: true }).populate('submittedBy', 'name email username');
		res.status(200).json({ success: true, data: submissions });
	} catch (error) {
		console.error('Error fetching submissions', error.message);
		res.status(500).json({ success: false, message: 'Server Error' });
	}
}

export const approveProduct = async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ success: false, message: 'Invalid Product Id' });
	try {
		const product = await Product.findById(id).populate('submittedBy', 'name email username');
		if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
		
		const p = await Product.findByIdAndUpdate(id, { approved: true, isSubmitted: false }, { new: true });
		
		// Notify the user who submitted the product
		if (product.submittedBy) {
			await Notification.create({
				user: product.submittedBy._id,
				message: `Great news! Your product "${product.name}" has been approved and is now live in the shop.`,
				type: "success",
				relatedProduct: product._id
			});
			console.log('EMAIL STUB -> To:', product.submittedBy.email, '\nSubject: Product Approved\nYour product "' + product.name + '" has been approved!');
		}
		
		res.status(200).json({ success: true, data: p });
	} catch (err) {
		console.error('Error rejecting product', err.message);
		res.status(500).json({ success: false, message: 'Server Error' });
	}
}

// Update stock quantity (admin only)
export const updateStock = async (req, res) => {
	const { id } = req.params;
	const { stock } = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: 'Invalid Product Id' });
	}

	// Validate stock value
	if (stock === null || stock === undefined) {
		return res.status(400).json({ success: false, message: 'Stock is required' });
	}
	if (typeof stock !== 'number' || stock < 0) {
		return res.status(400).json({ success: false, message: 'Stock must be a non-negative number' });
	}

	try {
		const product = await Product.findByIdAndUpdate(
			id,
			{ stock },
			{ new: true, runValidators: true }
		);

		if (!product) {
			return res.status(404).json({ success: false, message: 'Product not found' });
		}

		res.status(200).json({ 
			success: true, 
			message: 'Stock updated successfully',
			data: product 
		});
	} catch (err) {
		console.error('Error updating stock', err.message);
		res.status(500).json({ success: false, message: 'Server Error' });
	}
}

export const rejectProduct = async (req, res) => {
	const { id } = req.params;
	const { reason } = req.body || {};
	if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ success: false, message: 'Invalid Product Id' });
	try {
		const product = await Product.findById(id).populate('submittedBy', 'email name');
		if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

		// notify submitter if present
		if (product.submittedBy) {
			const msg = `Your product "${product.name}" was rejected.${reason ? ' Reason: ' + reason : ''}`;
			// create notification
			await Notification.create({ 
				user: product.submittedBy._id, 
				message: msg,
				type: "error",
				relatedProduct: product._id
			});
			// email stub (console)
			console.log('EMAIL STUB -> To:', product.submittedBy.email, '\nSubject: Product rejected\n', msg);
		}

		await Product.findByIdAndDelete(id);
		res.status(200).json({ success: true, message: 'Product rejected and removed' });
	} catch (err) {
		console.error('Error rejecting product', err.message);
		res.status(500).json({ success: false, message: 'Server Error' });
	}
}
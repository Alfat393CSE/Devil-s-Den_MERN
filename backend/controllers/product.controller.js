import mongoose from "mongoose";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
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
	}

	try {
		await newProduct.save();
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
		const p = await Product.findByIdAndUpdate(id, { approved: true, isSubmitted: false }, { new: true });
		res.status(200).json({ success: true, data: p });
	} catch (err) {
		console.error('Error approving product', err.message);
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
			await Notification.create({ user: product.submittedBy._id, message: msg });
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
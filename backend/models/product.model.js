import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		approved: {
			type: Boolean,
			default: true,
		},
		isSubmitted: {
			type: Boolean,
			default: false,
		},
		submittedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
		},
		sales: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true, // createdAt, updatedAt
	}
);

const Product = mongoose.model("Product", productSchema);

export default Product;
import express from "express";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

import { connectDB } from "./config/db.js";
import User from "./models/user.model.js";

import productRoutes from "./routes/product.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import salesRoutes from "./routes/sales.route.js";
import notificationRoutes from './routes/notification.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// const __dirname = path.resolve();

app.use(express.json()); // allows us to accept JSON data in the req.body

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/purchases', salesRoutes);
app.use('/api/notifications', notificationRoutes);

// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static(path.join(__dirname, "/frontend/dist")));
// 	app.get("*", (req, res) => {
// 		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
// 	});
// }

const seedAdminIfNeeded = async () => {
	const email = process.env.SEED_ADMIN_EMAIL;
	const password = process.env.SEED_ADMIN_PASSWORD;
	const name = process.env.SEED_ADMIN_NAME || "Admin";
	if (!email || !password) return;

	try {
		const existing = await User.findOne({ email });
		if (existing) {
			console.log(`Seed admin: user ${email} already exists`);
			// ensure role is admin
			if (existing.role !== "admin") {
				existing.role = "admin";
				await existing.save();
				console.log(`Seed admin: updated role to admin for ${email}`);
			}
			return;
		}

		const salt = await bcrypt.genSalt(10);
		const hashed = await bcrypt.hash(password, salt);
		// derive a username from the email to avoid null username conflicts with existing DB indexes
		const derivedUsername = email.split("@")[0];
		const user = await User.create({ name, email, username: derivedUsername, password: hashed, isVerified: true, role: "admin" });
		console.log(`Seed admin: created admin user ${user.email}`);
	} catch (err) {
		console.error("Seed admin error:", err.message || err);
	}
};

// Connect to DB first, then seed admin if requested, then start the server
connectDB()
	.then(async () => {
		await seedAdminIfNeeded();
		app.listen(PORT, () => {
			console.log("Server started at http://localhost:" + PORT);
		});
	})
	.catch((err) => {
		console.error("Failed to start server:", err.message || err);
	});
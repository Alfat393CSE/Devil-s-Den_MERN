import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export const signup = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // prepare username: use provided or derive from email
    const baseUsername = username && username.trim() ? username.trim() : email.split("@")[0];
    let finalUsername = baseUsername;
    // ensure username uniqueness by appending numeric suffix if needed
    let counter = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      /* eslint-disable no-await-in-loop */
      const u = await User.findOne({ username: finalUsername });
      if (!u) break;
      counter += 1;
      finalUsername = `${baseUsername}${counter}`;
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, username: finalUsername, password: hashed });

    return res.status(201).json({
      message: "Your account has been created. Please contact admin for verification.",
      user: { id: user._id, name: user.name, email: user.email, username: user.username, isVerified: user.isVerified, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const secret = req.headers["x-admin-secret"] || req.body?.secret;
    const expected = process.env.MAKE_ADMIN_SECRET || "dev_make_admin_secret";
    if (!secret || secret !== expected) {
      return res.status(401).json({ message: "Unauthorized - invalid secret" });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOneAndUpdate({ email }, { $set: { role: "admin" } }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "User updated to admin", user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

import User from "../models/user.model.js";

export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role isVerified createdAt");
    return res.json({ data: users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });

    const user = await User.findByIdAndUpdate(id, { $set: { role } }, { new: true }).select("name email role");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Role updated", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

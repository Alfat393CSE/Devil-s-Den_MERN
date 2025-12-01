import { connectDB } from "../config/db.js";
import User from "../models/User.model.js";

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Usage: node scripts/make-admin.js <email> <secret>");
    process.exit(1);
  }

  const [email, secret] = args;
  const expected = process.env.MAKE_ADMIN_SECRET || "dev_make_admin_secret";
  if (secret !== expected) {
    console.error("Invalid secret. Set MAKE_ADMIN_SECRET in your environment or provide the correct secret.");
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOneAndUpdate({ email }, { $set: { role: "admin" } }, { new: true });
  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  console.log(`Updated ${user.email} to role=${user.role}`);
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

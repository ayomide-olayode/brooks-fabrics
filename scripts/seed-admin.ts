/**
 * Run: node scripts/seed-admin.js
 * Creates the first admin user in MongoDB.
 * Set MONGODB_URI and edit email/password before running.
 */

const mongooseLib = require("mongoose") as any;
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "your_mongodb_uri_here";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@brooksfabrics.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change_me_now";

const AdminSchema = new mongooseLib.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

async function seed() {
  if (!MONGODB_URI) {
    console.error("Set MONGODB_URI in the script before running.");
    process.exit(1);
  }

  try {
    await mongooseLib.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }

  const Admin = mongooseLib.models.Admin || mongooseLib.model("Admin", AdminSchema);

  const existing = await Admin.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin "${ADMIN_EMAIL}" already exists.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await Admin.create({ email: ADMIN_EMAIL, passwordHash });

  console.log(`✅ Admin created: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   ⚠️  Change your password after first login!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

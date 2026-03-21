require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const existing = await Admin.findOne({ email: "admin@cea.com" });
  if (existing) {
    console.log("Admin already exists!");
    process.exit();
  }

  const hashed = await bcrypt.hash("admin123", 10);
  await Admin.create({
    email: "admin@cea.com",
    password: hashed,
  });

  console.log("✅ Admin created!");
  console.log("Email: admin@cea.com");
  console.log("Password: admin123");
  process.exit();
};

createAdmin();
require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const bcrypt = require("bcryptjs");

const verifyPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admin = await Admin.findOne({ email: "admin@cea.com" });
    if (!admin) {
      console.log("Admin not found");
      process.exit();
    }
    const password = "admin123";
    const isMatch = (password === admin.password) || (await bcrypt.compare(password, admin.password));
    console.log(`Password Match: ${isMatch}`);
    console.log(`Stored Password: ${admin.password}`);
    process.exit();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

verifyPassword();

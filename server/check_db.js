require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

const checkAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Admin.countDocuments();
    const admins = await Admin.find({}, { password: 0 });
    console.log(`Total Admins: ${count}`);
    console.log("Admins:", admins);
    process.exit();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

checkAdmins();

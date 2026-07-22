// One-time bootstrap: creates the first CEO user directly in the DB.
// Run with:  node seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./src/config/db");
const User = require("./src/models/User");

async function seed() {
  await connectDB();

  const email = "ceo@teamflow.test";
  const plainPassword = "Passw0rd!123";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`CEO already exists: ${email}`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const ceo = await User.create({
    employeeId: "EMP-0001",
    name: "Carol CEO",
    email,
    passwordHash,
    role: "ceo",
    department: "Executive",
    designation: "Chief Executive Officer",
    employmentType: "full_time",
    joiningDate: new Date(),
    status: "active",
  });

  console.log("Seeded CEO user:");
  console.log({ email, password: plainPassword, id: ceo._id.toString() });

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

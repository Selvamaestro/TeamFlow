require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const LeaveRequest = require("./src/models/LeaveRequest");
const User = require("./src/models/User");

async function seedLeaveRequests() {
  await connectDB();

  console.log("==================================================");
  console.log("          SEEDING PENDING LEAVE REQUESTS          ");
  console.log("==================================================");

  // Fetch users to assign leave requests to
  const users = await User.find({ status: "active" });

  if (!users || users.length === 0) {
    console.error("❌ No users found in database. Seed users first.");
    process.exit(1);
  }

  const findUserByEmail = (email) => users.find((u) => u.email === email) || users[0];

  const emp1 = findUserByEmail("employee1@teamflow.test");
  const emp3 = findUserByEmail("employee3@teamflow.test");
  const emp4 = findUserByEmail("employee4@teamflow.test");
  const emp5 = findUserByEmail("employee5@teamflow.test");
  const manager = findUserByEmail("manager@teamflow.test");
  const teamlead = findUserByEmail("teamleademp@teamflow.test");

  const pendingLeaves = [
    {
      user: emp1._id,
      type: "sick",
      startDate: new Date("2026-07-27"),
      endDate: new Date("2026-07-28"),
      reason: "High fever and flu symptoms, doctor recommended rest",
      status: "pending",
    },
    {
      user: emp3._id,
      type: "casual",
      startDate: new Date("2026-08-03"),
      endDate: new Date("2026-08-05"),
      reason: "Attending sister's wedding ceremony in hometown",
      status: "pending",
    },
    {
      user: emp4._id,
      type: "paid",
      startDate: new Date("2026-08-10"),
      endDate: new Date("2026-08-14"),
      reason: "Annual planned family vacation",
      status: "pending",
    },
    {
      user: emp5._id,
      type: "casual",
      startDate: new Date("2026-07-31"),
      endDate: new Date("2026-07-31"),
      reason: "Urgent personal work at government office and bank",
      status: "pending",
    },
    {
      user: manager._id,
      type: "paid",
      startDate: new Date("2026-08-17"),
      endDate: new Date("2026-08-21"),
      reason: "Summer break and personal travel",
      status: "pending",
    },
    {
      user: teamlead._id,
      type: "unpaid",
      startDate: new Date("2026-08-24"),
      endDate: new Date("2026-08-25"),
      reason: "Attending external leadership & tech certification workshop",
      status: "pending",
    },
  ];

  let createdCount = 0;
  for (const leaveData of pendingLeaves) {
    const existing = await LeaveRequest.findOne({
      user: leaveData.user,
      startDate: leaveData.startDate,
      reason: leaveData.reason,
    });

    if (!existing) {
      const created = await LeaveRequest.create(leaveData);
      console.log(`✅ Created pending leave request (${leaveData.type}: ${leaveData.reason})`);
      createdCount++;
    } else {
      console.log(`ℹ️ Pending leave request already exists for reason: ${leaveData.reason}`);
    }
  }

  console.log("==================================================");
  console.log(`       CREATED ${createdCount} NEW PENDING LEAVE REQUESTS`);
  console.log("==================================================");

  await mongoose.disconnect();
  process.exit(0);
}

seedLeaveRequests().catch((err) => {
  console.error("❌ Seeding leave requests failed:", err);
  process.exit(1);
});

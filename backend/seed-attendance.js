require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const Attendance = require("./src/models/Attendance");
const User = require("./src/models/User");

async function seedAttendance() {
  await connectDB();

  console.log("==================================================");
  console.log("          SEEDING ATTENDANCE FOR NON-CEO USERS    ");
  console.log("==================================================");

  const users = await User.find({ status: "active", role: { $ne: "ceo" } }).sort({ createdAt: 1 });
  console.log(`Found ${users.length} non-CEO active employees.`);

  if (users.length === 0) {
    console.error("❌ No non-CEO active users found.");
    process.exit(1);
  }

  // Desired target percentage configurations
  // [targetPct, fullDaysCount, hasHalfDay]
  const configMap = [
    { targetPct: 76, fullDays: 18, halfDay: true },   // 18.5 / 24 = 77%
    { targetPct: 78, fullDays: 19, halfDay: false },  // 19 / 24 = 79%
    { targetPct: 86, fullDays: 20, halfDay: true },   // 20.5 / 24 = 85%
    { targetPct: 72, fullDays: 17, halfDay: true },   // 17.5 / 24 = 73%
    { targetPct: 93, fullDays: 22, halfDay: true },   // 22.5 / 24 = 94%
    { targetPct: 96, fullDays: 23, halfDay: false },  // 23 / 24 = 96%
    { targetPct: 67, fullDays: 16, halfDay: false },  // 16 / 24 = 67%
    { targetPct: 81, fullDays: 19, halfDay: true },   // 19.5 / 24 = 81%
  ];

  const year = 2026;
  const month = 6; // 0-indexed: July
  const todayDay = 24; // Today is July 24, 2026

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const cfg = configMap[i % configMap.length];

    console.log(`\nUser [${user.name} - ${user.email}] (${user.department}): Target ~${cfg.targetPct}%`);

    // Remove old July 2026 attendance for clean state
    const startOfJuly = new Date(year, month, 1);
    const endOfJuly24 = new Date(year, month, 24, 23, 59, 59);
    await Attendance.deleteMany({ user: user._id, date: { $gte: startOfJuly, $lte: endOfJuly24 } });

    // Pick days: ensure today (day 24) is included if present count > 0 so today's attendance shows active present status
    let presentDaysList = [];
    for (let d = todayDay; d >= 1; d--) {
      if (presentDaysList.length < cfg.fullDays) {
        presentDaysList.push(d);
      }
    }

    let createdCount = 0;
    for (const day of presentDaysList) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0);

      const checkInTime = new Date(currentDate);
      checkInTime.setHours(9, Math.floor(Math.random() * 20), 0);

      const checkOutTime = new Date(currentDate);
      checkOutTime.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 59), 0);

      await Attendance.create({
        user: user._id,
        date: currentDate,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        status: "present",
      });
      createdCount++;
    }

    // Add half_day if configured
    if (cfg.halfDay) {
      const halfDayNum = 1; // day 1 or unused day
      if (!presentDaysList.includes(halfDayNum)) {
        const currentDate = new Date(year, month, halfDayNum);
        currentDate.setHours(0, 0, 0, 0);
        await Attendance.create({
          user: user._id,
          date: currentDate,
          checkIn: new Date(currentDate.setHours(9, 0, 0)),
          checkOut: new Date(currentDate.setHours(13, 0, 0)),
          status: "half_day",
        });
        createdCount++;
      }
    }

    console.log(`  └─ Created ${createdCount} attendance records for ${user.email}.`);
  }

  console.log("\n==================================================");
  console.log("       ATTENDANCE SEEDING COMPLETE SUCCESSFULLY   ");
  console.log("==================================================");

  await mongoose.disconnect();
  process.exit(0);
}

seedAttendance().catch((err) => {
  console.error("❌ Seeding attendance failed:", err);
  process.exit(1);
});

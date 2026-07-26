const Attendance = require("../models/Attendance");
const User = require("../models/User");

function startOfDay(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

class AlreadyCheckedInError extends Error {
  constructor() {
    super("Already checked in today");
    this.status = 409;
  }
}

class NoCheckInFoundError extends Error {
  constructor() {
    super("No check-in found for today");
    this.status = 404;
  }
}

async function checkIn(userId) {
  const now = new Date();
  const today = startOfDay(now);
  const existing = await Attendance.findOne({ user: userId, date: today });
  if (existing) throw new AlreadyCheckedInError();

  return Attendance.create({
    user: userId,
    date: today,
    checkIn: now,
    status: "present",
  });
}

async function checkOut(userId) {
  const today = startOfDay(new Date());
  const record = await Attendance.findOne({ user: userId, date: today });
  if (!record) throw new NoCheckInFoundError();

  record.checkOut = new Date();
  await record.save();
  return record;
}

async function myAttendance(userId, { month, year } = {}) {
  const filter = { user: userId };
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
    filter.date = { $gte: start, $lt: end };
  }
  return Attendance.find(filter).sort({ date: -1 });
}

// Manager is scoped to their team (users who report to them), unless a department filter narrows it
async function listAttendance(requestingUser, { userId, department, date } = {}) {
  const filter = {};
  if (userId) filter.user = userId;
  if (date) {
    const day = startOfDay(date);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    filter.date = { $gte: day, $lt: nextDay };
  }

  const userFilter = {};
  if (requestingUser.role === "manager") {
    userFilter.reportingManager = requestingUser.id;
  }
  if (department) userFilter.department = department;

  if (Object.keys(userFilter).length > 0) {
    const teamUsers = await User.find(userFilter).select("_id");
    const teamIds = teamUsers.map((u) => u._id);
    filter.user = filter.user ? filter.user : { $in: teamIds };
  }

  return Attendance.find(filter).populate("user", "name employeeId department").sort({ date: -1 });
}
async function calculateEmployeeAttendance(userId) {

  const now = new Date();

  const today = startOfDay(now);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totalDaysPassed = now.getDate();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  // Today's attendance
  const todayRecord = await Attendance.findOne({
    user: userId,
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  // Monthly attendance
  const monthlyRecords = await Attendance.find({
    user: userId,
    date: {
      $gte: startOfMonth,
      $lt: tomorrow,
    },
    status: {
      $in: ["present", "half_day", "leave"],
    },
  });

  let presentCount = 0;

  monthlyRecords.forEach((record) => {
    presentCount +=
      record.status === "half_day"
        ? 0.5
        : 1;
  });

  const percentage =
    totalDaysPassed > 0
      ? Math.round((presentCount / totalDaysPassed) * 100)
      : 100;

  const trend =
    percentage >= 85
      ? `+${percentage - 85}%`
      : `${percentage - 85}%`;

  return {
    todayStatus:
      todayRecord
        ? todayRecord.status === "half_day"
          ? "Half Day"
          : "Present"
        : "Absent",

    checkInTime:
      todayRecord?.checkIn
        ? new Date(
            todayRecord.checkIn
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,

    presentDays: `${presentCount} / ${totalDaysPassed} days`,

    percentage,

    trend,
  };
}
async function getAttendanceSummary() {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totalDaysPassed = now.getDate();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Exclude CEO from workforce stats
  const nonCeoUsers = await User.find({ status: "active", role: { $ne: "ceo" } })
    .select("_id name employeeId department designation role")
    .lean();

  const totalEmployees = nonCeoUsers.length;
  const nonCeoIds = nonCeoUsers.map((u) => u._id);

  // Today's attendance records for non-CEO users
  const todayRecords = await Attendance.find({
    user: { $in: nonCeoIds },
    date: { $gte: today, $lt: tomorrow },
  }).lean();

  const todayRecordMap = {};
  todayRecords.forEach((r) => {
    todayRecordMap[r.user.toString()] = r;
  });

  const presentUserIds = new Set(
    todayRecords
      .filter((r) => ["present", "half_day"].includes(r.status))
      .map((r) => r.user.toString())
  );

  const todayPresent = presentUserIds.size;
  const todayAbsent = Math.max(0, totalEmployees - todayPresent);

  // Monthly attendance records for non-CEO users
  const monthlyRecords = await Attendance.find({
    user: { $in: nonCeoIds },
    date: { $gte: startOfMonth, $lt: tomorrow },
    status: { $in: ["present", "half_day", "leave"] },
  }).lean();

  const userPresentCounts = {};
  monthlyRecords.forEach((r) => {
    const uid = r.user.toString();
    userPresentCounts[uid] = (userPresentCounts[uid] || 0) + 1;
  });

  const presentEmployees = [];
  const absentEmployees = [];

  const monthlyInsights = nonCeoUsers.map((u) => {
    const uid = u._id.toString();
    const pCount = userPresentCounts[uid] || 0;
    const percentage = totalDaysPassed > 0 ? Math.min(100, Math.round((pCount / totalDaysPassed) * 100)) : 100;
    const diff = percentage - 85;
    const trend = diff >= 0 ? `+${diff}%` : `${diff}%`;

    const todayRec = todayRecordMap[uid];
    const isPresent = presentUserIds.has(uid);
    const todayStatus = isPresent
      ? "Present"
      : (todayRec?.status === "leave" ? "On Leave" : "Absent");
    const checkInTime = todayRec?.checkIn
      ? new Date(todayRec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null;

    const empData = {
      id: uid,
      name: u.name,
      employeeId: u.employeeId,
      role: u.designation || u.role,
      dept: u.department || "General",
      presentDays: `${pCount} / ${totalDaysPassed} days`,
      percentage,
      trend,
      isPresentToday: isPresent,
      todayStatus,
      checkInTime,
    };

    if (isPresent) {
      presentEmployees.push(empData);
    } else {
      absentEmployees.push(empData);
    }

    return empData;
  });

  return {
    todayPresent,
    todayAbsent,
    totalEmployees,
    monthlyInsights,
    presentEmployees,
    absentEmployees,
  };
}

module.exports = {
  checkIn,
  checkOut,
  myAttendance,
  listAttendance,
  getAttendanceSummary,
  calculateEmployeeAttendance,
  AlreadyCheckedInError,
  NoCheckInFoundError,
};

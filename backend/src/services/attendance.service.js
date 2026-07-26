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

  // Check-in cutoff rule: <= 12:00 PM is present, > 12:00 PM is absent
  const checkInHour = now.getHours();
  const checkInMinute = now.getMinutes();
  const isPresent = checkInHour < 12 || (checkInHour === 12 && checkInMinute === 0);
  const status = isPresent ? "present" : "absent";

  return Attendance.create({
    user: userId,
    date: today,
    checkIn: now,
    status,
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
      .filter((r) => {
        if (r.status === "present") return true;
        if (r.status === "half_day" || r.checkIn) {
          const cDate = r.checkIn ? new Date(r.checkIn) : new Date(r.date);
          const h = cDate.getHours();
          const m = cDate.getMinutes();
          return h < 12 || (h === 12 && m === 0);
        }
        return false;
      })
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
    let isPres = false;
    if (r.status === "present" || r.status === "leave") {
      isPres = true;
    } else if (r.status === "half_day") {
      if (r.checkIn) {
        const cDate = new Date(r.checkIn);
        const h = cDate.getHours();
        const m = cDate.getMinutes();
        if (h < 12 || (h === 12 && m === 0)) isPres = true;
      } else {
        isPres = true;
      }
    }
    if (isPres) {
      userPresentCounts[uid] = (userPresentCounts[uid] || 0) + 1;
    }
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
  AlreadyCheckedInError,
  NoCheckInFoundError,
};


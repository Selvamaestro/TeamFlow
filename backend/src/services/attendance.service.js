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
  const today = startOfDay(new Date());
  const existing = await Attendance.findOne({ user: userId, date: today });
  if (existing) throw new AlreadyCheckedInError();

  return Attendance.create({
    user: userId,
    date: today,
    checkIn: new Date(),
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

module.exports = {
  checkIn,
  checkOut,
  myAttendance,
  listAttendance,
  AlreadyCheckedInError,
  NoCheckInFoundError,
};

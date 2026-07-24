const LeaveRequest = require("../models/LeaveRequest");
const Attendance = require("../models/Attendance");
const notify = require("../utils/notify");

function getDatesInRange(start, end) {
  const dates = [];
  if (!start) return dates;
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = end ? new Date(end) : new Date(s);
  e.setHours(0, 0, 0, 0);

  let current = new Date(s);
  while (current <= e) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

async function syncLeaveToAttendance(leaveRequest, status) {
  if (!leaveRequest || !leaveRequest.startDate) return;
  const dates = getDatesInRange(leaveRequest.startDate, leaveRequest.endDate);

  if (status === "approved") {
    for (const d of dates) {
      await Attendance.findOneAndUpdate(
        { user: leaveRequest.user, date: d },
        {
          $setOnInsert: { user: leaveRequest.user, date: d },
          $set: { status: "leave" },
        },
        { upsert: true, new: true }
      );
    }
  } else if (status === "rejected") {
    for (const d of dates) {
      await Attendance.deleteMany({
        user: leaveRequest.user,
        date: d,
        status: "leave",
      });
    }
  }
}

async function createLeave(userId, { type, startDate, endDate, reason }) {
  return LeaveRequest.create({ user: userId, type, startDate, endDate, reason });
}

async function myLeave(userId) {
  return LeaveRequest.find({ user: userId }).sort({ createdAt: -1 });
}

async function listLeave({ status, userId } = {}) {
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.user = userId;
  return LeaveRequest.find(filter).populate("user", "name employeeId department").sort({ createdAt: -1 });
}

// HR, Manager, CEO — any one, independently, single-step
async function decideLeave(app, id, status, reviewerId) {
  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest) return null;

  leaveRequest.status = status;
  leaveRequest.reviewedBy = reviewerId;
  await leaveRequest.save();

  // Sync attendance records for approved / rejected leave
  await syncLeaveToAttendance(leaveRequest, status);

  await notify(app, {
    user: leaveRequest.user,
    type: "leave_status",
    title: `Leave request ${status}`,
    body: `Your ${leaveRequest.type} leave request was ${status}`,
    link: "/leave",
  });

  return leaveRequest;
}

module.exports = { createLeave, myLeave, listLeave, decideLeave, syncLeaveToAttendance };

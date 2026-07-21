const LeaveRequest = require("../models/LeaveRequest");
const notify = require("../utils/notify");

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

  await notify(app, {
    user: leaveRequest.user,
    type: "leave_status",
    title: `Leave request ${status}`,
    body: `Your ${leaveRequest.type} leave request was ${status}`,
    link: "/leave",
  });

  return leaveRequest;
}

module.exports = { createLeave, myLeave, listLeave, decideLeave };

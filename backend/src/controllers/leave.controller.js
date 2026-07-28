const leaveService = require("../services/leave.service");

// POST /leave  (self)
async function createLeave(req, res, next) {
  try {
    const { type, startDate, endDate } = req.body;
    if (!type || !startDate || !endDate) {
      return res.status(400).json({ message: "type, startDate, endDate are required" });
    }

    const leaveRequest = await leaveService.createLeave(req.user.id, req.body);
    return res.status(201).json({ leaveRequest });
  } catch (err) {
    next(err);
  }
}

// GET /leave/me  (self)
async function myLeave(req, res, next) {
  try {
    const requests = await leaveService.myLeave(req.user.id);
    return res.status(200).json({ requests });
  } catch (err) {
    next(err);
  }
}

// GET /leave  (HR, Manager, CEO)
async function listLeave(req, res, next) {
  try {
    const requests = await leaveService.listLeave(req.query);
    return res.status(200).json({ requests });
  } catch (err) {
    next(err);
  }
}

// PATCH /leave/:id/decision  (HR, Manager, CEO — any one, independently, single-step)
async function decideLeave(req, res, next) {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be approved or rejected" });
    }

    const leaveRequest = await leaveService.decideLeave(req.app, req.params.id, status, req.user.id);
    if (!leaveRequest) return res.status(404).json({ message: "Leave request not found" });

    return res.status(200).json({ leaveRequest });
  } catch (err) {
    next(err);
  }
}

module.exports = { createLeave, myLeave, listLeave, decideLeave };

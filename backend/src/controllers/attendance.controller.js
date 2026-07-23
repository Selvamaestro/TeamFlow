const attendanceService = require("../services/attendance.service");

// POST /attendance/check-in  (self)
async function checkIn(req, res, next) {
  try {
    const record = await attendanceService.checkIn(req.user.id);
    return res.status(201).json({ attendance: record });
  } catch (err) {
    if (err instanceof attendanceService.AlreadyCheckedInError) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
}

// POST /attendance/check-out  (self)
async function checkOut(req, res, next) {
  try {
    const record = await attendanceService.checkOut(req.user.id);
    return res.status(200).json({ attendance: record });
  } catch (err) {
    if (err instanceof attendanceService.NoCheckInFoundError) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
}

// GET /attendance/me  (self)
async function myAttendance(req, res, next) {
  try {
    const records = await attendanceService.myAttendance(req.user.id, req.query);
    return res.status(200).json({ records });
  } catch (err) {
    next(err);
  }
}

// GET /attendance  (HR, Manager [team only], CEO)
async function listAttendance(req, res, next) {
  try {
    const records = await attendanceService.listAttendance(req.user, req.query);
    return res.status(200).json({ records });
  } catch (err) {
    next(err);
  }
}

// GET /attendance/summary (HR, Manager, CEO)
async function getSummary(req, res, next) {
  try {
    const summary = await attendanceService.getAttendanceSummary();
    return res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
}

module.exports = { checkIn, checkOut, myAttendance, listAttendance, getSummary };


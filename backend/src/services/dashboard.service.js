const User = require("../models/User");
const Project = require("../models/Project");
const Client = require("../models/Client");
const Attendance = require("../models/Attendance");

function startOfDay(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function overview(viewerRole) {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalEmployees, activeProjects, totalClients, attendanceToday, revenueAgg] =
    await Promise.all([
      User.countDocuments({ status: "active" }),
      Project.countDocuments({ status: { $in: ["planning", "in_progress"] } }),
      Client.countDocuments({ status: "active" }),
      Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: "present" }),
      Project.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$revenue" } } },
      ]),
    ]);

  const revenueThisMonth = viewerRole === "ceo" ? (revenueAgg[0]?.total || 0) : undefined;

  return { totalEmployees, activeProjects, totalClients, revenueThisMonth, attendanceToday };
}

async function revenueSeries(range = "monthly") {
  const projects = await Project.find({}, "revenue createdAt");

  const buckets = {};
  for (const p of projects) {
    if (!p.revenue) continue;
    const date = p.createdAt;
    let period;
    if (range === "yearly") {
      period = `${date.getFullYear()}`;
    } else if (range === "quarterly") {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      period = `${date.getFullYear()}-Q${quarter}`;
    } else {
      period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }
    buckets[period] = (buckets[period] || 0) + p.revenue;
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([period, rev]) => ({ period, revenue: rev }));
}

module.exports = { overview, revenueSeries };

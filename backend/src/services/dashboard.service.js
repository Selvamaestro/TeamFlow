const User = require("../models/User");
const Project = require("../models/Project");
const Client = require("../models/Client");
const Attendance = require("../models/Attendance");

function startOfDay(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}
function buildWeeklySeries(projects) {

  const days = [];

  for (let i = 6; i >= 0; i--) {

    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    days.push({
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      start: new Date(date),
      end: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      revenue: 0,
    });

  }

  projects.forEach((project) => {

    const projectDate = new Date(project.createdAt);

    days.forEach((day) => {

      if (projectDate >= day.start && projectDate < day.end) {

        day.revenue += project.revenue || 0;

      }

    });

  });

  return days.map((day) => ({
    day: day.label,
    revenue: day.revenue,
  }));

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
  console.log("***** NEW revenueSeries() is running *****");


  const projects = await Project.find()
    .populate("client", "company");

  let totalRevenue = 0;
  let totalExpenses = 0;
  let pendingInvoices = 0;
  let overdueAmount = 0;

  const buckets = {};
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (const p of projects) {

    totalRevenue += p.revenue || 0;
    totalExpenses += p.expenses || 0;

    if ((p.paymentStatus || "").toLowerCase() !== "paid") {
      pendingInvoices++;
    }

    overdueAmount += p.pendingAmount || 0;

    if (!p.revenue) continue;

    console.log("Start Date:", p.startDate);
    console.log("Created Date:", p.createdAt);

    const date = p.startDate ? new Date(p.startDate) : new Date(p.createdAt);

    console.log("Using:", date);
    console.log(
      p.title,
      date,
      monthNames[date.getMonth()],
      p.revenue
    );

    let period;

    if (range === "yearly") {
      period = `${date.getFullYear()}`;
    } else if (range === "quarterly") {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      period = `${date.getFullYear()}-Q${quarter}`;
    } else {


      period = monthNames[date.getMonth()];
    }

    buckets[period] = (buckets[period] || 0) + p.revenue;

  }

  const monthOrder = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
  };

  const series = Object.entries(buckets)
    .sort((a, b) => monthOrder[a[0]] - monthOrder[b[0]])
    .map(([period, revenue]) => ({
      period,
      revenue,
    }));
  const summary = {

    totalRevenue,

    availableFunds: totalRevenue - totalExpenses,

    pendingInvoices,

    overdueAmount,

    growth: 12.5, // we'll calculate this later

  };
  const weeklySeries = buildWeeklySeries(projects);
  console.log({
    summary,
    series,
    projectsCount: projects.length,
  });
  console.log("Buckets:", buckets);
  console.log("Series:", series);

return {

  summary,

  series,          // Revenue page

  weeklySeries,    // Dashboard

  projects,

};

}

module.exports = { overview, revenueSeries };

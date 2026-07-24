const dashboardService = require("../services/dashboard.service");

// GET /dashboard/overview  (Manager, CEO)
async function overview(req, res, next) {
  try {
    const data = await dashboardService.overview(req.user.role);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /dashboard/revenue  (CEO only)
async function revenue(req, res, next) {
  try {
    const data = await dashboardService.revenueSeries(req.query.range);

    console.log("Revenue API Response:");
    console.log(data.weeklySeries);
    console.log(data);

    return res.status(200).json(data);

  } catch (err) {
    next(err);
  }
}

module.exports = { overview, revenue };

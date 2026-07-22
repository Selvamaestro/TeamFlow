const rewardService = require("../services/reward.service");

// GET /rewards/me  (self)
async function myRewards(req, res, next) {
  try {
    const rewards = await rewardService.myRewards(req.user.id);
    return res.status(200).json({ rewards });
  } catch (err) {
    next(err);
  }
}

// GET /rewards  (HR, Manager, CEO)
async function listRewards(req, res, next) {
  try {
    const rewards = await rewardService.listRewards({ userId: req.query.userId });
    return res.status(200).json({ rewards });
  } catch (err) {
    next(err);
  }
}

// POST /rewards  (Manager, HR, CEO)
async function createReward(req, res, next) {
  try {
    const { userId, title } = req.body;
    if (!userId || !title) {
      return res.status(400).json({ message: "userId and title are required" });
    }

    const reward = await rewardService.createReward(req.app, req.body, req.user.id);
    return res.status(201).json({ reward });
  } catch (err) {
    next(err);
  }
}

module.exports = { myRewards, listRewards, createReward };

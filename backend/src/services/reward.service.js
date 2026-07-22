const Reward = require("../models/Reward");
const notify = require("../utils/notify");

async function myRewards(userId) {
  return Reward.find({ user: userId }).sort({ awardedAt: -1 });
}

async function listRewards({ userId } = {}) {
  const filter = {};
  if (userId) filter.user = userId;
  return Reward.find(filter).populate("user", "name employeeId").sort({ awardedAt: -1 });
}

async function createReward(app, { userId, title, description, points }, awardedBy) {
  const reward = await Reward.create({
    user: userId,
    title,
    description,
    points,
    awardedBy,
  });

  await notify(app, {
    user: userId,
    type: "reward",
    title: "You received a reward!",
    body: title,
    link: "/rewards",
  });

  return reward;
}

module.exports = { myRewards, listRewards, createReward };

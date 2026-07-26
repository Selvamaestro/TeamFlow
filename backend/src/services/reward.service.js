const Reward = require("../models/Reward");
const notify = require("../utils/notify");
const { pointsForType, levelForScore } = require("../utils/rewardPoints");

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

async function myRewards(userId) {
  return Reward.find({ user: userId }).sort({ awardedAt: -1 });
}

async function listRewards({ userId } = {}) {
  const filter = {};
  if (userId) filter.user = userId;
  return Reward.find(filter).populate("user", "name employeeId").sort({ awardedAt: -1 });
}

async function createReward(app, { userId, title, description, points, type, task }, awardedBy) {
  let finalPoints = points;
  if (type) {
    const derived = pointsForType(type);
    if (derived === undefined) throw new BadRequestError("Invalid reward type");
    finalPoints = derived;
  }
  if (finalPoints === undefined || finalPoints === null) {
    throw new BadRequestError("points or a valid type is required");
  }

  const reward = await Reward.create({
    user: userId,
    title,
    description,
    type: type || null,
    task: task || null,
    points: finalPoints,
    awardedBy,
  });

  await notify(app, {
    user: userId,
    type: "reward",
    title: finalPoints >= 0 ? "You received a reward!" : "Points update",
    body: title || `${finalPoints >= 0 ? "+" : ""}${finalPoints} points`,
    link: "/rewards",
  });

  return reward;
}

async function getScoreAndLevel(userId) {
  const rewards = await Reward.find({ user: userId });
  const score = rewards.reduce((sum, r) => sum + r.points, 0);
  return { score, level: levelForScore(score) };
}

// Called by task.service when a task is approved, to auto-award task_completed
// (+ early_delivery bonus if ahead of the due date, or late_delivery penalty if not).
async function autoAwardForTask(app, task, awardedBy) {
  const onTime = !task.dueDate || new Date() <= new Date(task.dueDate);
  const type = onTime ? "task_completed" : "late_delivery";
  await createReward(app, { userId: task.assignedTo, title: `Task: ${task.title}`, type, task: task._id }, awardedBy);

  if (onTime && task.dueDate) {
    const daysEarly = (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (daysEarly >= 1) {
      await createReward(
        app,
        { userId: task.assignedTo, title: `Early delivery: ${task.title}`, type: "early_delivery", task: task._id },
        awardedBy
      );
    }
  }
}

module.exports = {
  myRewards,
  listRewards,
  createReward,
  getScoreAndLevel,
  autoAwardForTask,
  BadRequestError,
};

// Fixed point values per achievement type.
const POINTS_BY_TYPE = {
  task_completed: 20,     // completed a task on time
  early_delivery: 40,     // completed a task before its due date
  client_praise: 80,      // received positive client feedback
  helped_teammate: 30,    // helped another team member
  late_delivery: -15,     // completed a task after its due date
  client_complaint: -50,  // received a client complaint
};

const REWARD_TYPES = Object.keys(POINTS_BY_TYPE);

// Cumulative point thresholds for each level.
const LEVELS = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 150 },
  { name: "Gold", min: 400 },
  { name: "Diamond", min: 800 },
  { name: "Legend", min: 1500 },
];

function levelForScore(score) {
  let current = LEVELS[0].name;
  for (const level of LEVELS) {
    if (score >= level.min) current = level.name;
  }
  return current;
}

function pointsForType(type) {
  return POINTS_BY_TYPE[type];
}

module.exports = { POINTS_BY_TYPE, REWARD_TYPES, LEVELS, levelForScore, pointsForType };

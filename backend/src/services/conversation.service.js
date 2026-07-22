const Conversation = require("../models/Conversation");
const User = require("../models/User");

// Roles that are auto-included in every conversation (project groups) as "admin"-equivalent.
const ADMIN_ROLES = ["ceo", "manager"];

/**
 * Returns the _id of every user whose role counts as "admin" (ceo, manager).
 */
async function getAdminUserIds() {
  const admins = await User.find({ role: { $in: ADMIN_ROLES }, status: "active" }).select("_id");
  return admins.map((u) => u._id);
}

/**
 * Finds the single company-wide "global" conversation, creating it (with every
 * active user as a participant) if it doesn't exist yet.
 * Safe to call concurrently: relies on the partial unique index on { type: "global" }.
 */
async function getOrCreateGlobalConversation() {
  let global = await Conversation.findOne({ type: "global" });
  if (global) return global;

  const allUserIds = (await User.find({ status: "active" }).select("_id")).map((u) => u._id);

  try {
    global = await Conversation.create({
      type: "global",
      name: "Company",
      participants: allUserIds,
    });
  } catch (err) {
    // race: another request created it first — just fetch it
    if (err.code === 11000) {
      global = await Conversation.findOne({ type: "global" });
    } else {
      throw err;
    }
  }
  return global;
}

/**
 * Adds a single (newly created) user to the global channel.
 * Called once, right after a user is created by ceo/manager/hr.
 */
async function addUserToGlobalChannel(userId) {
  const global = await getOrCreateGlobalConversation();
  await Conversation.updateOne(
    { _id: global._id },
    { $addToSet: { participants: userId } }
  );
  return global;
}

/**
 * Adds a single user to every existing project_group conversation.
 * Used when a newly created user is themself an admin (ceo/manager),
 * so they immediately see every project's chat, not just future ones.
 */
async function addUserToAllProjectGroups(userId) {
  await Conversation.updateMany(
    { type: "project_group" },
    { $addToSet: { participants: userId } }
  );
}

/**
 * Builds the initial participant list for a brand-new project_group conversation:
 * every ceo/manager, deduplicated.
 */
async function buildProjectGroupParticipants(extraUserIds = []) {
  const adminIds = await getAdminUserIds();
  const set = new Set([...adminIds, ...extraUserIds].map(String));
  return Array.from(set);
}

module.exports = {
  ADMIN_ROLES,
  getAdminUserIds,
  getOrCreateGlobalConversation,
  addUserToGlobalChannel,
  addUserToAllProjectGroups,
  buildProjectGroupParticipants,
};

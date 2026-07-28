function ok(res, status, payload) {
  return res.status(status).json(payload);
}

function fail(res, status, message) {
  return res.status(status).json({ message });
}

// Strips fields that a given role should never see.
// salary -> HR/CEO only. revenue -> CEO only.
function sanitizeUser(userDoc, viewerRole) {
  if (!userDoc) return userDoc;
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  // toObject() (without { virtuals: true }) only carries `_id`, not the `id`
  // string getter. /auth/login already returns `id` explicitly, but every
  // other endpoint that sends a user through sanitizeUser (notably
  // GET /auth/me, called on every page load/refresh) was silently sending
  // an object with NO `id` field. The frontend compares against `user.id`
  // everywhere (isTeamLeader, isAssignee/isMine, etc.), so after any
  // refresh those checks all silently evaluated to false. Always mirror
  // `_id` into `id` here so the frontend gets a consistent shape.
  if (user._id && !user.id) {
    user.id = String(user._id);
  }
  if (!["hr", "ceo"].includes(viewerRole)) {
    delete user.salary;
  }
  return user;
}

function sanitizeProject(projectDoc, viewerRole) {
  if (!projectDoc) return projectDoc;
  const project = projectDoc.toObject ? projectDoc.toObject() : { ...projectDoc };
  // Revenue/financials are CEO-only. Manager and HR (and everyone else) get the
  // rest of the project (status, progress, members, tasks, etc.) but not money.
  if (viewerRole !== "ceo") {
    delete project.revenue;
    delete project.budget;
    delete project.expenses;
    delete project.paidAmount;
    delete project.pendingAmount;
    delete project.paymentStatus;
  }
  return project;
}

module.exports = { ok, fail, sanitizeUser, sanitizeProject };

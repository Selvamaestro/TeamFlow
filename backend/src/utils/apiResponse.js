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

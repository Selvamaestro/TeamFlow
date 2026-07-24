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
  if (!["ceo", "manager", "hr"].includes(viewerRole)) {
    delete project.revenue;
    delete project.budget;
    delete project.expenses;
    delete project.paidAmount;
    delete project.pendingAmount;
  }
  return project;
}

module.exports = { ok, fail, sanitizeUser, sanitizeProject };

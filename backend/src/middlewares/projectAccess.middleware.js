const Project = require("../models/Project");

async function requireProjectAccess(req, res, next) {
  try {
    const projectId = req.params.projectId || req.params.id;
    const project = await Project.findById(projectId)
      .populate("teamLeader", "name email employeeId avatarUrl role designation department")
      .populate("members", "name email employeeId avatarUrl role designation department")
      .populate("client", "name company email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { id: userId, role } = req.user;

    const isPrivileged = ["manager", "ceo", "hr"].includes(role);
    // project.teamLeader / project.members are populated above into full user
    // documents, not raw ObjectIds — .toString() on the *document* itself
    // returns "[object Object]", not the id, which is why this always failed.
    const isTeamLeader = !!project.teamLeader && String(project.teamLeader._id || project.teamLeader) === userId;
    const isMember = project.members.some((m) => String(m._id || m) === userId);

    if (!isPrivileged && !isTeamLeader && !isMember) {
      return res.status(403).json({ message: "Forbidden: not associated with this project" });
    }

    req.project = project;
    req.projectRoleFlags = { isPrivileged, isTeamLeader, isMember };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireProjectAccess };

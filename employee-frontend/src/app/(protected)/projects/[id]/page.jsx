"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import EmployeeLayout from "../../../../components/EmployeeLayout";
import { useAuth } from "../../../../context/AuthContext";
import * as projectApi from "../../../../api/project.api";
import * as taskApi from "../../../../api/task.api";
import * as userApi from "../../../../api/user.api";
import { formatDate, formatDueLabel } from "../../../../utils/formatDate";

const STATUS_STYLES = {
  planning: "bg-tertiary-container text-on-tertiary-container",
  in_progress: "bg-secondary-container text-on-secondary-container",
  on_hold: "bg-error-container text-on-error-container",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-surface-container-high text-on-surface-variant",
};

const TASK_STATUS_STYLES = {
  todo: "bg-surface-container text-on-surface-variant",
  in_progress: "bg-secondary-container text-on-secondary-container",
  submitted: "bg-tertiary-fixed text-tertiary",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-error-container text-error",
};

const PRIORITY_STYLES = {
  low: "text-on-surface-variant",
  medium: "text-secondary",
  high: "text-error",
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]); // hydrated user docs for project.members (+ team leader)
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", dueDate: "", status: "" });
  const [isSavingProject, setIsSavingProject] = useState(false);

  const [isAssignFormOpen, setIsAssignFormOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium",
  });
  const [isAssigning, setIsAssigning] = useState(false);

  const isTeamLeader = Boolean(project?.teamLeader && user && project.teamLeader === user.id);
  const isPrivileged = ["manager", "ceo", "hr"].includes(user?.role);
  const canManage = isTeamLeader || isPrivileged;

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const proj = await projectApi.getProject(id);
      setProject(proj);
      setEditForm({
        title: proj.title || "",
        description: proj.description || "",
        dueDate: proj.dueDate ? proj.dueDate.slice(0, 10) : "",
        status: proj.status || "planning",
      });

      const projectTasks = await taskApi.listProjectTasks(id);
      setTasks(projectTasks);

      const memberIds = Array.from(new Set([...(proj.members || []), proj.teamLeader].filter(Boolean)));
      const memberDocs = await Promise.all(
        memberIds.map((mid) => userApi.getUser(mid).catch(() => null))
      );
      setMembers(memberDocs.filter(Boolean));
    } catch (err) {
      setLoadError(err.message || "Couldn't load this project right now.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const approvedCount = tasks.filter((t) => t.status === "approved").length;
  const progress = tasks.length ? Math.round((approvedCount / tasks.length) * 100) : 0;

  async function handleTaskStatusChange(task, status, submissionNote) {
    setActionError(null);
    try {
      const updated = await taskApi.updateTaskStatus(task._id, status, submissionNote);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      setActionError(err.message || "Couldn't update that task.");
    }
  }

  async function handleAssignTask(e) {
    e.preventDefault();
    if (!assignForm.title || !assignForm.assignedTo) return;
    setIsAssigning(true);
    setActionError(null);
    try {
      const task = await taskApi.createTask(id, assignForm);
      setTasks((prev) => [task, ...prev]);
      setAssignForm({ title: "", description: "", assignedTo: "", dueDate: "", priority: "medium" });
      setIsAssignFormOpen(false);
    } catch (err) {
      setActionError(err.message || "Couldn't assign that task.");
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleSaveProject(e) {
    e.preventDefault();
    setIsSavingProject(true);
    setActionError(null);
    try {
      const updated = await projectApi.updateProject(id, editForm);
      setProject((prev) => ({ ...prev, ...updated }));
      setIsEditingProject(false);
    } catch (err) {
      setActionError(err.message || "Couldn't save project changes.");
    } finally {
      setIsSavingProject(false);
    }
  }

  async function handleUploadDocument(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDoc(true);
    setActionError(null);
    try {
      const document = await projectApi.addDocument(id, file);
      setProject((prev) => ({ ...prev, documents: [...(prev.documents || []), document] }));
    } catch (err) {
      setActionError(err.message || "Couldn't upload that file.");
    } finally {
      setIsUploadingDoc(false);
      e.target.value = "";
    }
  }

  if (isLoading) {
    return (
      <EmployeeLayout title="Project">
        <p className="font-label-md text-on-surface-variant">Loading project...</p>
      </EmployeeLayout>
    );
  }

  if (loadError || !project) {
    return (
      <EmployeeLayout title="Project">
        <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-md">
          {loadError || "Project not found."}
        </div>
        <button
          onClick={() => router.push("/projects")}
          className="mt-4 text-primary font-label-md hover:underline"
        >
          &larr; Back to Projects
        </button>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout title="Project Detail">
      <nav className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-2">
        <button onClick={() => router.push("/projects")} className="hover:text-primary transition-colors">
          Projects
        </button>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-bold">{project.title}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-lg text-headline-lg text-primary">{project.title}</h2>
          <span
            className={`px-3 py-1 rounded-full font-label-sm text-label-sm capitalize ${
              STATUS_STYLES[project.status] || STATUS_STYLES.planning
            }`}
          >
            {project.status?.replace("_", " ")}
          </span>
        </div>
        {canManage && (
          <button
            onClick={() => setIsEditingProject((v) => !v)}
            className="px-4 py-2 border border-outline-variant text-primary rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
          >
            {isEditingProject ? "Cancel Edit" : "Edit Project"}
          </button>
        )}
      </div>

      {actionError && (
        <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-md mb-6">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left column */}
        <section className="lg:col-span-8 space-y-gutter">
          {/* Overview */}
          <div className="bg-white p-8 rounded-xl border border-outline-variant card-shadow">
            <h3 className="font-headline-md text-headline-md text-primary mb-4">Project Overview</h3>

            {isEditingProject ? (
              <form onSubmit={handleSaveProject} className="space-y-4">
                <div>
                  <label className="block text-label-md text-on-surface mb-2">Title</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed outline-none font-body-md"
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed outline-none font-body-md resize-none"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface mb-2">Due Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed outline-none font-body-md"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface mb-2">Status</label>
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed outline-none font-body-md"
                      value={editForm.status}
                      onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProject(false)}
                    className="px-6 py-2.5 text-on-surface-variant font-label-md hover:bg-surface-container rounded-lg transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProject}
                    className="px-6 py-2.5 bg-primary text-white font-label-md rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {isSavingProject ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-on-surface-variant font-body-md text-body-md mb-8 max-w-2xl leading-relaxed">
                  {project.description || "No description provided yet."}
                </p>
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                      Due Date
                    </p>
                    <p className="font-headline-sm text-headline-sm text-primary">
                      {project.dueDate ? formatDate(project.dueDate) : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                      Tasks
                    </p>
                    <p className="font-headline-sm text-headline-sm text-primary">
                      {tasks.length} {isTeamLeader || isPrivileged ? "total" : "assigned to you"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="font-label-md text-on-surface-variant">Overall Progress</span>
                    <span className="font-headline-sm text-headline-sm text-primary">{progress}%</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Final submission / documents */}
          <div className="bg-white p-8 rounded-xl border border-outline-variant card-shadow">
            <h3 className="font-headline-md text-headline-md text-primary mb-4">Project Documents</h3>
            <p className="text-on-surface-variant font-body-md text-body-md mb-6">
              Upload deliverables or reference files for this project.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingDoc}
              className="w-full border-2 border-dashed border-outline-variant rounded-xl p-10 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group disabled:opacity-60"
            >
              <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">
                  {isUploadingDoc ? "hourglass_top" : "cloud_upload"}
                </span>
              </div>
              <p className="font-headline-sm text-headline-sm text-primary mb-2">
                {isUploadingDoc ? "Uploading..." : "Click to upload a file"}
              </p>
              <p className="font-label-md text-label-md text-on-surface-variant">
                PDF, Word, Excel, or images &middot; Max 15MB
              </p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,image/png,image/jpeg"
              onChange={handleUploadDocument}
            />

            {(project.documents || []).length > 0 && (
              <div className="mt-6 space-y-2">
                {project.documents.map((doc) => (
                  <a
                    key={doc._id}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary">description</span>
                    <span className="font-label-md text-on-surface flex-1 truncate">{doc.name}</span>
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                      open_in_new
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-xl border border-outline-variant card-shadow overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary">
                  {isTeamLeader || isPrivileged ? "Team Tasks" : "Your Tasks"}
                </h3>
                <p className="font-label-md text-label-sm text-on-surface-variant">
                  {isTeamLeader
                    ? "As Team Leader you can assign tasks and review submissions."
                    : "Tasks assigned to you on this project."}
                </p>
              </div>
              {isTeamLeader && (
                <button
                  onClick={() => setIsAssignFormOpen((v) => !v)}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Assign Task
                </button>
              )}
            </div>

            {isAssignFormOpen && isTeamLeader && (
              <form
                onSubmit={handleAssignTask}
                className="p-6 border-b border-outline-variant bg-surface-container-low space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface mb-2">Task Title</label>
                    <input
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed outline-none font-body-md bg-white"
                      value={assignForm.title}
                      onChange={(e) => setAssignForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface mb-2">Assign To</label>
                    <select
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed outline-none font-body-md bg-white"
                      value={assignForm.assignedTo}
                      onChange={(e) => setAssignForm((f) => ({ ...f, assignedTo: e.target.value }))}
                    >
                      <option value="">Select a member</option>
                      {members
                        .filter((m) => (project.members || []).includes(m._id))
                        .map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface mb-2">Due Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed outline-none font-body-md bg-white"
                      value={assignForm.dueDate}
                      onChange={(e) => setAssignForm((f) => ({ ...f, dueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface mb-2">Priority</label>
                    <select
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed outline-none font-body-md bg-white"
                      value={assignForm.priority}
                      onChange={(e) => setAssignForm((f) => ({ ...f, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-label-md text-on-surface mb-2">Description</label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed outline-none font-body-md resize-none bg-white"
                      value={assignForm.description}
                      onChange={(e) => setAssignForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAssignFormOpen(false)}
                    className="px-5 py-2 text-on-surface-variant font-label-md hover:bg-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigning}
                    className="px-5 py-2 bg-primary text-white font-label-md rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {isAssigning ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </form>
            )}

            {tasks.length === 0 ? (
              <p className="p-8 text-label-md text-on-surface-variant">No tasks yet on this project.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Task</th>
                      {(isTeamLeader || isPrivileged) && (
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                          Assignee
                        </th>
                      )}
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                        Due Date
                      </th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                        Priority
                      </th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                        Status
                      </th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {tasks.map((task) => {
                      const assignee = members.find((m) => m._id === task.assignedTo);
                      const isMine = task.assignedTo === user?.id;
                      return (
                        <tr key={task._id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-label-md text-label-md text-primary">{task.title}</p>
                            {task.description && (
                              <p className="text-label-sm text-on-surface-variant mt-0.5 max-w-xs truncate">
                                {task.description}
                              </p>
                            )}
                          </td>
                          {(isTeamLeader || isPrivileged) && (
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-primary text-[11px] font-bold overflow-hidden">
                                  {assignee?.avatarUrl ? (
                                    <Image
                                      src={assignee.avatarUrl}
                                      alt={assignee.name}
                                      width={28}
                                      height={28}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    assignee?.name?.[0]?.toUpperCase() || "?"
                                  )}
                                </div>
                                <span className="font-label-md text-label-md text-on-surface">
                                  {assignee?.name || "Unknown"}
                                </span>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                            {task.dueDate ? formatDueLabel(task.dueDate) : "\u2014"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-label-md text-label-sm font-semibold capitalize ${
                                PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full font-label-sm text-label-sm capitalize ${
                                TASK_STATUS_STYLES[task.status] || TASK_STATUS_STYLES.todo
                              }`}
                            >
                              {task.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <TaskActions
                              task={task}
                              isMine={isMine}
                              canReview={isTeamLeader || isPrivileged}
                              onChange={handleTaskStatusChange}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Right column */}
        <aside className="lg:col-span-4 space-y-gutter">
          <div className="bg-white p-6 rounded-xl border border-outline-variant card-shadow">
            <h3 className="font-headline-md text-headline-md text-primary mb-6">Team Members</h3>
            <div className="space-y-4">
              {members.length === 0 ? (
                <p className="text-label-md text-on-surface-variant">No members assigned yet.</p>
              ) : (
                members.map((m) => (
                  <div key={m._id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                      {m.avatarUrl ? (
                        <Image
                          src={m.avatarUrl}
                          alt={m.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        m.name?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-label-md text-on-surface truncate">{m.name}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        {project.teamLeader === m._id ? "Team Leader" : m.designation || "Member"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-primary-container text-white p-6 rounded-xl">
            <h4 className="font-headline-sm text-headline-sm mb-2">Task Summary</h4>
            <div className="flex justify-between font-label-md text-label-md mb-1">
              <span>Approved</span>
              <span>{approvedCount}</span>
            </div>
            <div className="flex justify-between font-label-md text-label-md mb-1">
              <span>In review</span>
              <span>{tasks.filter((t) => t.status === "submitted").length}</span>
            </div>
            <div className="flex justify-between font-label-md text-label-md">
              <span>Open</span>
              <span>{tasks.filter((t) => ["todo", "in_progress"].includes(t.status)).length}</span>
            </div>
          </div>
        </aside>
      </div>
    </EmployeeLayout>
  );
}

function TaskActions({ task, isMine, canReview, onChange }) {
  const [note, setNote] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  async function run(status, submissionNote) {
    setIsBusy(true);
    try {
      await onChange(task, status, submissionNote);
    } finally {
      setIsBusy(false);
    }
  }

  if (isMine && task.status === "todo") {
    return (
      <button
        disabled={isBusy}
        onClick={() => run("in_progress")}
        className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg font-label-sm hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        Start
      </button>
    );
  }

  if (isMine && task.status === "in_progress") {
    return (
      <div className="flex items-center gap-2">
        <input
          className="w-32 px-2 py-1.5 rounded-lg border border-outline-variant text-label-sm"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          disabled={isBusy}
          onClick={() => run("submitted", note)}
          className="px-3 py-1.5 bg-primary text-white rounded-lg font-label-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          Submit
        </button>
      </div>
    );
  }

  if (canReview && task.status === "submitted") {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled={isBusy}
          onClick={() => run("approved")}
          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-label-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          Approve
        </button>
        <button
          disabled={isBusy}
          onClick={() => run("rejected")}
          className="px-3 py-1.5 bg-error-container text-error rounded-lg font-label-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    );
  }

  return <span className="text-label-sm text-on-surface-variant">&mdash;</span>;
}
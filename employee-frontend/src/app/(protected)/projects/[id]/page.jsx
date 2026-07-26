"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import EmployeeLayout from "../../../../components/EmployeeLayout";
import { useAuth } from "../../../../context/AuthContext";
import * as projectApi from "../../../../api/project.api";
import * as taskApi from "../../../../api/task.api";
import { formatDate } from "../../../../utils/formatDate";

const STATUS_STYLES = {
  planning: "bg-secondary-container text-on-secondary-container",
  in_progress: "bg-[#e8f5e9] text-[#2e7d32]",
  on_hold: "bg-error-container text-on-error-container",
  completed: "bg-[#e0f2fe] text-[#0369a1]",
  cancelled: "bg-surface-container-high text-on-surface-variant",
};

const TASK_STATUS_STYLES = {
  approved: "bg-[#e0f2fe] text-[#0369a1]",
  submitted: "bg-secondary-container text-on-secondary-container",
  rejected: "bg-error-container text-on-error-container",
  in_progress: "bg-tertiary-container text-on-tertiary-container",
  todo: "bg-surface-container-high text-on-surface-variant",
};

function Avatar({ name, avatarUrl, size = 32 }) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name || "User"}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-sm shrink-0"
      style={{ width: size, height: size }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export default function ProjectDetailPage({ params }) {
  const { id } = params;
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", dueDate: "", status: "planning" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [projectData, taskList] = await Promise.all([
        projectApi.getProject(id),
        taskApi.listProjectTasks(id).catch(() => []),
      ]);
      setProject(projectData);
      setTasks(taskList);
      setEditForm({
        title: projectData.title || "",
        description: projectData.description || "",
        dueDate: projectData.dueDate ? projectData.dueDate.slice(0, 10) : "",
        status: projectData.status || "planning",
      });
    } catch (err) {
      setLoadError(err.message || "Couldn't load this project.");
    } finally {
      setIsLoading(false);
    }
  }

  const canEdit =
    !!project &&
    (["manager", "ceo", "hr"].includes(user?.role) || project.teamLeader?._id === user?.id);

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const approved = tasks.filter((t) => t.status === "approved").length;
    return Math.round((approved / tasks.length) * 100);
  }, [tasks]);

  const completedTasks = useMemo(
    () => [...tasks].filter((t) => t.status === "approved").sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [tasks]
  );

  const recentActivity = useMemo(
    () => [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5),
    [tasks]
  );

  async function handleSaveEdit(e) {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await projectApi.updateProject(id, {
        title: editForm.title,
        description: editForm.description,
        dueDate: editForm.dueDate || null,
        status: editForm.status,
      });
      setProject((prev) => ({ ...prev, ...updated }));
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message || "Couldn't save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadFeedback(null);
    try {
      const document = await projectApi.uploadProjectDocument(id, file);
      setProject((prev) => ({ ...prev, documents: [...(prev.documents || []), document] }));
      setUploadFeedback({ type: "success", text: `Uploaded ${document.name}.` });
    } catch (err) {
      setUploadFeedback({ type: "error", text: err.message || "Upload failed." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        <Link href="/projects" className="inline-block mt-6 text-primary font-label-md hover:underline">
          &larr; Back to Projects
        </Link>
      </EmployeeLayout>
    );
  }

  const members = project.members || [];
  const teamLeaderId = project.teamLeader?._id;
  const otherMembers = members.filter((m) => m._id !== teamLeaderId);

  return (
    <EmployeeLayout title="Projects">
      <nav className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-2">
        <Link href="/projects" className="hover:text-primary transition-colors">
          Projects
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-bold">{project.title}</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="font-headline-lg text-headline-lg text-primary">{project.title}</h2>
          <span
            className={`px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 capitalize ${
              STATUS_STYLES[project.status] || "bg-surface-container text-on-surface-variant"
            }`}
          >
            <span className="w-2 h-2 bg-current rounded-full opacity-70" />
            {project.status?.replace("_", " ")}
          </span>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsEditing((v) => !v)}
            className="px-4 py-2 border border-outline-variant text-primary rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors self-start"
          >
            {isEditing ? "Cancel Edit" : "Edit Project"}
          </button>
        )}
      </div>

      {isEditing && (
        <form
          onSubmit={handleSaveEdit}
          className="bg-white p-8 rounded-xl border border-outline-variant shadow-sm mb-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label-md text-on-surface-variant">Title</label>
              <input
                className="w-full border-outline-variant rounded-lg p-3 font-body-md"
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-on-surface-variant">Due Date</label>
              <input
                type="date"
                className="w-full border-outline-variant rounded-lg p-3 font-body-md"
                value={editForm.dueDate}
                onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-on-surface-variant">Description</label>
            <textarea
              className="w-full border-outline-variant rounded-lg p-3 font-body-md resize-none"
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2 max-w-xs">
            <label className="font-label-md text-on-surface-variant">Status</label>
            <select
              className="w-full border-outline-variant rounded-lg p-3 font-body-md"
              value={editForm.status}
              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
            >
              {["planning", "in_progress", "on_hold", "completed", "cancelled"].map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          {saveError && <p className="text-label-sm text-error">{saveError}</p>}
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left column */}
        <section className="lg:col-span-8 space-y-gutter">
          <div className="bg-white p-8 rounded-xl border border-outline-variant card-shadow">
            <h3 className="font-headline-md text-headline-md text-primary mb-4">Project Overview</h3>
            <p className="text-on-surface-variant font-body-md text-body-md mb-8 max-w-2xl leading-relaxed">
              {project.description || "No description provided yet."}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                  Created
                </p>
                <p className="font-headline-sm text-headline-sm text-primary">{formatDate(project.createdAt)}</p>
              </div>
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
                  Team Lead
                </p>
                <p className="font-headline-sm text-headline-sm text-primary">
                  {project.teamLeader?.name || "Unassigned"}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="font-label-md text-label-md text-primary">
                  Your Task Progress on this Project
                </span>
                <span className="font-headline-sm text-headline-sm text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl border border-outline-variant card-shadow">
            <h3 className="font-headline-md text-headline-md text-primary mb-4">Final Submission</h3>
            <p className="text-on-surface-variant font-body-md text-body-md mb-6">
              Upload your project deliverables for review and archival.
            </p>
            <label className="border-2 border-dashed border-outline-variant rounded-xl p-10 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary">cloud_upload</span>
              </div>
              <p className="font-headline-sm text-headline-sm text-primary mb-2">
                {isUploading ? "Uploading..." : "Click to select a file"}
              </p>
              <p className="font-label-md text-label-md text-on-surface-variant mb-2">
                Any document type, up to your server's configured limit.
              </p>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
            </label>
            {uploadFeedback && (
              <p
                className={`mt-4 text-label-sm ${
                  uploadFeedback.type === "success" ? "text-primary" : "text-error"
                }`}
              >
                {uploadFeedback.text}
              </p>
            )}

            {project.documents?.length > 0 && (
              <div className="mt-6 space-y-2">
                {project.documents.map((doc) => (
                  <a
                    key={doc._id}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary">description</span>
                    <span className="flex-1 font-label-md text-label-md text-primary truncate">{doc.name}</span>
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">download</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-outline-variant card-shadow overflow-hidden">
            <div className="p-6 border-b border-outline-variant">
              <h3 className="font-headline-md text-headline-md text-primary">Completed Tasks</h3>
            </div>
            {completedTasks.length === 0 ? (
              <p className="p-6 text-label-md text-on-surface-variant">No completed tasks yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Task Name</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Assignee</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Completed</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Priority</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {completedTasks.map((task) => (
                      <tr key={task._id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-label-md text-label-md text-primary">{task.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={task.assignedTo?.name} avatarUrl={task.assignedTo?.avatarUrl} size={28} />
                            <span className="font-label-md text-label-md text-on-surface">
                              {task.assignedTo?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                          {formatDate(task.updatedAt)}
                        </td>
                        <td className="px-6 py-4 font-label-md text-label-md text-on-surface-variant capitalize">
                          {task.priority}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-[#e0f2fe] text-[#0369a1] px-3 py-1 rounded-full font-label-sm text-label-sm capitalize">
                            Approved
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Right column */}
        <aside className="lg:col-span-4 space-y-gutter">
          <div className="bg-white p-6 rounded-xl border border-outline-variant card-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-md text-headline-md text-primary">Team Members</h3>
              <span className="text-label-sm text-on-surface-variant">{members.length}</span>
            </div>
            <div className="space-y-2">
              {project.teamLeader && (
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-all">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={project.teamLeader.name}
                      avatarUrl={project.teamLeader.avatarUrl}
                      size={40}
                    />
                    <div>
                      <p className="font-label-md text-label-md text-primary">{project.teamLeader.name}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Team Lead</p>
                    </div>
                  </div>
                </div>
              )}
              {otherMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} avatarUrl={member.avatarUrl} size={40} />
                    <div>
                      <p className="font-label-md text-label-md text-primary">{member.name}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        {member.designation || member.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-label-sm text-on-surface-variant">No members listed yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-outline-variant card-shadow">
            <h3 className="font-headline-md text-headline-md text-primary mb-6">Recent Task Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="text-label-sm text-on-surface-variant">No task activity yet.</p>
            ) : (
              <div className="relative space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container">
                {recentActivity.map((task) => (
                  <div key={task._id} className="relative pl-8">
                    <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 border-primary rounded-full flex items-center justify-center z-10">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <p className="font-label-md text-label-md text-primary capitalize">
                      &quot;{task.title}&quot; is {task.status.replace("_", " ")}
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {formatDate(task.updatedAt)} &bull; {task.assignedTo?.name || "Unknown"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </EmployeeLayout>
  );
}

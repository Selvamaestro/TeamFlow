import { useEffect, useMemo, useState } from "react";
import EmployeeLayout from "../layouts/EmployeeLayout";
import TaskListItem from "../components/TaskListItem";
import { useAuth } from "../context/AuthContext";
import * as projectApi from "../api/project.api";
import * as taskApi from "../api/task.api";
import * as rewardApi from "../api/reward.api";
import * as attendanceApi from "../api/attendance.api";
import { formatTime, formatDueLabel, daysUntil } from "../utils/formatDate";

export default function Dashboard() {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [todaysAttendance, setTodaysAttendance] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [rewards, setRewards] = useState([]);
  const [progressNote, setProgressNote] = useState("");
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState(null);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDashboard() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [attendanceRecords, projectList, rewardList] = await Promise.all([
        attendanceApi.getMyAttendance().catch(() => []),
        projectApi.listProjects(),
        rewardApi.getMyRewards().catch(() => []),
      ]);

      const today = new Date().toDateString();
      const todaysRecord = attendanceRecords.find((r) => new Date(r.date).toDateString() === today);
      setTodaysAttendance(todaysRecord || null);

      setProjects(projectList);
      setRewards(rewardList);

      const active = projectList.find((p) => p.status === "in_progress" || p.status === "planning");
      setCurrentProject(active || projectList[0] || null);

      if (active || projectList[0]) {
        const projectTasks = await taskApi.listProjectTasks((active || projectList[0])._id);
        setTasks(projectTasks);
      }
    } catch (err) {
      setLoadError(err.message || "Couldn't load your dashboard right now.");
    } finally {
      setIsLoading(false);
    }
  }

  const totalPoints = useMemo(() => rewards.reduce((sum, r) => sum + (r.points || 0), 0), [rewards]);

  const projectProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const approved = tasks.filter((t) => t.status === "approved").length;
    return Math.round((approved / tasks.length) * 100);
  }, [tasks]);

  // The task this employee should be reporting progress against right now.
  const activeTask = useMemo(
    () => tasks.find((t) => t.status === "todo" || t.status === "in_progress"),
    [tasks]
  );

  const upcomingDeadlines = useMemo(() => {
    const items = [];
    projects.forEach((p) => {
      if (p._id !== currentProject?._id && p.dueDate) {
        items.push({ id: p._id, label: p.title, dueDate: p.dueDate, kind: "project" });
      }
    });
    tasks.forEach((t) => {
      if (t.dueDate && t.status !== "approved") {
        items.push({ id: t._id, label: t.title, dueDate: t.dueDate, kind: "task" });
      }
    });
    return items
      .filter((i) => daysUntil(i.dueDate) !== null && daysUntil(i.dueDate) >= 0)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);
  }, [projects, tasks, currentProject]);

  const soonestDeadline = upcomingDeadlines[0];

  async function handleCheckIn() {
    setIsCheckingIn(true);
    try {
      const record = await attendanceApi.checkIn();
      setTodaysAttendance(record);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setIsCheckingIn(false);
    }
  }

  async function handleToggleTask(task, nextStatus) {
    const updated = await taskApi.updateTaskStatus(task._id, nextStatus);
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  }

  async function handleSubmitUpdate(e) {
    e.preventDefault();
    if (!activeTask || !progressNote.trim()) return;
    setIsSubmittingUpdate(true);
    setUpdateFeedback(null);
    try {
      const updated = await taskApi.updateTaskStatus(activeTask._id, "submitted", progressNote.trim());
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setProgressNote("");
      setUpdateFeedback({ type: "success", text: "Update submitted for review." });
    } catch (err) {
      setUpdateFeedback({ type: "error", text: err.message || "Couldn't submit your update." });
    } finally {
      setIsSubmittingUpdate(false);
    }
  }

  if (isLoading) {
    return (
      <EmployeeLayout title="WorkforceConnect">
        <p className="font-label-md text-on-surface-variant">Loading dashboard...</p>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout title="WorkforceConnect">
      {loadError && (
        <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-md mb-6">
          {loadError}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="font-body-md text-on-surface-variant">
            {currentProject
              ? `Here's what's happening on ${currentProject.title} today.`
              : "You're not assigned to any active project yet."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-3 bg-surface-container-lowest px-6 py-3 rounded-xl border border-outline-variant shadow-sm">
            {todaysAttendance ? (
              <>
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <span className="font-label-md text-on-surface font-semibold">Present Today</span>
                <span className="text-label-sm text-on-surface-variant ml-2">
                  Checked in at {formatTime(todaysAttendance.checkIn)}
                </span>
              </>
            ) : (
              <button
                onClick={handleCheckIn}
                disabled={isCheckingIn}
                className="flex items-center gap-2 text-label-md font-semibold text-primary disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                {isCheckingIn ? "Checking in..." : "Check In"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 bg-surface-container-lowest px-6 py-3 rounded-xl border border-outline-variant shadow-sm">
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">stars</span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Total Points</span>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">
                {totalPoints.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-12 flex flex-col md:flex-row gap-6 items-start w-full">
          <div className="flex-1 flex flex-col gap-6">
            {currentProject && (
              <section className="w-full bg-white border border-outline-variant rounded-[16px] p-8 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-label-sm uppercase tracking-widest text-on-surface-variant opacity-80">
                      Current Project
                    </span>
                    <h3 className="font-headline-md text-headline-md text-primary mt-1">
                      {currentProject.title}
                    </h3>
                  </div>
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm font-semibold capitalize">
                    {currentProject.status?.replace("_", " ")}
                  </span>
                </div>
                <p className="font-body-md text-on-surface-variant mb-6">{currentProject.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-label-sm">
                    <span className="text-on-surface-variant">Overall Progress</span>
                    <span className="font-bold text-primary">{projectProgress}%</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${projectProgress}%` }} />
                  </div>
                </div>
              </section>
            )}

            <section className="w-full bg-white border border-outline-variant rounded-[16px] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-headline-md text-primary">Your Tasks</h3>
                <span className="text-label-sm text-on-surface-variant">
                  {tasks.filter((t) => ["submitted", "approved"].includes(t.status)).length} of {tasks.length}{" "}
                  completed
                </span>
              </div>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <p className="text-label-md text-on-surface-variant">
                    No tasks assigned to you on this project yet.
                  </p>
                ) : (
                  tasks.map((task) => (
                    <TaskListItem key={task._id} task={task} onToggle={handleToggleTask} />
                  ))
                )}
              </div>
            </section>

            <section className="w-full bg-surface-container-low border border-outline-variant rounded-[16px] p-8 shadow-sm flex flex-col justify-between min-h-[400px]">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Update Progress</h3>
                <p className="font-body-md text-on-surface-variant mb-6">
                  {activeTask
                    ? `Briefly explain what you accomplished on "${activeTask.title}" for the project logs.`
                    : "You don't have an open task to report progress on right now."}
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleSubmitUpdate}>
                <textarea
                  className="w-full bg-white border border-outline-variant rounded-lg p-4 text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all placeholder:text-on-surface-variant/50 disabled:opacity-60"
                  placeholder="e.g. Completed the frontend integration for the user dashboard..."
                  rows={8}
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  disabled={!activeTask || isSubmittingUpdate}
                />
                {updateFeedback && (
                  <p
                    className={`text-label-sm ${
                      updateFeedback.type === "success" ? "text-primary" : "text-error"
                    }`}
                  >
                    {updateFeedback.text}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
                  disabled={!activeTask || !progressNote.trim() || isSubmittingUpdate}
                >
                  {isSubmittingUpdate ? "Submitting..." : "Submit Update"}
                </button>
              </form>
            </section>
          </div>

          <section className="w-full md:w-80 space-y-6">
            {soonestDeadline && daysUntil(soonestDeadline.dueDate) <= 3 && (
              <div className="bg-error-container text-on-error-container rounded-[16px] p-6 border border-error/20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-error">alarm</span>
                  <h3 className="font-label-md uppercase tracking-wide">Approaching Deadline</h3>
                </div>
                <p className="font-headline-md text-headline-md mb-2">{soonestDeadline.label}</p>
                <p className="font-body-md mb-6 opacity-80 capitalize">{soonestDeadline.kind} deadline</p>
                <div className="flex justify-between items-center bg-white/20 p-3 rounded-lg">
                  <span className="font-label-md">{formatDueLabel(soonestDeadline.dueDate)}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            )}

            <div className="bg-white border border-outline-variant rounded-[16px] p-6 shadow-sm">
              <h3 className="font-label-md text-primary mb-4">Upcoming Deadlines</h3>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-label-sm text-on-surface-variant">Nothing due soon.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingDeadlines.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-on-tertiary-container mt-2" />
                      <div>
                        <span className="font-label-md text-on-surface block">{item.label}</span>
                        <span className="text-label-sm text-on-surface-variant">
                          {formatDueLabel(item.dueDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </EmployeeLayout>
  );
}

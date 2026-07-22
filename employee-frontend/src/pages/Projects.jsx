import { useEffect, useState } from "react";
import EmployeeLayout from "../layouts/EmployeeLayout";
import ProjectProgressCard from "../components/ProjectProgressCard";
import * as projectApi from "../api/project.api";
import * as taskApi from "../api/task.api";
import { formatDate } from "../utils/formatDate";

export default function Projects() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [projects, setProjects] = useState([]);
  // projectId -> { progress, taskCount }
  const [projectStats, setProjectStats] = useState({});

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await projectApi.listProjects();
      setProjects(list);

      const statsEntries = await Promise.all(
        list.map(async (project) => {
          try {
            const tasks = await taskApi.listProjectTasks(project._id);
            const approved = tasks.filter((t) => t.status === "approved").length;
            const progress = tasks.length ? Math.round((approved / tasks.length) * 100) : 0;
            return [project._id, { progress, taskCount: tasks.length }];
          } catch {
            return [project._id, { progress: 0, taskCount: 0 }];
          }
        })
      );
      setProjectStats(Object.fromEntries(statsEntries));
    } catch (err) {
      setLoadError(err.message || "Couldn't load your projects right now.");
    } finally {
      setIsLoading(false);
    }
  }

  const currentProjects = projects.filter((p) => p.status !== "completed" && p.status !== "cancelled");
  const completedProjects = projects.filter((p) => p.status === "completed");

  return (
    <EmployeeLayout title="Projects">
      {loadError && (
        <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-md mb-6">
          {loadError}
        </div>
      )}

      {isLoading ? (
        <p className="font-label-md text-on-surface-variant">Loading projects...</p>
      ) : (
        <div className="space-y-12 pb-12">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface">Current Projects</h3>
            </div>

            {currentProjects.length === 0 ? (
              <p className="text-label-md text-on-surface-variant">
                You're not assigned to any active projects right now.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                {currentProjects.map((project) => (
                  <ProjectProgressCard
                    key={project._id}
                    project={project}
                    progress={projectStats[project._id]?.progress ?? 0}
                    taskCount={projectStats[project._id]?.taskCount ?? 0}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface">Completed Projects</h3>
            </div>

            {completedProjects.length === 0 ? (
              <p className="text-label-md text-on-surface-variant">No completed projects yet.</p>
            ) : (
              <div className="bg-white rounded-xl border border-outline-variant card-shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="px-6 py-4 font-label-md text-on-surface-variant">Project Name</th>
                        <th className="px-6 py-4 font-label-md text-on-surface-variant">Status</th>
                        <th className="px-6 py-4 font-label-md text-on-surface-variant">Due Date</th>
                        <th className="px-6 py-4 font-label-md text-on-surface-variant">Your Tasks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {completedProjects.map((project) => (
                        <tr key={project._id} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-secondary-container flex items-center justify-center text-on-secondary-container">
                                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                              </div>
                              <span className="font-label-md text-on-surface">{project.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-label-md text-on-surface-variant capitalize">
                            {project.status}
                          </td>
                          <td className="px-6 py-5 font-label-md text-on-surface-variant">
                            {project.dueDate ? formatDate(project.dueDate) : "—"}
                          </td>
                          <td className="px-6 py-5 font-label-md text-on-surface-variant">
                            {projectStats[project._id]?.taskCount ?? 0} tasks
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </EmployeeLayout>
  );
}

import { formatDate } from "../utils/formatDate";

const STATUS_STYLES = {
  in_progress: "bg-secondary-container text-on-secondary-container",
  planning: "bg-tertiary-container text-on-tertiary-container",
  on_hold: "bg-error-container text-on-error-container",
};

export default function ProjectProgressCard({ project, progress, taskCount }) {
  return (
    <div className="bg-white rounded-xl p-8 border border-outline-variant card-shadow relative overflow-hidden md:col-span-6">
      <div className="absolute top-0 right-0 p-4">
        <span
          className={`px-3 py-1 rounded-full text-label-sm capitalize ${
            STATUS_STYLES[project.status] || "bg-secondary-container text-on-secondary-container"
          }`}
        >
          {project.status?.replace("_", " ")}
        </span>
      </div>
      <div className="flex flex-col h-full justify-between">
        <div>
          <h4 className="font-headline-md text-headline-md mb-2 text-primary pr-28">{project.title}</h4>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mb-6">
            {project.description}
          </p>
          <div className="flex gap-8 mb-6">
            <div className="flex flex-col">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Members</span>
              <span className="font-label-md text-on-surface">{project.members?.length || 0} people</span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Due Date</span>
              <span className="font-label-md text-on-surface">
                {project.dueDate ? formatDate(project.dueDate) : "Not set"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Tasks</span>
              <span className="font-label-md text-on-surface">{taskCount} assigned to you</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="font-label-md text-on-surface-variant">Overall Progress</span>
            <span className="font-headline-sm text-headline-sm text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { TEAM_PROJECT_STAGES, type TeamProject } from "../../types";

type TeamProjectProgressProps = {
  project: TeamProject;
};

export function TeamProjectProgress({ project }: TeamProjectProgressProps) {
  const clamped = Math.min(100, Math.max(0, project.progress));
  const stageCount = TEAM_PROJECT_STAGES.length;

  return (
    <section className="fb-teams-detail-project" aria-label={`Project ${project.name}`}>
      <div className="fb-teams-detail-project-meta">
        <p className="fb-teams-detail-project-name">PROJECT: {project.name}</p>
        <p>ACTIVE TASKS: {project.activeTasks}</p>
        <p>CLOSED TASKS: {project.closedTasks}</p>
        <p>ACTIVE INTERNS: {project.activeInterns}</p>
      </div>

      <div className="fb-teams-detail-stages">
        <div className="fb-teams-detail-stages-scroller">
          <div className="fb-teams-detail-stages-inner">
            <div
              className="fb-teams-detail-stages-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={clamped}
              aria-label={`${project.name} progress`}
            >
              <div
                className="fb-teams-detail-stages-fill"
                style={{ width: `${clamped}%` }}
              />
              <div className="fb-teams-detail-stages-dividers" aria-hidden>
                {Array.from({ length: stageCount - 1 }, (_, index) => (
                  <span
                    key={TEAM_PROJECT_STAGES[index + 1]}
                    style={{ left: `${((index + 1) / stageCount) * 100}%` }}
                  />
                ))}
              </div>
              {clamped > 0 ? (
                <span
                  className="fb-teams-detail-stages-percent"
                  style={{ left: `${clamped / 2}%` }}
                >
                  {clamped}%
                </span>
              ) : null}
            </div>

            <ul className="fb-teams-detail-stages-labels">
              {TEAM_PROJECT_STAGES.map((stage) => (
                <li key={stage}>{stage}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

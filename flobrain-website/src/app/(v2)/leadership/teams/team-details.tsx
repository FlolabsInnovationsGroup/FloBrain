"use client";

import Link from "next/link";

import { DesignScrollbar } from "@/components/v2/tasks/DesignScrollbar";

import { TeamProjectProgress } from "./components/team-project-progress";
import type { TeamDetail } from "./types";

type TeamDetailsProps = {
  team: TeamDetail;
};

/**
 * Team details content from Lead Controls Figma (frame 19:680).
 * Shared V2 chrome (nav + create CTAs) stays in PageStructure — this is
 * only the center content: back link, header, project progress, project rows.
 */
export function TeamDetails({ team }: TeamDetailsProps) {
  const [featured, ...restProjects] = team.projects;
  const title = /team/i.test(team.name) ? team.name.toUpperCase() : `${team.name} TEAM`.toUpperCase();

  return (
    <div className="fb-teams-detail">
      <Link href="/leadership/teams" className="fb-teams-detail-back">
        <span className="fb-teams-detail-back-arrow" aria-hidden="true" />
        Back to Teams
      </Link>

      <DesignScrollbar
        className="fb-teams-detail-row"
        viewportClassName="fb-teams-detail-viewport"
      >
        <div className="fb-teams-detail-body">
          <header className="fb-teams-detail-header">
            <div className="fb-teams-detail-identity">
              <div className="fb-teams-detail-avatar" aria-hidden />
              <div className="fb-teams-detail-copy">
                <h2 className="fb-teams-detail-title">{title}</h2>
                <p className="fb-teams-detail-lead">Lead: {team.lead}</p>
                <p className="fb-teams-detail-description">{team.description}</p>
              </div>
            </div>

            <dl className="fb-teams-detail-stats">
              <div>
                <dt>{team.blockers}</dt>
                <dd>Blockers</dd>
              </div>
              <div>
                <dt>{team.activeProjects}</dt>
                <dd>Active Projects</dd>
              </div>
              <div>
                <dt>{team.activeInterns}</dt>
                <dd>Active Interns</dd>
              </div>
            </dl>
          </header>

          {featured ? <TeamProjectProgress project={featured} /> : null}

          <ul className="fb-teams-detail-project-list">
            {restProjects.map((_, index) => (
              <li key={`project-${index + 2}`}>
                <article className="fb-teams-detail-project-row">
                  <h3>{`PROJECT: #${index + 2}`}</h3>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </DesignScrollbar>
    </div>
  );
}

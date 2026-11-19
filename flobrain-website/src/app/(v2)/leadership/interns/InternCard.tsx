import { WEEKLY_HOURS, type Intern } from "./types";

interface InternCardProps {
  intern: Intern;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return words[0]?.slice(0, 2).toUpperCase() || "?";
}

export const InternCard = ({ intern }: InternCardProps) => {
  return (
    <article className="flex h-full min-h-[168px] flex-col justify-between rounded-[5px] border border-[var(--fb-v2-border)] p-4">
      <div>
        <div className="mb-3 flex items-start gap-2.5">
          <div
            aria-hidden
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[var(--fb-v2-text-muted)] text-xs font-medium text-[var(--fb-v2-page-bg)]"
          >
            {getInitials(intern.name)}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h2 className="truncate text-xs font-medium leading-normal text-[var(--fb-v2-heading)]">
              {intern.name}
            </h2>
            <p className="truncate text-xs font-medium leading-normal text-[var(--fb-v2-text)]">
              {intern.designation}
            </p>
          </div>
        </div>

        <dl className="flex flex-col gap-1.5 text-[12px] font-normal leading-normal">
          <div className="flex min-w-0 items-baseline justify-between gap-2">
            <dt className="shrink-0 text-[var(--fb-v2-text-muted)]">Team</dt>
            <dd className="min-w-0 truncate text-right text-[var(--fb-v2-text)]">{intern.team}</dd>
          </div>
          <div className="flex min-w-0 items-baseline justify-between gap-2">
            <dt className="shrink-0 text-[var(--fb-v2-text-muted)]">Project</dt>
            <dd className="min-w-0 truncate text-right text-[var(--fb-v2-text)]">
              {intern.project}
            </dd>
          </div>
          <div className="flex min-w-0 items-baseline justify-between gap-2">
            <dt className="shrink-0 text-[var(--fb-v2-text-muted)]">Hours</dt>
            <dd className="tabular-nums text-[var(--fb-v2-text)]">
              {intern.hours}/{WEEKLY_HOURS}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 border-t border-[var(--fb-v2-border)] pt-3">
        <p className="text-[10px] font-medium leading-normal text-[var(--fb-v2-text-muted)]">
          Specialization
        </p>
        <p className="mt-1 truncate text-[12px] font-normal leading-normal text-[var(--fb-v2-heading)]">
          {intern.specialization}
        </p>
      </div>
    </article>
  );
};

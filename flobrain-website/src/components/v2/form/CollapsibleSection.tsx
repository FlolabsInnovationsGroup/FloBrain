"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type CollapsibleSectionProps = {
  title: string;
  /** Shows a small marker while collapsed so filled sections are not forgotten. */
  filled?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsibleSection({
  title,
  filled = false,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="fb-v2-task-section" data-open={open}>
      <button
        type="button"
        className="fb-v2-task-section-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className="fb-v2-task-section-title">
          {title}
          {filled && !open ? (
            <span className="fb-v2-task-section-filled" aria-label="has content" />
          ) : null}
        </span>
        <ChevronDown size={16} className="fb-v2-task-section-chevron" aria-hidden="true" />
      </button>
      <div id={panelId} role="region" aria-label={title} hidden={!open}>
        <div className="fb-v2-task-section-body">{children}</div>
      </div>
    </div>
  );
}

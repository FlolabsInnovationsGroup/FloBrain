"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  CREATE_ACTIONS,
  LeadershipToolbar,
  type CreateActionId,
} from "./LeadershipToolbar";
import {
  LEADERSHIP_NAV_ITEMS,
  MAIN_NAV_ITEMS,
  isLeadershipNavActive,
  isLeadershipSection,
  isMainNavActive,
  showLeadershipSearch,
} from "./navigation";

export type PageStructureProps = {
  children?: ReactNode;
  /** Meetings / chat column. Owned by the left-panel pages. */
  leftPanel?: ReactNode;
  /** Timer / buddies column. Owned by the right-panel pages. */
  rightPanel?: ReactNode;
};

/**
 * Shared FloBrain V2 shell. It renders under the existing V1 navbar.
 * Page content goes in `children`. Side regions stay empty until the
 * panel pages pass `leftPanel` or `rightPanel`.
 */
export function PageStructure({
  children,
  leftPanel,
  rightPanel,
}: PageStructureProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [createAction, setCreateAction] = useState<CreateActionId | null>(null);
  const currentPath = pendingPath ?? pathname;
  const showLeadershipNav = isLeadershipSection(currentPath);
  const showSearch = showLeadershipSearch(currentPath);
  const activeCreateLabel =
    CREATE_ACTIONS.find((action) => action.id === createAction)?.label ?? null;
  const activeLabel =
    LEADERSHIP_NAV_ITEMS.find((item) => isLeadershipNavActive(item.href, currentPath))?.label ??
    MAIN_NAV_ITEMS.find((item) => isMainNavActive(item.href, currentPath))?.label ??
    "FloBrain";

  useEffect(() => {
    setPendingPath(null);
    setCreateAction(null);
  }, [pathname]);

  useEffect(() => {
    for (const item of MAIN_NAV_ITEMS) router.prefetch(item.href);
    for (const item of LEADERSHIP_NAV_ITEMS) router.prefetch(item.href);
  }, [router]);

  return (
    <div className="fb-v2-shell">
      <nav className="fb-v2-main-nav" aria-label="Primary">
        <ul className="fb-v2-main-nav-list">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = isMainNavActive(item.href, currentPath);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="fb-v2-main-link"
                  aria-current={isActive ? "page" : undefined}
                  prefetch
                  scroll={false}
                  onPointerDown={() => setPendingPath(item.href)}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className="fb-v2-center" aria-label={activeLabel}>
        <h1 className="sr-only">{activeLabel}</h1>
        {showLeadershipNav ? (
          <nav className="fb-v2-leadership-nav" aria-label="Leadership">
            <ul className="fb-v2-leadership-nav-list">
              {LEADERSHIP_NAV_ITEMS.map((item) => {
                const isActive = isLeadershipNavActive(item.href, currentPath);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="fb-v2-sub-link"
                      aria-current={isActive ? "page" : undefined}
                      prefetch
                      scroll={false}
                      onPointerDown={() => setPendingPath(item.href)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
        {showLeadershipNav ? (
          <div className="fb-v2-actions" data-slot="actions">
            <LeadershipToolbar
              showSearch={showSearch}
              activeAction={createAction}
              onActionClick={setCreateAction}
            />
          </div>
        ) : null}
        <div className="fb-v2-content" data-slot="content">
          {createAction ? (
            <div
              className="fb-v2-create-panel"
              data-slot="create-panel"
              data-create={createAction}
              aria-label={activeCreateLabel ?? "Create"}
            />
          ) : (
            children
          )}
        </div>
      </section>

      <aside
        className={leftPanel ? "fb-v2-panel-left" : "fb-v2-panel-left fb-v2-slot-empty"}
        data-slot="left-panel"
        aria-label={leftPanel ? "Left panel" : undefined}
        aria-hidden={leftPanel ? undefined : true}
      >
        {leftPanel}
      </aside>
      <aside
        className={rightPanel ? "fb-v2-panel-right" : "fb-v2-panel-right fb-v2-slot-empty"}
        data-slot="right-panel"
        aria-label={rightPanel ? "Right panel" : undefined}
        aria-hidden={rightPanel ? undefined : true}
      >
        {rightPanel}
      </aside>
    </div>
  );
}

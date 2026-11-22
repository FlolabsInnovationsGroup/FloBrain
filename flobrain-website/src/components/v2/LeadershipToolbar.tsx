"use client";

import Link from "next/link";
import { CREATE_ACTION_ITEMS, isPathActive } from "./navigation";

type LeadershipToolbarProps = {
  pathname: string;
  showSearch?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
};

function SearchIcon() {
  return (
    <svg
      width="17.0047"
      height="17.0046"
      viewBox="0 0 17.0047 17.0046"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.16016 0C11.1143 8.34928e-05 14.3203 3.206 14.3203 7.16016C14.3203 8.53917 13.9286 9.82619 13.2529 10.9189L16.5215 14.1885C17.1656 14.8329 17.1658 15.8772 16.5215 16.5215C15.8772 17.1658 14.8329 17.1656 14.1885 16.5215L10.9199 13.2539C9.82708 13.9297 8.53933 14.3203 7.16016 14.3203C3.20595 14.3203 7.91112e-05 11.1143 0 7.16016C5.52825e-05 3.20595 3.20593 0 7.16016 0ZM7.16016 2.40039C4.53142 2.40039 2.40045 4.53143 2.40039 7.16016C2.40047 9.78886 4.53143 11.9199 7.16016 11.9199C9.78881 11.9198 11.9198 9.78881 11.9199 7.16016C11.9199 4.53148 9.78882 2.40047 7.16016 2.40039Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Leadership action row under the secondary nav.
 * Search appears on Dashboard, Teams, and Interns only.
 */
export function LeadershipToolbar({
  pathname,
  showSearch = false,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: LeadershipToolbarProps) {
  return (
    <div className="fb-v2-toolbar">
      <div className="fb-v2-create-actions">
        {CREATE_ACTION_ITEMS.map((action) => {
          const isActive = isPathActive(action.href, pathname);
          return (
            <Link
              key={action.href}
              href={action.href}
              className={isActive ? "fb-v2-btn-create fb-v2-btn-create-active" : "fb-v2-btn-create"}
              aria-current={isActive ? "page" : undefined}
              prefetch
              scroll={false}
            >
              {action.label}
            </Link>
          );
        })}
      </div>

      {showSearch ? (
        <label className="fb-v2-search">
          <span className="sr-only">Search by name</span>
          <span className="fb-v2-search-icon">
            <SearchIcon />
          </span>
          <input
            type="search"
            className="fb-v2-search-input"
            placeholder="Search by name"
            autoComplete="off"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Enter") onSearchSubmit();
              if (event.key === "Escape") onSearchChange("");
            }}
          />
        </label>
      ) : null}
    </div>
  );
}

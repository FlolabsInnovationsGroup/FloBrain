"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Paperclip,
  Library,
  Clock3,
  FilePlus2,
  Upload,
  ChevronRight,
} from "lucide-react";
import { fetchDocsRecent, v2Keys, formatIsoDate } from "@/lib/v2-api";

const actions = [
  {
    title: "New Doc",
    description: "Create a new document",
    href: "/docs/new",
    icon: FilePlus2,
  },
  {
    title: "New Attachment",
    description: "Upload files and attachments",
    href: "/docs/attachments/new",
    icon: Upload,
  },
  {
    title: "Library",
    description: "Browse your documents and attachments",
    href: "/docs/library",
    icon: Library,
  },
];

export function MyDocsOverview() {
  const { data: recentData, isLoading } = useQuery({
    queryKey: v2Keys.docsRecent,
    queryFn: fetchDocsRecent,
  });

  const recentActivities = (recentData ?? []).map((item) => ({
    title: item.title,
    description: item.type === "document" ? "Document" : "Attachment uploaded",
    date: formatIsoDate(item.date),
    type: item.type,
  }));

  return (
    <div
      className="flex min-h-full flex-col gap-6 p-5 sm:p-6"
      style={{ color: "var(--fb-v2-text)" }}
    >
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--fb-v2-heading)" }}
        >
          My Docs
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--fb-v2-text-muted)" }}
        >
          Create, manage and access your documents and attachments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex min-h-[145px] flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--fb-v2-accent)] hover:shadow-lg"
              style={{
                background: "var(--fb-v2-surface)",
                borderColor: "var(--fb-v2-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{
                    background: "var(--fb-v2-page-bg)",
                    color: "var(--fb-v2-accent)",
                  }}
                >
                  <Icon size={20} />
                </div>
                <ChevronRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                  style={{ color: "var(--fb-v2-text-muted)" }}
                />
              </div>

              <div>
                <h2
                  className="text-sm font-semibold"
                  style={{ color: "var(--fb-v2-heading)" }}
                >
                  {action.title}
                </h2>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--fb-v2-text-muted)" }}
                >
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <section
        className="overflow-hidden rounded-xl border"
        style={{
          background: "var(--fb-v2-surface)",
          borderColor: "var(--fb-v2-border)",
        }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
          style={{ borderColor: "var(--fb-v2-border)" }}
        >
          <div>
            <div className="flex items-center gap-2">
              <Clock3 size={17} style={{ color: "var(--fb-v2-accent)" }} />
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--fb-v2-heading)" }}
              >
                Recent Activity
              </h2>
            </div>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--fb-v2-text-muted)" }}
            >
              Your recently created and updated files
            </p>
          </div>

          <Link
            href="/docs/library"
            className="text-xs font-medium hover:opacity-75"
            style={{ color: "var(--fb-v2-accent)" }}
          >
            View Library
          </Link>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--fb-v2-border)" }}>
          {isLoading ? (
            <div className="px-5 py-6 text-center text-sm" style={{ color: "var(--fb-v2-text-muted)" }}>
              Loading recent activity…
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm" style={{ color: "var(--fb-v2-text-muted)" }}>
              No recent activity yet.
            </div>
          ) : (
            recentActivities.map((activity, index) => {
              const Icon = activity.type === "document" ? FileText : Paperclip;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: "var(--fb-v2-page-bg)",
                        color: "var(--fb-v2-accent)",
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="truncate text-sm font-medium"
                        style={{ color: "var(--fb-v2-heading)" }}
                      >
                        {activity.title}
                      </h3>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--fb-v2-text-muted)" }}
                      >
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className="shrink-0 text-xs"
                    style={{ color: "var(--fb-v2-text-subtle)" }}
                  >
                    {activity.date}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

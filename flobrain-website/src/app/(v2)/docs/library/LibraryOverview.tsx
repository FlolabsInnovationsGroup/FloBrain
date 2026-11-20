
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Paperclip,
  Star,
  Clock3,
} from "lucide-react";

type LibraryItem = {
  id: number;
  name: string;
  modified: string;
  favorite: boolean;
};

const initialDocuments: LibraryItem[] = [
  { id: 1, name: "Project Documentation", modified: "Nov 20, 2026", favorite: true },
  { id: 2, name: "Team Meeting Notes", modified: "Nov 18, 2026", favorite: false },
  { id: 3, name: "Project Requirements", modified: "Nov 17, 2026", favorite: false },
];

const initialAttachments: LibraryItem[] = [
  { id: 4, name: "Design Reference.pdf", modified: "Nov 19, 2026", favorite: true },
  { id: 5, name: "Project Assets.zip", modified: "Nov 16, 2026", favorite: false },
];

export function LibraryOverview() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [attachments, setAttachments] = useState(initialAttachments);
  const [showFavorites, setShowFavorites] = useState(false);

  function toggleFavorite(id: number, type: "document" | "attachment") {
    if (type === "document") {
      setDocuments((current) =>
        current.map((item) =>
          item.id === id ? { ...item, favorite: !item.favorite } : item,
        ),
      );
    } else {
      setAttachments((current) =>
        current.map((item) =>
          item.id === id ? { ...item, favorite: !item.favorite } : item,
        ),
      );
    }
  }

  const visibleDocuments = showFavorites
    ? documents.filter((item) => item.favorite)
    : documents;

  const visibleAttachments = showFavorites
    ? attachments.filter((item) => item.favorite)
    : attachments;

  const favoriteCount =
    documents.filter((item) => item.favorite).length +
    attachments.filter((item) => item.favorite).length;

  function renderItems(items: LibraryItem[], type: "document" | "attachment") {
    const Icon = type === "document" ? FileText : Paperclip;

    if (items.length === 0) {
      return (
        <div className="px-5 py-8 text-center">
          <p className="text-sm" style={{ color: "var(--fb-v2-text-muted)" }}>
            No {type === "document" ? "documents" : "attachments"} found.
          </p>
        </div>
      );
    }

    return items.map((item) => (
      <div
        key={item.id}
        className="flex items-center justify-between gap-3 border-t px-5 py-4 transition-colors hover:bg-white/[0.03]"
        style={{ borderColor: "var(--fb-v2-border)" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: "var(--fb-v2-page-bg)",
              color: "var(--fb-v2-accent)",
            }}
          >
            <Icon size={19} />
          </div>

          <div className="min-w-0">
            <h3
              className="truncate text-sm font-medium"
              style={{ color: "var(--fb-v2-heading)" }}
            >
              {item.name}
            </h3>
            <div
              className="mt-1 flex items-center gap-1 text-xs"
              style={{ color: "var(--fb-v2-text-muted)" }}
            >
              <Clock3 size={12} />
              Last modified: {item.modified}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(item.id, type)}
          aria-label={item.favorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
          title={item.favorite ? "Remove from favorites" : "Add to favorites"}
          className="shrink-0 cursor-pointer rounded-md p-2 transition-colors hover:bg-white/10"
        >
          <Star
            size={18}
            fill={item.favorite ? "#eab308" : "none"}
            color={item.favorite ? "#eab308" : "currentColor"}
          />
        </button>
      </div>
    ));
  }

  return (
    <div
      className="flex min-h-full flex-col gap-6 p-5 sm:p-6"
      style={{ color: "var(--fb-v2-text)" }}
    >
      {/* Header */}
      <div>
        <Link
          href="/docs"
          className="mb-4 inline-flex items-center gap-2 text-sm transition-colors hover:text-blue-400"
          style={{ color: "var(--fb-v2-text-muted)" }}
        >
          <ArrowLeft size={17} />
          Back to My Docs
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: "var(--fb-v2-heading)" }}
            >
              Library
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--fb-v2-text-muted)" }}
            >
              Browse and manage your documents and attachments.
            </p>
          </div>

          <div className="text-xs" style={{ color: "var(--fb-v2-text-muted)" }}>
            {documents.length} Documents · {attachments.length} Attachments
          </div>
        </div>
      </div>

      {/* Favorites filter */}
      <button
        type="button"
        onClick={() => setShowFavorites((current) => !current)}
        aria-pressed={showFavorites}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors hover:border-blue-500"
        style={{
          background: showFavorites ? "var(--fb-v2-surface)" : "transparent",
          borderColor: showFavorites ? "var(--fb-v2-accent)" : "var(--fb-v2-border)",
          color: "var(--fb-v2-text)",
        }}
      >
        <Star
          size={17}
          fill={showFavorites ? "#eab308" : "none"}
          color={showFavorites ? "#eab308" : "currentColor"}
        />
        Favorites
        <span
          className="rounded-full px-2 py-0.5 text-xs"
          style={{
            background: "var(--fb-v2-page-bg)",
            color: "var(--fb-v2-text-muted)",
          }}
        >
          {favoriteCount}
        </span>
      </button>

      {/* Recent Documents */}
      <section
        className="overflow-hidden rounded-xl border"
        style={{
          background: "var(--fb-v2-surface)",
          borderColor: "var(--fb-v2-border)",
        }}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText size={18} style={{ color: "var(--fb-v2-accent)" }} />
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--fb-v2-heading)" }}
            >
              Recent Documents
            </h2>
          </div>
          <span className="text-xs" style={{ color: "var(--fb-v2-text-muted)" }}>
            {visibleDocuments.length} items
          </span>
        </div>

        {renderItems(visibleDocuments, "document")}
      </section>

      {/* Recent Attachments */}
      <section
        className="overflow-hidden rounded-xl border"
        style={{
          background: "var(--fb-v2-surface)",
          borderColor: "var(--fb-v2-border)",
        }}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2">
            <Paperclip size={18} style={{ color: "var(--fb-v2-accent)" }} />
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--fb-v2-heading)" }}
            >
              Recent Attachments
            </h2>
          </div>
          <span className="text-xs" style={{ color: "var(--fb-v2-text-muted)" }}>
            {visibleAttachments.length} items
          </span>
        </div>

        {renderItems(visibleAttachments, "attachment")}
      </section>
    </div>
  );
}

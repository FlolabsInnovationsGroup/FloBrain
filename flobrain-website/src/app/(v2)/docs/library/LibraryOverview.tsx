"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  FileText,
  Paperclip,
  Star,
  Clock3,
} from "lucide-react";
import { fetchDocs, fetchAttachments, v2Keys, formatIsoDate } from "@/lib/v2-api";
import { apiClient } from "@/lib/axios";

type LibraryItem = {
  id: number;
  name: string;
  modified: string;
  favorite: boolean;
  type: "document" | "attachment";
};

export function LibraryOverview() {
  const queryClient = useQueryClient();
  const [showFavorites, setShowFavorites] = useState(false);

  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: v2Keys.docs,
    queryFn: fetchDocs,
  });

  const { data: attachmentsData, isLoading: attachmentsLoading } = useQuery({
    queryKey: v2Keys.attachments,
    queryFn: fetchAttachments,
  });

  const documents: LibraryItem[] = useMemo(
    () =>
      (docsData ?? []).map((d) => ({
        id: d.id,
        name: d.title,
        modified: formatIsoDate(d.updated_at),
        favorite: d.is_favorite,
        type: "document" as const,
      })),
    [docsData]
  );

  const attachments: LibraryItem[] = useMemo(
    () =>
      (attachmentsData ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        modified: formatIsoDate(a.created_at),
        favorite: a.is_favorite,
        type: "attachment" as const,
      })),
    [attachmentsData]
  );

  const toggleDocFavoriteMutation = useMutation({
    mutationFn: ({ id, favorite }: { id: number; favorite: boolean }) =>
      apiClient.patch(`/api/docs/${id}/`, { is_favorite: favorite }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: v2Keys.docs }),
  });

  const toggleAttachmentFavoriteMutation = useMutation({
    mutationFn: ({ id, favorite }: { id: number; favorite: boolean }) =>
      apiClient.patch(`/api/docs/attachments/${id}/`, { is_favorite: favorite }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: v2Keys.attachments }),
  });

  function toggleFavorite(id: number, type: "document" | "attachment") {
    if (type === "document") {
      const item = documents.find((d) => d.id === id);
      if (item) toggleDocFavoriteMutation.mutate({ id, favorite: !item.favorite });
    } else {
      const item = attachments.find((a) => a.id === id);
      if (item) toggleAttachmentFavoriteMutation.mutate({ id, favorite: !item.favorite });
    }
  }

  const visibleDocuments = showFavorites ? documents.filter((item) => item.favorite) : documents;
  const visibleAttachments = showFavorites ? attachments.filter((item) => item.favorite) : attachments;
  const favoriteCount =
    documents.filter((item) => item.favorite).length +
    attachments.filter((item) => item.favorite).length;

  function renderItems(items: LibraryItem[], type: "document" | "attachment") {
    const Icon = type === "document" ? FileText : Paperclip;
    const isLoading = type === "document" ? docsLoading : attachmentsLoading;

    if (isLoading) {
      return (
        <div className="px-5 py-8 text-center">
          <p className="text-sm" style={{ color: "var(--fb-v2-text-muted)" }}>
            Loading…
          </p>
        </div>
      );
    }

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
            style={{ background: "var(--fb-v2-page-bg)", color: "var(--fb-v2-accent)" }}
          >
            <Icon size={19} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium" style={{ color: "var(--fb-v2-heading)" }}>
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
            <h1 className="text-2xl font-semibold" style={{ color: "var(--fb-v2-heading)" }}>
              Library
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--fb-v2-text-muted)" }}>
              Browse and manage your documents and attachments.
            </p>
          </div>

          <div className="text-xs" style={{ color: "var(--fb-v2-text-muted)" }}>
            {documents.length} Documents · {attachments.length} Attachments
          </div>
        </div>
      </div>

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
          style={{ background: "var(--fb-v2-page-bg)", color: "var(--fb-v2-text-muted)" }}
        >
          {favoriteCount}
        </span>
      </button>

      <section
        className="overflow-hidden rounded-xl border"
        style={{ background: "var(--fb-v2-surface)", borderColor: "var(--fb-v2-border)" }}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText size={18} style={{ color: "var(--fb-v2-accent)" }} />
            <h2 className="text-base font-semibold" style={{ color: "var(--fb-v2-heading)" }}>
              Recent Documents
            </h2>
          </div>
          <span className="text-xs" style={{ color: "var(--fb-v2-text-muted)" }}>
            {visibleDocuments.length} items
          </span>
        </div>
        {renderItems(visibleDocuments, "document")}
      </section>

      <section
        className="overflow-hidden rounded-xl border"
        style={{ background: "var(--fb-v2-surface)", borderColor: "var(--fb-v2-border)" }}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2">
            <Paperclip size={18} style={{ color: "var(--fb-v2-accent)" }} />
            <h2 className="text-base font-semibold" style={{ color: "var(--fb-v2-heading)" }}>
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

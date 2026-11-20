
"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  File,
  FileText,
  Image,
  FileArchive,
  X,
  CheckCircle2,
  CloudUpload,
} from "lucide-react";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ACCEPTED_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
  ".zip",
];

type SelectedFile = {
  id: string;
  file: File;
};

export function NewAttachmentUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [uploaded, setUploaded] = useState(false);

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function getFileIcon(fileName: string) {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (["png", "jpg", "jpeg"].includes(extension || "")) return Image;
    if (["pdf", "doc", "docx", "txt"].includes(extension || "")) return FileText;
    if (["zip"].includes(extension || "")) return FileArchive;

    return File;
  }

  function addFiles(selectedFiles: FileList | File[]) {
    setMessage("");
    setUploaded(false);

    const validFiles: SelectedFile[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

      if (!ACCEPTED_TYPES.includes(extension)) {
        setMessage(`${file.name}: This file type is not supported.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setMessage(`${file.name}: File exceeds the 25 MB limit.`);
        return;
      }

      validFiles.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
      });
    });

    setFiles((current) => {
      const combined = [...current, ...validFiles];
      return combined.filter(
        (item, index, array) =>
          array.findIndex(
            (candidate) =>
              candidate.file.name === item.file.name &&
              candidate.file.size === item.file.size,
          ) === index,
      );
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      addFiles(event.target.files);
      event.target.value = "";
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files) {
      addFiles(event.dataTransfer.files);
    }
  }

  function removeFile(id: string) {
    setFiles((current) => current.filter((item) => item.id !== id));
    setUploaded(false);
    setMessage("");
  }

  function handleUpload() {
    if (files.length === 0) {
      setMessage("Please select at least one file before uploading.");
      return;
    }

    setUploaded(true);
    setMessage("Files are ready. Backend upload is not connected yet.");
  }

  return (
    <div
      className="flex min-h-full flex-col gap-6 p-5 sm:p-6"
      style={{ color: "var(--fb-v2-text)" }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/docs"
            className="mb-4 inline-flex items-center gap-2 text-sm transition-colors hover:text-blue-400"
            style={{ color: "var(--fb-v2-text-muted)" }}
          >
            <ArrowLeft size={17} />
            Back to My Docs
          </Link>

          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--fb-v2-heading)" }}
          >
            New Attachment
          </h1>

          <p
            className="mt-1 text-sm"
            style={{ color: "var(--fb-v2-text-muted)" }}
          >
            Upload files to your document library.
          </p>
        </div>
      </div>

      {/* Upload area */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
        className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors"
        style={{
          borderColor: isDragging ? "var(--fb-v2-accent)" : "var(--fb-v2-border)",
          background: isDragging ? "var(--fb-v2-surface)" : "transparent",
        }}
      >
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "var(--fb-v2-surface)",
            color: "var(--fb-v2-accent)",
          }}
        >
          <CloudUpload size={30} />
        </div>

        <h2
          className="text-base font-semibold"
          style={{ color: "var(--fb-v2-heading)" }}
        >
          Drag and drop your files here
        </h2>

        <p
          className="mt-2 text-sm"
          style={{ color: "var(--fb-v2-text-muted)" }}
        >
          or choose files from your computer
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Upload size={16} />
          Browse files
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />

        <p
          className="mt-4 text-xs"
          style={{ color: "var(--fb-v2-text-subtle)" }}
        >
          PDF, Word, Excel, PowerPoint, TXT, CSV, PNG, JPG and ZIP · Maximum 25 MB per file
        </p>
      </div>

      {/* Feedback */}
      {message && (
        <p
          role="status"
          className="rounded-md border p-3 text-sm"
          style={{
            borderColor: "var(--fb-v2-border)",
            color: "var(--fb-v2-text)",
          }}
        >
          {message}
        </p>
      )}

      {/* Selected files */}
      <section
        className="overflow-hidden rounded-xl border"
        style={{
          background: "var(--fb-v2-surface)",
          borderColor: "var(--fb-v2-border)",
        }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--fb-v2-border)" }}
        >
          <div>
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--fb-v2-heading)" }}
            >
              Selected Files
            </h2>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--fb-v2-text-muted)" }}
            >
              {files.length} {files.length === 1 ? "file" : "files"} selected
            </p>
          </div>
        </div>

        {files.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <File
              size={28}
              className="mx-auto mb-3"
              style={{ color: "var(--fb-v2-text-subtle)" }}
            />
            <p
              className="text-sm"
              style={{ color: "var(--fb-v2-text-muted)" }}
            >
              No files selected yet.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--fb-v2-border)" }}>
            {files.map((item) => {
              const Icon = getFileIcon(item.file.name);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon
                      size={20}
                      className="shrink-0"
                      style={{ color: "var(--fb-v2-accent)" }}
                    />
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-medium"
                        style={{ color: "var(--fb-v2-heading)" }}
                      >
                        {item.file.name}
                      </p>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--fb-v2-text-muted)" }}
                      >
                        {formatFileSize(item.file.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    aria-label={`Remove ${item.file.name}`}
                    title="Remove file"
                    className="shrink-0 cursor-pointer rounded-md p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <X size={17} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Upload action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-xs"
          style={{ color: "var(--fb-v2-text-muted)" }}
        >
          {uploaded ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-green-500" />
              Ready for backend integration
            </span>
          ) : (
            "Review your selected files before continuing."
          )}
        </p>

        <button
          type="button"
          onClick={handleUpload}
          disabled={files.length === 0}
          className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Upload size={16} />
          Upload Files
        </button>
      </div>
    </div>
  );
}

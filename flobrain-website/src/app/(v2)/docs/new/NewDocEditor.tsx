
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Save,
} from "lucide-react";

export function NewDocEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("Untitled Document");
  const [saved, setSaved] = useState(false);

  function applyFormat(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setSaved(false);
  }

  function applyBlockFormat(tag: "H1" | "H2" | "P") {
    applyFormat("formatBlock", tag);
  }

  function handleContentChange() {
    setSaved(false);
  }

  function saveDocument() {
    setSaved(true);
  }

  const toolbarButton =
    "flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-2 text-sm transition-colors hover:bg-white/10 active:scale-95";

  return (
    <div
      className="flex min-h-full flex-col gap-5 p-5 sm:p-6"
      style={{ color: "var(--fb-v2-text)" }}
    >
      {/* Back navigation and save */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/docs"
          className="flex items-center gap-2 text-sm transition-colors hover:text-blue-400"
          style={{ color: "var(--fb-v2-text-muted)" }}
        >
          <ArrowLeft size={17} />
          Back to My Docs
        </Link>

        <button
          type="button"
          onClick={saveDocument}
          className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Save size={15} />
          Save
        </button>
      </div>

      {/* Document title */}
      <div>
        <input
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setSaved(false);
          }}
          placeholder="Document title"
          aria-label="Document title"
          className="w-full border-b bg-transparent pb-3 text-2xl font-semibold outline-none transition-colors focus:border-blue-500"
          style={{
            color: "var(--fb-v2-heading)",
            borderColor: "var(--fb-v2-border)",
          }}
        />
      </div>

      {/* Formatting toolbar */}
      <div
        className="flex flex-wrap items-center gap-1 rounded-lg border p-2"
        style={{
          background: "var(--fb-v2-surface)",
          borderColor: "var(--fb-v2-border)",
        }}
      >
        <select
          aria-label="Text style"
          defaultValue="P"
          onChange={(event) =>
            applyBlockFormat(event.target.value as "H1" | "H2" | "P")
          }
          className="h-8 cursor-pointer rounded-md border bg-transparent px-2 text-xs outline-none"
          style={{ borderColor: "var(--fb-v2-border)", color: "var(--fb-v2-text)" }}
        >
          <option value="P" className="bg-neutral-800">Body</option>
          <option value="H1" className="bg-neutral-800">Heading 1</option>
          <option value="H2" className="bg-neutral-800">Heading 2</option>
        </select>

        <div className="mx-1 h-6 w-px" style={{ background: "var(--fb-v2-border)" }} />

        <button type="button" className={toolbarButton} title="Bold" aria-label="Bold" onClick={() => applyFormat("bold")}>
          <Bold size={16} />
        </button>
        <button type="button" className={toolbarButton} title="Italic" aria-label="Italic" onClick={() => applyFormat("italic")}>
          <Italic size={16} />
        </button>
        <button type="button" className={toolbarButton} title="Underline" aria-label="Underline" onClick={() => applyFormat("underline")}>
          <Underline size={16} />
        </button>

        <div className="mx-1 h-6 w-px" style={{ background: "var(--fb-v2-border)" }} />

        <button type="button" className={toolbarButton} title="Bullet list" aria-label="Bullet list" onClick={() => applyFormat("insertUnorderedList")}>
          <List size={17} />
        </button>
        <button type="button" className={toolbarButton} title="Numbered list" aria-label="Numbered list" onClick={() => applyFormat("insertOrderedList")}>
          <ListOrdered size={17} />
        </button>

        <div className="mx-1 h-6 w-px" style={{ background: "var(--fb-v2-border)" }} />

        <button type="button" className={toolbarButton} title="Align left" aria-label="Align left" onClick={() => applyFormat("justifyLeft")}>
          <AlignLeft size={16} />
        </button>
        <button type="button" className={toolbarButton} title="Align center" aria-label="Align center" onClick={() => applyFormat("justifyCenter")}>
          <AlignCenter size={16} />
        </button>
        <button type="button" className={toolbarButton} title="Align right" aria-label="Align right" onClick={() => applyFormat("justifyRight")}>
          <AlignRight size={16} />
        </button>

        <div className="mx-1 h-6 w-px" style={{ background: "var(--fb-v2-border)" }} />

        <button type="button" className={toolbarButton} title="Undo" aria-label="Undo" onClick={() => applyFormat("undo")}>
          <Undo2 size={16} />
        </button>
        <button type="button" className={toolbarButton} title="Redo" aria-label="Redo" onClick={() => applyFormat("redo")}>
          <Redo2 size={16} />
        </button>
      </div>

      {/* Document writing area */}
      <div
        className="min-h-[500px] flex-1 rounded-lg border p-6 sm:p-8"
        style={{
          background: "var(--fb-v2-surface)",
          borderColor: "var(--fb-v2-border)",
        }}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          role="textbox"
          aria-label="Document writing area"
          aria-multiline="true"
          data-placeholder="Start writing your document here..."
          className="min-h-[450px] w-full text-sm leading-7 outline-none [&_h1]:my-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:my-2 [&_h2]:text-xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
          style={{ color: "var(--fb-v2-text)" }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span style={{ color: "var(--fb-v2-text-muted)" }}>
          {saved ? "Saved locally for this session" : "Unsaved changes"}
        </span>
        <span style={{ color: "var(--fb-v2-text-subtle)" }}>
          Your document
        </span>
      </div>
    </div>
  );
}

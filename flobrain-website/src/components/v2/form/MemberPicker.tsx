"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import type { TaskOption } from "@/types/task";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type MemberPickerProps = {
  label: string;
  options: readonly TaskOption[];
  selectedIds: readonly string[];
  onChange: (ids: string[]) => void;
};

/** Searchable multi-select with an A-Z filter and removable chips. */
export function MemberPicker({ label, options, selectedIds, onChange }: MemberPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;

  const lettersWithMembers = useMemo(
    () => new Set(options.map((option) => option.label.charAt(0).toUpperCase())),
    [options]
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return options.filter((option) => {
      if (letter && option.label.charAt(0).toUpperCase() !== letter) return false;
      return !needle || option.label.toLowerCase().includes(needle);
    });
  }, [options, query, letter]);

  const selected = options.filter((option) => selectedIds.includes(option.id));

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]
    );
  }

  return (
    <div
      ref={rootRef}
      className="fb-v2-task-members"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <div className="fb-v2-task-members-head">
        <span className="fb-v2-task-label" id={`${baseId}-label`}>
          {label}
        </span>
        <div
          className="fb-v2-task-letters"
          role="group"
          aria-label="Filter members by first letter"
        >
          {LETTERS.map((value) => (
            <button
              key={value}
              type="button"
              className="fb-v2-task-letter"
              aria-pressed={letter === value}
              disabled={!lettersWithMembers.has(value)}
              onClick={() => {
                setLetter((previous) => (previous === value ? null : value));
                setOpen(true);
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="fb-v2-task-combobox">
        <Search size={14} className="fb-v2-task-combobox-icon" aria-hidden="true" />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${baseId}-label`}
          aria-autocomplete="list"
          className="fb-v2-task-input fb-v2-task-combobox-input"
          placeholder="Search members"
          autoComplete="off"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
        />
        <button
          type="button"
          className="fb-v2-task-combobox-toggle"
          aria-label={open ? "Hide member list" : "Show member list"}
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((previous) => !previous)}
        >
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </div>

      <div id={listId} className="fb-v2-task-listbox" hidden={!open}>
        {visible.length === 0 ? (
          <p className="fb-v2-task-listbox-empty">No members match.</p>
        ) : (
          <ul>
            {visible.map((option) => (
              <li key={option.id}>
                <label className="fb-v2-task-option">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(option.id)}
                    onChange={() => toggle(option.id)}
                  />
                  <span>{option.label}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected.length > 0 ? (
        <ul className="fb-v2-task-chips" aria-label="Selected members">
          {selected.map((option) => (
            <li key={option.id} className="fb-v2-task-chip">
              <span>{option.label}</span>
              <button
                type="button"
                aria-label={`Remove ${option.label}`}
                onClick={() => toggle(option.id)}
              >
                <X size={12} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

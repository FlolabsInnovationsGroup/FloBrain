"use client";

import { useId, useState, type FocusEvent, type KeyboardEvent } from "react";
import { Check, ChevronDown, X } from "lucide-react";

import type { Member } from "./mockMembers";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type MemberMultiSelectProps = {
  id: string;
  label: string;
  members: Member[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
};

// Searchable multi-select: type or pick a letter to filter, then toggle members on and off.
export default function MemberMultiSelect({
  id,
  label,
  members,
  selectedIds,
  onChange,
}: MemberMultiSelectProps) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const search = query.trim().toLowerCase();
  const options = members.filter(
    (member) =>
      member.name.toLowerCase().includes(search) &&
      (!letter || member.name.toUpperCase().startsWith(letter))
  );
  const selectedMembers = members.filter((member) => selectedIds.includes(member.id));
  const activeOption = open ? options[activeIndex] : undefined;

  function toggle(memberId: number) {
    onChange(
      selectedIds.includes(memberId)
        ? selectedIds.filter((selectedId) => selectedId !== memberId)
        : [...selectedIds, memberId]
    );
  }

  function openList() {
    setOpen(true);
    setActiveIndex(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return openList();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (index + step + options.length) % Math.max(options.length, 1));
    } else if (event.key === "Enter" && open) {
      // Enter picks the highlighted member instead of submitting the form.
      event.preventDefault();
      if (activeOption) toggle(activeOption.id);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }

  return (
    <div>
      <div className="fb-v2-member-label-row">
        <label htmlFor={id} className="fb-v2-label fb-v2-form-label">
          {label}
        </label>
        <div role="group" aria-label="Filter members by first letter" className="fb-v2-letters">
          {LETTERS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={letter === item}
              className="fb-v2-letter"
              onClick={() => {
                setLetter(letter === item ? null : item);
                openList();
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="fb-v2-combobox" onBlur={handleBlur}>
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeOption ? `${listId}-${activeOption.id}` : undefined}
          autoComplete="off"
          placeholder="Search members"
          className="fb-v2-input fb-v2-form-input fb-v2-select-input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            openList();
          }}
          onClick={openList}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? "Hide members" : "Show members"}
          className="fb-v2-select-icon fb-v2-combobox-toggle"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => (open ? setOpen(false) : openList())}
        >
          <ChevronDown size={16} />
        </button>

        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={label}
            className="fb-v2-listbox"
          >
            {options.length === 0 && <li className="fb-v2-option-empty">No members match.</li>}
            {options.map((member, index) => {
              const selected = selectedIds.includes(member.id);
              return (
                <li
                  key={member.id}
                  id={`${listId}-${member.id}`}
                  role="option"
                  aria-selected={selected}
                  data-active={index === activeIndex}
                  className="fb-v2-option"
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => toggle(member.id)}
                >
                  <span className="fb-v2-option-check" aria-hidden="true">
                    {selected && <Check size={12} />}
                  </span>
                  {member.name}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedMembers.length > 0 && (
        <ul aria-label="Selected members" className="fb-v2-chips">
          {selectedMembers.map((member) => (
            <li key={member.id} className="fb-v2-chip">
              {member.name}
              <button
                type="button"
                aria-label={`Remove ${member.name}`}
                className="fb-v2-chip-remove"
                onClick={() => toggle(member.id)}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

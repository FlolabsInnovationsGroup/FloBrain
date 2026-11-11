"use client";

import { ChevronDown } from "lucide-react";

export type FilterOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  /** Accessible name, read by screen readers only */
  label: string;
  value: string;
  options: readonly FilterOption[];
  onChange: (value: string) => void;
};

/** Borderless dropdown with a chevron, used for table filters on V2 Leadership pages. */
export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="relative inline-flex items-center text-[11px]">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="fb-v2-select cursor-pointer appearance-none bg-transparent py-1.5 pl-2 pr-7 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-1 opacity-80" />
    </label>
  );
}

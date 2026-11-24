"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { COUNTRIES, findCountry } from "./countries";

function CountryFlag({ code }: { code: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className="fb-auth-flag-code">{code}</span>;
  }
  return (
    <img
      className="fb-auth-flag"
      alt=""
      width={20}
      height={14}
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      onError={() => setFailed(true)}
    />
  );
}

export function CountrySelect({
  id,
  value,
  disabled = false,
  onChange,
}: {
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = findCountry(value);

  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return COUNTRIES;
    const digits = text.replace(/^\+/, "");
    return COUNTRIES.filter(
      (item) =>
        item.name.toLowerCase().includes(text) ||
        (digits.length > 0 && item.dial.replace("+", "").startsWith(digits)),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const selectedIndex = COUNTRIES.findIndex((item) => item.code === selected.code);
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, selected.code]);

  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
  }, [active, open, results]);

  function choose(code: string) {
    onChange(code);
    setOpen(false);
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = results[active];
      if (item) choose(item.code);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div className="fb-auth-country" ref={rootRef}>
      <button
        type="button"
        id={id}
        className="fb-auth-country-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <CountryFlag code={selected.code} />
        <span className="fb-auth-country-value">
          {selected.dial} {selected.name}
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open ? (
        <div className="fb-auth-country-menu">
          <input
            ref={searchRef}
            className="fb-auth-country-search"
            placeholder="Search country"
            value={query}
            aria-label="Search countries"
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onSearchKeyDown}
          />
          <ul className="fb-auth-country-list" role="listbox" aria-label="Countries">
            {results.length === 0 ? (
              <li className="fb-auth-country-empty">No countries found</li>
            ) : (
              results.map((item, index) => (
                <li key={item.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={item.code === selected.code}
                    className={`fb-auth-country-option${index === active ? " is-active" : ""}`}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(item.code)}
                  >
                    <CountryFlag code={item.code} />
                    <span className="fb-auth-country-name">{item.name}</span>
                    <span className="fb-auth-country-dial">{item.dial}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

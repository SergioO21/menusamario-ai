"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "./icons";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  // Términos extra para la búsqueda (p. ej. el nombre del idioma en español)
  keywords?: string;
}

interface DropdownProps<T extends string> {
  label: string;
  value: T;
  options: Array<DropdownOption<T>>;
  onChange: (value: T) => void;
  children: React.ReactNode;
  // Con listas largas (todos los idiomas, todas las monedas) se muestra un buscador
  searchPlaceholder?: string;
  emptyLabel?: string;
}

// Sin tildes ni mayúsculas: "frances" encuentra "Français"
const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Lista desplegable compacta para el header (idioma, moneda)
export default function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  children,
  searchPlaceholder,
  emptyLabel
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listId = useId();
  const selected = options.find((option) => option.value === value);
  const searchable = Boolean(searchPlaceholder);

  const visibleOptions = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return options;
    return options.filter((option) =>
      normalize(`${option.value} ${option.label} ${option.hint ?? ""} ${option.keywords ?? ""}`).includes(q)
    );
  }, [options, query]);

  // Cerrar al tocar fuera o con Escape
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Al abrir, mostrar la opción activa y enfocar el buscador (o esa opción)
  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const index = options.findIndex((option) => option.value === value);
    const active = optionRefs.current[Math.max(index, 0)];
    if (searchable) {
      active?.scrollIntoView({ block: "center" });
      searchRef.current?.focus();
    } else {
      active?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const choose = (option: DropdownOption<T>) => {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    const count = visibleOptions.length;
    const current = optionRefs.current.findIndex((el) => el === document.activeElement);
    let next = -1;
    if (e.key === "ArrowDown") next = (current + 1) % count;
    else if (e.key === "ArrowUp") {
      // Desde la primera opción se vuelve al buscador
      if (current <= 0 && searchable) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      next = (current - 1 + count) % count;
    } else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    else if (e.key === "Tab") setOpen(false);

    if (next >= 0 && count > 0) {
      e.preventDefault();
      optionRefs.current[next]?.focus();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${label}: ${selected?.label ?? value}`}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`flex h-10 items-center gap-1.5 rounded-full border pl-2.5 pr-2 sm:pl-3 sm:pr-2.5 text-ink-soft transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
          open
            ? "border-ink bg-paper-card text-ink"
            : "border-ink-line hover:border-ink-mute hover:text-ink"
        }`}
      >
        {children}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-ink-mute transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          onKeyDown={handleListKeyDown}
          className={`absolute top-full z-40 mt-2 origin-top-right animate-pop-in rounded-xl border border-ink-line bg-paper-card p-1.5 shadow-lg shadow-ink/10 motion-reduce:animate-none ltr:right-0 rtl:left-0 ${
            searchable ? "w-[min(18rem,calc(100vw-2rem))]" : "w-56"
          }`}
        >
          <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{label}</p>
          {searchable && (
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  e.stopPropagation();
                  optionRefs.current[0]?.focus();
                } else if (e.key === "Enter" && visibleOptions[0]) {
                  e.preventDefault();
                  choose(visibleOptions[0]);
                }
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-controls={listId}
              className="mb-1.5 w-full rounded-lg border border-ink-line bg-paper px-3 py-2 text-base text-ink placeholder:text-ink-mute focus:border-ink focus:outline-none sm:text-sm"
            />
          )}
          <div
            id={listId}
            role="listbox"
            aria-label={label}
            className={searchable ? "max-h-[min(20rem,60dvh)] overflow-y-auto overscroll-contain" : undefined}
          >
            {visibleOptions.length === 0 && (
              <p className="px-2.5 py-3 text-sm text-ink-mute">{emptyLabel}</p>
            )}
            {visibleOptions.map((option, idx) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  ref={(el) => {
                    optionRefs.current[idx] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => choose(option)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-start text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink ${
                    isSelected ? "bg-paper-deep text-ink" : "text-ink-soft hover:bg-paper"
                  }`}
                >
                  {option.icon && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center text-lg">
                      {option.icon}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-tight">{option.label}</span>
                    {option.hint && (
                      <span className="mt-0.5 block truncate text-xs text-ink-mute">{option.hint}</span>
                    )}
                  </span>
                  {isSelected && <CheckIcon className="h-4 w-4 shrink-0 text-achiote" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

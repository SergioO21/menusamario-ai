"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "./icons";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
}

interface DropdownProps<T extends string> {
  label: string;
  value: T;
  options: Array<DropdownOption<T>>;
  onChange: (value: T) => void;
  children: React.ReactNode;
}

// Lista desplegable compacta para el header (idioma, moneda)
export default function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  children
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

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

  // Al abrir, enfocar la opción activa para navegar con flechas
  useEffect(() => {
    if (!open) return;
    const index = options.findIndex((option) => option.value === value);
    optionRefs.current[Math.max(index, 0)]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    const current = optionRefs.current.findIndex((el) => el === document.activeElement);
    let next = -1;
    if (e.key === "ArrowDown") next = (current + 1) % options.length;
    else if (e.key === "ArrowUp") next = (current - 1 + options.length) % options.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = options.length - 1;
    else if (e.key === "Tab") setOpen(false);

    if (next >= 0) {
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
        className={`flex h-10 items-center gap-1.5 rounded-full border pl-2.5 pr-2 sm:pl-3 sm:pr-2.5 text-slate-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
          open
            ? "border-teal-500 bg-teal-50 text-teal-900"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        {children}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          onKeyDown={handleListKeyDown}
          className="absolute right-0 top-full z-40 mt-2 w-56 origin-top-right animate-pop-in rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 motion-reduce:animate-none"
        >
          <p className="px-2.5 pb-1.5 pt-1 text-xs font-medium text-slate-400">{label}</p>
          {options.map((option, idx) => {
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
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 ${
                  isSelected ? "bg-teal-50 text-teal-900" : "text-slate-700 hover:bg-slate-50"
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
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{option.hint}</span>
                  )}
                </span>
                {isSelected && <CheckIcon className="h-4 w-4 shrink-0 text-teal-700" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

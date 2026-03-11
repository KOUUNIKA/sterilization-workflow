"use client";

import { useEffect, useRef, useState } from "react";

export function ScanInput({
  label,
  placeholder,
  disabled,
  onScan,
}: {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  onScan: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const trimmed = value.trim();
            if (!trimmed) return;
            onScan(trimmed);
            setValue("");
          }}
          placeholder={placeholder ?? "Scan here…"}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-emerald-400 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <button
          type="button"
          disabled={disabled || !value.trim()}
          onClick={() => {
            const trimmed = value.trim();
            if (!trimmed) return;
            onScan(trimmed);
            setValue("");
          }}
          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-emerald-500 dark:text-black"
        >
          Add
        </button>
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        Tip: most barcode scanners type into the focused field and send Enter.
      </div>
    </div>
  );
}


"use client";

import { useMemo } from "react";
import type { WashParams } from "@/lib/predesinfection/types";

type Key = keyof WashParams;

const meta: Array<{ key: Key; label: string }> = [
  { key: "detergent", label: "Détergent" },
  { key: "dilution", label: "Dilution" },
  { key: "dosage", label: "Dosage" },
  { key: "waterVolume", label: "Volume d’eau" },
];

export function ParamChips({
  params,
  onSet,
}: {
  params: WashParams;
  onSet: (key: Key, value: string) => void;
}) {
  const dialogs = useMemo(() => {
    return Object.fromEntries(meta.map((m) => [m.key, `dialog-${m.key}`])) as Record<
      Key,
      string
    >;
  }, []);

  return (
    <div className="flex flex-wrap gap-2">
      {meta.map((m) => {
        const value = params[m.key];
        return (
          <div key={m.key}>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById(dialogs[m.key]) as HTMLDialogElement | null;
                el?.showModal();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <span>{m.label}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {value ? value : "—"}
              </span>
            </button>

            <dialog
              id={dialogs[m.key]}
              className="w-[min(520px,calc(100vw-2rem))] rounded-2xl border border-black/10 bg-white p-0 shadow-xl dark:border-white/10 dark:bg-zinc-950"
            >
              <form
                method="dialog"
                className="p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {m.label}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    name="value"
                    defaultValue={value ?? ""}
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-400 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    placeholder="Enter value…"
                    autoFocus
                  />
                  <button
                    type="submit"
                    onClick={(e) => {
                      const form = (e.currentTarget.closest("form") as HTMLFormElement | null)!;
                      const fd = new FormData(form);
                      const next = String(fd.get("value") ?? "").trim();
                      if (next) onSet(m.key, next);
                      (form.closest("dialog") as HTMLDialogElement | null)?.close();
                    }}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white dark:bg-emerald-500 dark:text-black"
                  >
                    Save
                  </button>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      (document.getElementById(dialogs[m.key]) as HTMLDialogElement | null)?.close()
                    }
                    className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </dialog>
          </div>
        );
      })}
    </div>
  );
}


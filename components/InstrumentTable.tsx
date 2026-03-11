"use client";

import type { ScannedItem } from "@/lib/predesinfection/types";

function kindLabel(kind: ScannedItem["kind"]) {
  if (kind === "container") return "Container";
  if (kind === "instrument") return "Instrument";
  return "Unknown";
}

function kindChipClass(kind: ScannedItem["kind"]) {
  if (kind === "instrument")
    return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200";
  if (kind === "container")
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
  return "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";
}

export function InstrumentTable({ items }: { items: ScannedItem[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-900/40 dark:text-zinc-400">
          <tr>
            <th className="px-3 py-2 font-medium">Code</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 bg-white dark:divide-white/10 dark:bg-zinc-950">
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="px-3 py-5 text-center text-sm text-zinc-500 dark:text-zinc-400"
              >
                No scanned items yet.
              </td>
            </tr>
          ) : (
            items.map((it) => (
              <tr key={`${it.code}-${it.ts}`}>
                <td className="px-3 py-2 font-mono text-xs text-zinc-900 dark:text-zinc-100">
                  {it.code}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${kindChipClass(
                      it.kind,
                    )}`}
                  >
                    {kindLabel(it.kind)}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {new Date(it.ts).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}


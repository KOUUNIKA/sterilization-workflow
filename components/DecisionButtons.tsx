"use client";

import { useState } from "react";

export function DecisionButtons({
  disabled,
  onValidate,
  onReject,
}: {
  disabled?: boolean;
  onValidate: () => void;
  onReject: (reason?: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="rounded-2xl border border-black/10 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900/30">
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Validation
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onValidate}
          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-emerald-500 dark:text-black"
        >
          Validate
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onReject(reason.trim() || undefined)}
          className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-rose-500 dark:text-black"
        >
          Reject
        </button>
        <input
          value={reason}
          disabled={disabled}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional reject reason…"
          className="min-w-[220px] flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-rose-400 disabled:opacity-40 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>
    </div>
  );
}


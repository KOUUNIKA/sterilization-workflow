import { ReactNode } from "react";

export type SectionStatus = "Not started" | "In progress" | "Completed";

export function SectionCard({
  title,
  status,
  primaryActionLabel,
  children,
}: {
  title: string;
  status: SectionStatus;
  primaryActionLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              {status}
            </span>
            <span className="text-xs">•</span>
            <span className="text-xs">{primaryActionLabel}</span>
          </div>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}


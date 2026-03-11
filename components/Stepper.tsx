export type StepperStep = {
  key: string;
  label: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Stepper({
  steps,
  activeKey,
}: {
  steps: StepperStep[];
  activeKey: string;
}) {
  const activeIdx = Math.max(
    0,
    steps.findIndex((s) => s.key === activeKey),
  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-950">
        {steps.map((s, idx) => {
          const isActive = idx === activeIdx;
          const isDone = idx < activeIdx;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                  isActive &&
                    "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black",
                  isDone &&
                    "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
                  !isActive &&
                    !isDone &&
                    "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
                )}
              >
                {s.label}
              </div>
              {idx !== steps.length - 1 && (
                <div className="h-px w-8 bg-zinc-200 dark:bg-zinc-800" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


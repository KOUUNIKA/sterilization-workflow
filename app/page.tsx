 "use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function HomePage() {
  const [cycleId, setCycleId] = useState("2026-0001");

  const href = useMemo(() => {
    const safe = cycleId.trim() || "2026-0001";
    return `/cycles/${encodeURIComponent(safe)}/predesinfection`;
  }, [cycleId]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Stérilisation
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Pré-désinfection</h1>
          <p className="text-sm text-slate-600">
            Démarrez un flux 3 étapes (bac de trempage → contenant &amp; priorité → opérateur).
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl border-2 border-pink-400 bg-pink-50 px-4 py-3 text-sm font-semibold text-pink-700">
            Sélectionner un cycle pour ouvrir le workflow de Pré-désinfection
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr,auto] sm:items-end">
            <div className="space-y-2">
              <label htmlFor="cycleId" className="block text-sm font-medium text-slate-700">
                Cycle ID
              </label>
              <input
                id="cycleId"
                value={cycleId}
                onChange={(e) => setCycleId(e.target.value)}
                placeholder="Ex. 2026-0001"
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <Link
              href={href}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-rose-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
            >
              Ouvrir le workflow
            </Link>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Chemin :{" "}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              {href}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


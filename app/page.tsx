"use client";

import { useState } from "react";
// Importation de tous les modules du cycle complet
import { PredesinfectionWizard } from "@/components/PredesinfectionWizard";
import { LavageWizard } from "@/components/steps/Lavage";
import { Recomposition } from "@/components/steps/Recomposition";
import { SterilizationWizard } from "@/components/steps/Sterilization";
import { StorageDistribution } from "@/components/steps/StorageDistribution";

export default function Home() {
  const [activeModule, setActiveModule] = useState<
    "pre" | "lavage" | "recomp" | "steri" | "storage-distri" | null
  >(null);

  const renderBackButton = () => (
    <button
      onClick={() => setActiveModule(null)}
      className="fixed left-4 top-4 z-[60] rounded-xl border border-[#b8cad6] bg-white/95 px-4 py-2 text-xs font-semibold text-[#0b4867] shadow-[0_16px_32px_rgba(11,72,103,0.12)] backdrop-blur transition-all hover:border-[#1378ac] hover:bg-white active:scale-95"
    >
      ← Retour au tableau de bord
    </button>
  );

  if (activeModule === "pre") {
    return (
      <div className="relative">
        {renderBackButton()}
        <PredesinfectionWizard cycleId="2026-0001" />
      </div>
    );
  }
  if (activeModule === "lavage") {
    return (
      <div className="relative">
        {renderBackButton()}
        <LavageWizard />
      </div>
    );
  }
  if (activeModule === "recomp") {
    return (
      <div className="relative">
        {renderBackButton()}
        <Recomposition />
      </div>
    );
  }
  if (activeModule === "steri") {
    return (
      <div className="relative">
        {renderBackButton()}
        <SterilizationWizard />
      </div>
    );
  }
  if (activeModule === "storage-distri") {
    return (
      <div className="relative">
        {renderBackButton()}
        <StorageDistribution />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-3xl border border-[#d5e2ea] bg-white/95 shadow-[0_24px_60px_rgba(11,72,103,0.12)] backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-6 p-8 md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#b8cad6] bg-[#edf5f9] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1378ac]">
                Centre de sterilisation
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-[#0b4867] md:text-5xl">
                  Tableau de bord de sterilisation
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                  Suivi des dispositifs depuis la predesinfection jusqu&apos;a la
                  distribution, avec controle de charge, identification agent et
                  continuite de tracabilite.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <InfoTile label="Cycle actif" value="2026-0001" />
                <InfoTile label="Secteur" value="Bloc & sterilisation" />
                <InfoTile label="Priorite" value="Suivi continu" />
              </div>
            </div>
            <div className="flex flex-col justify-between bg-[#0b4867] p-8 text-white">
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
                  Situation du service
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Activite du jour
                </h2>
                <p className="text-sm leading-6 text-white/80">
                  Controlez les flux en cours, ouvrez un module et poursuivez la
                  traçabilite de chaque charge selon l&apos;etat du cycle.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-white/85">
                <div className="rounded-xl border border-white/15 bg-white/8 px-4 py-3">
                  Charges en attente: 08
                </div>
                <div className="rounded-xl border border-white/15 bg-white/8 px-4 py-3">
                  Alertes qualite: 00
                </div>
                <div className="rounded-xl border border-white/15 bg-white/8 px-4 py-3">
                  Charges liberees: 24
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1378ac]">
                Modules du cycle
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0b4867]">
                Cycle de vie complet des dispositifs stériles
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Selectionnez un module pour acceder au poste concerne.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
            <DashboardCard
              step="01"
              title="Prédésinfection"
              desc="Trempage, identification du contenant et validation agent."
              accent="border-[#11b5a2]/35 bg-[#eafaf7] text-[#0b786e]"
              onClick={() => setActiveModule("pre")}
            />

            <DashboardCard
              step="02"
              title="Lavage"
              desc="Entrée machine, conformité de cycle et libération de charge."
              accent="border-[#1378ac]/25 bg-[#e8f4fb] text-[#1378ac]"
              onClick={() => setActiveModule("lavage")}
            />

            <DashboardCard
              step="03"
              title="Recomposition"
              desc="Contrôle des instruments, état, emballage et étiquette."
              accent="border-[#0b4867]/20 bg-[#edf5f9] text-[#0b4867]"
              onClick={() => setActiveModule("recomp")}
            />

            <DashboardCard
              step="04"
              title="Stérilisation"
              desc="Chargement autoclave, indicateurs critiques et validation."
              accent="border-[#11b5a2]/30 bg-[#f2fbfa] text-[#11b5a2]"
              onClick={() => setActiveModule("steri")}
            />

            <DashboardCard
              step="05"
              title="Stockage & Distribution"
              desc="Arsenal, affectation bloc et continuité de traçabilité."
              accent="border-[#1378ac]/20 bg-[#edf5f9] text-[#0b4867]"
              onClick={() => setActiveModule("storage-distri")}
            />
          </div>
        </section>

        <footer className="flex items-center justify-between rounded-2xl border border-[#d5e2ea] bg-white/80 px-5 py-4 text-xs text-slate-500 shadow-[0_10px_30px_rgba(11,72,103,0.08)]">
          <span className="font-medium uppercase tracking-[0.24em]">
            Centre de sterilisation
          </span>
          <span className="font-medium text-[#1378ac]">
            Mise a jour du 13 mars 2026
          </span>
        </footer>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d5e2ea] bg-[#f8fbfd] px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[#0b4867]">{value}</p>
    </div>
  );
}

function DashboardCard({
  step,
  title,
  desc,
  accent,
  onClick,
}: {
  step: string;
  title: string;
  desc: string;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex min-h-[250px] flex-col justify-between rounded-3xl border border-[#d5e2ea] bg-white/95 p-6 text-left shadow-[0_18px_40px_rgba(11,72,103,0.08)] transition-all hover:-translate-y-1.5 hover:border-[#1378ac]/40 hover:shadow-[0_24px_50px_rgba(11,72,103,0.14)] active:scale-[0.99]"
    >
      <div className="space-y-5">
        <div
          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.24em] ${accent}`}
        >
          Module {step}
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold tracking-tight text-[#0b4867]">
            {title}
          </h3>
          <p className="text-sm leading-6 text-slate-500">{desc}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#1378ac]">
        Acceder au module
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </button>
  );
}
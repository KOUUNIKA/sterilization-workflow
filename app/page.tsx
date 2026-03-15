"use client";

import { useState } from "react";
// Importation de tous les modules du cycle complet
import { PredesinfectionWizard } from "@/components/PredesinfectionWizard";
import { LavageWizard } from "@/components/steps/Lavage";
import { Recomposition } from "@/components/steps/Recomposition";
import { SterilizationWizard } from "@/components/steps/Sterilization";
import { StorageDistribution } from "@/components/steps/StorageDistribution";
import { PatientLiaison } from "@/components/PatientLiaison";
import { Chatbot } from "@/components/Chatbot";

import { Sidebar, type WorkflowZone } from "@/components/Sidebar";

export default function Home() {
  const [activeModule, setActiveModule] = useState<
    "pre" | "lavage-chargement" | "lavage-sortie" | "recomp" | "steri-chargement" | "steri-sortie" | "storage-distri" | "liaison" | "maintenance" | "edition" | null
  >(null);

  // Map module to zone
  const moduleToZone = (mod: typeof activeModule): WorkflowZone => {
    switch (mod) {
      case "pre": return "zone-sale";
      case "lavage-chargement": return "zone-sale";
      case "lavage-sortie": return "zone-propre";
      case "recomp": return "zone-propre";
      case "steri-chargement": return "zone-propre";
      case "steri-sortie": return "zone-sterile";
      case "storage-distri": return "zone-sterile";
      case "liaison": return "liaison";
      case "maintenance": return "maintenance";
      case "edition": return "edition";
      default: return "dashboard";
    }
  };

  const handleZoneChange = (zone: WorkflowZone) => {
    switch (zone) {
      case "zone-sale": setActiveModule("pre"); break;
      case "zone-propre": setActiveModule("recomp"); break;
      case "zone-sterile": setActiveModule("storage-distri"); break;
      case "liaison": setActiveModule("liaison"); break;
      case "maintenance": setActiveModule("maintenance"); break;
      case "edition": setActiveModule("edition"); break;
      case "dashboard": setActiveModule(null); break;
      default: break;
    }
  };

  const getZoneLabel = (zone: WorkflowZone) => {
    switch (zone) {
      case "zone-sale": return "Zone sale";
      case "zone-propre": return "Zone propre";
      case "zone-sterile": return "Zone stérile";
      case "liaison": return "Liaison Patient";
      case "maintenance": return "Gestion de maintenance";
      case "edition": return "Edition";
      default: return "Tableau de bord";
    }
  };

  const renderLayout = (content: React.ReactNode) => {
    const currentZone = moduleToZone(activeModule);
    return (
      <div className="flex h-screen overflow-hidden bg-white font-app">
        <Sidebar 
          currentZone={currentZone} 
          onZoneChange={handleZoneChange}
        />
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Header - Removed CLINISYS logo */}
          <header className="h-[70px] bg-[#0b4867] flex items-center justify-between px-6 text-white shrink-0 shadow-lg z-20">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/10 p-2 rounded-xl border border-white/20">
                  <span className="text-xl">🛡️</span>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8de7da]">Sterilization Suite</p>
                  <p className="text-[10px] font-medium text-white/60">Gestion Opérationnelle</p>
                </div>
              </div>
              <div className="h-8 w-px bg-white/10 mx-2" />
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#8de7da]">Hospital Central</span>
                <span className="text-[10px] font-medium text-white/60">Pôle Chirurgical • Bloc & Stéri</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex bg-white/10 p-1.5 rounded-2xl gap-2">
                  <button 
                    onClick={() => setActiveModule(null)}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white text-white hover:text-[#0b4867] transition-all"
                  >🏠</button>
                  <button className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-all text-xl">📄</button>
               </div>
               <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  <div className="text-right hidden sm:block">
                     <p className="text-[10px] font-bold text-white uppercase tracking-wider">Amina Benali</p>
                     <p className="text-[9px] text-[#8de7da] font-medium uppercase tracking-[0.1em]">Agent Qualité</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-[#1378ac] flex items-center justify-center text-sm font-bold border-2 border-white/20 shadow-inner">AB</div>
               </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto bg-[#f4f8fb] relative scroll-smooth">
            {/* Dashboard Header Bar matching screenshot */}
            <div className="sticky top-0 z-10 bg-[#f4f8fb]/80 backdrop-blur-md px-8 py-4 border-b border-[#d5e2ea] flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#d5e2ea] text-xl">📦</div>
                  <div>
                     <h2 className="text-lg font-bold text-[#0b4867] tracking-tight">{getZoneLabel(currentZone).toUpperCase()}</h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Poste opérationnel</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#fff6e9] rounded-2xl border border-[#ffe4bc]">
                     <span className="text-[#f59e0b] font-bold text-lg leading-none">12</span>
                     <span className="text-[11px] font-bold text-[#b45309] uppercase tracking-wide">boite(s) transférée(s)</span>
                  </div>
                  <button className="px-5 py-2.5 bg-white border border-[#d5e2ea] rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-[#1378ac] hover:text-[#1378ac] transition-all shadow-sm">
                    Fiche procédurale
                  </button>
               </div>
            </div>

            <div className="p-8">
              {content}
            </div>
          </main>
          
          <Chatbot currentZone={currentZone} />
        </div>
      </div>
    );
  };

  if (activeModule === "pre") {
    return renderLayout(<PredesinfectionWizard cycleId="2026-0001" />);
  }
  if (activeModule === "lavage-chargement") {
    return renderLayout(<LavageWizard initialPhase={1} onPhaseChange={(p) => setActiveModule(p === 1 ? "lavage-chargement" : "lavage-sortie")} />);
  }
  if (activeModule === "lavage-sortie") {
    return renderLayout(<LavageWizard initialPhase={2} onPhaseChange={(p) => setActiveModule(p === 1 ? "lavage-chargement" : "lavage-sortie")} />);
  }
  if (activeModule === "recomp") {
    return renderLayout(<Recomposition />);
  }
  if (activeModule === "steri-chargement") {
    return renderLayout(<SterilizationWizard initialPhase={1} onPhaseChange={(p) => setActiveModule(p === 1 ? "steri-chargement" : "steri-sortie")} />);
  }
  if (activeModule === "steri-sortie") {
    return renderLayout(<SterilizationWizard initialPhase={2} onPhaseChange={(p) => setActiveModule(p === 1 ? "steri-chargement" : "steri-sortie")} />); 
  }
  if (activeModule === "storage-distri") {
    return renderLayout(<StorageDistribution />);
  }
  if (activeModule === "liaison") {
    return renderLayout(<PatientLiaison />);
  }
  if (activeModule === "maintenance") {
    return renderLayout(<div className="bg-white p-10 rounded-3xl border border-[#d5e2ea] shadow-sm"><h2 className="text-2xl font-bold text-[#0b4867]">Gestion de Maintenance</h2><p className="mt-4 text-slate-500">Interface de maintenance en attente de configuration.</p></div>);
  }
  if (activeModule === "edition") {
    return renderLayout(<div className="bg-white p-10 rounded-3xl border border-[#d5e2ea] shadow-sm"><h2 className="text-2xl font-bold text-[#0b4867]">Edition</h2><p className="mt-4 text-slate-500">Interface d'édition en attente de configuration.</p></div>);
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

          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <DashboardCard
              step="01"
              title="Prédésinfection"
              desc="Trempage, identification du contenant et validation agent (Zone Sale - Bloc)."
              accent="border-[#11b5a2]/35 bg-[#eafaf7] text-[#0b786e]"
              onClick={() => setActiveModule("pre")}
            />

            <DashboardCard
              step="02"
              title="Lavage"
              desc="Entrée machine, conformité de cycle et libération (Zone Sale/Propre - Service)."
              accent="border-[#1378ac]/25 bg-[#e8f4fb] text-[#1378ac]"
              onClick={() => setActiveModule("lavage-chargement")}
            />

            <DashboardCard
              step="03"
              title="Recomposition"
              desc="Contrôle instruments, emballage et étiquette (Zone Propre - Service)."
              accent="border-[#0b4867]/20 bg-[#edf5f9] text-[#0b4867]"
              onClick={() => setActiveModule("recomp")}
            />

            <DashboardCard
              step="04"
              title="Stérilisation"
              desc="Chargement autoclave et validation sortie (Zone Propre/Stérile)."
              accent="border-[#11b5a2]/30 bg-[#f2fbfa] text-[#11b5a2]"
              onClick={() => setActiveModule("steri-chargement")}
            />

            <DashboardCard
              step="05"
              title="Stockage & Distribution"
              desc="Arsenal, affectation bloc et traçabilité (Zone Stérile)."
              accent="border-[#1378ac]/20 bg-[#edf5f9] text-[#0b4867]"
              onClick={() => setActiveModule("storage-distri")}
            />

            <DashboardCard
              step="06"
              title="Liaison Patient"
              desc="Lier le matériel utilisé au dossier patient (Post-Opératoire)."
              accent="border-[#11b5a2]/35 bg-[#eafaf7] text-[#0b786e]"
              onClick={() => setActiveModule("liaison")}
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

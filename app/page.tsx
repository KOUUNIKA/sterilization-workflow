"use client";

import { useState } from "react";
// Importation de tous les modules du cycle complet
import { PredesinfectionWizard } from "@/components/PredesinfectionWizard";
import { LavageWizard } from "@/components/steps/Lavage";
import { Recomposition } from "@/components/steps/Recomposition";
import { SterilizationWizard } from "@/components/steps/Sterilization";
import { StorageDistribution } from "@/components/steps/StorageDistribution";
import { PatientLiaison } from "@/components/PatientLiaison";
import { InventoryManagement } from "@/components/InventoryManagement";

export type WorkflowZone = 
  | "zone-sale"
  | "zone-propre"
  | "zone-sterile"
  | "liaison"
  | "inventory"
  | "maintenance"
  | "edition"
  | "dashboard";

export default function Home() {
  const [activeModule, setActiveModule] = useState<
    "pre" | "lavage-chargement" | "lavage-sortie" | "recomp" | "steri-chargement" | "steri-sortie" | "storage-distri" | "liaison" | "inventory" | "maintenance" | "edition" | null
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
      case "inventory": return "inventory";
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
      case "inventory": setActiveModule("inventory"); break;
      case "maintenance": setActiveModule("maintenance"); break;
      case "edition": setActiveModule("edition"); break;
      case "dashboard": setActiveModule(null); break;
      default: break;
    }
  };

  const getZoneLabel = (zone: WorkflowZone) => {
    switch (zone) {
      case "zone-sale": return { label: "Zone sale", icon: "🧼" };
      case "zone-propre": return { label: "Zone propre", icon: "✨" };
      case "zone-sterile": return { label: "Zone stérile", icon: "🛡️" };
      case "liaison": return { label: "Liaison Patient", icon: "🔗" };
      case "inventory": return { label: "Inventaire & Config", icon: "⚙️" };
      case "maintenance": return { label: "Gestion de maintenance", icon: "🛠️" };
      case "edition": return { label: "Edition", icon: "📄" };
      default: return { label: "Tableau de bord", icon: "📊" };
    }
  };

  const renderLayout = (content: React.ReactNode) => {
    const currentZone = moduleToZone(activeModule);
    const { label, icon } = getZoneLabel(currentZone);
    
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#f4f8fb] font-app flex flex-col">
        {/* Header - Consolidated with Zone/Step info */}
        <header className="h-[80px] bg-[#0b4867] flex items-center justify-between px-6 text-white shrink-0 shadow-lg z-20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/10 p-2 rounded-xl border border-white/20">
                <span className="text-xl">🛡️</span>
              </div>
              <div className="hidden lg:block">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8de7da]">Sterilization Suite</p>
                <p className="text-[10px] font-medium text-white/60">Gestion Opérationnelle</p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-white/10 mx-2" />
            
            {/* Zone Type in Header */}
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
              <span className="text-xl">{icon}</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8de7da] leading-tight">Poste Actuel</span>
                <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
              </div>
            </div>

            {/* Step context info - always visible in header */}
            {activeModule && (
              <>
                <div className="h-8 w-px bg-white/10 mx-2 hidden xl:block" />
                <div className="hidden xl:flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl border border-white/10">
                    <span className="text-[#8de7da] font-bold text-sm">12</span>
                    <span className="text-[9px] font-bold text-white/70 uppercase tracking-wide">boite(s)</span>
                  </div>
                  <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-white/60 hover:bg-white hover:text-[#0b4867] transition-all">
                    Fiche procédurale
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
             <nav className="flex items-center gap-1.5 mr-4">
               <button 
                 onClick={() => setActiveModule(null)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!activeModule ? 'bg-white text-[#0b4867]' : 'hover:bg-white/10 text-white/70'}`}
               >
                 Dashboard
               </button>
               <button 
                 onClick={() => setActiveModule("pre")}
                 className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeModule === "pre" ? 'bg-white text-[#0b4867]' : 'hover:bg-white/10 text-white/70'}`}
               >
                 Sale
               </button>
               <button 
                 onClick={() => setActiveModule("recomp")}
                 className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeModule === "recomp" ? 'bg-white text-[#0b4867]' : 'hover:bg-white/10 text-white/70'}`}
               >
                 Propre
               </button>
                 <button 
                   onClick={() => setActiveModule("storage-distri")}
                   className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeModule === "storage-distri" ? 'bg-white text-[#0b4867]' : 'hover:bg-white/10 text-white/70'}`}
                 >
                   Stérile
                 </button>
                 <button 
                   onClick={() => setActiveModule("inventory")}
                   className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeModule === "inventory" ? 'bg-white text-[#0b4867]' : 'hover:bg-[#11b5a2] bg-[#11b5a2]/20 text-[#8de7da] border border-[#11b5a2]/30'}`}
                 >
                   Inventaire
                 </button>
               </nav>

             <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                   <p className="text-[10px] font-bold text-white uppercase tracking-wider">Amina Benali</p>
                   <p className="text-[9px] text-[#8de7da] font-medium uppercase tracking-[0.1em]">Agent Qualité</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#1378ac] flex items-center justify-center text-sm font-bold border-2 border-white/20 shadow-inner">AB</div>
             </div>
          </div>
        </header>

        {/* Content Area - Zero Scroll Wrapper */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-hidden p-6">
            {content}
          </div>
          
          {/* Global Footer Bar */}
          <footer className="shrink-0 flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-sm border-t border-[#d5e2ea] text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">
            <div>
              Centre de stérilisation • Hospital Operational Suite
            </div>
            <div className="text-[#1378ac]">
              v2.4.0 • Mise à jour Mars 2026
            </div>
          </footer>
        </main>
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
  if (activeModule === "inventory") {
    return renderLayout(<InventoryManagement />);
  }
  if (activeModule === "maintenance") {
    return renderLayout(<div className="bg-white p-10 rounded-3xl border border-[#d5e2ea] shadow-sm"><h2 className="text-2xl font-bold text-[#0b4867]">Gestion de Maintenance</h2><p className="mt-4 text-slate-500">Interface de maintenance en attente de configuration.</p></div>);
  }
  if (activeModule === "edition") {
    return renderLayout(<div className="bg-white p-10 rounded-3xl border border-[#d5e2ea] shadow-sm"><h2 className="text-2xl font-bold text-[#0b4867]">Edition</h2><p className="mt-4 text-slate-500">Interface d'édition en attente de configuration.</p></div>);
  }

  return renderLayout(
    <div className="h-full flex flex-col overflow-hidden text-slate-900">
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <section className="w-full max-w-7xl space-y-8">
          <div className="text-center space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1378ac]">
              Modules du cycle
            </p>
            <h2 className="text-3xl font-black tracking-tight text-[#0b4867]">
              Cycle de vie complet des dispositifs stériles
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Sélectionnez un module pour accéder au poste opérationnel.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center items-stretch">
            <DashboardCard
              step="01"
              title="Prédésinfection"
              desc="Trempage, identification contenant et validation (Zone Sale)."
              accent="border-[#11b5a2]/35 bg-[#eafaf7] text-[#0b786e]"
              onClick={() => setActiveModule("pre")}
            />

            <DashboardCard
              step="02"
              title="Lavage"
              desc="Entrée machine, conformité cycle et libération (Zone Sale/Propre)."
              accent="border-[#1378ac]/25 bg-[#e8f4fb] text-[#1378ac]"
              onClick={() => setActiveModule("lavage-chargement")}
            />

            <DashboardCard
              step="03"
              title="Recomposition"
              desc="Contrôle instruments, AI Vision et étiquetage (Zone Propre)."
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

            <DashboardCard
              step="07"
              title="Inventaire & Config"
              desc="Gestion du référentiel : boîtes, instruments et emballages."
              accent="border-[#0b4867]/20 bg-[#edf5f9] text-[#0b4867]"
              onClick={() => setActiveModule("inventory")}
            />
          </div>
        </section>
      </div>
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
      className="group flex flex-col justify-between rounded-[2rem] border border-[#d5e2ea] bg-white/95 p-5 text-left shadow-[0_10px_30px_rgba(11,72,103,0.05)] transition-all hover:-translate-y-1 hover:border-[#1378ac]/40 hover:shadow-[0_20px_45px_rgba(11,72,103,0.1)] active:scale-[0.98]"
    >
      <div className="space-y-4">
        <div
          className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black tracking-[0.24em] ${accent}`}
        >
          Module {step}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black tracking-tight text-[#0b4867] leading-tight">
            {title}
          </h3>
          <p className="text-[11px] leading-relaxed text-slate-500 font-medium">{desc}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1378ac]">
        Accéder
        <span className="transition-transform group-hover:translate-x-1 text-sm">→</span>
      </div>
    </button>
  );
}

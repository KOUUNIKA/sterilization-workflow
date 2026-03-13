"use client";

import { useState } from "react";
// Importation de tous les modules du cycle complet
import { PredesinfectionWizard } from "@/components/PredesinfectionWizard";
import { LavageWizard } from "@/components/steps/Lavage";
import { Recomposition } from "@/components/steps/Recomposition";
import { SterilizationWizard } from "@/components/steps/Sterilization";
import { Storage } from "@/components/steps/storage";
import { Distribution } from "@/components/steps/distribution";

export default function Home() {
  // État unifié pour les modules du cycle de vie complet
  const [activeModule, setActiveModule] = useState<
    "pre" | "lavage" | "recomp" | "steri" | "storage" | "distri" | null
  >(null);

  // Bouton de retour universel
  const renderBackButton = () => (
    <button 
      onClick={() => setActiveModule(null)}
      className="fixed top-4 left-4 z-[60] bg-white border-2 border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 font-bold text-xs transition-all active:scale-95"
    >
      ← Menu Principal
    </button>
  );

  // --- Logique de Routage Dynamique ---
  if (activeModule === "pre") {
    return <div className="relative">{renderBackButton()}<PredesinfectionWizard cycleId="2026-0001" /></div>;
  }
  if (activeModule === "lavage") {
    return <div className="relative">{renderBackButton()}<LavageWizard /></div>;
  }
  if (activeModule === "recomp") {
    return <div className="relative">{renderBackButton()}<Recomposition /></div>;
  }
  if (activeModule === "steri") {
    return <div className="relative">{renderBackButton()}<SterilizationWizard /></div>;
  }
  if (activeModule === "storage") {
    return <div className="relative">{renderBackButton()}<Storage /></div>;
  }
  if (activeModule === "distri") {
    return <div className="relative">{renderBackButton()}<Distribution /></div>;
  }

  // --- Interface Dashboard Principal ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
      
      <header className="mb-12 text-center animate-in fade-in zoom-in duration-700">
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-slate-800 italic uppercase">STERILE TRACK PRO</h1>
        <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full mb-4"></div>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Full Sterilization Lifecycle</p>
      </header>

      {/* Grille optimisée pour les cartes du flux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        
        <DashboardCard 
          icon="🧪" 
          title="Prédésinfection" 
          desc="Trempage & Traçabilité" 
          color="hover:border-rose-500" 
          textColor="text-rose-600" 
          onClick={() => setActiveModule("pre")} 
        />

        <DashboardCard 
          icon="🌊" 
          title="Lavage" 
          desc="Chargement & Déchargement" 
          color="hover:border-blue-500" 
          textColor="text-blue-600" 
          onClick={() => setActiveModule("lavage")} 
        />

        <DashboardCard 
          icon="📦" 
          title="Recomposition" 
          desc="Contrôle & Emballage" 
          color="hover:border-purple-500" 
          textColor="text-purple-600" 
          onClick={() => setActiveModule("recomp")} 
        />

        <DashboardCard 
          icon="♨️" 
          title="Stérilisation" 
          desc="Chargement & Validation" 
          color="hover:border-orange-500" 
          textColor="text-orange-600" 
          onClick={() => setActiveModule("steri")} 
        />

        <DashboardCard 
          icon="🏢" 
          title="Stockage" 
          desc="Gestion Arsenal & Rayonnage" 
          color="hover:border-blue-600" 
          textColor="text-blue-700" 
          onClick={() => setActiveModule("storage")} 
        />

        <DashboardCard 
          icon="🚚" 
          title="Distribution" 
          desc="Affectation aux Blocs" 
          color="hover:border-indigo-500" 
          textColor="text-indigo-600" 
          onClick={() => setActiveModule("distri")} 
        />
        
      </div>

      <footer className="mt-20">
        <div className="px-4 py-1 bg-slate-200 rounded-full text-[9px] font-bold text-slate-500 tracking-widest uppercase">
          MARCH 2026 • WORKSTATION ACTIVE
        </div>
      </footer>
    </div>
  );
}

function DashboardCard({ icon, title, desc, color, textColor, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`group bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 transition-all hover:-translate-y-2 active:scale-95 text-left flex flex-col justify-between ${color}`}
    >
      <div>
        <div className="text-4xl mb-4 group-hover:rotate-12 transition-transform">{icon}</div>
        <h2 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-tight">{title}</h2>
        <p className="text-slate-400 text-[10px] font-medium leading-relaxed">{desc}</p>
      </div>
      <div className={`mt-6 flex items-center gap-2 font-black text-[9px] uppercase ${textColor}`}>
        Ouvrir le flux <span className="group-hover:translate-x-2 transition-transform">→</span>
      </div>
    </button>
  );
}
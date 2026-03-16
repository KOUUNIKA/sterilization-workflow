"use client";

import { useState } from "react";

export function StorageDistribution() {
  const [phase, setPhase] = useState<1 | 2>(1); // 1: Stockage, 2: Distribution

  // --- ÉTATS PHASE 1: STOCKAGE ---
  const [storageItem, setStorageItem] = useState("");
  const [storageShelf, setStorageShelf] = useState("");
  const [storageConfirmed, setStorageConfirmed] = useState(false);

  // --- ÉTATS PHASE 2: DISTRIBUTION ---
  const [distriItem, setDistriItem] = useState("");
  const [distriRoom, setDistriRoom] = useState("");
  const [distriAgent, setDistriAgent] = useState({ name: "", role: "" });
  const [distriLinked, setDistriLinked] = useState(false);

  const triggerSimulation = () => {
    if (phase === 1) {
      if (!storageItem) setStorageItem("BOITE-ORTHO-001");
      else if (!storageShelf) setStorageShelf("RAYONNAGE-B / ÉTAGE-03");
      else if (!storageConfirmed) setStorageConfirmed(true);
    } else {
      if (!distriItem) setDistriItem("BOITE-APPENDICECTOMIE-04");
      else if (!distriRoom) setDistriRoom("BLOC OPÉRATOIRE N°03");
      else if (!distriAgent.name) setDistriAgent({ name: "MME. AMINA ALAMI", role: "AGENT STÉRILISATION" });
      else if (!distriLinked) setDistriLinked(true);
    }
  };
  const quickActionLabel =
    phase === 1
      ? !storageItem
        ? "Scanner dispositif"
        : !storageShelf
          ? "Scanner emplacement"
          : !storageConfirmed
            ? "Valider entrée"
            : null
      : !distriItem
        ? "Scanner sortie"
        : !distriRoom
          ? "Scanner salle"
          : !distriAgent.name
            ? "Scanner badge"
            : !distriLinked
              ? "Confirmer affectation"
              : null;

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div className="space-y-3">
          <div className="flex w-fit rounded-xl border border-[#d5e2ea] bg-white/95 p-1 shadow-sm">
            <button 
              onClick={() => setPhase(1)}
              className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-[0.2em] transition-all ${phase === 1 ? 'bg-[#1378ac] text-white shadow-md' : 'text-slate-400 hover:text-[#0b4867]'}`}
            >
              Stockage
            </button>
            <button 
              onClick={() => setPhase(2)}
              className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-[0.2em] transition-all ${phase === 2 ? 'bg-[#11b5a2] text-white shadow-md' : 'text-slate-400 hover:text-[#0b4867]'}`}
            >
              Distribution
            </button>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#0b4867]">
              {phase === 1 ? "Stockage & Arsenal" : "Distribution & Blocs"}
            </h1>
            <p className="text-[10px] font-medium text-slate-500">
              {phase === 1 ? "Entrée en stock et localisation" : "Affectation aux salles opératoires"}
            </p>
          </div>
        </div>
        <div className="text-right hidden md:block text-slate-400">
           <div className="text-[8px] font-semibold uppercase tracking-[0.24em]">Secteur: <span className="text-slate-900">Logistique</span></div>
           <div className="text-[8px] font-semibold uppercase tracking-[0.24em]">Cycle: <span className="text-[#1378ac]">2026-0001</span></div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden">
        {phase === 1 ? (
          <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-4 shrink-0">
               <section className={`bg-white/95 p-5 rounded-3xl border transition-all shadow-sm ${storageItem ? 'border-[#1378ac] ring-4 ring-[#edf5f9]' : 'border-[#d5e2ea]'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1378ac] text-[9px] font-semibold text-white">1</span>
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0b4867]">Scan dispositif</h3>
                  </div>
                  {!storageItem ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-6 text-slate-400 text-center">
                      <div className="text-2xl opacity-50">📦</div>
                      <p className="font-bold text-[8px] uppercase tracking-widest">Attente Scan</p>
                    </div>
                  ) : (
                    <div className="animate-in zoom-in rounded-xl border border-[#b8cad6] bg-[#edf5f9] p-4 text-center">
                       <p className="text-sm font-semibold tracking-tight text-[#0b4867]">{storageItem}</p>
                       <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.18em] text-[#1378ac]">Stérile • Validé</p>
                    </div>
                  )}
               </section>

               <section className={`bg-white/95 p-5 rounded-3xl border transition-all shadow-sm ${storageShelf ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea] opacity-50'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#11b5a2] text-[9px] font-semibold text-white">2</span>
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0b4867]">Localisation</h3>
                  </div>
                  {!storageShelf ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-6 text-slate-400 text-center">
                      <div className="text-2xl opacity-50">🪜</div>
                      <p className="font-bold text-[8px] uppercase tracking-widest">Attente Rayon</p>
                    </div>
                  ) : (
                    <div className="animate-in zoom-in rounded-xl border border-[#bdece4] bg-[#eafaf7] p-4 text-center">
                       <p className="text-sm font-semibold tracking-tight text-[#0b4867]">{storageShelf}</p>
                       <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.18em] text-[#0b786e]">Position validée</p>
                    </div>
                  )}
               </section>
            </div>

            <div className={`flex-1 min-h-0 bg-white/95 p-6 rounded-3xl border transition-all shadow-sm overflow-hidden flex flex-col ${storageConfirmed ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
               <div className="flex-1 grid lg:grid-cols-2 gap-6 min-h-0">
                  <div className="flex flex-col min-h-0">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 shrink-0">Schéma arsenal</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                      <div className="grid grid-cols-4 gap-2">
                         {[...Array(24)].map((_, i) => (
                           <div key={i} className={`aspect-square rounded-xl border flex items-center justify-center text-[8px] font-bold transition-all ${storageShelf && i === 6 ? "border-[#1378ac] bg-[#1378ac] text-white shadow-md" : "border-[#d5e2ea] bg-[#f8fbfd] text-slate-300"}`}>
                             {storageShelf && i === 6 ? "ICI" : `Z${i+1}`}
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center gap-4 border-l pl-6 text-center">
                     <div className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-inner transition-all ${storageConfirmed ? 'bg-[#eafaf7] text-[#11b5a2] scale-110' : 'bg-[#f8fbfd] text-slate-300'}`}>
                        {storageConfirmed ? "✓" : "..."}
                     </div>
                     <div>
                        <h4 className="text-base font-semibold tracking-tight text-[#0b4867]">
                           {storageConfirmed ? "Confirmé" : "En attente"}
                        </h4>
                        <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">
                           {storageConfirmed ? "Archivage système ok" : "Veuillez valider"}
                        </p>
                     </div>
                     <button 
                        onClick={() => setStorageConfirmed(true)}
                        disabled={!storageShelf || storageConfirmed}
                        className={`w-full max-w-xs rounded-xl py-3 text-[9px] font-bold uppercase tracking-[0.22em] transition-all ${!storageShelf || storageConfirmed ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-[#1378ac] text-white hover:bg-[#0f6a98] shadow-md'}`}
                      >
                        Valider l&apos;entrée
                      </button>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <div className="flex-1 grid lg:grid-cols-3 gap-4 min-h-0 overflow-y-auto custom-scrollbar pr-2">
               <section className={`bg-white/95 p-6 rounded-3xl border transition-all shadow-sm h-fit ${distriItem ? 'border-[#1378ac] ring-4 ring-[#edf5f9]' : 'border-[#d5e2ea]'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1378ac] text-[9px] font-semibold text-white shadow-md">1</span>
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0b4867]">Scan sortie</h3>
                  </div>
                  {!distriItem ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-10 text-slate-400 text-center">
                      <div className="text-3xl opacity-50">📦</div>
                      <p className="font-bold text-[8px] uppercase tracking-widest">Scanner boîte</p>
                    </div>
                  ) : (
                    <div className="animate-in zoom-in rounded-xl border border-[#b8cad6] bg-[#edf5f9] p-4 text-center">
                       <p className="text-sm font-semibold tracking-tight text-[#0b4867]">{distriItem}</p>
                       <div className="mt-3 space-y-1.5 border-t border-[#b8cad6]/50 pt-3">
                          <div className="flex justify-between text-[8px] font-bold text-[#1378ac]">
                             <span>POS.</span>
                             <span className="text-slate-700">ARM. B / T04</span>
                          </div>
                          <div className="flex justify-between text-[8px] font-bold text-[#1378ac]">
                             <span>PÉREMP.</span>
                             <span className="text-[#0b4867]">13/09/2026</span>
                          </div>
                       </div>
                    </div>
                  )}
               </section>

               <section className={`bg-white/95 p-6 rounded-3xl border transition-all shadow-sm h-fit ${distriRoom ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea] opacity-50'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#11b5a2] text-[9px] font-semibold text-white shadow-md">2</span>
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0b4867]">Affectation</h3>
                  </div>
                  {!distriRoom ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-10 text-slate-400 text-center">
                      <div className="text-3xl opacity-50">🏥</div>
                      <p className="font-bold text-[8px] uppercase tracking-widest">Scanner Salle</p>
                    </div>
                  ) : (
                    <div className="animate-in zoom-in rounded-xl border border-[#bdece4] bg-[#eafaf7] p-4 text-center">
                       <p className="text-sm font-semibold tracking-tight text-[#0b4867]">{distriRoom}</p>
                       <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.18em] text-[#0b786e]">Validé</p>
                    </div>
                  )}
               </section>

               <section className={`bg-white/95 p-6 rounded-3xl border transition-all shadow-sm h-fit ${distriAgent.name ? 'border-[#0b4867] ring-4 ring-[#edf5f9]' : 'border-[#d5e2ea] opacity-50'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0b4867] text-[9px] font-semibold text-white shadow-md">3</span>
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0b4867]">Responsable</h3>
                  </div>
                  {!distriAgent.name ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-10 text-slate-400 text-center">
                      <div className="text-3xl opacity-50">🪪</div>
                      <p className="font-bold text-[8px] uppercase tracking-widest">Scanner Badge</p>
                    </div>
                  ) : (
                    <div className="animate-in zoom-in rounded-xl bg-[#0b4867] p-4 text-white text-center">
                       <p className="text-xs font-semibold tracking-tight">{distriAgent.name}</p>
                       <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-[#8de7da]">{distriAgent.role}</p>
                    </div>
                  )}
               </section>
            </div>

            <div className="shrink-0 flex justify-center py-4">
               <button 
                onClick={() => setDistriLinked(true)}
                disabled={!distriAgent.name || distriLinked}
                className={`rounded-2xl px-16 py-4 text-[10px] font-bold uppercase tracking-[0.22em] transition-all shadow-lg ${!distriAgent.name || distriLinked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#11b5a2] text-white hover:bg-[#0fa391] hover:-translate-y-1'}`}
               >
                 {distriLinked ? "Lien Réussi ✓" : "Lier à la Salle OP"}
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Button - Floating within main area */}
      {quickActionLabel && (
        <button
          onClick={triggerSimulation}
          className="shrink-0 flex items-center justify-center gap-2 rounded-full bg-[#0b4867] px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-[#0a3952] hover:scale-105 active:scale-95 group mt-auto self-center"
        >
          <span className="text-lg text-[#8de7da]">⌁</span>
          <span>{quickActionLabel}</span>
        </button>
      )}

      {distriLinked && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-10 text-center shadow-2xl animate-in zoom-in duration-500">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-[#1378ac]"></div>
            <div className="text-5xl mb-6">🚀</div>
            <h2 className="mb-2 text-xl font-semibold tracking-tight text-[#0b4867]">Affectation terminée</h2>
            <p className="mb-8 px-4 text-xs font-medium leading-relaxed text-slate-500">
              Le dispositif <span className="font-bold text-[#1378ac]">{distriItem}</span> est affecté au <span className="font-bold text-[#0b786e]">{distriRoom}</span>.
            </p>
            <button 
              onClick={() => {setDistriLinked(false); setDistriItem(""); setDistriRoom(""); setDistriAgent({name:"", role:""});}} 
              className="w-full rounded-2xl bg-[#0b4867] py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-md hover:bg-[#0a3952]"
            >
              Nouvelle Distribution
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

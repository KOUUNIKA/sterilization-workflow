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
      else if (!distriAgent.name) setDistriAgent({ name: "MME. AMINA ALAMI", role: "AGENT STÉRILISATION (IBODE)" });
      else if (!distriLinked) setDistriLinked(true);
    }
  };
  const quickActionLabel =
    phase === 1
      ? !storageItem
        ? "Scanner le dispositif"
        : !storageShelf
          ? "Scanner l'emplacement"
          : !storageConfirmed
            ? "Valider l'entree"
            : null
      : !distriItem
        ? "Scanner la sortie"
        : !distriRoom
          ? "Scanner la salle"
          : !distriAgent.name
            ? "Scanner le badge"
            : !distriLinked
              ? "Confirmer l'affectation"
              : null;

  return (
    <div className="min-h-screen px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex w-fit rounded-xl border border-[#d5e2ea] bg-white/95 p-1.5 shadow-sm">
              <button 
                onClick={() => setPhase(1)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-[0.2em] transition-all ${phase === 1 ? 'bg-[#1378ac] text-white shadow-lg' : 'text-slate-400 hover:text-[#0b4867]'}`}
              >
                04. Stockage
              </button>
              <button 
                onClick={() => setPhase(2)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-[0.2em] transition-all ${phase === 2 ? 'bg-[#11b5a2] text-white shadow-lg' : 'text-slate-400 hover:text-[#0b4867]'}`}
              >
                05. Distribution
              </button>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-[#0b4867]">
                {phase === 1 ? "Stockage & Arsenal" : "Distribution & Blocs"}
              </h1>
              <p className="text-sm font-medium text-slate-500">
                {phase === 1 ? "Entrée en stock et localisation des dispositifs" : "Affectation des dispositifs aux salles opératoires"}
              </p>
            </div>
          </div>
          <div className="text-right hidden md:block text-slate-400">
             <div className="text-[10px] font-semibold uppercase tracking-[0.24em]">Secteur: <span className="text-slate-900">Logistique</span></div>
             <div className="text-[10px] font-semibold uppercase tracking-[0.24em]">Cycle: <span className="text-[#1378ac]">2026-0001</span></div>
          </div>
        </header>

        {phase === 1 && (
          <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8">
               <section className={`bg-white/95 p-8 rounded-3xl border transition-all shadow-[0_20px_45px_rgba(11,72,103,0.08)] ${storageItem ? 'border-[#1378ac] ring-4 ring-[#edf5f9]' : 'border-[#d5e2ea]'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white">1</span>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b4867]">Scan dispositif</h3>
                  </div>
                  {!storageItem ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-12 text-slate-400">
                      <div className="text-4xl opacity-50">📦</div>
                      <p className="font-bold text-[10px] uppercase tracking-widest">Attente Scan Boîte</p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in zoom-in duration-300">
                       <div className="rounded-xl border border-[#b8cad6] bg-[#edf5f9] p-5">
                          <p className="text-xl font-semibold tracking-tight text-[#0b4867]">{storageItem}</p>
                          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1378ac]">Stérile • Validé</p>
                       </div>
                    </div>
                  )}
               </section>

               <section className={`bg-white/95 p-8 rounded-3xl border transition-all shadow-[0_20px_45px_rgba(11,72,103,0.08)] ${storageShelf ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea] opacity-50'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#11b5a2] text-[10px] font-semibold text-white">2</span>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b4867]">Localisation</h3>
                  </div>
                  {!storageShelf ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-12 text-slate-400">
                      <div className="text-4xl opacity-50">🪜</div>
                      <p className="font-bold text-[10px] uppercase tracking-widest">Attente Scan Rayon</p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in zoom-in duration-300">
                       <div className="rounded-xl border border-[#bdece4] bg-[#eafaf7] p-5">
                          <p className="text-lg font-semibold tracking-tight text-[#0b4867]">{storageShelf}</p>
                          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">Position validée</p>
                       </div>
                    </div>
                  )}
               </section>
            </div>

            <div className={`bg-white/95 p-10 rounded-3xl border transition-all shadow-[0_20px_45px_rgba(11,72,103,0.08)] ${storageConfirmed ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
               <div className="grid lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Schéma arsenal</h3>
                    <div className="grid grid-cols-4 gap-2">
                       {[...Array(12)].map((_, i) => (
                         <div key={i} className={`aspect-square rounded-xl border flex items-center justify-center text-[9px] font-semibold transition-all ${storageShelf && i === 6 ? "border-[#1378ac] bg-[#1378ac] text-white shadow-lg" : "border-[#d5e2ea] bg-[#f8fbfd] text-slate-300"}`}>
                           {storageShelf && i === 6 ? "ICI" : `Z${i+1}`}
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center gap-6 border-l pl-10">
                     <div className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-inner transition-all ${storageConfirmed ? 'bg-[#eafaf7] text-[#11b5a2] scale-110' : 'bg-[#f8fbfd] text-slate-300'}`}>
                        {storageConfirmed ? "✓" : "..."}
                     </div>
                     <div className="text-center">
                        <h4 className="text-lg font-semibold tracking-tight text-[#0b4867]">
                           {storageConfirmed ? "Stockage Confirmé" : "En attente de validation"}
                        </h4>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                           {storageConfirmed ? "Archivage système ok" : "Veuillez valider l&apos;emplacement"}
                        </p>
                     </div>
                     <button 
                        onClick={() => setStorageConfirmed(true)}
                        disabled={!storageShelf || storageConfirmed}
                        className={`w-full rounded-xl py-4 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all ${!storageShelf || storageConfirmed ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-[#1378ac] text-white hover:bg-[#0f6a98] shadow-xl hover:-translate-y-1'}`}
                      >
                        Valider l&apos;entrée
                      </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {phase === 2 && (
          <div className="flex flex-col gap-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="grid lg:grid-cols-3 gap-8">
               <section className={`bg-white/95 p-8 rounded-3xl border transition-all shadow-[0_20px_45px_rgba(11,72,103,0.08)] ${distriItem ? 'border-[#1378ac] ring-4 ring-[#edf5f9]' : 'border-[#d5e2ea]'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white">1</span>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b4867]">Scan sortie</h3>
                  </div>
                  {!distriItem ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-12 text-slate-400">
                      <div className="text-4xl opacity-50">📦</div>
                      <p className="font-bold text-[10px] uppercase tracking-widest text-center">Scanner boîte <br/>pour distribution</p>
                    </div>
                  ) : (
                    <div className="animate-in zoom-in rounded-xl border border-[#b8cad6] bg-[#edf5f9] p-5">
                       <p className="text-lg font-semibold tracking-tight text-[#0b4867]">{distriItem}</p>
                       <div className="mt-4 space-y-2 border-t border-[#b8cad6]/50 pt-3">
                          <div className="flex justify-between text-[9px] font-semibold text-[#1378ac]">
                             <span>EMPLACE.</span>
                             <span className="text-slate-700">ARM. B / T04</span>
                          </div>
                          <div className="flex justify-between text-[9px] font-semibold text-[#1378ac]">
                             <span>PÉREMPTION</span>
                             <span className="font-semibold text-[#0b4867]">13/09/2026</span>
                          </div>
                       </div>
                    </div>
                  )}
               </section>

               <section className={`bg-white/95 p-8 rounded-3xl border transition-all shadow-[0_20px_45px_rgba(11,72,103,0.08)] ${distriRoom ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea] opacity-50'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#11b5a2] text-[10px] font-semibold text-white">2</span>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b4867]">Affectation</h3>
                  </div>
                  {!distriRoom ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-12 text-slate-400">
                      <div className="text-4xl opacity-50">🏥</div>
                      <p className="font-bold text-[10px] uppercase tracking-widest">Scanner Salle OP</p>
                    </div>
                  ) : (
                    <div className="animate-in zoom-in rounded-xl border border-[#bdece4] bg-[#eafaf7] p-5">
                       <p className="text-lg font-semibold tracking-tight text-[#0b4867]">{distriRoom}</p>
                       <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">Destinataire validé</p>
                    </div>
                  )}
               </section>

               <section className={`bg-white/95 p-8 rounded-3xl border transition-all shadow-[0_20px_45px_rgba(11,72,103,0.08)] ${distriAgent.name ? 'border-[#0b4867] ring-4 ring-[#edf5f9]' : 'border-[#d5e2ea] opacity-50'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0b4867] text-[10px] font-semibold text-white">3</span>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b4867]">Responsable</h3>
                  </div>
                  {!distriAgent.name ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-12 text-slate-400">
                      <div className="text-4xl opacity-50">🪪</div>
                      <p className="font-bold text-[10px] uppercase tracking-widest">Scanner Badge</p>
                    </div>
                  ) : (
                    <div className="animate-in zoom-in rounded-xl bg-[#0b4867] p-5 text-white">
                       <p className="text-xs font-semibold tracking-tight">{distriAgent.name}</p>
                       <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#8de7da]">{distriAgent.role}</p>
                       <div className="mt-4 flex justify-end">
                          <span className="text-xs">👤</span>
                       </div>
                    </div>
                  )}
               </section>
            </div>

            <div className="flex justify-center pt-6">
               <button 
                onClick={() => setDistriLinked(true)}
                disabled={!distriAgent.name || distriLinked}
                className={`rounded-2xl px-24 py-5 text-sm font-semibold uppercase tracking-[0.22em] transition-all shadow-[0_20px_40px_rgba(11,72,103,0.14)] ${!distriAgent.name || distriLinked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#11b5a2] text-white hover:bg-[#0fa391] hover:-translate-y-1.5'}`}
               >
                 {distriLinked ? "Lien Réussi ✓" : "Lier à la Salle OP"}
               </button>
            </div>

            {distriLinked && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white p-12 text-center shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in duration-500">
                  <div className="absolute top-0 left-0 h-2 w-full bg-[#1378ac]"></div>
                  <div className="text-7xl mb-8">🚀</div>
                  <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[#0b4867]">Affectation terminée</h2>
                  <p className="mb-10 px-6 text-sm font-medium leading-relaxed text-slate-500">
                    Le dispositif <span className="font-semibold text-[#1378ac] underline">{distriItem}</span> est officiellement affecté au <span className="font-semibold text-[#0b786e] underline">{distriRoom}</span>.
                  </p>
                  <button 
                    onClick={() => {setDistriLinked(false); setDistriItem(""); setDistriRoom(""); setDistriAgent({name:"", role:""});}} 
                    className="rounded-2xl bg-[#0b4867] px-16 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all shadow-xl hover:bg-[#0a3952]"
                  >
                    Nouvelle Distribution
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {quickActionLabel && (
        <button
          onClick={triggerSimulation}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl bg-[#0b4867] px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_24px_45px_rgba(11,72,103,0.28)] transition-all hover:bg-[#0a3952] hover:scale-105 active:scale-95 group"
        >
          <span className="text-xl text-[#8de7da]">⌁</span>
          <span>{quickActionLabel}</span>
        </button>
      )}

    </div>
  );
}

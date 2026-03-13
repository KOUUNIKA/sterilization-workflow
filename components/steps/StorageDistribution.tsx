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

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl space-y-10">
        
        {/* Header avec Toggle de Phase */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm w-fit">
              <button 
                onClick={() => setPhase(1)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${phase === 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                04. Stockage
              </button>
              <button 
                onClick={() => setPhase(2)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${phase === 2 ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                05. Distribution
              </button>
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                {phase === 1 ? "Stockage & Arsenal" : "Distribution & Blocs"}
              </h1>
              <p className="text-slate-500 font-medium">
                {phase === 1 ? "Entrée en stock et localisation des dispositifs" : "Affectation des dispositifs aux salles opératoires"}
              </p>
            </div>
          </div>
          <div className="text-right hidden md:block text-slate-400">
             <div className="text-[10px] font-bold uppercase tracking-widest">Secteur: <span className="text-slate-900 font-black">LOGISTIQUE</span></div>
             <div className="text-[10px] font-bold uppercase tracking-widest">Cycle: <span className={phase === 1 ? "text-indigo-600 italic" : "text-rose-600 italic"}>2026-0001</span></div>
          </div>
        </header>

        {/* --- PHASE 1: STOCKAGE --- */}
        {phase === 1 && (
          <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8">
               {/* Section 1: Scan Boîte */}
               <section className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all ${storageItem ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100 shadow-sm'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px]">1</span>
                    <h3 className="font-black uppercase text-xs italic tracking-widest">Scan Dispositif</h3>
                  </div>
                  {!storageItem ? (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 gap-3">
                      <div className="text-4xl opacity-50">📦</div>
                      <p className="font-bold text-[10px] uppercase tracking-widest">Attente Scan Boîte</p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in zoom-in duration-300">
                       <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                          <p className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">{storageItem}</p>
                          <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">Stérile • Validé</p>
                       </div>
                    </div>
                  )}
               </section>

               {/* Section 2: Scan Étage */}
               <section className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all ${storageShelf ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-100 shadow-sm opacity-50'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px]">2</span>
                    <h3 className="font-black uppercase text-xs italic tracking-widest">Localisation</h3>
                  </div>
                  {!storageShelf ? (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 gap-3">
                      <div className="text-4xl opacity-50">🪜</div>
                      <p className="font-bold text-[10px] uppercase tracking-widest">Attente Scan Rayon</p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in zoom-in duration-300">
                       <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <p className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">{storageShelf}</p>
                          <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1 tracking-widest italic">Position Validée</p>
                       </div>
                    </div>
                  )}
               </section>
            </div>

            {/* Vue 2D & Confirmation */}
            <div className={`bg-white p-10 rounded-[3rem] border-2 transition-all ${storageConfirmed ? 'border-emerald-500 ring-8 ring-emerald-50' : 'border-slate-100 shadow-xl'}`}>
               <div className="grid lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="font-black uppercase text-xs italic tracking-[0.2em] text-slate-400">Schéma Arsenal</h3>
                    <div className="grid grid-cols-4 gap-2">
                       {[...Array(12)].map((_, i) => (
                         <div key={i} className={`aspect-square rounded-xl border flex items-center justify-center text-[9px] font-black transition-all ${storageShelf && i === 6 ? "bg-indigo-500 border-indigo-600 text-white animate-pulse shadow-lg" : "bg-slate-50 border-slate-100 text-slate-200"}`}>
                           {storageShelf && i === 6 ? "ICI" : `Z${i+1}`}
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center gap-6 border-l pl-10">
                     <div className={`h-20 w-20 rounded-full flex items-center justify-center text-4xl shadow-inner transition-all ${storageConfirmed ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-slate-50 text-slate-200'}`}>
                        {storageConfirmed ? "✓" : "..."}
                     </div>
                     <div className="text-center">
                        <h4 className="font-black uppercase italic text-lg tracking-tight">
                           {storageConfirmed ? "Stockage Confirmé" : "En attente de validation"}
                        </h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                           {storageConfirmed ? "Archivage système ok" : "Veuillez valider l'emplacement"}
                        </p>
                     </div>
                     <button 
                        onClick={() => setStorageConfirmed(true)}
                        disabled={!storageShelf || storageConfirmed}
                        className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all ${!storageShelf || storageConfirmed ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-xl hover:-translate-y-1'}`}
                      >
                        Valider l'entrée
                      </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* --- PHASE 2: DISTRIBUTION --- */}
        {phase === 2 && (
          <div className="flex flex-col gap-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="grid lg:grid-cols-3 gap-8">
               {/* 01. Item Scan */}
               <section className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all ${distriItem ? 'border-rose-500 ring-4 ring-rose-50' : 'border-slate-100 shadow-sm'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-rose-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px]">1</span>
                    <h3 className="font-black uppercase text-xs italic tracking-widest">Scan Sortie</h3>
                  </div>
                  {!distriItem ? (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 gap-3">
                      <div className="text-4xl opacity-50">📦</div>
                      <p className="font-bold text-[10px] uppercase tracking-widest text-center">Scanner boîte <br/>pour distribution</p>
                    </div>
                  ) : (
                    <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 animate-in zoom-in">
                       <p className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">{distriItem}</p>
                       <div className="mt-4 space-y-2 border-t border-rose-200/50 pt-3">
                          <div className="flex justify-between text-[9px] font-bold text-rose-400">
                             <span>EMPLACE.</span>
                             <span className="text-slate-700">ARM. B / T04</span>
                          </div>
                          <div className="flex justify-between text-[9px] font-bold text-rose-400">
                             <span>PÉREMPTION</span>
                             <span className="text-rose-600 italic font-black">13/09/2026</span>
                          </div>
                       </div>
                    </div>
                  )}
               </section>

               {/* 02. Room Scan */}
               <section className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all ${distriRoom ? 'border-purple-500 ring-4 ring-purple-50' : 'border-slate-100 shadow-sm opacity-50'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-purple-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px]">2</span>
                    <h3 className="font-black uppercase text-xs italic tracking-widest">Affectation</h3>
                  </div>
                  {!distriRoom ? (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 gap-3">
                      <div className="text-4xl opacity-50">🏥</div>
                      <p className="font-bold text-[10px] uppercase tracking-widest">Scanner Salle OP</p>
                    </div>
                  ) : (
                    <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 animate-in zoom-in">
                       <p className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">{distriRoom}</p>
                       <p className="text-[9px] font-bold text-purple-500 uppercase mt-2 italic">Destinataire Validé</p>
                    </div>
                  )}
               </section>

               {/* 03. Agent Scan */}
               <section className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all ${distriAgent.name ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100 shadow-sm opacity-50'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px]">3</span>
                    <h3 className="font-black uppercase text-xs italic tracking-widest">Responsable</h3>
                  </div>
                  {!distriAgent.name ? (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 gap-3">
                      <div className="text-4xl opacity-50">🪪</div>
                      <p className="font-bold text-[10px] uppercase tracking-widest">Scanner Badge</p>
                    </div>
                  ) : (
                    <div className="p-5 bg-slate-900 rounded-2xl text-white animate-in zoom-in">
                       <p className="text-xs font-black uppercase italic tracking-tight">{distriAgent.name}</p>
                       <p className="text-[8px] font-bold text-blue-400 uppercase mt-1 tracking-widest">{distriAgent.role}</p>
                       <div className="mt-4 flex justify-end">
                          <span className="text-xs">👤</span>
                       </div>
                    </div>
                  )}
               </section>
            </div>

            {/* Validation Distribution */}
            <div className="flex justify-center pt-6">
               <button 
                onClick={() => setDistriLinked(true)}
                disabled={!distriAgent.name || distriLinked}
                className={`px-24 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-sm transition-all shadow-2xl ${!distriAgent.name || distriLinked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700 hover:-translate-y-2'}`}
               >
                 {distriLinked ? "Lien Réussi ✓" : "Lier à la Salle OP"}
               </button>
            </div>

            {/* Modal de succès Distribution */}
            {distriLinked && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                <div className="bg-white rounded-[4rem] p-12 max-w-xl w-full text-center shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in duration-500 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500"></div>
                  <div className="text-7xl mb-8">🚀</div>
                  <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter mb-4">Affectation Terminée</h2>
                  <p className="text-slate-500 font-bold text-sm leading-relaxed mb-10 px-6">
                    Le dispositif <span className="text-rose-600 font-black underline italic">{distriItem}</span> est officiellement affecté au <span className="text-purple-600 font-black underline italic">{distriRoom}</span>.
                  </p>
                  <button 
                    onClick={() => {setDistriLinked(false); setDistriItem(""); setDistriRoom(""); setDistriAgent({name:"", role:""});}} 
                    className="bg-slate-900 text-white px-16 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl"
                  >
                    Nouvelle Distribution
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Floating Simulation Button */}
      <button 
        onClick={triggerSimulation}
        className="fixed bottom-8 right-8 flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 hover:scale-110 transition-all active:scale-95 group z-50 border-4 border-white"
      >
        <span className="text-xl group-hover:animate-pulse">⚡</span>
        <span>Simulate Next Scan</span>
      </button>

    </div>
  );
}

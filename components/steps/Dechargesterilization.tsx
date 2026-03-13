"use client";

import { useState } from "react";

// Définition rigoureuse des types pour éviter l'erreur d'indexation TypeScript
interface ConformityChecks {
  passage: boolean;
  physico: boolean;
  siccite: boolean;
  integrite: boolean;
}

export function Dechargesterilization() {
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [agentBadge, setAgentBadge] = useState({ name: "", role: "" });
  const [checks, setChecks] = useState<ConformityChecks>({
    passage: false,
    physico: false,
    siccite: false,
    integrite: false,
  });

  // --- BOUTONS FLOTTANTS DE SIMULATION ---
  const simulateCheckAll = () => {
    setChecks({ passage: true, physico: true, siccite: true, integrite: true });
  };

  const simulateItemScan = () => {
    const id = `EMB-SORTIE-${Math.floor(1000 + Math.random() * 9000)}`;
    setScannedItems((prev) => [...prev, id]);
  };

  const simulateBadgeScan = () => {
    setAgentBadge({
      name: "MME. AMINA ALAMI",
      role: "AGENT STÉRILISATION (IBODE)"
    });
  };

  // Helper pour basculer les états de conformité en toute sécurité
  const toggleCheck = (key: keyof ConformityChecks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksValid = Object.values(checks).every(v => v);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans relative">
      
      {/* Boutons Flottants de Simulation */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-50">
        <button onClick={simulateCheckAll} title="Simuler conformité" className="bg-orange-500 text-white p-5 rounded-2xl shadow-xl border-4 border-white hover:scale-105 transition-all w-24 flex flex-col items-center">
          <span className="text-xl">📊</span>
          <span className="text-[9px] font-black uppercase mt-1">Conformité</span>
        </button>
        <button onClick={simulateItemScan} title="Simuler scan emballage" className="bg-pink-500 text-white p-5 rounded-2xl shadow-xl border-4 border-white hover:scale-105 transition-all w-24 flex flex-col items-center">
          <span className="text-xl">📦</span>
          <span className="text-[9px] font-black uppercase mt-1">Scan Objet</span>
        </button>
        <button onClick={simulateBadgeScan} title="Simuler scan badge" className="bg-blue-600 text-white p-5 rounded-2xl shadow-xl border-4 border-white hover:scale-105 transition-all w-24 flex flex-col items-center">
          <span className="text-xl">🪪</span>
          <span className="text-[9px] font-black uppercase mt-1">Scan Badge</span>
        </button>
      </div>

      <h1 className="text-xl font-black text-slate-800 mb-12 uppercase italic bg-purple-100 w-fit px-4 py-1 rounded-lg">
        Validation du cycle et libération du charge
      </h1>

      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* SECTION 1 : CONFORMITÉ DU CYCLE */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl border-2 border-slate-100">
          <div className="flex justify-center mb-10">
             <div className="bg-pink-100 text-pink-600 px-10 py-4 rounded-2xl font-black uppercase text-sm border-2 border-pink-200">
                Conformité du Cycle
             </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(Object.keys(checks) as Array<keyof ConformityChecks>).map((key) => (
              <button
                key={key}
                onClick={() => toggleCheck(key)}
                className={`p-6 rounded-3xl font-black text-[10px] uppercase transition-all border-2 h-28 flex items-center justify-center text-center ${
                  checks[key] ? "bg-pink-500 text-white border-white shadow-lg scale-105" : "bg-pink-50 text-pink-400 border-pink-100 opacity-60"
                }`}
              >
                {key === 'passage' && 'Indicateurs de passage'}
                {key === 'physico' && 'Indicateurs physico-chimiques'}
                {key === 'siccite' && 'Siccité de l\'emballage'}
                {key === 'integrite' && 'Intégrité du conditionnement'}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 2 : SCAN SORTIE */}
        <div className="flex gap-10 items-center">
          <div className="bg-pink-100 text-pink-600 p-6 rounded-2xl font-black text-[11px] w-64 text-center border-2 border-pink-200 shadow-sm uppercase">
            Scanner chaque emballage à la sortie de l'autoclave
          </div>
          <div className="flex-1 bg-slate-200 p-8 rounded-[3rem] border-2 border-slate-300 min-h-[140px]">
             <div className="flex flex-wrap gap-3">
                {scannedItems.length > 0 ? scannedItems.map((id, i) => (
                  <div key={i} className="bg-white px-6 py-3 rounded-2xl font-black text-slate-700 shadow-sm border border-slate-300 animate-in zoom-in">
                    {id}
                  </div>
                )) : <p className="text-slate-400 italic text-sm w-full text-center py-4 uppercase font-bold">Attente du scan emballage . . .</p>}
             </div>
             {scannedItems.length > 0 && (
               <div className="mt-4 bg-[#66BB6A] text-white p-4 rounded-2xl font-bold text-[10px] text-center uppercase shadow-md animate-bounce">
                 Confirmation visuelle : Emballage lié au Cycle N°2026-001
               </div>
             )}
          </div>
        </div>

        {/* SECTION 3 : BADGE AGENT */}
        <div className="flex gap-10 items-center">
          <div className="bg-pink-100 text-pink-600 p-6 rounded-2xl font-black text-[11px] w-64 text-center border-2 border-pink-200 shadow-sm uppercase leading-tight">
            Scanner le badge de l'agent responsable
          </div>
          <div className="flex-1 bg-slate-200 p-8 rounded-[3rem] border-2 border-slate-300 flex gap-6">
             <div className="bg-white p-6 rounded-2xl text-center shadow-sm flex-1 flex flex-col justify-center min-h-[100px]">
                <p className="text-[9px] text-slate-400 font-bold uppercase mb-2">Le nom et le prénom</p>
                <p className="font-black text-slate-700 text-lg italic uppercase">{agentBadge.name || ". . . . ."}</p>
             </div>
             <div className="bg-white p-6 rounded-2xl text-center shadow-sm flex-1 flex flex-col justify-center min-h-[100px]">
                <p className="text-[9px] text-slate-400 font-bold uppercase mb-2">Rôle / Fonction</p>
                <p className="font-black text-slate-700 text-lg italic uppercase">{agentBadge.role || ". . . . ."}</p>
             </div>
          </div>
        </div>

        {/* VALIDATION FINALE */}
        <div className="flex justify-center pb-20">
          <button 
            disabled={!agentBadge.name || scannedItems.length === 0 || !allChecksValid}
            className={`px-24 py-6 rounded-[3rem] font-black uppercase text-sm tracking-[0.3em] shadow-2xl transition-all ${
              agentBadge.name && scannedItems.length > 0 && allChecksValid
              ? "bg-[#00C853] text-white hover:scale-105 active:scale-95" 
              : "bg-slate-300 text-slate-400 cursor-not-allowed opacity-50"
            }`}
          >
            Libérer la charge
          </button>
        </div>
      </div>
    </div>
  );
}
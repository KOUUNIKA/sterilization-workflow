"use client";

import { useState } from "react";

export function ChargementSterilization() {
  const [autoclaveStatus, setAutoclaveStatus] = useState<"ready" | "maintenance" | null>(null);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [agentBadge, setAgentBadge] = useState({ name: "", role: "" });

  // --- LOGIQUE DES BOUTONS FLOTTANTS (SIMULATIONS) ---
  
  // Simulation 1 : Ajoute un emballage au chariot
  const simulateItemScan = () => {
    const ids = ["EMB-9920", "EMB-4412", "EMB-3301", "EMB-7721"];
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    setScannedItems((prev) => [...prev, `${randomId}-${prev.length + 1}`]);
  };

  // Simulation 2 : Active l'autoclave scanné
  const simulateAutoclaveScan = () => {
    setAutoclaveStatus("ready");
  };

  // Simulation 3 : Affiche l'agent (Seulement au clic)
  const simulateBadgeScan = () => {
    setAgentBadge({
      name: "MME. AMINA ALAMI",
      role: "AGENT STÉRILISATION (IBODE)"
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans relative">
      
      {/* --- BOUTONS FLOTTANTS DE SIMULATION --- */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-50">
        <button 
          onClick={simulateItemScan}
          className="bg-pink-500 text-white p-5 rounded-2xl shadow-xl hover:scale-105 transition-all border-4 border-white flex flex-col items-center w-24"
        >
          <span className="text-xl">🧺</span>
          <span className="text-[9px] font-black uppercase mt-1">Scan Objet</span>
        </button>
        
        <button 
          onClick={simulateAutoclaveScan}
          className="bg-purple-600 text-white p-5 rounded-2xl shadow-xl hover:scale-105 transition-all border-4 border-white flex flex-col items-center w-24"
        >
          <span className="text-xl">♨️</span>
          <span className="text-[9px] font-black uppercase mt-1">Scan Auto</span>
        </button>

        <button 
          onClick={simulateBadgeScan}
          className="bg-blue-600 text-white p-5 rounded-2xl shadow-xl hover:scale-105 transition-all border-4 border-white flex flex-col items-center w-24"
        >
          <span className="text-xl">🪪</span>
          <span className="text-[9px] font-black uppercase mt-1">Scan Badge</span>
        </button>
      </div>

      <h1 className="text-xl font-black text-slate-800 mb-12 uppercase italic bg-purple-100 w-fit px-4 py-1 rounded-lg">
        Interface de chargement (stérilisation)
      </h1>

      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* SECTION : SCAN EMBALLAGES */}
        <div className="flex gap-10 items-center">
          <div className="bg-pink-100 text-pink-600 p-6 rounded-2xl font-black text-[11px] w-64 text-center border-2 border-pink-200 shadow-sm uppercase leading-tight">
            Scanner le code barres de chaque emballage sur le chariot
          </div>
          <div className="flex-1 bg-slate-200 p-8 rounded-[3rem] border-2 border-slate-300 min-h-[140px]">
             <div className="bg-white px-4 py-2 rounded-xl border border-slate-400 w-fit mb-6 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">ID de l'emballage</p>
             </div>
             <p className="text-[10px] font-black text-slate-600 mb-4 uppercase italic">Instruments présents dans l'emballage :</p>
             <div className="flex flex-wrap gap-3">
                {scannedItems.map((item, i) => (
                  <div key={i} className="bg-white px-5 py-2 rounded-xl font-bold text-slate-700 shadow-sm border border-slate-300 animate-in zoom-in">
                    {item}
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* SECTION : SCAN AUTOCLAVE */}
        <div className="flex gap-10 items-center">
          <div className="bg-pink-100 text-pink-600 p-6 rounded-2xl font-black text-[11px] w-64 text-center border-2 border-pink-200 shadow-sm uppercase leading-tight">
            Scanner le code barres de l'autoclave
          </div>
          <div className="flex-1 bg-slate-200 p-8 rounded-[3rem] border-2 border-slate-300 flex flex-col items-center gap-6">
             <div className="bg-white px-12 py-4 rounded-2xl border-2 border-slate-400 font-black text-slate-700 text-lg shadow-sm">
                Nom/Numéro : autoclave N° 02
             </div>
             <div className="flex items-center gap-8">
                <span className="font-black text-slate-600 uppercase text-xs">état</span>
                <div className="flex gap-4">
                   <div className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase transition-all border-2 ${autoclaveStatus === "ready" ? "bg-[#66BB6A] text-white border-white shadow-lg scale-105" : "bg-slate-300 text-slate-500 border-transparent"}`}>
                      Prêt à l'emploi
                   </div>
                   <div className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase transition-all border-2 ${autoclaveStatus === "maintenance" ? "bg-[#EF5350] text-white border-white shadow-lg scale-105" : "bg-slate-300 text-slate-500 border-transparent"}`}>
                      En maintenance
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* SECTION : BADGE RESPONSABLE */}
        <div className="flex gap-10 items-center">
          <div className="bg-pink-100 text-pink-600 p-6 rounded-2xl font-black text-[11px] w-64 text-center border-2 border-pink-200 shadow-sm uppercase leading-tight">
            Scanner le badge de l'agent responsable
          </div>
          <div className="flex-1 bg-slate-200 p-8 rounded-[3rem] border-2 border-slate-300 flex gap-6">
             <div className="flex-1 bg-white p-6 rounded-2xl text-center border border-slate-300 shadow-sm min-h-[100px] flex flex-col justify-center">
                <p className="text-[9px] text-slate-400 font-bold uppercase mb-2">Le nom et le prénom</p>
                <p className="font-black text-slate-700 text-lg italic uppercase">{agentBadge.name || ". . . . ."}</p>
             </div>
             <div className="flex-1 bg-white p-6 rounded-2xl text-center border border-slate-300 shadow-sm min-h-[100px] flex flex-col justify-center">
                <p className="text-[9px] text-slate-400 font-bold uppercase mb-2">Rôle / Fonction</p>
                <p className="font-black text-slate-700 text-lg italic uppercase">{agentBadge.role || ". . . . ."}</p>
             </div>
          </div>
        </div>

        {/* ACTION FINALE */}
        <div className="flex justify-center pt-6 pb-20">
          <button 
            disabled={!agentBadge.name || scannedItems.length === 0}
            className={`px-24 py-6 rounded-[3rem] font-black uppercase text-sm tracking-[0.3em] shadow-2xl transition-all ${
              agentBadge.name && scannedItems.length > 0
              ? "bg-emerald-600 text-white hover:scale-105 active:scale-95" 
              : "bg-slate-300 text-slate-400 cursor-not-allowed"
            }`}
          >
            Démarrer le cycle
          </button>
        </div>

      </div>
    </div>
  );
}
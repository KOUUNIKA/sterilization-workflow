"use client";

import { useState } from "react";

export function Recomposition() {
  const [step, setStep] = useState<"scan" | "dashboard">("scan");
  const [showDefectPanel, setShowDefectPanel] = useState(false);
  const [scanValue, setScanValue] = useState("");
  
  // État initial vide pour l'agent
  const [agentBadge, setAgentBadge] = useState({ 
    name: "", 
    role: "" 
  });

  // --- SIMULATIONS ---
  
  const simulateBasketScan = () => {
    setScanValue("BASKET-2026-CHIR42");
    setTimeout(() => setStep("dashboard"), 500);
  };

  // Le nom et le prénom s'affichent UNIQUEMENT ici
  const simulateBadgeScan = () => {
    setAgentBadge({ 
      name: "MME. AMINA ALAMI", 
      role: "AGENT STÉRILISATION (IBODE)" 
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans relative">
      
      {/* --- BOUTONS FLOTTANTS (SIMULATEURS) --- */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-50">
        <button 
          onClick={simulateBasketScan}
          className="bg-pink-500 text-white p-6 rounded-full shadow-2xl hover:scale-105 transition-all flex flex-col items-center justify-center border-4 border-white"
        >
          <span className="text-2xl">🧺</span>
          <span className="text-[9px] font-black uppercase mt-1">Scan Panier</span>
        </button>

        {step === "dashboard" && (
          <button 
            onClick={simulateBadgeScan}
            className="bg-blue-600 text-white p-6 rounded-full shadow-2xl hover:scale-105 transition-all flex flex-col items-center justify-center border-4 border-white animate-in slide-in-from-right"
          >
            <span className="text-2xl">🪪</span>
            <span className="text-[9px] font-black uppercase mt-1">Scan Badge</span>
          </button>
        )}
      </div>

      {/* --- PHASE 1: SCAN PANIER --- */}
      {step === "scan" && (
        <div className="flex flex-col items-center justify-center h-[85vh]">
          <div className="border-4 border-dashed border-slate-200 p-24 rounded-[4rem] bg-white text-center shadow-sm">
            <div className="bg-pink-100 text-pink-600 px-10 py-3 rounded-2xl font-black uppercase text-xs mb-10 border-2 border-pink-200">
              Scanner le code-barres du panier
            </div>
            <input 
              readOnly
              type="text" 
              value={scanValue}
              placeholder="Attente du scan . . ." 
              className="w-full max-w-md p-6 bg-slate-50 rounded-3xl border-2 border-pink-400 text-center font-mono text-2xl outline-none"
            />
          </div>
        </div>
      )}

      {/* --- PHASE 2: DASHBOARD --- */}
      {step === "dashboard" && (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in slide-in-from-bottom duration-700">
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 italic uppercase">BOÎTE CHIRURGIE GÉNÉRALE #42</h2>
          </div>

          {/* TABLEAU DES INSTRUMENTS */}
          <div className="bg-white rounded-[3rem] border-2 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#B0B0B0] text-slate-800 text-[11px] font-black uppercase">
                <tr>
                  <th className="p-6 border-r border-slate-300">ID instrument</th>
                  <th className="p-6 border-r border-slate-300">Désignation</th>
                  <th className="p-6 border-r border-slate-300 text-center">Quantité</th>
                  <th className="p-6 border-r border-slate-300 text-center">Edit (Status)</th>
                  <th className="p-6 border-r border-slate-300 text-center">Type d'emballage</th>
                  <th className="p-6 text-center">Date de péremption</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-6 font-mono font-bold text-blue-600">INST-1022</td>
                  <td className="p-6 font-bold text-slate-700">Pince Kocher 14cm</td>
                  <td className="p-6 font-black text-center text-xl">2</td>
                  <td className="p-6 flex justify-center gap-2">
                    <button className="bg-[#00C853] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Validé</button>
                    <button 
                      onClick={() => setShowDefectPanel(!showDefectPanel)}
                      className="bg-[#FF6D00] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                    >
                      Défectueux
                    </button>
                    <button className="bg-[#FF1744] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Manquant</button>
                  </td>
                  <td className="p-6 text-center italic text-slate-500 font-bold">Papier tissé</td>
                  <td className="p-6 text-center font-bold text-slate-400">04/03/2028</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PANNEAU DÉFECTUEUX (S'affiche au clic sur le bouton Orange) */}
          {showDefectPanel && (
            <div className="bg-[#E3F2FD] border-2 border-[#BBDEFB] rounded-[3.5rem] p-10 shadow-inner animate-in zoom-in">
               <div className="grid grid-cols-3 gap-8 text-center mb-10">
                  <div className="bg-white p-6 rounded-2xl border border-blue-50">
                    <h4 className="text-[10px] font-black uppercase mb-2 opacity-50">QUI?</h4>
                    <p className="text-xs font-bold text-slate-700 italic">Mme. Amina ALAMI (IBODE)</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-blue-50">
                    <h4 className="text-[10px] font-black uppercase mb-2 opacity-50">QUAND?</h4>
                    <p className="text-xs font-bold text-slate-700 italic">04/03/2026 à 10:45</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-blue-50">
                    <h4 className="text-[10px] font-black uppercase mb-2 opacity-50">POURQUOI?</h4>
                    <p className="text-xs font-bold text-slate-700 italic">Mors émoussés</p>
                  </div>
               </div>
               <div className="flex justify-center">
                  <button className="bg-[#A5D6A7] text-[#1B5E20] px-16 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">
                    Valider et passer au remplacement
                  </button>
               </div>
               <div className="mt-8 bg-[#CFD8DC] rounded-3xl p-6 border border-slate-300 text-center">
                  <p className="font-black text-sm uppercase italic">Localisation : Armoire B - Tiroir 04</p>
               </div>
            </div>
          )}

          {/* --- ZONE DU BADGE (NOM MASQUÉ PAR DÉFAUT) --- */}
          <div className="mt-16 bg-[#F1FDF6] rounded-[4rem] p-10 border-2 border-emerald-100 flex items-center gap-8 shadow-sm">
             <div className="bg-pink-200 text-pink-700 p-8 rounded-3xl font-black text-[10px] w-72 text-center border-2 border-pink-300 uppercase leading-tight">
               Scanner le badge de l'agent responsable
             </div>
             
             <div className="flex-1 grid grid-cols-2 gap-6">
                <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl text-center shadow-sm min-h-[100px] flex flex-col justify-center">
                  <p className="text-[9px] text-slate-400 font-bold uppercase mb-2 tracking-widest">Le nom et le prénom</p>
                  <p className="text-lg font-black text-slate-700 uppercase italic">
                    {agentBadge.name || ". . . . . . . . . ."}
                  </p>
                </div>
                <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl text-center shadow-sm min-h-[100px] flex flex-col justify-center">
                  <p className="text-[9px] text-slate-400 font-bold uppercase mb-2 tracking-widest">Rôle / Fonction</p>
                  <p className="text-lg font-black text-slate-700 uppercase italic">
                    {agentBadge.role || ". . . . . . . . . ."}
                  </p>
                </div>
             </div>
          </div>
          
          <div className="flex justify-center pb-20">
             <button 
                disabled={!agentBadge.name}
                className={`px-24 py-6 rounded-[3rem] font-black uppercase text-sm tracking-[0.4em] shadow-2xl transition-all ${
                  agentBadge.name ? "bg-[#00C853] text-white hover:scale-105" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
             >
               Imprimer l'étiquette
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
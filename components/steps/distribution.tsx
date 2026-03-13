"use client";

import { useState } from "react";

export function Distribution() {
  const [step, setStep] = useState<"item" | "room" | "confirm">("item");
  const [scannedItem, setScannedItem] = useState("");
  const [scannedRoom, setScannedRoom] = useState("");
  const [agentBadge, setAgentBadge] = useState({ name: "", role: "" });
  const [isLinked, setIsLinked] = useState(false);

  // --- BOUTONS FLOTTANTS DE SIMULATION ---
  const simulateItemScan = () => {
    setScannedItem("BOITE-APPENDICECTOMIE-04");
    setStep("room");
  };

  const simulateRoomScan = () => {
    setScannedRoom("BLOC OPÉRATOIRE N°03");
    setStep("confirm");
  };

  const simulateBadgeScan = () => {
    setAgentBadge({
      name: "MME. AMINA ALAMI",
      role: "AGENT STÉRILISATION (IBODE)"
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans relative">
      
      {/* --- SIMULATEURS FLOTTANTS --- */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-50">
        <button onClick={simulateItemScan} className="bg-pink-500 text-white p-5 rounded-2xl shadow-xl border-4 border-white hover:scale-105 transition-all w-24 flex flex-col items-center">
          <span className="text-xl">📦</span>
          <span className="text-[9px] font-black uppercase mt-1">Scan Boîte</span>
        </button>
        <button onClick={simulateRoomScan} className="bg-purple-600 text-white p-5 rounded-2xl shadow-xl border-4 border-white hover:scale-105 transition-all w-24 flex flex-col items-center">
          <span className="text-xl">🏥</span>
          <span className="text-[9px] font-black uppercase mt-1">Scan Salle</span>
        </button>
        <button onClick={simulateBadgeScan} className="bg-blue-600 text-white p-5 rounded-2xl shadow-xl border-4 border-white hover:scale-105 transition-all w-24 flex flex-col items-center">
          <span className="text-xl">🪪</span>
          <span className="text-[9px] font-black uppercase mt-1">Scan Badge</span>
        </button>
      </div>

      <h1 className="text-xl font-black text-slate-800 mb-12 uppercase italic bg-indigo-100 w-fit px-4 py-1 rounded-lg">
        Distribution et Affectation aux Salles OP
      </h1>

      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLONNE GAUCHE : FLUX DE SCAN */}
          <div className="space-y-6">
            <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${scannedItem ? "bg-emerald-50 border-emerald-500" : "bg-white border-slate-200 shadow-xl"}`}>
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs">1</span>
                <p className="font-black text-[11px] uppercase text-slate-500">Scanner la boîte ou l'instrument</p>
              </div>
              <p className="text-xl font-black text-slate-800 uppercase italic">
                {scannedItem || "En attente de scan..."}
              </p>
            </div>

            <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${scannedRoom ? "bg-emerald-50 border-emerald-500" : "bg-white border-slate-200 shadow-xl"}`}>
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs">2</span>
                <p className="font-black text-[11px] uppercase text-slate-500">Scanner le code de la salle OP</p>
              </div>
              <p className="text-xl font-black text-slate-800 uppercase italic">
                {scannedRoom || "En attente de scan..."}
              </p>
            </div>
          </div>

          {/* COLONNE DROITE : AFFICHAGE SYSTÈME */}
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
             <h3 className="text-[10px] font-black uppercase text-indigo-500 mb-8 tracking-[0.2em] bg-indigo-50 w-fit px-3 py-1 rounded-md">
               Données du Système
             </h3>
             
             <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Statut Stérilité</span>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${scannedItem ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                    {scannedItem ? "Stérile / Validé" : "Inconnu"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Emplacement Arsenal</span>
                  <span className="font-black text-slate-700 text-xs">{scannedItem ? "Armoire B - Tiroir 04" : "---"}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Péremption</span>
                  <span className="font-black text-rose-500 text-xs">{scannedItem ? "13/09/2026" : "---"}</span>
                </div>
             </div>
          </div>
        </div>

        {/* SECTION BADGE */}
        <div className="bg-slate-200 p-8 rounded-[3rem] border-2 border-slate-300 flex flex-col md:flex-row gap-6 items-center">
           <div className="bg-pink-100 text-pink-600 p-4 rounded-2xl font-black text-[10px] w-full md:w-64 text-center border-2 border-pink-200 uppercase">
             Badge Agent Responsable
           </div>
           <div className="flex-1 bg-white p-6 rounded-2xl text-center shadow-inner w-full min-h-[80px] flex flex-col justify-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Nom & Prénom / Rôle</p>
              <p className="font-black text-slate-700 uppercase italic">
                {agentBadge.name ? `${agentBadge.name} - ${agentBadge.role}` : ". . . . ."}
              </p>
           </div>
        </div>

        {/* VALIDATION FINALE */}
        <div className="flex justify-center pb-12">
          <button 
            onClick={() => setIsLinked(true)}
            disabled={!scannedRoom || !agentBadge.name}
            className={`px-20 py-6 rounded-[2.5rem] font-black uppercase text-sm tracking-widest transition-all shadow-2xl ${
              scannedRoom && agentBadge.name ? "bg-emerald-500 text-white hover:scale-105" : "bg-slate-300 text-slate-400 cursor-not-allowed"
            }`}
          >
            Lier au bloc opératoire
          </button>
        </div>

        {/* MODAL DE SUCCÈS */}
        {isLinked && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl animate-in zoom-in">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-black text-slate-800 uppercase mb-4">Affectation Réussie</h2>
              <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
                La boîte <span className="text-pink-600 underline">{scannedItem}</span> a été liée avec succès à la <span className="text-purple-600 underline">{scannedRoom}</span>.
              </p>
              <button onClick={() => {setIsLinked(false); setScannedItem(""); setScannedRoom("");}} className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs">
                Nouveau Scan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
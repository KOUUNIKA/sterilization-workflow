"use client";

import { useState } from "react";

export function Storage() {
  const [step, setStep] = useState<"item" | "shelf" | "confirm">("item");
  const [scannedItem, setScannedItem] = useState("");
  const [scannedShelf, setScannedShelf] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  // --- BOUTONS FLOTTANTS DE SIMULATION ---
  const simulateItemScan = () => {
    setScannedItem("BOITE-ORTHO-001");
    setStep("shelf");
  };

  const simulateShelfScan = () => {
    setScannedShelf("RAYONNAGE-B / ÉTAGE-03");
    setStep("confirm");
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans relative">
      
      {/* Simulateurs Flottants */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-50">
        <button onClick={simulateItemScan} className="bg-pink-500 text-white p-5 rounded-2xl shadow-xl border-4 border-white hover:scale-105 transition-all w-24 flex flex-col items-center">
          <span className="text-xl">📦</span>
          <span className="text-[9px] font-black uppercase mt-1">Scan Boîte</span>
        </button>
        <button onClick={simulateShelfScan} className="bg-purple-600 text-white p-5 rounded-2xl shadow-xl border-4 border-white hover:scale-105 transition-all w-24 flex flex-col items-center">
          <span className="text-xl">🪜</span>
          <span className="text-[9px] font-black uppercase mt-1">Scan Étage</span>
        </button>
      </div>

      <h1 className="text-xl font-black text-slate-800 mb-12 uppercase italic bg-blue-100 w-fit px-4 py-1 rounded-lg">
        Phase de Stockage / Archivage
      </h1>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* ÉTAPES DE SCAN (Schéma de flux) */}
        <div className="flex justify-between items-center gap-4">
          <div className={`flex-1 p-6 rounded-2xl border-2 transition-all ${scannedItem ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-pink-50 border-pink-200 text-pink-600"}`}>
            <p className="text-[10px] font-black uppercase mb-1">Étape 1</p>
            <p className="font-bold text-xs uppercase">Scanner le code-barres de la boite ou l'instrument</p>
            {scannedItem && <p className="mt-2 font-black text-sm">{scannedItem}</p>}
          </div>

          <div className="text-slate-300">→</div>

          <div className={`flex-1 p-6 rounded-2xl border-2 transition-all ${scannedShelf ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-pink-50 border-pink-200 text-pink-600"}`}>
            <p className="text-[10px] font-black uppercase mb-1">Étape 2</p>
            <p className="font-bold text-xs uppercase">Scanner le code-barres de l'étage</p>
            {scannedShelf && <p className="mt-2 font-black text-sm">{scannedShelf}</p>}
          </div>

          <div className="text-slate-300">→</div>

          <button 
            onClick={handleConfirm}
            disabled={!scannedShelf}
            className={`flex-1 p-6 rounded-2xl border-2 font-black uppercase text-sm transition-all ${isConfirmed ? "bg-emerald-600 border-white text-white shadow-lg" : "bg-slate-100 border-slate-200 text-slate-400"}`}
          >
            Confirmer l'emplacement
          </button>
        </div>

        {/* VUE 2D DE L'EMPLACEMENT */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl border-2 border-slate-100 overflow-hidden">
          <div className="bg-purple-100 text-purple-600 px-6 py-2 rounded-xl font-black uppercase text-[10px] w-fit mb-6">
            Vue 2D de l'emplacement
          </div>
          
          <div className="aspect-video bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center relative">
            {scannedShelf ? (
              <div className="grid grid-cols-4 grid-rows-3 gap-4 w-full h-full p-8">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-lg border-2 flex items-center justify-center font-black text-xs ${i === 6 ? "bg-emerald-500 border-emerald-600 text-white animate-pulse" : "bg-white border-slate-200 text-slate-300"}`}
                  >
                    {i === 6 ? "POSITION CIBLE" : `Zone ${i+1}`}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 font-black uppercase italic tracking-widest">En attente de localisation...</p>
            )}
            
            {isConfirmed && (
              <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white p-10 text-center animate-in fade-in zoom-in">
                <span className="text-6xl mb-4">✅</span>
                <h2 className="text-2xl font-black uppercase mb-2">Stockage Validé</h2>
                <p className="font-bold opacity-90">L'instrument est maintenant répertorié en Armoire B - Tiroir 04</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
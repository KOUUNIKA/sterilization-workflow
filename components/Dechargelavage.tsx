"use client";

import { useState } from "react";

export function DechargementLavage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cycleValidated, setCycleValidated] = useState(false);
  const [panierScanned, setPanierScanned] = useState(false);
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);

  // Form states for validation
  const [conformity, setConformity] = useState({
    programme: false,
    parameters: false,
    dosage: false,
    stability: false,
    cleanliness: false
  });

  const allConform = Object.values(conformity).every(v => v === true);

  const triggerSimulation = () => {
    if (currentStep === 1) {
      setConformity({
        programme: true, parameters: true, dosage: true, 
        stability: true, cleanliness: true
      });
      setCycleValidated(true);
    }
    if (currentStep === 2) setPanierScanned(true);
    if (currentStep === 3) setOperatorConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl flex flex-col gap-6">
        
        {/* Header Section */}
        <header className="flex justify-between items-end border-b pb-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Phase 02 - Sortie</div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic">Déchargement Laveur</h2>
          </div>
          <div className="text-right">
             <div className="text-[10px] font-bold text-slate-400 uppercase">Laveur: <span className="text-slate-900">LD 2</span></div>
             <div className="text-[10px] font-bold text-slate-400 uppercase">N° Cycle: <span className="text-slate-900">12333</span></div>
          </div>
        </header>

        {/* Simulation Button Inline */}
        <div className="bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase italic">Action requise : {currentStep}/3</span>
          <button onClick={triggerSimulation} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200">
            <span>⚡</span> SIMULER SCAN / VALIDATION
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[2.5rem] border p-8 shadow-sm">
          
          {/* STEP 1: VALIDATION DU CYCLE */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-emerald-50 border-2 border-emerald-500 p-4 rounded-2xl text-emerald-700 font-bold text-center">
                Validation du cycle et libération de la charge
              </div>
              
              <div className="grid gap-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <CheckCard label="Programme utilisé" checked={conformity.programme} onClick={() => setConformity({...conformity, programme: !conformity.programme})} />
                  <CheckCard label="Paramètres critiques" checked={conformity.parameters} onClick={() => setConformity({...conformity, parameters: !conformity.parameters})} />
                  <CheckCard label="Dosage des produits" checked={conformity.dosage} onClick={() => setConformity({...conformity, dosage: !conformity.dosage})} />
                </div>
                <CheckCard label="Stabilité de la charge (Vérifier que rien n'a bougé)" checked={conformity.stability} onClick={() => setConformity({...conformity, stability: !conformity.stability})} />
                <CheckCard label="Siccité et Propreté macroscopique" checked={conformity.cleanliness} onClick={() => setConformity({...conformity, cleanliness: !conformity.cleanliness})} />
              </div>
            </div>
          )}

          {/* STEP 2: TRAÇABILITÉ MATÉRIELLE */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
               <div className="bg-pink-50 border-2 border-pink-400 p-6 rounded-2xl text-center">
                  <p className="text-pink-700 font-bold mb-2">Scanner chaque panier à la sortie</p>
                  {panierScanned && <p className="text-2xl font-black text-slate-800">PANIER_ID_2024-001</p>}
               </div>
               {panierScanned && (
                 <div className="bg-emerald-500 p-6 rounded-2xl text-white text-center font-bold animate-bounce">
                    ✓ Confirmation : Ce panier appartient bien à la charge validée.
                 </div>
               )}
            </div>
          )}

          {/* STEP 3: TRAÇABILITÉ HUMAINE */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
               <div className="p-8 border-4 border-dashed rounded-[2rem] text-center border-slate-200">
                  <p className="text-slate-400 font-bold uppercase tracking-widest mb-4">Scanner le badge de l'agent responsable</p>
                  {operatorConfirmed && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl shadow-inner">👤</div>
                        <div>
                          <p className="text-2xl font-black italic">SALMA BENANI</p>
                          <p className="text-emerald-600 font-bold uppercase text-xs tracking-widest">Responsable Déchargement</p>
                        </div>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center">
          <button onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1} className="px-8 py-3 rounded-2xl border font-bold text-slate-400 hover:bg-white disabled:opacity-0 transition-all tracking-tighter uppercase text-xs">← Retour</button>
          <button 
            onClick={() => currentStep === 3 ? alert('Cycle Lavage Terminé et Libéré!') : setCurrentStep(prev => prev + 1)} 
            disabled={(currentStep === 1 && !allConform) || (currentStep === 2 && !panierScanned) || (currentStep === 3 && !operatorConfirmed)}
            className="px-12 py-4 rounded-2xl bg-slate-900 text-white font-black shadow-2xl hover:bg-black disabled:bg-slate-200 transition-all uppercase tracking-widest text-xs"
          >
            {currentStep === 3 ? "Libérer la charge" : "Étape Suivante →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Small Component for Checkboxes
function CheckCard({ label, checked, onClick }: { label: string, checked: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${checked ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-100 bg-white text-slate-400'}`}>
      <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center ${checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
        {checked && "✓"}
      </div>
      <span className="text-xs font-bold leading-tight uppercase tracking-tighter">{label}</span>
    </button>
  );
}
"use client";

import { useState } from "react";

type Step = 1 | 2 | 3;
type Priority = "standard" | "urgent";

type InstrumentLine = {
  id: string;
  name: string;
  quantity: number;
};

interface PredesinfectionWizardProps {
  cycleId: string;
}

export function PredesinfectionWizard({ cycleId }: PredesinfectionWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [priority, setPriority] = useState<Priority>("standard");
  const [boxName, setBoxName] = useState("");
  const [operatorBadge, setOperatorBadge] = useState("");
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  
  // Simulation States
  const [trayScanned, setTrayScanned] = useState(false);
  const [boxScanned, setBoxScanned] = useState(false);

  // Data Static
  const [provenance] = useState("SALLE OP n° 04");
  const [soakingSummary] = useState({
    detergent: "Anioxyde 1000",
    duration: "10 min",
    dilution: "0,5%",
    dosage: "50 mL/L",
    waterVolume: "12 L",
  });
  const [instruments] = useState<InstrumentLine[]>([
    { id: "ins-1", quantity: 4, name: "Ciseaux de Mayo" },
    { id: "ins-2", quantity: 2, name: "Pinces Hémostatiques" },
    { id: "ins-3", quantity: 1, name: "Porte-aiguille" },
    { id: "ins-4", quantity: 6, name: "Ecarteurs" },
  ]);

  const handleNext = () => { if (currentStep < 3) setCurrentStep((prev) => (prev + 1) as Step); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step); };

  // وظيفة المحاكاة اللي غتخدم في كاع المراحل
  const triggerSimulation = () => {
    if (currentStep === 1) setTrayScanned(true);
    if (currentStep === 2) { setBoxScanned(true); setBoxName("CONTENEUR_A1"); }
    if (currentStep === 3) { setOperatorBadge("OP-7789"); setOperatorConfirmed(true); }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        
        {/* Header Section */}
        <header className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Prédésinfection</div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Flux de travail de stérilisation</h2>
            <div className="text-xs text-slate-500 font-mono bg-slate-200 px-2 py-1 rounded">Cycle: {cycleId}</div>
          </div>
        </header>

        {/* Stepper Indicator */}
        <div className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white font-bold">{currentStep}</div>
            <div className="text-sm font-bold uppercase text-rose-600 tracking-tighter">Étape {currentStep} / 3</div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`h-1.5 w-10 rounded-full transition-all ${currentStep >= s ? "bg-rose-500" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        {/* --- MAIN BOX WITH INLINE SIMULATION BUTTON --- */}
        <div className="relative group">
          <div className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
            ((currentStep === 1 && trayScanned) || (currentStep === 2 && boxScanned) || (currentStep === 3 && operatorConfirmed))
            ? "border-emerald-500 bg-emerald-50" : "border-pink-400 bg-pink-50 animate-pulse"
          }`}>
            <span className={`font-bold ${((currentStep === 1 && trayScanned) || (currentStep === 2 && boxScanned) || (currentStep === 3 && operatorConfirmed)) ? "text-emerald-700" : "text-pink-700"}`}>
              {currentStep === 1 && (trayScanned ? "✓ Bac de trempage scanné" : "Scanner le code-barres du bac de trempage")}
              {currentStep === 2 && (boxScanned ? "✓ Contenant identifié" : "Scanner le code-barres des contenants")}
              {currentStep === 3 && (operatorConfirmed ? "✓ Badge agent validé" : "Scanner le badge de l'agent responsable")}
            </span>

            {/* زر المحاكاة الجديد - لاصق حدا الكارّة */}
            <button 
              onClick={triggerSimulation}
              className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-pink-500 px-3 py-1.5 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 group"
            >
              <span className="text-lg group-hover:animate-bounce">⚡</span>
              <span className="text-[10px] font-bold uppercase text-slate-500">Simuler Scan</span>
            </button>
          </div>
        </div>

        {/* --- STEP 1 CONTENT --- */}
        {currentStep === 1 && trayScanned && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 bg-white border rounded-xl shadow-sm">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Provenance</div>
                  <div className="text-xl font-bold text-slate-800">{provenance}</div>
               </div>
               <div className="p-4 bg-white border rounded-xl shadow-sm flex flex-wrap gap-3">
                  {Object.entries(soakingSummary).map(([k, v]) => (
                    <div key={k} className="bg-slate-50 px-2 py-1 rounded border text-[10px] font-semibold"><span className="text-slate-400 uppercase">{k}:</span> {v}</div>
                  ))}
               </div>
            </div>

            {/* جدول الأدوات لي طلبتي فالمرحلة الأولى */}
            <div className="overflow-hidden border rounded-xl bg-white shadow-sm">
              <div className="bg-slate-800 p-3 text-white text-sm font-bold flex justify-between">
                <span>Instruments dans le bac</span>
                <span className="bg-rose-500 px-2 rounded">{instruments.length} types</span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3 font-bold text-slate-600">Quantité</th>
                    <th className="p-3 font-bold text-slate-600">Désignation de l'instrument</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {instruments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-black text-rose-600 w-20">x {inst.quantity}</td>
                      <td className="p-3 text-slate-700 font-medium">{inst.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- STEP 2 & 3 CONTENT (نفس المنطق السابق) --- */}
        {currentStep === 2 && (
          <div className={`space-y-6 transition-all ${!boxScanned ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
             <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Nom Box</label>
                  <input type="text" value={boxName} readOnly className="w-full p-3 bg-white border rounded-xl font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Priorité</label>
                  <div className="flex gap-2">
                    <button onClick={() => setPriority("standard")} className={`flex-1 p-3 rounded-xl border font-bold ${priority === "standard" ? "bg-emerald-600 text-white" : "bg-white"}`}>Standard</button>
                    <button onClick={() => setPriority("urgent")} className={`flex-1 p-3 rounded-xl border font-bold ${priority === "urgent" ? "bg-rose-600 text-white" : "bg-white"}`}>Urgent</button>
                  </div>
                </div>
             </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={`space-y-6 transition-all ${!operatorConfirmed ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
            <div className="p-6 bg-emerald-600 rounded-2xl text-white flex items-center gap-6 shadow-lg shadow-emerald-200">
               <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">👩‍⚕️</div>
               <div>
                  <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Opérateur Confirmé</p>
                  <p className="text-2xl font-bold">Amina BENALI</p>
                  <p className="text-sm opacity-80 italic">ID: {operatorBadge}</p>
               </div>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-between mt-4">
          <button onClick={handleBack} disabled={currentStep === 1} className="px-6 py-2 border rounded-xl bg-white hover:bg-slate-100 transition-all disabled:opacity-20">Retour</button>
          <button 
            onClick={handleNext} 
            disabled={(currentStep === 1 && !trayScanned) || (currentStep === 2 && !boxScanned) || (currentStep === 3 && !operatorConfirmed)}
            className={`px-10 py-2 rounded-xl font-bold text-white shadow-md transition-all ${currentStep === 3 ? "bg-emerald-600" : "bg-slate-900 disabled:bg-slate-300"}`}
          >
            {currentStep === 3 ? "Terminer" : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
}
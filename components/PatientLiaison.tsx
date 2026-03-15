"use client";

import { useState } from "react";

interface ScannedItem {
  id: string;
  label: string;
  time: string;
}

export function PatientLiaison() {
  const [patientScanned, setPatientScanned] = useState(false);
  const [patientData, setPatientData] = useState<{ id: string; name: string } | null>(null);
  const [scannedBoxes, setScannedBoxes] = useState<ScannedItem[]>([]);
  const [nurseConfirmed, setNurseConfirmed] = useState(false);

  const simulatePatientScan = () => {
    setPatientScanned(true);
    setPatientData({ id: "PAT-2026-0882", name: "Jean DUPONT" });
  };

  const simulateBoxScan = () => {
    if (!patientScanned) return;
    const newId = `BOX-${Math.floor(1000 + Math.random() * 9000)}`;
    setScannedBoxes(prev => [
      ...prev,
      { id: newId, label: `Conteneur Chirurgie-${prev.length + 1}`, time: new Date().toLocaleTimeString() }
    ]);
  };

  const simulateNurseScan = () => {
    setNurseConfirmed(true);
  };

  const isComplete = patientScanned && scannedBoxes.length > 0 && nurseConfirmed;

  const quickActionLabel = !patientScanned 
    ? "Scanner Patient" 
    : scannedBoxes.length === 0 
      ? "Scanner premier matériel" 
      : !nurseConfirmed 
        ? "Scanner Badge Infirmier" 
        : "Scanner matériel supp.";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        
        {/* Step 1 & 2: Patient Identification */}
        <section className={`bg-white/95 p-8 rounded-3xl border transition-all shadow-[0_20px_45px_rgba(11,72,103,0.08)] ${patientScanned ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1378ac] text-sm font-bold text-white shadow-lg">01</span>
            <h2 className="text-xl font-bold tracking-tight text-[#0b4867]">Identification Patient</h2>
          </div>

          {!patientScanned ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-12 text-slate-400">
              <div className="text-5xl opacity-40">👤</div>
              <p className="font-bold text-xs uppercase tracking-[0.2em] text-center px-4">Scanner le bracelet ou le dossier patient</p>
            </div>
          ) : (
            <div className="animate-in zoom-in duration-300">
              <div className="rounded-2xl border border-[#bdece4] bg-[#eafaf7] p-6 flex items-center gap-6">
                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm border border-[#bdece4]">👨</div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0b786e]">Identifiant Unique Patient</p>
                  <p className="text-2xl font-black text-[#0b4867]">{patientData?.id}</p>
                  <p className="text-sm font-semibold text-slate-500 mt-1">{patientData?.name}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Nurse Identification */}
        <section className={`bg-white/95 p-8 rounded-3xl border transition-all shadow-[0_20px_45px_rgba(11,72,103,0.08)] ${nurseConfirmed ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b4867] text-sm font-bold text-white shadow-lg">03</span>
            <h2 className="text-xl font-bold tracking-tight text-[#0b4867]">Infirmier(ère)</h2>
          </div>

          {!nurseConfirmed ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-12 text-slate-400">
              <div className="text-5xl opacity-40">🪪</div>
              <p className="font-bold text-xs uppercase tracking-[0.2em] text-center px-4">Scanner le badge pour validation</p>
            </div>
          ) : (
            <div className="animate-in zoom-in duration-300">
              <div className="rounded-2xl bg-[#0b4867] p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-[#1378ac] flex items-center justify-center text-2xl border-2 border-white/20 shadow-inner">👩‍⚕️</div>
                  <div>
                    <p className="text-lg font-bold">MME. SOPHIE MARTIN</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8de7da]">Infirmière de Bloc (IBODE)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Step 3: Material Scanning */}
      <section className={`bg-white/95 p-8 rounded-3xl border transition-all shadow-[0_20px_45px_rgba(11,72,103,0.08)] ${scannedBoxes.length > 0 ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
        <div className="flex items-center gap-4 mb-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1378ac] text-sm font-bold text-white shadow-lg">02</span>
          <h2 className="text-xl font-bold tracking-tight text-[#0b4867]">Liaison Matériel Utilisé</h2>
          {scannedBoxes.length > 0 && (
            <span className="ml-auto bg-[#11b5a2] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
              {scannedBoxes.length} Matériel(s) lié(s)
            </span>
          )}
        </div>

        {!patientScanned ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-slate-300">
            <p className="font-bold text-sm uppercase tracking-widest">Veuillez d'abord identifier le patient</p>
          </div>
        ) : scannedBoxes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-16 text-[#1378ac]">
            <div className="text-5xl opacity-40">📦</div>
            <p className="font-bold text-xs uppercase tracking-[0.2em] text-center px-4">Scanner les étiquettes de chaque boîte une par une</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4">
            {scannedBoxes.map((box, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-2xl border border-[#b8cad6] bg-white shadow-sm hover:border-[#1378ac] transition-all">
                <div className="h-12 w-12 rounded-xl bg-[#edf5f9] flex items-center justify-center text-xl">🏷️</div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0b4867] truncate">{box.id}</p>
                  <p className="text-[10px] font-medium text-slate-400">{box.label}</p>
                </div>
                <span className="ml-auto text-[9px] font-bold text-slate-300">{box.time}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Step 4: Final Validation */}
      <div className="flex justify-center pt-4">
        <button 
          onClick={() => alert("Liaison Patient Validée !")}
          disabled={!isComplete}
          className={`group relative rounded-2xl px-24 py-5 text-sm font-black uppercase tracking-[0.25em] transition-all duration-500 shadow-[0_20px_40px_rgba(11,72,103,0.14)] ${isComplete ? 'bg-[#1378ac] text-white hover:bg-[#0f6a98] hover:-translate-y-1.5 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          {isComplete && <span className="absolute -top-3 -right-3 rounded-full bg-[#11b5a2] p-2 text-xs text-white shadow-lg animate-bounce">✓</span>}
          Valider la liaison
        </button>
      </div>

      {/* Floating Simulation Controls */}
      <div className="fixed bottom-8 right-8 z-[70] flex flex-col gap-3">
        <button 
          onClick={simulatePatientScan}
          className="flex items-center gap-3 bg-white border border-[#d5e2ea] px-6 py-3.5 rounded-2xl shadow-xl hover:border-[#1378ac] transition-all group active:scale-95"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Simuler Patient</span>
        </button>
        <button 
          onClick={simulateBoxScan}
          className="flex items-center gap-3 bg-white border border-[#d5e2ea] px-6 py-3.5 rounded-2xl shadow-xl hover:border-[#1378ac] transition-all group active:scale-95"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🏷️</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Simuler Scan Matériel</span>
        </button>
        <button 
          onClick={simulateNurseScan}
          className="flex items-center gap-3 bg-white border border-[#d5e2ea] px-6 py-3.5 rounded-2xl shadow-xl hover:border-[#1378ac] transition-all group active:scale-95"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🪪</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Simuler Badge</span>
        </button>
      </div>

      {/* Flowchart Reminder Header */}
      <div className="fixed top-24 right-8 z-[40] hidden xl:block pointer-events-none">
        <div className="bg-[#fff6e9] border border-[#ffe4bc] p-4 rounded-2xl max-w-[200px] shadow-sm">
          <p className="text-[9px] font-bold uppercase text-[#b45309] tracking-widest mb-2">Processus Liaison</p>
          <ul className="space-y-2">
            {[
              { color: 'bg-pink-400', text: 'Récupérer étiquettes' },
              { color: 'bg-green-400', text: 'Scanner patient' },
              { color: 'bg-purple-400', text: 'Scanner matériel' },
              { color: 'bg-white', text: 'Valider liaison' }
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${step.color} shadow-sm`} />
                <span className="text-[10px] font-medium text-slate-600">{step.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

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

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden">
      {/* Top Section */}
      <div className="grid gap-4 lg:grid-cols-2 shrink-0">
        <section className={`bg-white/95 p-5 rounded-3xl border transition-all shadow-sm ${patientScanned ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1378ac] text-xs font-bold text-white shadow-md">01</span>
            <h2 className="text-base font-bold tracking-tight text-[#0b4867]">Identification Patient</h2>
          </div>

          {!patientScanned ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-6 text-slate-400">
              <div className="text-3xl opacity-40">👤</div>
              <p className="font-bold text-[9px] uppercase tracking-widest text-center px-4">Scanner Patient</p>
            </div>
          ) : (
            <div className="animate-in zoom-in duration-300">
              <div className="rounded-2xl border border-[#bdece4] bg-[#eafaf7] p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm border border-[#bdece4]">👨</div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#0b786e]">ID Unique</p>
                  <p className="text-lg font-black text-[#0b4867]">{patientData?.id}</p>
                  <p className="text-xs font-semibold text-slate-500">{patientData?.name}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className={`bg-white/95 p-5 rounded-3xl border transition-all shadow-sm ${nurseConfirmed ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b4867] text-xs font-bold text-white shadow-md">03</span>
            <h2 className="text-base font-bold tracking-tight text-[#0b4867]">Infirmier(ère)</h2>
          </div>

          {!nurseConfirmed ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-6 text-slate-400">
              <div className="text-3xl opacity-40">🪪</div>
              <p className="font-bold text-[9px] uppercase tracking-widest text-center px-4">Scanner Badge</p>
            </div>
          ) : (
            <div className="animate-in zoom-in duration-300">
              <div className="rounded-2xl bg-[#0b4867] p-4 text-white">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#1378ac] flex items-center justify-center text-xl border-2 border-white/20 shadow-inner">👩‍⚕️</div>
                  <div>
                    <p className="text-sm font-bold">MME. SOPHIE MARTIN</p>
                    <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#8de7da]">IBODE</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Middle Section: Scanned Items List */}
      <section className={`flex-1 min-h-0 bg-white/95 p-5 rounded-3xl border transition-all shadow-sm flex flex-col overflow-hidden ${scannedBoxes.length > 0 ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1378ac] text-xs font-bold text-white shadow-md">02</span>
            <h2 className="text-base font-bold tracking-tight text-[#0b4867]">Liaison Matériel</h2>
          </div>
          {scannedBoxes.length > 0 && (
            <span className="bg-[#11b5a2] text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-sm">
              {scannedBoxes.length} lié(s)
            </span>
          )}
        </div>

        {!patientScanned ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-slate-300">
            <p className="font-bold text-[9px] uppercase tracking-widest">Identifier le patient</p>
          </div>
        ) : scannedBoxes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] p-6 text-[#1378ac]">
            <div className="text-4xl opacity-40">📦</div>
            <p className="font-bold text-[9px] uppercase tracking-widest text-center px-4">Scanner étiquettes</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {scannedBoxes.map((box, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl border border-[#b8cad6] bg-white shadow-sm hover:border-[#1378ac] transition-all">
                  <div className="h-10 w-10 rounded-lg bg-[#edf5f9] flex items-center justify-center text-lg">🏷️</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-[#0b4867] truncate">{box.id}</p>
                    <p className="text-[8px] font-medium text-slate-400 truncate">{box.label}</p>
                  </div>
                  <span className="text-[7px] font-bold text-slate-300 shrink-0">{box.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Footer Section */}
      <footer className="shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-[#d5e2ea] shadow-lg mt-auto">
        <button 
          onClick={() => alert("Liaison Patient Validée !")}
          disabled={!isComplete}
          className={`group relative rounded-xl px-12 py-3.5 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-300 shadow-md ${isComplete ? 'bg-[#1378ac] text-white hover:bg-[#0f6a98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          {isComplete && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[#11b5a2] p-1 text-[8px] text-white shadow-lg animate-bounce">✓</span>}
          Valider liaison
        </button>

        <div className="flex gap-2">
          <SimBtn icon="👤" label="Patient" onClick={simulatePatientScan} active={patientScanned} />
          <SimBtn icon="🏷️" label="Box" onClick={simulateBoxScan} active={patientScanned} />
          <SimBtn icon="🪪" label="Badge" onClick={simulateNurseScan} active={nurseConfirmed} />
        </div>
      </footer>
    </div>
  );
}

function SimBtn({ icon, label, onClick, active }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[8px] font-bold uppercase tracking-widest ${active ? 'bg-[#eafaf7] border-[#11b5a2] text-[#0b786e]' : 'bg-white border-[#d5e2ea] text-slate-500 hover:border-[#1378ac]'}`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

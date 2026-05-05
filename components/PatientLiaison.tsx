"use client";

import { useState } from "react";
import { 
  Pencil, 
  RotateCcw, 
  Trash2, 
  UserMinus, 
  AlertCircle, 
  ChevronLeft,
  CheckCircle2,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ScannedItem {
  id: string;
  label: string;
  time: string;
}

export function PatientLiaison() {
  const navigate = useNavigate();
  const [patientScanned, setPatientScanned] = useState(false);
  const [patientData, setPatientData] = useState<{ id: string; name: string } | null>(null);
  const [scannedBoxes, setScannedBoxes] = useState<ScannedItem[]>([]);
  const [nurseConfirmed, setNurseConfirmed] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleGlobalReset = () => {
    setPatientScanned(false);
    setPatientData(null);
    setScannedBoxes([]);
    setNurseConfirmed(false);
    setShowResetConfirm(false);
  };

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1378ac] text-xs font-bold text-white shadow-md">01</span>
              <h2 className="text-base font-bold tracking-tight text-[#0b4867]">Identification Patient</h2>
            </div>
            {patientScanned && (
              <button 
                onClick={() => { setPatientScanned(false); setPatientData(null); }}
                className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-slate-400 hover:text-[#1378ac] hover:border-[#1378ac] transition-colors"
              >
                <Pencil className="w-2.5 h-2.5" />
                Modifier
              </button>
            )}
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b4867] text-xs font-bold text-white shadow-md">03</span>
              <h2 className="text-base font-bold tracking-tight text-[#0b4867]">Infirmier(ère)</h2>
            </div>
            {nurseConfirmed && (
              <button 
                onClick={() => setNurseConfirmed(false)}
                className="flex items-center gap-1 text-[7px] font-black uppercase tracking-wider text-slate-400 hover:text-[#1378ac] transition-colors"
              >
                <UserMinus className="w-2.5 h-2.5" />
                Changer
              </button>
            )}
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
          <div className="flex items-center gap-3">
            {scannedBoxes.length > 0 && (
              <button 
                onClick={() => setScannedBoxes([])}
                className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-slate-400 hover:text-[#1378ac] hover:border-[#1378ac] transition-colors"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Réinitialiser
              </button>
            )}
            {scannedBoxes.length > 0 && (
              <span className="bg-[#11b5a2] text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-sm">
                {scannedBoxes.length} lié(s)
              </span>
            )}
          </div>
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
                <div key={index} className="group relative flex items-center gap-3 p-3 rounded-xl border border-[#b8cad6] bg-white shadow-sm hover:border-[#1378ac] transition-all">
                  <div className="h-10 w-10 rounded-lg bg-[#edf5f9] flex items-center justify-center text-lg">🏷️</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-[#0b4867] truncate">{box.id}</p>
                    <p className="text-[8px] font-medium text-slate-400 truncate">{box.label}</p>
                  </div>
                  <span className="text-[7px] font-bold text-slate-300 shrink-0 group-hover:opacity-0 transition-opacity">{box.time}</span>
                  <button 
                    onClick={() => setScannedBoxes(prev => prev.filter((_, i) => i !== index))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-lg bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Footer Section */}
      <footer className="shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#d5e2ea] shadow-lg mt-auto gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            Étape précédente
          </button>
          
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Tout effacer
          </button>
        </div>

        <button 
          onClick={() => alert("Liaison Patient Validée !")}
          disabled={!isComplete}
          className={`group relative flex items-center gap-3 rounded-xl px-12 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] transition-all duration-300 shadow-xl ${isComplete ? 'bg-[#1378ac] text-white hover:bg-[#0f6a98] hover:-translate-y-0.5 active:scale-95 shadow-[#1378ac]/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200 shadow-none'}`}
        >
          {isComplete && <CheckCircle2 className="w-4 h-4 text-white" />}
          Valider liaison
        </button>

        <div className="flex gap-2">
          <SimBtn icon="👤" label="Patient" onClick={simulatePatientScan} active={patientScanned} />
          <SimBtn icon="🏷️" label="Box" onClick={simulateBoxScan} active={patientScanned} />
          <SimBtn icon="🪪" label="Badge" onClick={simulateNurseScan} active={nurseConfirmed} />
        </div>
      </footer>

      {/* GLOBAL RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center uppercase tracking-tight mb-2">Tout effacer ?</h3>
            <p className="text-sm font-bold text-slate-500 text-center leading-relaxed mb-8">
              Êtes-vous sûr de vouloir effacer toutes les données de liaison patient pour ce cycle ?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
              >
                Annuler
              </button>
              <button
                onClick={handleGlobalReset}
                className="py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
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

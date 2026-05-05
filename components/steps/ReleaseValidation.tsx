"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Fingerprint, 
  Thermometer, 
  Droplets, 
  Zap, 
  Timer,
  FileText,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface TicketData {
  vacuum: number; // Torr
  h2o2Area: number; // mg-sec/l
  plasmaPower: number; // Watts
  temperature: number; // °C
}

const REFERENCE_THRESHOLDS = {
  vacuum: 1.0, // < 1 Torr
  h2o2Area: 795, // > 795 mg-sec/l
  plasmaPower: 450, // > 450 Watts
  tempMin: 45,
  tempMax: 55
};

export default function ReleaseValidationInterface() {
  // --- STATE ---
  const [ticketData, setTicketData] = useState<TicketData>({
    vacuum: 0.8,
    h2o2Area: 812,
    plasmaPower: 485,
    temperature: 52
  });

  const [chemicalIndicator, setChemicalIndicator] = useState(false);
  const [biologicalIndicator, setBiologicalIndicator] = useState<"Pending" | "Negative" | "Positive">("Pending");
  const [agentBadge, setAgentBadge] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- VALIDATION LOGIC ---
  const validation = {
    vacuum: ticketData.vacuum < REFERENCE_THRESHOLDS.vacuum,
    h2o2: ticketData.h2o2Area > REFERENCE_THRESHOLDS.h2o2Area,
    plasma: ticketData.plasmaPower > REFERENCE_THRESHOLDS.plasmaPower,
    temp: ticketData.temperature >= REFERENCE_THRESHOLDS.tempMin && ticketData.temperature <= REFERENCE_THRESHOLDS.tempMax
  };

  const isParametricValid = Object.values(validation).every(v => v);
  const canRelease = isParametricValid && chemicalIndicator && biologicalIndicator === "Negative" && isSigned;

  const handleBadgeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentBadge.length > 3) {
      setIsSigned(true);
    }
  };

  const handleFinalRelease = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert("Charge libérée avec succès. Traçabilité archivée.");
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-8 bg-[#f4f8fb] min-h-screen font-app">
      {/* HEADER */}
      <header className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-[#d5e2ea]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#edf5f9] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#1378ac] border border-[#b8cad6] mb-2">
            <ShieldCheck className="w-3 h-3" /> Libération de Charge (Validation Finale)
          </div>
          <h1 className="text-2xl font-black text-[#0b4867] uppercase tracking-tight">Interface de Validation BT</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cycle ID</p>
          <p className="text-lg font-black text-[#1378ac]">BT-2026-0042</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: PARAMETRIC VERIFICATION */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#d5e2ea]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-[#0b4867] uppercase tracking-widest flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#1378ac]" /> 1. Vérification Paramétrique Automatisée
              </h2>
              {!isParametricValid && (
                <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-red-100 flex items-center gap-2 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" /> Alerte Paramètres
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* VACUUM */}
              <ParamCard 
                label="Validation Vide (Séchage)"
                value={`${ticketData.vacuum} Torr`}
                threshold={`< ${REFERENCE_THRESHOLDS.vacuum} Torr`}
                isValid={validation.vacuum}
                icon={<Timer className="w-5 h-5" />}
              />
              {/* CHEMICAL EFFICACY */}
              <ParamCard 
                label="Efficacité Chimique (H2O2)"
                value={`${ticketData.h2o2Area} mg-sec/l`}
                threshold={`> ${REFERENCE_THRESHOLDS.h2o2Area}`}
                isValid={validation.h2o2}
                icon={<Droplets className="w-5 h-5" />}
              />
              {/* IONIC EFFICACY */}
              <ParamCard 
                label="Efficacité Ionique (Plasma)"
                value={`${ticketData.plasmaPower} W`}
                threshold={`> ${REFERENCE_THRESHOLDS.plasmaPower} W`}
                isValid={validation.plasma}
                icon={<Zap className="w-5 h-5" />}
              />
              {/* THERMAL CONTROL */}
              <ParamCard 
                label="Contrôle Thermique"
                value={`${ticketData.temperature} °C`}
                threshold={`${REFERENCE_THRESHOLDS.tempMin}°C - ${REFERENCE_THRESHOLDS.tempMax}°C`}
                isValid={validation.temp}
                icon={<Thermometer className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* INDICATORS ENTRY */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#d5e2ea]">
            <h2 className="text-sm font-black text-[#0b4867] uppercase tracking-widest flex items-center gap-3 mb-8">
              <CheckCircle2 className="w-5 h-5 text-[#1378ac]" /> 2. Saisie des Indicateurs Physiques
            </h2>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Indicateur Chimique (Classe 1/4)</label>
                <button 
                  onClick={() => setChemicalIndicator(!chemicalIndicator)}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${chemicalIndicator ? 'bg-[#eafaf7] border-[#11b5a2] text-[#0b786e]' : 'bg-white border-slate-100 text-slate-400 hover:border-[#1378ac]/30'}`}
                >
                  <span className="text-[11px] font-black uppercase">Changement de couleur conforme</span>
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${chemicalIndicator ? 'bg-[#11b5a2] border-[#11b5a2] text-white' : 'border-slate-200'}`}>
                    {chemicalIndicator && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Indicateur Biologique (IB)</label>
                <select 
                  value={biologicalIndicator}
                  onChange={(e) => setBiologicalIndicator(e.target.value as any)}
                  className={`w-full p-5 rounded-2xl border-2 text-[11px] font-black uppercase outline-none transition-all ${
                    biologicalIndicator === "Negative" ? 'bg-[#eafaf7] border-[#11b5a2] text-[#0b786e]' : 
                    biologicalIndicator === "Positive" ? 'bg-red-50 border-red-500 text-red-600' : 
                    'bg-white border-slate-100 text-slate-400'
                  }`}
                >
                  <option value="Pending">En attente (Incubation...)</option>
                  <option value="Negative">Négatif (Stérile)</option>
                  <option value="Positive">Positif (Échec)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: SIGNATURE & RELEASE */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#d5e2ea] h-full flex flex-col">
            <h2 className="text-sm font-black text-[#0b4867] uppercase tracking-widest flex items-center gap-3 mb-8">
              <Fingerprint className="w-5 h-5 text-[#1378ac]" /> 3. Signature Numérique
            </h2>

            <div className="flex-1 flex flex-col justify-center gap-8">
              {!isSigned ? (
                <div className="p-10 bg-[#f8fbfd] rounded-[2rem] border-2 border-dashed border-[#d5e2ea] flex flex-col items-center gap-6">
                  <div className="h-20 w-20 rounded-3xl bg-white shadow-inner flex items-center justify-center">
                    <Fingerprint className="w-10 h-10 text-slate-300" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xs font-black text-[#0b4867] uppercase tracking-widest">SCAN_BADGE_AGENT</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Responsabilité légale de libération</p>
                  </div>
                  <form onSubmit={handleBadgeScan} className="w-full">
                    <input 
                      type="password"
                      value={agentBadge}
                      onChange={(e) => setAgentBadge(e.target.value)}
                      placeholder="BADGE ID"
                      className="w-full bg-white border-2 border-[#d5e2ea] rounded-xl py-4 px-4 text-center text-sm font-black tracking-[0.4em] focus:border-[#1378ac] outline-none transition-all shadow-inner"
                    />
                  </form>
                </div>
              ) : (
                <div className="bg-[#0b4867] rounded-[2rem] p-8 text-white relative overflow-hidden group animate-in zoom-in duration-500">
                  <div className="absolute top-0 right-0 p-6 bg-white/5 rounded-bl-[3rem]">
                    <ShieldCheck className="w-8 h-8 text-[#11b5a2]" />
                  </div>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="h-20 w-20 rounded-2xl bg-[#1378ac] flex items-center justify-center text-3xl shadow-inner border-2 border-white/10">👩‍🔬</div>
                    <div>
                      <p className="text-xl font-black uppercase tracking-tight">Dr. Salma Kounka</p>
                      <p className="text-[10px] font-bold text-[#8de7da] uppercase tracking-[0.3em] opacity-80">Pharmacien Responsable</p>
                    </div>
                  </div>
                  <button onClick={() => setIsSigned(false)} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[9px] font-black uppercase tracking-widest transition-all">
                    Changer de signataire
                  </button>
                </div>
              )}

              {/* FINAL RELEASE BUTTON */}
              <div className="space-y-4">
                {biologicalIndicator === "Positive" && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 animate-in shake duration-500">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-tight">
                      ALERTE CRITIQUE : IB POSITIF. Libération strictement interdite. Procédure de rappel requise.
                    </p>
                  </div>
                )}
                
                <button 
                  disabled={!canRelease || isProcessing}
                  onClick={handleFinalRelease}
                  className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs transition-all shadow-xl flex items-center justify-center gap-4 ${
                    canRelease 
                    ? 'bg-[#11b5a2] text-white hover:-translate-y-1 hover:shadow-[#11b5a2]/20 active:scale-95' 
                    : 'bg-slate-50 text-slate-200 cursor-not-allowed border border-slate-100'
                  }`}
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  {isProcessing ? "Traitement..." : "Valider la Libération"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParamCard({ label, value, threshold, isValid, icon }: { label: string, value: string, threshold: string, isValid: boolean, icon: React.ReactNode }) {
  return (
    <div className={`p-5 rounded-2xl border-2 transition-all duration-500 ${isValid ? 'bg-[#f8fbfd] border-slate-50' : 'bg-red-50 border-red-100'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${isValid ? 'bg-white text-[#1378ac]' : 'bg-white text-red-500'} shadow-sm`}>
          {icon}
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest ${isValid ? 'text-slate-400' : 'text-red-400'}`}>{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-xl font-black tracking-tight ${isValid ? 'text-[#0b4867]' : 'text-red-600'}`}>{value}</p>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">Réf: {threshold}</p>
        </div>
        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${isValid ? 'bg-[#eafaf7] text-[#11b5a2]' : 'bg-red-100 text-red-500'}`}>
          {isValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4 animate-pulse" />}
        </div>
      </div>
    </div>
  );
}

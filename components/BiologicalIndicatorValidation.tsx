"use client";

import React, { useState, useRef } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Upload, 
  FileCheck, 
  History,
  ShieldCheck,
  AlertTriangle,
  X,
  Loader2,
  RotateCcw,
  Fingerprint
} from "lucide-react";

interface BiologicalIndicatorValidationProps {
  onValidated?: (status: "valid" | "recalled") => void;
  operatorId: string;
  agentScanned?: boolean;
  onBadgeScan?: () => void;
  onResetUser?: () => void;
}

export default function BiologicalIndicatorValidation({ onValidated, operatorId, agentScanned, onBadgeScan, onResetUser }: BiologicalIndicatorValidationProps) {
  const simulationImage = "/images/biological-indicators/simulation-tube-test.png";
  const [internalStep, setInternalStep] = useState<1 | 2>(1); // 1: Capture, 2: Decision
  const [result, setResult] = useState<"VIOLET" | "JAUNE" | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(simulationImage);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCapturing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setIsCapturing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAuditTrail = (color: string) => {
    const auditEntry = {
      user_id: operatorId,
      timestamp: new Date().toISOString(),
      result_color: color,
      image_url: capturedImage || "N/A"
    };

    const currentTrail = JSON.parse(localStorage.getItem('BiologicalAuditTrail') || '[]');
    localStorage.setItem('BiologicalAuditTrail', JSON.stringify([...currentTrail, auditEntry]));
  };

  const handleSelection = (color: "VIOLET" | "JAUNE") => {
    setResult(color);
    if (color === "JAUNE") {
      // Triggering modal for recall warning
      setShowRecallModal(true);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCapturedImage(simulationImage);
    setIsCapturing(false);
    setShowRecallModal(false);
    setIsProcessing(false);
  };

  const finalizeValidation = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      if (result === "VIOLET") {
        // Success Logic
        localStorage.setItem('sterilization_cycle_status', 'FULLY_VALIDATED');
        localStorage.setItem('medical_devices_unlocked', 'true');
        saveAuditTrail("VIOLET");
        onValidated?.("valid");
      } else if (result === "JAUNE") {
        // Failure Logic
        localStorage.setItem('sterilization_cycle_status', 'RECALLED');
        localStorage.setItem('system_critical_alert', 'true');
        localStorage.setItem('machine_critical_error', 'true'); // Block further cycles
        localStorage.setItem('batch_items_status', 'NON_STERILE');
        saveAuditTrail("JAUNE");
        onValidated?.("recalled");
      }
      setIsProcessing(false);
      setShowRecallModal(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 gap-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-[#0b4867] uppercase tracking-tight">Le Test des Indicateurs Biologiques (IB)</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Poste Qualification</span>
            <div className="h-1.5 w-10 bg-indigo-600 rounded-full" />
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Evidence & Decision */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className={`flex-1 bg-[#f8fbfd] rounded-2xl p-6 border-2 transition-all duration-500 ${
            capturedImage ? 'border-[#11b5a2]' : 'border-dashed border-[#d5e2ea]'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black uppercase text-[#0b4867] tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" /> Photo Preuve du Tube
              </p>
              {capturedImage && (
                <button onClick={() => setCapturedImage(null)} className="text-[9px] font-black uppercase text-red-500 hover:underline">
                  Reprendre la photo
                </button>
              )}
            </div>

            <div className="h-48 rounded-2xl bg-white border-2 border-[#d5e2ea]/50 overflow-hidden flex items-center justify-center relative shadow-inner mb-8">
              {isCapturing ? (
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              ) : capturedImage ? (
                <img src={capturedImage} alt="IB Proof" className="h-full w-full object-contain" />
              ) : (
                <div className="text-center space-y-2 opacity-60">
                  <Camera className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Simulation masquee
                  </p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
                  >
                    Cliquer pour reprendre la photo
                  </button>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleCapture} accept="image/*" capture="environment" className="hidden" />
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-[#0b4867] tracking-widest">Résultat de l'Incubation (24h)</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleSelection("VIOLET")}
                  className={`flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all ${
                    result === "VIOLET" ? "bg-[#7F00FF] border-[#7F00FF] text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-[#7F00FF]/30"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Violet (Conforme)</span>
                </button>
                <button 
                  onClick={() => handleSelection("JAUNE")}
                  className={`flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all ${
                    result === "JAUNE" ? "bg-[#FFD700] border-[#FFD700] text-[#0b4867] shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-[#FFD700]/30"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Jaune (Échec)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Signature */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className={`bg-white rounded-2xl p-6 border-2 transition-all duration-500 ${
            agentScanned ? 'border-[#11b5a2]' : (capturedImage && result ? 'border-indigo-600' : 'border-[#d5e2ea] opacity-60')
          }`}>
            <h3 className="text-xs font-black text-[#0b4867] uppercase mb-6 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-indigo-600" /> Signature Agent
            </h3>
            
            {!agentScanned ? (
              <div className="p-8 bg-[#f8fbfd] rounded-2xl border-2 border-dashed border-[#d5e2ea] flex flex-col items-center gap-6">
                <Fingerprint className="w-10 h-10 text-slate-300" />
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#0b4867] mb-1">Scan Badge Requis</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Validation de l'IB</p>
                </div>
                <button 
                  disabled={!capturedImage || !result}
                  onClick={onBadgeScan}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${
                    capturedImage && result ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' : 'bg-slate-50 text-slate-200 cursor-not-allowed border border-slate-100'
                  }`}
                >
                  Simuler Scan Badge
                </button>
              </div>
            ) : (
              <div className="bg-[#0b4867] rounded-2xl p-6 text-white flex flex-col gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 bg-white/5 rounded-bl-[2rem]">
                  <ShieldCheck className="w-6 h-6 text-[#11b5a2]" />
                </div>
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-[#1378ac] flex items-center justify-center text-2xl shadow-inner border-2 border-white/10 overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=amina" alt="Agent" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black truncate uppercase tracking-tight leading-none mb-1.5">Mme Amina Benali</p>
                    <p className="text-[10px] font-bold text-[#8de7da] uppercase tracking-[0.3em] opacity-80">Superviseur Qualité</p>
                  </div>
                </div>
                <button onClick={onResetUser} className="py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[9px] font-black uppercase tracking-widest transition-all">
                  Changer d'agent
                </button>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3">
            <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200 pb-2 mb-1">Résumé IB</h4>
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-400 uppercase">Statut IB</span>
              <span className={`font-black ${result === "VIOLET" ? "text-indigo-600" : (result === "JAUNE" ? "text-[#FFD700]" : "text-slate-300")}`}>
                {result || "—"}
              </span>
            </div>
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-400 uppercase">Photo</span>
              <span className={`font-black ${capturedImage ? "text-emerald-500" : "text-slate-300"}`}>
                {capturedImage ? "CAPTURÉE" : "—"}
              </span>
            </div>
          </div>

          <button 
            disabled={!result || !capturedImage || !agentScanned || isProcessing}
            onClick={result === "JAUNE" ? () => setShowRecallModal(true) : finalizeValidation}
            className={`w-full flex items-center justify-center gap-4 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl ${
              (result && capturedImage && agentScanned && !isProcessing)
              ? 'bg-indigo-600 text-white hover:-translate-y-1'
              : 'bg-slate-50 text-slate-200 cursor-not-allowed border border-slate-100 shadow-none'
            }`}
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {isProcessing ? "Traitement..." : "Finaliser Validation IB"}
          </button>
        </div>
      </div>

      {/* RECALL CONFIRMATION MODAL */}
... 50 lines not shown ...
      {/* RECALL CONFIRMATION MODAL */}
      {showRecallModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md" onClick={() => setShowRecallModal(false)} />
          <div className="relative bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-[0_0_100px_rgba(220,38,38,0.3)] border-2 border-red-500 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowRecallModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="h-24 w-24 rounded-[2rem] bg-red-100 text-red-600 flex items-center justify-center mb-8 mx-auto shadow-inner relative overflow-hidden">
              <AlertTriangle className="w-12 h-12 relative z-10" />
              <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse" />
            </div>

            <h3 className="text-3xl font-black text-slate-900 text-center uppercase tracking-tighter mb-4">Alerte Critique : Rappel de Charge</h3>
            
            <div className="bg-red-50 rounded-3xl p-6 border-2 border-red-100 mb-8 space-y-4">
              <p className="text-sm font-bold text-red-700 text-center leading-relaxed uppercase">
                ATTENTION : Une liste de rappel est en cours de génération pour tous les articles du lot.
              </p>
              <div className="flex flex-col items-center gap-2 py-4 bg-white/50 rounded-2xl border border-red-200">
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Articles concernés</span>
                <span className="text-4xl font-black text-red-600">42 ITEMS</span>
              </div>
              <p className="text-xs font-black text-red-500 text-center uppercase tracking-widest italic animate-pulse">
                Notifier la Pharmacie IMMÉDIATEMENT
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowRecallModal(false)}
                className="py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
              >
                Annuler
              </button>
              <button 
                onClick={finalizeValidation}
                disabled={isProcessing}
                className="py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-200 transition-all animate-bounce-short"
              >
                Confirmer le Rappel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

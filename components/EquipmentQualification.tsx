"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  CheckCircle2, 
  XCircle, 
  Scan, 
  Fingerprint, 
  Clock, 
  Calendar,
  ShieldCheck,
  Play,
  Loader2,
  Settings,
  AlertCircle
} from "lucide-react";

interface EquipmentQualificationProps {
  onValidated?: (isValid: boolean) => void;
}

export function EquipmentQualification({ onValidated }: EquipmentQualificationProps) {
  // --- STATE MANAGEMENT ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [step1State, setStep1State] = useState<"idle" | "processing" | "completed">("idle");
  const [testResult, setTestResult] = useState<"CONFORM" | "NON_CONFORM" | null>(null);
  const [capturedMeta, setCapturedMeta] = useState<{ date: string; time: string } | null>(null);
  const [agentScanned, setAgentScanned] = useState(false);
  const [badgeValue, setBadgeValue] = useState("");
  const badgeInputRef = useRef<HTMLInputElement>(null);

  // --- DYNAMIC CLOCK ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- AUTO-FOCUS BADGE INPUT ---
  useEffect(() => {
    if (step1State === "completed" && testResult === "CONFORM" && !agentScanned) {
      badgeInputRef.current?.focus();
    }
  }, [step1State, testResult, agentScanned]);

  // --- SIMULATION HANDLERS ---
  const handleCaptureImage = () => {
    setStep1State("processing");
    
    // Simulate AI analysis delay
    setTimeout(() => {
      // 90% chance of success for prototype smoothness
      const isConform = Math.random() > 0.1;
      setTestResult(isConform ? "CONFORM" : "NON_CONFORM");
      
      const now = new Date();
      setCapturedMeta({
        date: now.toLocaleDateString('fr-FR'),
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      
      setStep1State("completed");
    }, 2500);
  };

  const handleBadgeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (badgeValue.length > 3) {
      setAgentScanned(true);
    }
  };

  const canStartSterilization = 
    step1State === "completed" && 
    testResult === "CONFORM" && 
    agentScanned;

  const simulateBadgeScan = () => {
    if (step1State === "completed" && testResult === "CONFORM") {
      setAgentScanned(true);
      setBadgeValue("8820");
    }
  };

  useEffect(() => {
    onValidated?.(canStartSterilization);
  }, [canStartSterilization, onValidated]);

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 font-app animate-in fade-in duration-500">
      
      {/* 1. INTERFACE HEADER */}
      <header className="bg-white rounded-[1.5rem] py-3 px-5 shadow-sm border border-[#d5e2ea] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eafaf7] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#0b786e] border border-[#bdece4]">
            <Settings className="w-2.5 h-2.5" /> Mandatory Safety Qualification
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#0b4867] uppercase">
            Daily Sterilizer Qualification <span className="text-[#1378ac] text-lg">(Bowie-Dick Test)</span>
          </h1>
        </div>

        <div className="flex gap-3">
          <div className="bg-[#f8fbfd] px-3 py-2 rounded-xl border border-[#d5e2ea] flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#0b4867] flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sterilizer ID</p>
              <p className="text-xs font-black text-[#0b4867]">UNIT-STERI-02</p>
            </div>
          </div>
          <div className="bg-[#f8fbfd] px-3 py-2 rounded-xl border border-[#d5e2ea] flex items-center gap-2.5 min-w-[150px]">
            <Clock className="w-4 h-4 text-[#1378ac]" />
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">System Time</p>
              <p className="text-xs font-black text-[#0b4867] tabular-nums">
                {currentTime.toLocaleDateString('fr-FR')} {currentTime.toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* WORKFLOW GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        
        {/* STEP 1: IMAGE CAPTURE (7 cols) */}
        <section className={`lg:col-span-7 bg-white rounded-3xl p-4 shadow-sm border-2 transition-all duration-500 flex flex-col ${
          step1State === 'completed' ? 'border-[#11b5a2]' : 'border-[#d5e2ea]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1378ac] text-white text-[10px] font-black shadow-lg">01</span>
              <div>
                <h2 className="text-sm font-black tracking-tight text-[#0b4867] uppercase">Scan Test Sheet</h2>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Computer Vision Alignment Required</p>
              </div>
            </div>
            {step1State === 'completed' && (
              <div className="bg-[#eafaf7] text-[#11b5a2] px-2 py-1 rounded-lg text-[8px] font-black uppercase border border-[#bdece4] flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Captured
              </div>
            )}
          </div>

          <div className="flex-1 rounded-2xl bg-slate-900 border-2 border-[#0b4867]/20 overflow-hidden relative group">
            {/* Simulation of Camera Feed */}
            {step1State === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-2">
                <div className="h-12 w-12 rounded-full border-2 border-white/10 flex items-center justify-center animate-pulse">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-[8px] font-black uppercase tracking-[0.4em]">Live Camera Feed Ready</p>
              </div>
            )}

            {step1State === "processing" && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-white gap-3">
                <Loader2 className="w-10 h-10 text-[#11b5a2] animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-black uppercase tracking-[0.3em] animate-pulse">AI Processing...</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Analyzing color uniformity gradients</p>
                </div>
              </div>
            )}

            {step1State === "completed" && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 overflow-hidden">
                {/* Simulated test sheet result */}
                <div className={`w-32 h-32 rounded-lg border-2 transition-all flex items-center justify-center ${
                  testResult === 'CONFORM' ? 'bg-[#3b3a30] border-[#11b5a2] rotate-2 shadow-2xl' : 'bg-[#a39e8d] border-[#d6455d] -rotate-1 shadow-xl'
                }`}>
                   <div className="grid grid-cols-4 grid-rows-4 gap-0.5 w-full h-full p-1 opacity-40">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`rounded-px ${testResult === 'CONFORM' ? 'bg-black' : (i % 3 === 0 ? 'bg-slate-400' : 'bg-black')}`} />
                      ))}
                   </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* AI Result Overlay */}
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 border transition-all animate-in slide-in-from-bottom-2 ${
                  testResult === 'CONFORM' ? 'bg-[#eafaf7] border-[#11b5a2] text-[#0b786e]' : 'bg-[#fdecef] border-[#d6455d] text-[#d6455d]'
                }`}>
                  {testResult === 'CONFORM' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span className="font-black text-[10px] uppercase tracking-wider">
                    AI Analysis: {testResult === 'CONFORM' ? 'UNIFORM COLOR DETECTED' : 'NON-UNIFORM CHANGE'}
                  </span>
                </div>
              </div>
            )}

            {/* Viewfinder Overlay */}
            <div className="absolute inset-4 border border-white/10 rounded-xl pointer-events-none">
              <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-[#11b5a2]" />
              <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-[#11b5a2]" />
              <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-[#11b5a2]" />
              <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-[#11b5a2]" />
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <button 
              onClick={handleCaptureImage}
              disabled={step1State !== "idle"}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-lg font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-lg active:scale-95 ${
                step1State === 'idle' 
                ? 'bg-[#0b4867] text-white hover:bg-[#1378ac] hover:-translate-y-0.5' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Camera className="w-4 h-4" />
              CAPTURE TEST IMAGE
            </button>
          </div>
        </section>

        {/* STEPS 2 & 3 (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
          
          {/* STEP 2: REVIEW AND LOG */}
          <section className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all duration-500 ${
            step1State === 'completed' ? 'border-[#1378ac]' : 'border-[#d5e2ea] opacity-60 grayscale'
          }`}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1378ac] text-white text-[10px] font-black shadow-lg">02</span>
              <h2 className="text-sm font-black tracking-tight text-[#0b4867] uppercase">Review and Log</h2>
            </div>

            <div className="space-y-2.5">
              {/* Thumbnail and Status */}
              <div className="flex items-center gap-3 p-2.5 bg-[#f8fbfd] rounded-xl border border-[#d5e2ea]">
                <div className="h-12 w-12 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                  {step1State === 'completed' ? (
                    <div className={`w-full h-full ${testResult === 'CONFORM' ? 'bg-[#3b3a30]' : 'bg-[#a39e8d]'}`} />
                  ) : (
                    <Camera className="w-4 h-4 text-slate-400 opacity-30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Test Status</p>
                  <div className={`inline-flex items-center gap-1 font-black text-[10px] uppercase tracking-wider ${
                    testResult === 'CONFORM' ? 'text-[#0b786e]' : testResult === 'NON_CONFORM' ? 'text-[#d6455d]' : 'text-slate-400'
                  }`}>
                    {testResult === 'CONFORM' ? <CheckCircle2 className="w-3 h-3" /> : testResult === 'NON_CONFORM' ? <XCircle className="w-3 h-3" /> : null}
                    {testResult ? (testResult === 'CONFORM' ? 'CONFORM' : 'NON-CONFORM') : 'WAITING...'}
                  </div>
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-[#f8fbfd] rounded-lg border border-[#d5e2ea]">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" /> Date
                  </p>
                  <p className="text-[11px] font-black text-[#0b4867]">{capturedMeta?.date || '--/--/--'}</p>
                </div>
                <div className="p-2.5 bg-[#f8fbfd] rounded-lg border border-[#d5e2ea]">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> Time
                  </p>
                  <p className="text-[11px] font-black text-[#0b4867]">{capturedMeta?.time || '--:--:--'}</p>
                </div>
              </div>

              {testResult === 'NON_CONFORM' && (
                <div className="p-2 bg-[#fdecef] rounded-lg border border-[#f8d7da] flex items-center gap-2 text-[#d6455d]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-[9px] font-bold leading-tight uppercase tracking-wide">
                    Safety alert: Non-conform result. Maintenance required.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* STEP 3: RESPONSIBLE AGENT VERIFICATION */}
          <section className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all duration-500 ${
            agentScanned ? 'border-[#11b5a2]' : (step1State === 'completed' && testResult === 'CONFORM') ? 'border-[#1378ac]' : 'border-[#d5e2ea] opacity-60 grayscale'
          }`}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0b4867] text-white text-[10px] font-black shadow-lg">03</span>
              <h2 className="text-sm font-black tracking-tight text-[#0b4867] uppercase">Signature</h2>
            </div>

            <div className="space-y-2.5">
              {!agentScanned ? (
                <form onSubmit={handleBadgeScan} className="space-y-2.5">
                  <div className="flex flex-col items-center gap-3 p-4 bg-[#f8fbfd] rounded-xl border-2 border-dashed border-[#d5e2ea] group hover:border-[#1378ac] transition-all">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-[#1378ac] shadow-lg border border-slate-100 group-hover:scale-110 transition-transform">
                      <Fingerprint className="w-6 h-6" />
                    </div>
                    <div className="w-full space-y-1.5">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Scan Badge...</p>
                      <input 
                        ref={badgeInputRef}
                        type="password"
                        value={badgeValue}
                        onChange={(e) => setBadgeValue(e.target.value)}
                        disabled={step1State !== 'completed' || testResult !== 'CONFORM'}
                        placeholder="••••••••"
                        className="w-full bg-white border-2 border-[#d5e2ea] rounded-lg py-2 px-3 text-center text-base font-black tracking-[0.8em] text-[#0b4867] focus:outline-none focus:border-[#1378ac] transition-all disabled:opacity-30"
                      />
                    </div>
                  </div>
                  <button type="submit" className="hidden">Submit</button>
                </form>
              ) : (
                <div className="animate-in zoom-in duration-500 bg-[#0b4867] rounded-xl p-3 text-white flex items-center gap-3 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[#1378ac]/10 group-hover:bg-transparent transition-colors" />
                  <div className="h-12 w-12 rounded-full bg-[#1378ac] flex items-center justify-center text-xl border-2 border-white/10 shadow-inner relative z-10 animate-in slide-in-from-left-4">👩‍🔬</div>
                  <div className="relative z-10 flex-1 min-w-0">
                    <p className="text-[7px] font-black uppercase tracking-[0.25em] text-[#8de7da] leading-none mb-0.5">Validated by</p>
                    <p className="text-sm font-black tracking-tighter uppercase italic truncate">Mme Amina Benali</p>
                    <p className="text-[8px] font-bold text-white/50 uppercase tracking-[0.2em]">Supervisor</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-[#11b5a2] absolute right-3 top-1/2 -translate-y-1/2 opacity-20" />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* SIMULATION BUTTON */}
      {step1State === "completed" && testResult === "CONFORM" && !agentScanned && (
        <button
          onClick={simulateBadgeScan}
          className="fixed bottom-32 right-10 flex items-center gap-3 rounded-full bg-[#0b4867] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-[#0a3952] hover:scale-105 active:scale-95 group z-[40]"
        >
          <span className="text-xl text-[#8de7da] animate-pulse">⌁</span>
          <span>Simuler Scan Badge</span>
        </button>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  AlertCircle,
  RotateCcw,
  UserMinus,
  Trash2
} from "lucide-react";
import BiologicalIndicatorValidation from "./BiologicalIndicatorValidation";

interface EquipmentQualificationProps {
  onValidated?: (isValid: boolean) => void;
}

export function EquipmentQualification({ onValidated }: EquipmentQualificationProps) {
  const navigate = useNavigate();
  // --- STATE MANAGEMENT ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTest, setActiveTest] = useState<"bowie-dick" | "leak" | "ez">("bowie-dick");
  
  // --- LEAK TEST (VACUUM TEST) DATA STRUCTURE ---
  const [leakTicketFile, setLeakTicketFile] = useState<File | null>(null);
  const [leakTicketPreview, setLeakTicketPreview] = useState<string | null>(null);
  
  const [step1State, setStep1State] = useState<"idle" | "processing" | "completed">("idle");
  const [isManualConfirmed, setIsManualConfirmed] = useState(false);
  const [capturedMeta, setCapturedMeta] = useState<{ date: string; time: string; sterilizerId: string } | null>(null);
  const [agentScanned, setAgentScanned] = useState(false);
  const [badgeValue, setBadgeValue] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const [autoclaveId, setAutoclaveId] = useState<string>("UNIT-STERI-02");
  const [leakTestStatus, setLeakTestStatus] = useState<"pending" | "valid">("pending");
  
  // --- TEST EZ STATE ---
  const [ezValue, setEzValue] = useState<string>("");
  const [ezTestStatus, setEzTestStatus] = useState<"pending" | "valid">("pending");
  
  const badgeInputRef = useRef<HTMLInputElement>(null);
  const leakTicketInputRef = useRef<HTMLInputElement>(null);

  // --- LOGGING SIMULATION ---
  const logQualification = (type: string, value: string, status: string) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      operatorId: agentScanned ? "AGENT-BENALI-01" : "VISITEUR", // Maps to requested agent_id in logs
      autoclaveId: autoclaveId,
      testType: type,
      value: value,
      status: status,
    };
    console.log("Saving to traceability_logs table:", logEntry);
    // Persist for other modules
    if (status === "critical") {
      localStorage.setItem('machine_critical_error', 'true');
    } else {
      localStorage.removeItem('machine_critical_error');
    }
    localStorage.setItem('autoclave_status', status === "valid" ? "Qualified" : (status === "critical" ? "Critical" : "Pending Tests"));
  };

  const handleLeakTicketUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (leakTicketPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(leakTicketPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setLeakTicketFile(file);
    setLeakTicketPreview(previewUrl);
    setLeakTestStatus("valid");
    logQualification("Leak Ticket Capture", file.name, "valid");
  };

  // --- DYNAMIC CLOCK ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- AUTO-FOCUS BADGE INPUT ---
  useEffect(() => {
    if (step1State === "completed" && isManualConfirmed && !agentScanned) {
      badgeInputRef.current?.focus();
    }
  }, [step1State, isManualConfirmed, agentScanned]);

  // --- RESET LOGIC ---
  const handleRetakePhoto = () => {
    setStep1State("idle");
    setCapturedMeta(null);
    setIsManualConfirmed(false);
  };

  const handleLeakTicketRetake = () => {
    if (leakTicketPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(leakTicketPreview);
    }
    setLeakTicketFile(null);
    setLeakTicketPreview(null);
    setLeakTestStatus("pending");
    setAgentScanned(false);
    setBadgeValue("");
    if (leakTicketInputRef.current) {
      leakTicketInputRef.current.value = "";
    }
  };

  const handleChangeUser = () => {
    setAgentScanned(false);
    setBadgeValue("");
  };

  const handleGlobalReset = () => {
    setStep1State("idle");
    setCapturedMeta(null);
    setIsManualConfirmed(false);
    setAgentScanned(false);
    setBadgeValue("");
    if (leakTicketPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(leakTicketPreview);
    }
    setLeakTicketFile(null);
    setLeakTicketPreview(null);
    setLeakTestStatus("pending");
    setEzValue("");
    setEzTestStatus("pending");
    localStorage.removeItem('machine_critical_error');
    localStorage.setItem('autoclave_status', 'Pending Tests');
    setShowResetConfirm(false);
  };

  // --- SIMULATION HANDLERS ---
  const handleCaptureImage = () => {
    setStep1State("processing");
    
    // Simulate capture delay (not AI analysis)
    setTimeout(() => {
      const now = new Date();
      setCapturedMeta({
        date: now.toLocaleDateString('fr-FR'),
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        sterilizerId: "UNIT-STERI-02"
      });
      
      setStep1State("completed");
    }, 1500);
  };

  const handleBadgeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const leakTicketReady = leakTicketFile !== null;
    if (badgeValue.length > 3 && (isManualConfirmed || (activeTest === "leak" && leakTicketReady) || activeTest === "ez")) {
      setAgentScanned(true);
    }
  };

  const canApprove = 
    step1State === "completed" && 
    isManualConfirmed && 
    agentScanned &&
    leakTicketFile !== null &&
    leakTestStatus === "valid" &&
    ezTestStatus === "valid";

  const simulateBadgeScan = () => {
    setAgentScanned(true);
    setBadgeValue("8820");
  };

  const simulateLeakSuccess = () => {
    setLeakTicketFile(new File(["demo-ticket"], "ticket-etancheite.jpg", { type: "image/jpeg" }));
    setLeakTicketPreview("/images/bowie-dick/captured.png");
    setLeakTestStatus("valid");
    setAgentScanned(true);
  };

  const simulateLeakFailure = () => {
    handleLeakTicketRetake();
  };

  useEffect(() => {
    onValidated?.(canApprove);
  }, [canApprove, onValidated]);

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 font-app animate-in fade-in duration-500">
      
      {/* 1. INTERFACE HEADER */}
      <header className="bg-white rounded-[1.5rem] py-3 px-5 shadow-sm border border-[#d5e2ea] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eafaf7] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#0b786e] border border-[#bdece4]">
            <Settings className="w-2.5 h-2.5" /> Qualification de Sécurité Obligatoire
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#0b4867] uppercase">
            Qualification Quotidienne du Stérilisateur <span className="text-[#1378ac] text-lg">(Tests de Performance)</span>
          </h1>
        </div>

        <div className="flex gap-3">
          <div className="bg-[#f8fbfd] px-3 py-2 rounded-xl border border-[#d5e2ea] flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#0b4867] flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ID Stérilisateur</p>
              <p className="text-xs font-black text-[#0b4867]">UNIT-STERI-02</p>
            </div>
          </div>
          <div className="bg-[#f8fbfd] px-3 py-2 rounded-xl border border-[#d5e2ea] flex items-center gap-2.5 min-w-[150px]">
            <Clock className="w-4 h-4 text-[#1378ac]" />
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Heure Système</p>
              <p className="text-xs font-black text-[#0b4867] tabular-nums">
                {currentTime.toLocaleDateString('fr-FR')} {currentTime.toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. TOP TEST NAVIGATION (Structure from Image) */}
      <div className="bg-white rounded-2xl p-4 border border-[#d5e2ea] shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTest("bowie-dick")}
            className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all border-2 flex items-center justify-center gap-3 ${
              activeTest === "bowie-dick" 
              ? 'bg-[#1378ac] border-[#1378ac] text-white shadow-lg shadow-[#1378ac]/20' 
              : (step1State === 'completed' && isManualConfirmed && agentScanned) 
                ? 'bg-[#edf5f9] border-[#1378ac] text-[#1378ac]' 
                : 'bg-[#f8fbfd] border-[#d5e2ea] text-slate-400 hover:border-[#1378ac]/30'
            }`}
          >
            { (step1State === 'completed' && isManualConfirmed && agentScanned) && <CheckCircle2 className="w-4 h-4" /> }
            Bowie-dick
          </button>
          
          <div className="h-0.5 w-8 bg-slate-200" />
          
          <button 
            onClick={() => setActiveTest("leak")}
            className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all border-2 flex items-center justify-center gap-3 ${
              activeTest === "leak" 
              ? 'bg-[#1378ac] border-[#1378ac] text-white shadow-lg shadow-[#1378ac]/20' 
              : leakTestStatus === 'valid'
                ? 'bg-[#edf5f9] border-[#1378ac] text-[#1378ac]'
                : 'bg-[#f8fbfd] border-[#d5e2ea] text-slate-400 hover:border-[#1378ac]/30'
            }`}
          >
            { leakTestStatus === 'valid' && <CheckCircle2 className="w-4 h-4" /> }
            Etanchéité
          </button>
          
          <div className="h-0.5 w-8 bg-slate-200" />
          
          <button 
            onClick={() => setActiveTest("ez")}
            className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all border-2 flex items-center justify-center gap-3 ${
              activeTest === "ez" 
              ? 'bg-[#1378ac] border-[#1378ac] text-white shadow-lg shadow-[#1378ac]/20' 
              : ezTestStatus === 'valid'
                ? 'bg-[#edf5f9] border-[#1378ac] text-[#1378ac]'
                : 'bg-[#f8fbfd] border-[#d5e2ea] text-slate-400 hover:border-[#1378ac]/30'
            }`}
          >
            { ezTestStatus === 'valid' && <CheckCircle2 className="w-4 h-4" /> }
            Indicateurs Biologiques (IB)
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA (Selected Test) */}
      <div className="flex-1 bg-white rounded-[2rem] border border-[#d5e2ea] shadow-sm flex flex-col overflow-hidden relative min-h-0">
        
        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 p-8 overflow-hidden">
          
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {activeTest === "bowie-dick" && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 gap-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-black text-[#0b4867] uppercase tracking-tight">Test Bowie-Dick</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Poste Qualification</span>
                    <div className="h-1.5 w-10 bg-[#1378ac] rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                  {/* Left Column: Evidence */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className={`flex-1 bg-[#f8fbfd] rounded-2xl p-6 border-2 flex flex-col transition-all duration-500 ${
                      step1State === 'completed' ? 'border-[#11b5a2]' : 'border-dashed border-[#d5e2ea]'
                    }`}>
                      <div className="flex items-center justify-between mb-6 shrink-0">
                        <p className="text-[10px] font-black uppercase text-[#0b4867] tracking-wider flex items-center gap-2">
                          <Camera className="w-4 h-4 text-[#1378ac]" /> Capture de la feuille de test
                        </p>
                        {step1State === 'completed' && <span className="bg-[#eafaf7] text-[#11b5a2] px-3 py-1 rounded-full text-[8px] font-black uppercase border border-[#11b5a2]/20">Image Capturée</span>}
                      </div>

                      <div className="flex-1 rounded-2xl bg-white border-2 border-[#d5e2ea]/30 overflow-hidden relative group min-h-[300px]">
                        {step1State === "idle" && (
                          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white/40 gap-2">
                            <Camera className="w-8 h-8 animate-pulse" />
                            <p className="text-[8px] font-black uppercase tracking-[0.4em]">Prêt pour la capture</p>
                          </div>
                        )}
                        {step1State === "processing" && (
                          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-white gap-3">
                            <Loader2 className="w-10 h-10 text-[#1378ac] animate-spin" />
                            <p className="text-sm font-black uppercase tracking-[0.3em] animate-pulse">Analyse en cours...</p>
                          </div>
                        )}
                        {step1State === "completed" && (
                          <div className="absolute inset-0 flex flex-row p-4 gap-4 animate-in fade-in duration-700">
                            <div className="flex-1 bg-white rounded-xl border flex items-center justify-center overflow-hidden relative group">
                              <img src="/images/bowie-dick/captured.png" alt="Captured" className="w-full h-full object-contain" />
                              <button onClick={handleRetakePhoto} className="absolute top-2 right-2 p-2 bg-white/90 rounded-lg hover:bg-white text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex-1 bg-[#edf5f9]/50 rounded-xl border border-[#1378ac]/20 flex items-center justify-center overflow-hidden">
                              <img src="/images/bowie-dick/reference.png" alt="Reference" className="w-full h-full object-contain" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 flex justify-center">
                        <button 
                          onClick={handleCaptureImage}
                          disabled={step1State !== "idle"}
                          className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl ${
                            step1State === 'idle' ? 'bg-[#1378ac] text-white hover:bg-[#0f6a98] hover:-translate-y-0.5 active:scale-95' : 'bg-slate-100 text-slate-300'
                          }`}
                        >
                          <Camera className="w-5 h-5" /> CAPTURER L&apos;IMAGE
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Validation & Signature */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className={`bg-white rounded-2xl p-6 border-2 transition-all duration-500 ${
                      isManualConfirmed ? 'border-[#11b5a2]' : (step1State === 'completed' ? 'border-[#1378ac]' : 'border-[#d5e2ea] opacity-60')
                    }`}>
                      <h3 className="text-xs font-black text-[#0b4867] uppercase mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#11b5a2]" /> Validation Manuelle
                      </h3>
                      <div 
                        onClick={() => step1State === 'completed' && setIsManualConfirmed(!isManualConfirmed)}
                        className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer ${
                        isManualConfirmed ? 'bg-[#eafaf7] border-[#11b5a2]' : 'bg-[#f8fbfd] border-[#d5e2ea] hover:border-[#1378ac]/30'
                      }`}>
                        <div className={`shrink-0 h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isManualConfirmed ? 'bg-[#11b5a2] border-[#11b5a2]' : 'bg-white border-[#d5e2ea]'
                        }`}>
                          {isManualConfirmed && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <p className={`text-[11px] font-black uppercase leading-tight ${isManualConfirmed ? 'text-[#0b786e]' : 'text-[#0b4867]'}`}>
                          Je confirme que le changement de couleur est uniforme et conforme
                        </p>
                      </div>
                    </div>

                    <div className={`bg-white rounded-2xl p-6 border-2 transition-all duration-500 ${
                      agentScanned ? 'border-[#11b5a2]' : (isManualConfirmed ? 'border-[#1378ac]' : 'border-[#d5e2ea] opacity-60')
                    }`}>
                      <h3 className="text-xs font-black text-[#0b4867] uppercase mb-6 flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-[#1378ac]" /> Signature Superviseur
                      </h3>
                      {!agentScanned ? (
                        <div className="p-8 bg-[#f8fbfd] rounded-2xl border-2 border-dashed border-[#d5e2ea] flex flex-col items-center gap-6">
                          <Fingerprint className="w-10 h-10 text-slate-300" />
                          <form onSubmit={handleBadgeScan} className="w-full">
                            <input 
                              ref={badgeInputRef}
                              type="password"
                              value={badgeValue}
                              onChange={(e) => setBadgeValue(e.target.value)}
                              disabled={!isManualConfirmed}
                              placeholder="SCAN BADGE"
                              className="w-full bg-white border-2 border-[#d5e2ea] rounded-xl py-4 px-4 text-center text-sm font-black tracking-[0.4em] focus:border-[#1378ac] outline-none transition-all shadow-inner"
                            />
                          </form>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center">Scan requis pour validation finale</p>
                        </div>
                      ) : (
                        <div className="bg-[#0b4867] rounded-2xl p-6 text-white flex flex-col gap-6 shadow-xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 bg-white/5 rounded-bl-[2rem]">
                            <ShieldCheck className="w-6 h-6 text-[#11b5a2]" />
                          </div>
                          <div className="flex items-center gap-5">
                            <div className="h-20 w-20 rounded-2xl bg-[#1378ac] flex items-center justify-center text-3xl shadow-inner border-2 border-white/10 overflow-hidden">
                              <span className="group-hover:scale-110 transition-transform duration-500">👩‍🔬</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-black truncate uppercase tracking-tight leading-none mb-1.5">Mme Amina Benali</p>
                              <p className="text-[10px] font-bold text-[#8de7da] uppercase tracking-[0.3em] opacity-80">Superviseur Qualité</p>
                            </div>
                          </div>
                          <button onClick={handleChangeUser} className="py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[9px] font-black uppercase tracking-widest transition-all">
                            Changer d&apos;agent
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTest === "leak" && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 gap-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-black text-[#0b4867] uppercase tracking-tight">Test d&apos;Étanchéité (Vide)</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Poste Maintenance</span>
                    <div className="h-1.5 w-10 bg-[#1378ac] rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                  {/* Left Column: Leak Ticket Capture */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className={`flex-1 bg-[#f8fbfd] rounded-2xl p-6 border-2 transition-all duration-500 ${
                      leakTicketFile ? 'border-[#11b5a2]' : 'border-dashed border-[#d5e2ea]'
                    }`}>
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] font-black uppercase text-[#0b4867] tracking-wider flex items-center gap-2">
                          <Camera className="w-4 h-4 text-[#1378ac]" /> Capture Ticket Étanchéité
                        </p>
                        {leakTicketFile && <span className="bg-[#eafaf7] text-[#11b5a2] px-3 py-1 rounded-full text-[8px] font-black uppercase border border-[#11b5a2]/20">Ticket Capturé</span>}
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-[#d5e2ea] shadow-sm relative overflow-hidden">
                        <input
                          ref={leakTicketInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleLeakTicketUpload}
                          className="hidden"
                        />

                        {!leakTicketPreview ? (
                          <button
                            onClick={() => leakTicketInputRef.current?.click()}
                            className="w-full min-h-[320px] rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-[#1378ac] hover:text-[#1378ac] transition-all"
                          >
                            <Camera className="w-12 h-12" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Capture Ticket Étanchéité</p>
                          </button>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-full min-h-[320px] rounded-2xl border-2 border-[#11b5a2]/20 bg-[#f8fbfd] overflow-hidden flex items-center justify-center">
                              <img src={leakTicketPreview} alt="Ticket d'étanchéité capturé" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => leakTicketInputRef.current?.click()}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-[#1378ac] text-white hover:bg-[#0f6a98] transition-all"
                              >
                                <Camera className="w-4 h-4" />
                                Reprendre
                              </button>
                              <button
                                onClick={handleLeakTicketRetake}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-white border border-[#d5e2ea] text-slate-500 hover:text-red-500 hover:border-red-200 transition-all"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Retake
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Signature */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className={`bg-white rounded-2xl p-6 border-2 transition-all duration-500 ${
                      agentScanned ? 'border-[#11b5a2]' : (leakTestStatus === 'valid' ? 'border-[#1378ac]' : 'border-[#d5e2ea] opacity-60')
                    }`}>
                      <h3 className="text-xs font-black text-[#0b4867] uppercase mb-6 flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-[#1378ac]" /> Signature Agent
                      </h3>
                      {!agentScanned ? (
                        <div className="p-8 bg-[#f8fbfd] rounded-2xl border-2 border-dashed border-[#d5e2ea] flex flex-col items-center gap-6">
                          <Fingerprint className="w-10 h-10 text-slate-300" />
                          <form onSubmit={handleBadgeScan} className="w-full">
                            <input 
                              type="password"
                              value={badgeValue}
                              onChange={(e) => setBadgeValue(e.target.value)}
                              disabled={!leakTicketFile}
                              placeholder="SCAN BADGE"
                              className="w-full bg-white border-2 border-[#d5e2ea] rounded-xl py-4 px-4 text-center text-sm font-black tracking-[0.4em] focus:border-[#1378ac] outline-none transition-all shadow-inner"
                            />
                          </form>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center">Scan requis pour validation maintenance</p>
                        </div>
                      ) : (
                        <div className="bg-[#0b4867] rounded-2xl p-6 text-white flex flex-col gap-6 shadow-xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 bg-white/5 rounded-bl-[2rem]">
                            <ShieldCheck className="w-6 h-6 text-[#11b5a2]" />
                          </div>
                          <div className="flex items-center gap-5">
                            <div className="h-20 w-20 rounded-2xl bg-[#1378ac] flex items-center justify-center text-3xl shadow-inner border-2 border-white/10 overflow-hidden">
                              <img src="https://i.pravatar.cc/150?u=salma" alt="Salma KOUNKA" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-black truncate uppercase tracking-tight leading-none mb-1.5">Salma KOUNKA</p>
                              <p className="text-[10px] font-bold text-[#8de7da] uppercase tracking-[0.3em] opacity-80">Biomedical Engineer</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={handleChangeUser} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[9px] font-black uppercase tracking-widest transition-all">
                              Changer d&apos;agent
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3">
                      <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200 pb-2 mb-1">Résumé Audit</h4>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-400 uppercase">Autoclave</span>
                        <span className="text-[#0b4867] font-black">{autoclaveId}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-400 uppercase">Ticket</span>
                        <span className="text-[#0b4867] font-black">{leakTicketFile ? leakTicketFile.name : "Non capturé"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTest === "ez" && (
              <BiologicalIndicatorValidation 
                operatorId={agentScanned ? "AGENT-BENALI-01" : "VISITEUR"}
                agentScanned={agentScanned}
                onBadgeScan={simulateBadgeScan}
                onResetUser={handleChangeUser}
                onValidated={(status) => {
                  if (status === "valid") {
                    setEzTestStatus("valid");
                    setEzValue("NEGATIF");
                    logQualification("Biological Test", "VIOLET - NEGATIF", "valid");
                  } else {
                    setEzTestStatus("pending"); 
                    setEzValue("POSITIF");
                    logQualification("Biological Test", "JAUNE - POSITIF", "critical");
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 4. ACTION FOOTER */}
      <footer className="mt-2 flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#d5e2ea] shadow-lg">
        <div className="flex items-center gap-6 text-slate-400">
          <div className="flex items-center gap-8 px-6 border-r border-slate-200">
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTest === 'bowie-dick' ? 'text-[#11b5a2]' : 'text-slate-300'}`}>
              <div className={`h-2 w-2 rounded-full ${activeTest === 'bowie-dick' ? 'bg-[#11b5a2]' : 'bg-slate-200'}`} />
              Bowie-Dick
            </div>
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTest === 'leak' ? 'text-[#1378ac]' : 'text-slate-300'}`}>
              <div className={`h-2 w-2 rounded-full ${activeTest === 'leak' ? 'bg-[#1378ac]' : 'bg-slate-200'}`} />
              Étanchéité
            </div>
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTest === 'ez' ? 'text-[#0b4867]' : 'text-slate-300'}`}>
              <div className={`h-2 w-2 rounded-full ${activeTest === 'ez' ? 'bg-[#0b4867]' : 'bg-slate-200'}`} />
              Test IB
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setShowResetConfirm(true)} className="px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-100 transition-all active:scale-95">
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            disabled={!canApprove}
            onClick={() => {
              onValidated?.(true);
              navigate("/predesinfection");
            }}
            className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl ${
              canApprove 
              ? 'bg-[#11b5a2] text-white hover:bg-[#0fa391] hover:-translate-y-0.5 active:scale-95 shadow-[#11b5a2]/20' 
              : 'bg-slate-50 text-slate-200 cursor-not-allowed border border-slate-100'
            }`}
          >
            <ShieldCheck className="w-5 h-5" /> VALIDATION GLOBALE
          </button>
        </div>
      </footer>

      {/* MODALS & SIMULATIONS */}
      {/* FLOATING SIMULATION TOOLBOX (For Prototype/Demo Only) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[100] items-end">
        {/* Toggle Panel Button */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-2 shadow-2xl border border-[#d5e2ea] flex flex-col gap-2">
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-1">Demo Toolbox</p>
          
          {activeTest === "bowie-dick" && !agentScanned && (
            <button 
              onClick={simulateBadgeScan} 
              className="flex items-center gap-3 rounded-2xl bg-[#1378ac] px-4 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95 group border-2 border-white/10"
            >
              <Fingerprint className="w-3.5 h-3.5 text-[#8de7da]" /> Signer (Badge)
            </button>
          )}

          {activeTest === "leak" && (
            <>
              <button 
                onClick={() => {
                  simulateLeakSuccess();
                }} 
                className="flex items-center gap-3 rounded-2xl bg-[#11b5a2] px-4 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95 group border-2 border-white/10"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Simulation Succès
              </button>
              <button 
                onClick={() => {
                  simulateLeakFailure();
                }} 
                className="flex items-center gap-3 rounded-2xl bg-red-500 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95 group border-2 border-white/10"
              >
                <AlertCircle className="w-3.5 h-3.5" /> Simulation Échec
              </button>
            </>
          )}

          {activeTest === "ez" && (
            <>
              <button 
                onClick={() => {
                  setEzTestStatus("valid");
                  setEzValue("NEGATIF");
                }} 
                className="flex items-center gap-3 rounded-2xl bg-[#7F00FF] px-4 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95 group border-2 border-white/10"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Simulation VIOLET
              </button>
              <button 
                onClick={() => {
                  setEzTestStatus("pending");
                  setEzValue("POSITIF");
                  localStorage.setItem('machine_critical_error', 'true');
                  localStorage.setItem('sterilization_cycle_status', 'RECALLED');
                }} 
                className="flex items-center gap-3 rounded-2xl bg-[#FFD700] px-4 py-3 text-[9px] font-black uppercase tracking-widest text-[#0b4867] shadow-lg transition-all hover:scale-105 active:scale-95 group border-2 border-white/10"
              >
                <AlertCircle className="w-3.5 h-3.5" /> Simulation JAUNE
              </button>
            </>
          )}

          <button 
            onClick={handleGlobalReset} 
            className="flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all border border-slate-200"
          >
            <RotateCcw className="w-3 h-3 mr-2" /> Reset All
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="h-20 w-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mb-8 mx-auto shadow-inner">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center uppercase tracking-tighter mb-4">Réinitialiser ?</h3>
            <p className="text-sm font-bold text-slate-400 text-center leading-relaxed mb-10">Toutes les données de qualification en cours seront effacées.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowResetConfirm(false)} className="py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all">ANNULER</button>
              <button onClick={handleGlobalReset} className="py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all">CONFIRMER</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

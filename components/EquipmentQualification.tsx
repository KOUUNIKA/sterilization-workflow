"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  Settings,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import BiologicalIndicatorValidation from "./BiologicalIndicatorValidation";
import { useFooterActions } from "@/contexts/FooterActionsContext";

function StepNode({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`size-2.5 rounded-full border-2 transition-colors ${
        done ? "bg-primary border-primary" : active ? "border-primary bg-card" : "border-border bg-card"
      }`} />
      <span className={`text-[9px] font-medium uppercase tracking-wide whitespace-nowrap ${
        done || active ? "text-primary" : "text-muted-foreground"
      }`}>{label}</span>
    </div>
  );
}

interface EquipmentQualificationProps {
  onValidated?: (isValid: boolean) => void;
}

export function EquipmentQualification({ onValidated }: EquipmentQualificationProps) {
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTest, setActiveTest] = useState<"bowie-dick" | "leak" | "ez">("bowie-dick");
  const [alreadyQualified, setAlreadyQualified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [leakTicketFile, setLeakTicketFile] = useState<File | null>(null);
  const [leakTicketPreview, setLeakTicketPreview] = useState<string | null>(null);
  const [step1State, setStep1State] = useState<"idle" | "processing" | "completed">("idle");
  const [isManualConfirmed, setIsManualConfirmed] = useState(false);
  const [capturedMeta, setCapturedMeta] = useState<{ date: string; time: string; sterilizerId: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const autoclaveId = "AUTOCLAVE-02";
  const [leakTestStatus, setLeakTestStatus] = useState<"pending" | "valid">("pending");
  const [ezValue, setEzValue] = useState<string>("");
  const [ezTestStatus, setEzTestStatus] = useState<"pending" | "valid">("pending");


  const leakTicketInputRef = useRef<HTMLInputElement>(null);

  const logQualification = (type: string, value: string, status: string) => {
    if (status === "critical") {
      localStorage.setItem("machine_critical_error", "true");
    } else {
      localStorage.removeItem("machine_critical_error");
    }
    localStorage.setItem(
      "autoclave_status",
      status === "valid" ? "Qualified" : status === "critical" ? "Critical" : "Pending Tests"
    );
  };

  const handleLeakTicketUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (leakTicketPreview?.startsWith("blob:")) URL.revokeObjectURL(leakTicketPreview);
    setLeakTicketFile(file);
    setLeakTicketPreview(URL.createObjectURL(file));
    setLeakTestStatus("valid");
    logQualification("Leak Ticket Capture", file.name, "valid");
  };

  useEffect(() => {
    fetch(`/api/qualification/today?machineId=${autoclaveId}`)
      .then((r) => r.json())
      .then((data) => { if (data.qualified) setAlreadyQualified(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const handleRetakePhoto = () => {
    setStep1State("idle");
    setCapturedMeta(null);
    setIsManualConfirmed(false);
  };

  const handleLeakTicketRetake = () => {
    if (leakTicketPreview?.startsWith("blob:")) URL.revokeObjectURL(leakTicketPreview);
    setLeakTicketFile(null);
    setLeakTicketPreview(null);
    setLeakTestStatus("pending");
    if (leakTicketInputRef.current) leakTicketInputRef.current.value = "";
  };

  const handleGlobalReset = () => {
    setStep1State("idle");
    setCapturedMeta(null);
    setIsManualConfirmed(false);
    if (leakTicketPreview?.startsWith("blob:")) URL.revokeObjectURL(leakTicketPreview);
    setLeakTicketFile(null);
    setLeakTicketPreview(null);
    setLeakTestStatus("pending");
    setEzValue("");
    setEzTestStatus("pending");
    localStorage.removeItem("machine_critical_error");
    localStorage.setItem("autoclave_status", "Pending Tests");
    setShowResetConfirm(false);
  };

  const handleCaptureImage = () => {
    setStep1State("processing");
    setTimeout(() => {
      const now = new Date();
      setCapturedMeta({
        date: now.toLocaleDateString("fr-FR"),
        time: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        sterilizerId: "AUTOCLAVE-02",
      });
      setStep1State("completed");
    }, 1500);
  };

  const canApprove =
    step1State === "completed" &&
    isManualConfirmed &&
    leakTicketFile !== null &&
    leakTestStatus === "valid" &&
    ezTestStatus === "valid";

  const simulateLeakSuccess = () => {
    setLeakTicketFile(new File(["demo"], "ticket-etancheite.jpg", { type: "image/jpeg" }));
    setLeakTicketPreview("/images/bowie-dick/captured.png");
    setLeakTestStatus("valid");
  };
  const simulateLeakFailure = () => handleLeakTicketRetake();

  useEffect(() => { onValidated?.(canApprove); }, [canApprove, onValidated]);

  const handleValidate = async () => {
    setSaving(true);
    setSaveError(null);
    const res = await fetch("/api/qualification/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        machineId: autoclaveId,

        bowieDick: { captured: step1State === "completed", confirmed: isManualConfirmed },
        leakTest: { fileName: leakTicketFile?.name ?? "" },
        biological: { result: ezValue },
      }),
    });
    setSaving(false);
    if (!res.ok && res.status !== 409) {
      const data = await res.json().catch(() => ({}));
      setSaveError((data as { error?: string }).error ?? "Erreur lors de la sauvegarde.");
      return;
    }
    localStorage.setItem("autoclave_status", "Qualified");
    onValidated?.(true);
    navigate("/predesinfection");
  };

  const submitRef = useRef<() => Promise<void>>(async () => {});
  submitRef.current = handleValidate;
  const stableSubmit = useCallback(async () => { await submitRef.current(); }, []);
  const stableReset = useCallback(() => setShowResetConfirm(true), []);
  const { setOverride } = useFooterActions();

  useEffect(() => {
    setOverride({
      submitLabel: "Validation Globale",
      submittingLabel: "Enregistrement...",
      doneLabel: "Étape Suivante",
      onSubmit: stableSubmit,
      isReady: canApprove,
      isSubmitting: saving,
      isDone: false,
      onReset: stableReset,
      saveError,
    });
    return () => setOverride(null);
  }, [canApprove, saving, saveError, stableSubmit, stableReset, setOverride]);

  const signatureCardClass = (ready: boolean, done: boolean) =>
    `bg-card rounded-xl p-5 border-2 transition-all duration-300 ${
      done ? "border-secondary" : ready ? "border-primary" : "border-border opacity-60"
    }`;



  return (
    <div className="h-full flex flex-col gap-4 text-foreground animate-in fade-in duration-500">

      {/* Header */}
      <header className="bg-card rounded-xl py-3 px-5 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary-muted px-2.5 py-0.5 text-xs font-medium text-secondary border border-secondary/20">
            <Settings className="size-3" /> Qualification de Sécurité Obligatoire
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            Qualification Quotidienne — <span className="text-primary">Tests de Performance</span>
          </h1>
        </div>

        <div className="flex gap-3">
          <div className="bg-muted px-3 py-2 rounded-lg border border-border flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="size-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide leading-none mb-0.5">ID Stérilisateur</p>
              <p className="text-xs font-semibold text-foreground">AUTOCLAVE-02</p>
            </div>
          </div>
          <div className="bg-muted px-3 py-2 rounded-lg border border-border flex items-center gap-2.5 min-w-[150px]">
            <Clock className="size-4 text-primary" />
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide leading-none mb-0.5">Heure Système</p>
              <p className="text-xs font-semibold text-foreground tabular-nums">
                {currentTime.toLocaleDateString("fr-FR")} {currentTime.toLocaleTimeString("fr-FR")}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Already qualified banner */}
      {alreadyQualified && (
        <div className="flex items-center justify-between bg-secondary-muted border border-secondary/30 rounded-xl px-5 py-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-4 text-secondary shrink-0" />
            <div>
              <p className="text-sm font-medium text-secondary">Qualification journalière validée</p>
              <p className="text-xs text-secondary/70">Machine {autoclaveId} — déjà qualifiée aujourd&apos;hui</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/predesinfection")}
            className="interactive-secondary flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium"
          >
            <ShieldCheck className="size-4" /> Continuer le workflow
          </button>
        </div>
      )}

      {/* Step queue */}
      <div className="flex items-center shrink-0 px-1">
        <button onClick={() => setActiveTest("bowie-dick")} className="focus:outline-none">
          <StepNode label="Bowie-Dick" done={step1State === "completed" && isManualConfirmed} active={activeTest === "bowie-dick"} />
        </button>
        <div className={`flex-1 h-px transition-colors ${step1State === "completed" && isManualConfirmed ? "bg-primary" : "bg-border"}`} />
        <button onClick={() => setActiveTest("leak")} className="focus:outline-none">
          <StepNode label="Étanchéité" done={leakTestStatus === "valid"} active={activeTest === "leak"} />
        </button>
        <div className={`flex-1 h-px transition-colors ${leakTestStatus === "valid" ? "bg-primary" : "bg-border"}`} />
        <button onClick={() => setActiveTest("ez")} className="focus:outline-none">
          <StepNode label="Indicateurs Biologiques" done={ezTestStatus === "valid"} active={activeTest === "ez"} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-card rounded-xl border border-border flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-w-0 p-6 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">

            {/* Bowie-Dick */}
            {activeTest === "bowie-dick" && (
              <div className="flex flex-col h-full gap-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Test Bowie-Dick</h2>
                  <span className="text-xs text-muted-foreground">Poste Qualification</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
                  {/* Left: capture */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className={`flex-1 bg-muted rounded-xl p-5 border-2 flex flex-col transition-all duration-300 ${
                      step1State === "completed" ? "border-secondary" : "border-dashed border-border"
                    }`}>
                      <div className="flex items-center justify-between mb-4 shrink-0">
                        <p className="text-xs font-medium text-foreground flex items-center gap-2">
                          <Camera className="size-4 text-primary" /> Capture de la feuille de test
                        </p>
                        {step1State === "completed" && (
                          <span className="inline-flex items-center gap-1 bg-secondary-muted text-secondary border border-secondary/20 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            <CheckCircle2 className="size-3" /> Capturée
                          </span>
                        )}
                      </div>

                      <div className="flex-1 rounded-xl bg-card border border-border overflow-hidden relative min-h-[280px]">
                        {step1State === "idle" && (
                          <div className="absolute inset-0 bg-foreground/90 flex flex-col items-center justify-center text-primary-foreground/40 gap-2 rounded-xl">
                            <Camera className="size-8 animate-pulse" />
                            <p className="text-xs font-medium uppercase tracking-wider">Prêt pour la capture</p>
                          </div>
                        )}
                        {step1State === "processing" && (
                          <div className="absolute inset-0 bg-foreground/80 z-10 flex flex-col items-center justify-center text-primary-foreground gap-3 rounded-xl">
                            <Loader2 className="size-8 text-primary animate-spin" />
                            <p className="text-sm font-medium uppercase tracking-wide animate-pulse">Analyse en cours...</p>
                          </div>
                        )}
                        {step1State === "completed" && (
                          <div className="absolute inset-0 flex flex-row p-3 gap-3 animate-in fade-in duration-500">
                            <div className="flex-1 bg-card rounded-lg border border-border flex items-center justify-center overflow-hidden relative group">
                              <img src="/images/bowie-dick/captured.png" alt="Captured" className="w-full h-full object-contain" />
                              <button onClick={handleRetakePhoto} className="absolute top-2 right-2 p-1.5 bg-card rounded-lg hover:bg-muted text-destructive border border-border opacity-0 group-hover:opacity-100 transition-opacity">
                                <RotateCcw className="size-3.5" />
                              </button>
                            </div>
                            <div className="flex-1 bg-primary-muted rounded-lg border border-primary/20 flex items-center justify-center overflow-hidden">
                              <img src="/images/bowie-dick/reference.png" alt="Reference" className="w-full h-full object-contain" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={handleCaptureImage}
                          disabled={step1State !== "idle"}
                          className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide transition-all ${
                            step1State === "idle"
                              ? "interactive-primary"
                              : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                          }`}
                        >
                          <Camera className="size-4" /> Capturer l&apos;image
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: validation + signature */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className={signatureCardClass(step1State === "completed", isManualConfirmed)}>
                      <h3 className="text-xs font-medium text-foreground mb-4 flex items-center gap-2">
                        <ShieldCheck className="size-4 text-secondary" /> Validation Manuelle
                      </h3>
                      <div
                        onClick={() => step1State === "completed" && setIsManualConfirmed(!isManualConfirmed)}
                        className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                          isManualConfirmed
                            ? "bg-secondary-muted border-secondary/30"
                            : "bg-muted border-border hover:border-primary/30"
                        }`}
                      >
                        <div className={`shrink-0 size-5 rounded border-2 flex items-center justify-center transition-all ${
                          isManualConfirmed ? "bg-secondary border-secondary" : "bg-card border-border"
                        }`}>
                          {isManualConfirmed && <CheckCircle2 className="size-3 text-secondary-foreground" />}
                        </div>
                        <p className={`text-xs font-medium leading-snug ${isManualConfirmed ? "text-secondary" : "text-foreground"}`}>
                          Je confirme que le changement de couleur est uniforme et conforme
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Étanchéité */}
            {activeTest === "leak" && (
              <div className="flex flex-col h-full gap-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Test d&apos;Étanchéité (Vide)</h2>
                  <span className="text-xs text-muted-foreground">Poste Maintenance</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className={`flex-1 bg-muted rounded-xl p-5 border-2 flex flex-col transition-all duration-300 ${
                      leakTicketFile ? "border-secondary" : "border-dashed border-border"
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-medium text-foreground flex items-center gap-2">
                          <Camera className="size-4 text-primary" /> Capture Ticket Étanchéité
                        </p>
                        {leakTicketFile && (
                          <span className="inline-flex items-center gap-1 bg-secondary-muted text-secondary border border-secondary/20 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            <CheckCircle2 className="size-3" /> Ticket Capturé
                          </span>
                        )}
                      </div>

                      <div className="bg-card rounded-xl p-4 border border-border relative overflow-hidden">
                        <input ref={leakTicketInputRef} type="file" accept="image/*" capture="environment" onChange={handleLeakTicketUpload} className="hidden" />
                        {!leakTicketPreview ? (
                          <button
                            onClick={() => leakTicketInputRef.current?.click()}
                            className="w-full min-h-[280px] rounded-xl border-2 border-dashed border-border bg-muted flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-all"
                          >
                            <Camera className="size-10" />
                            <p className="text-xs font-medium uppercase tracking-wide">Capture Ticket Étanchéité</p>
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-full min-h-[280px] rounded-xl border border-secondary/20 bg-muted overflow-hidden flex items-center justify-center">
                              <img src={leakTicketPreview} alt="Ticket capturé" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex justify-center gap-2">
                              <button onClick={() => leakTicketInputRef.current?.click()} className="interactive-primary flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium">
                                <Camera className="size-3.5" /> Reprendre
                              </button>
                              <button onClick={handleLeakTicketRetake} className="interactive-muted flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium">
                                <RotateCcw className="size-3.5" /> Retake
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="p-4 bg-muted rounded-xl border border-border flex flex-col gap-2">
                      <h4 className="text-xs font-medium text-muted-foreground border-b border-border pb-2 mb-1">Résumé Audit</h4>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Autoclave</span>
                        <span className="font-medium text-foreground">{autoclaveId}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Ticket</span>
                        <span className="font-medium text-foreground">{leakTicketFile ? leakTicketFile.name : "Non capturé"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Biological */}
            {activeTest === "ez" && (
              <BiologicalIndicatorValidation
                operatorId="AGENT-QUALIF"
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


      {/* Demo toolbox */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <div className="bg-card rounded-xl p-2.5 shadow-lg border border-border flex flex-col gap-2 min-w-[160px]">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-center">Demo</p>
          {activeTest === "leak" && (
            <>
              <button onClick={simulateLeakSuccess} className="interactive-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium">
                <CheckCircle2 className="size-3.5" /> Succès
              </button>
              <button onClick={simulateLeakFailure} className="interactive-danger flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium">
                <AlertCircle className="size-3.5" /> Échec
              </button>
            </>
          )}
          {activeTest === "ez" && (
            <>
              <button onClick={() => { setEzTestStatus("valid"); setEzValue("NEGATIF"); }} className="interactive-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium">
                <CheckCircle2 className="size-3.5" /> Violet (OK)
              </button>
              <button onClick={() => { setEzTestStatus("pending"); setEzValue("POSITIF"); localStorage.setItem("machine_critical_error", "true"); }} className="interactive-warning flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium">
                <AlertCircle className="size-3.5" /> Jaune (KO)
              </button>
            </>
          )}
          <button onClick={handleGlobalReset} className="interactive-muted flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium justify-center">
            <RotateCcw className="size-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-card rounded-xl p-8 max-w-sm w-full shadow-lg border border-border animate-in zoom-in-95 duration-200">
            <div className="size-14 rounded-xl bg-danger-muted flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="size-7 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground text-center mb-2">Réinitialiser ?</h3>
            <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
              Toutes les données de qualification en cours seront effacées.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="interactive-muted py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide">
                Annuler
              </button>
              <button onClick={handleGlobalReset} className="interactive-danger py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

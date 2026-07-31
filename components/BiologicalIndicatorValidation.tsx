"use client";

import React, { useState, useRef } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Camera,
  ShieldCheck,
  X,
  Loader2,
  RotateCcw,
} from "lucide-react";

interface BiologicalIndicatorValidationProps {
  onValidated?: (status: "valid" | "recalled") => void;
  operatorId: string;
}

export default function BiologicalIndicatorValidation({
  onValidated,
  operatorId,
}: BiologicalIndicatorValidationProps) {
  const simulationImage = "/images/biological-indicators/simulation-tube-test.png";
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
      image_url: capturedImage || "N/A",
    };
    const currentTrail = JSON.parse(localStorage.getItem("BiologicalAuditTrail") || "[]");
    localStorage.setItem("BiologicalAuditTrail", JSON.stringify([...currentTrail, auditEntry]));
  };

  const handleSelection = (color: "VIOLET" | "JAUNE") => {
    setResult(color);
    if (color === "JAUNE") setShowRecallModal(true);
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
        localStorage.setItem("sterilization_cycle_status", "FULLY_VALIDATED");
        localStorage.setItem("medical_devices_unlocked", "true");
        saveAuditTrail("VIOLET");
        onValidated?.("valid");
      } else if (result === "JAUNE") {
        localStorage.setItem("sterilization_cycle_status", "RECALLED");
        localStorage.setItem("system_critical_alert", "true");
        localStorage.setItem("machine_critical_error", "true");
        localStorage.setItem("batch_items_status", "NON_STERILE");
        saveAuditTrail("JAUNE");
        onValidated?.("recalled");
      }
      setIsProcessing(false);
      setShowRecallModal(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 gap-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Le Test des Indicateurs Biologiques (IB)</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Poste Qualification</span>
          <div className="h-1.5 w-10 bg-primary rounded-full" />
          <button
            onClick={handleReset}
            className="interactive-muted flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            <RotateCcw className="size-3.5" /> Réinitialiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left: capture + decision */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className={`flex-1 bg-muted rounded-xl p-5 border-2 flex flex-col transition-all duration-300 ${
            capturedImage ? "border-secondary" : "border-dashed border-border"
          }`}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <p className="text-xs font-medium text-foreground flex items-center gap-2">
                <Camera className="size-4 text-primary" /> Photo Preuve du Tube
              </p>
              {capturedImage && (
                <button
                  onClick={() => setCapturedImage(null)}
                  className="interactive-danger flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium"
                >
                  Reprendre la photo
                </button>
              )}
            </div>

            <div className="h-52 rounded-xl bg-card border border-border overflow-hidden flex items-center justify-center relative mb-5">
              {isCapturing ? (
                <Loader2 className="size-8 text-primary animate-spin" />
              ) : capturedImage ? (
                <img src={capturedImage} alt="IB Proof" className="h-full w-full object-contain" />
              ) : (
                <div className="text-center space-y-2 text-muted-foreground">
                  <Camera className="size-8 mx-auto" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Cliquer pour reprendre la photo
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCapture}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
            </div>

            <div className="space-y-3 shrink-0">
              <p className="text-xs font-medium text-foreground">Résultat de l&apos;Incubation (24h)</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelection("VIOLET")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-xs font-medium uppercase tracking-wide transition-all ${
                    result === "VIOLET"
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <CheckCircle2 className="size-4" />
                  Violet (Conforme)
                </button>
                <button
                  onClick={() => handleSelection("JAUNE")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-xs font-medium uppercase tracking-wide transition-all ${
                    result === "JAUNE"
                      ? "bg-warning border-warning text-white"
                      : "bg-card border-border text-muted-foreground hover:border-warning/30"
                  }`}
                >
                  <AlertTriangle className="size-4" />
                  Jaune (Échec)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: summary + validate */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-4 bg-muted rounded-xl border border-border flex flex-col gap-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-2 mb-1">
              Résumé IB
            </h4>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Statut IB</span>
              <span className={`font-semibold ${
                result === "VIOLET" ? "text-primary" : result === "JAUNE" ? "text-warning" : "text-muted-foreground"
              }`}>
                {result ?? "—"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Photo</span>
              <span className={`font-semibold ${capturedImage ? "text-secondary" : "text-muted-foreground"}`}>
                {capturedImage ? "Capturée" : "—"}
              </span>
            </div>
          </div>

          <button
            disabled={!result || !capturedImage || isProcessing}
            onClick={result === "JAUNE" ? () => setShowRecallModal(true) : finalizeValidation}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-medium uppercase tracking-wide transition-all ${
              result && capturedImage && !isProcessing
                ? "interactive-primary"
                : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
            }`}
          >
            {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            {isProcessing ? "Traitement..." : "Finaliser Validation IB"}
          </button>
        </div>
      </div>

      {/* Recall confirmation modal */}
      {showRecallModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            onClick={() => setShowRecallModal(false)}
          />
          <div className="relative bg-card rounded-xl p-8 max-w-md w-full shadow-lg border border-border animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowRecallModal(false)}
              className="absolute top-4 right-4 interactive-muted p-1.5 rounded-lg"
            >
              <X className="size-4" />
            </button>

            <div className="size-14 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="size-7 text-destructive" />
            </div>

            <h3 className="text-lg font-semibold text-foreground text-center mb-2">
              Alerte Critique : Rappel de Charge
            </h3>

            <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20 mb-6 space-y-3">
              <p className="text-sm font-medium text-destructive text-center leading-relaxed">
                Une liste de rappel va être générée pour tous les articles du lot.
              </p>
              <div className="flex items-center justify-between bg-card rounded-lg p-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Articles concernés</span>
                <span className="text-sm font-semibold text-destructive">42 items</span>
              </div>
              <p className="text-xs font-medium text-destructive text-center">
                Notifier la Pharmacie immédiatement.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowRecallModal(false)}
                className="interactive-muted py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide"
              >
                Annuler
              </button>
              <button
                onClick={finalizeValidation}
                disabled={isProcessing}
                className="interactive-danger py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide"
              >
                {isProcessing ? "Traitement..." : "Confirmer le Rappel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

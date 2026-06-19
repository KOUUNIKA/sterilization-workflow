"use client";

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WORKFLOW_SEQUENCE, MODULE_LABELS, MODULE_ZONES, ZONE_INFO } from "../types";
import { ArrowLeft, ArrowRight, CheckCircle2, X, RotateCcw } from "lucide-react";
import { useFooterActions } from "@/contexts/FooterActionsContext";

export function WorkflowFooter() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCycleComplete, setShowCycleComplete] = useState(false);
  const { override } = useFooterActions();

  const currentPath = location.pathname.substring(1);
  const currentIndex = WORKFLOW_SEQUENCE.indexOf(currentPath as any);

  if (currentIndex === -1) return null;

  const currentStep = WORKFLOW_SEQUENCE[currentIndex];
  const nextStep = WORKFLOW_SEQUENCE[currentIndex + 1];
  const prevStep = WORKFLOW_SEQUENCE[currentIndex - 1];

  const currentZone = MODULE_ZONES[currentStep as string];
  const zone = ZONE_INFO[currentZone];

  const handleNext = () => {
    if (nextStep) {
      navigate(`/${nextStep}`);
    } else {
      setShowCycleComplete(true);
    }
  };

  const handlePrev = () => {
    if (prevStep) {
      navigate(`/${prevStep}`);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <>
    <div className="shrink-0 h-[100px] bg-card border-t border-border flex items-center justify-between px-10 shadow-sm">
      {/* Previous Step + optional Reset */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handlePrev}
          className="group interactive-muted flex items-center gap-3 px-5 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider active:scale-95"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          {prevStep ? "Étape Précédente" : "Retour Dashboard"}
        </button>
        {override?.onReset && (
          <button
            onClick={override.onReset}
            className="interactive-danger flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wide"
          >
            <RotateCcw className="size-4" /> Tout effacer
          </button>
        )}
      </div>

      {/* Workflow Progress */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {zone.label}
        </span>
        <div className="flex items-center gap-2">
          {WORKFLOW_SEQUENCE.map((step, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = idx < currentIndex;
            return (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive ? "w-6 bg-primary" :
                    isCompleted ? "w-2 bg-secondary" :
                    "w-2 bg-border"
                  }`}
                  title={MODULE_LABELS[step as string]}
                />
                {isActive && (
                  <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">
                    {MODULE_LABELS[step as string]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Step / Submit */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {nextStep && (
          <span className="text-[10px] text-muted-foreground font-medium mr-1">
            Prochain : {MODULE_LABELS[nextStep as string]}
          </span>
        )}
        {override?.saveError && (
          <p className="text-xs font-medium text-destructive">{override.saveError}</p>
        )}
        {override && !override.isDone ? (
          <button
            onClick={() => void override.onSubmit()}
            disabled={!override.isReady || override.isSubmitting}
            className={`group flex items-center gap-3 px-8 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider active:scale-95 transition-all ${
              override.isReady && !override.isSubmitting
                ? "interactive-secondary hover:-translate-y-0.5"
                : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
            }`}
          >
            {override.isSubmitting ? override.submittingLabel : override.submitLabel}
            {!override.isSubmitting && <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="group interactive-secondary flex items-center gap-3 px-8 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider active:scale-95 hover:-translate-y-0.5 transition-all"
          >
            {nextStep ? (override?.isDone ? override.doneLabel : "Étape Suivante") : "Terminer le Cycle"}
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>

    {/* Cycle complete modal */}
    {showCycleComplete && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <button
          type="button"
          onClick={() => setShowCycleComplete(false)}
          className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
          aria-label="Fermer"
        />
        <div className="relative z-[101] bg-card rounded-xl border border-border p-6 max-w-sm w-full shadow-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary-muted border border-secondary/20">
              <CheckCircle2 className="size-7 text-secondary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Cycle terminé</h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                La boîte a complété toutes les étapes du cycle de stérilisation avec succès.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCycleComplete(false);
                  navigate(`/${WORKFLOW_SEQUENCE[0]}`);
                }}
                className="interactive-primary w-full rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide"
              >
                Nouveau cycle
              </button>
              <button
                type="button"
                onClick={() => setShowCycleComplete(false)}
                className="interactive-muted w-full rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide"
              >
                Rester sur cette étape
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

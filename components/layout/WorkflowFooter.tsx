"use client";

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WORKFLOW_SEQUENCE, MODULE_LABELS, MODULE_ZONES, ZONE_INFO } from "../types";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export function WorkflowFooter() {
  const location = useLocation();
  const navigate = useNavigate();
  
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
      navigate("/dashboard");
      alert("Cycle de stérilisation terminé avec succès !");
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
    <div className="fixed bottom-0 left-0 right-0 h-[100px] bg-white/80 backdrop-blur-xl border-t border-[#d5e2ea] flex items-center justify-between px-10 z-[40] shadow-[0_-10px_40px_rgba(11,72,103,0.05)]">
      {/* Previous Step */}
      <div className="w-1/4">
        <button 
          onClick={handlePrev}
          className="group flex items-center gap-4 bg-white border-2 border-[#d5e2ea] text-slate-400 px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:border-[#1378ac] hover:text-[#1378ac] transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {prevStep ? "Étape Précédente" : "Retour Dashboard"}
        </button>
      </div>

      {/* Workflow Progress & Zone Info */}
      <div className="flex-1 flex flex-col items-center gap-3">
        {/* Zone Badge */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm transition-all duration-500 ${zone.color}`}>
          <span>{zone.icon}</span>
          <span>{zone.label}</span>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center gap-3">
          {WORKFLOW_SEQUENCE.map((step, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = idx < currentIndex;
            return (
              <div key={step} className="flex items-center gap-3">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    isActive ? 'w-8 bg-[#1378ac] shadow-[0_0_10px_rgba(19,120,172,0.4)]' : 
                    isCompleted ? 'w-2.5 bg-[#11b5a2]' : 
                    'w-2.5 bg-slate-200'
                  }`}
                  title={MODULE_LABELS[step as string]}
                />
                {isActive && (
                  <span className="text-[10px] font-black text-[#0b4867] uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
                    {MODULE_LABELS[step as string]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Step */}
      <div className="w-1/4 flex flex-col items-end gap-2">
        {nextStep && (
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mr-2">
            Prochain : {MODULE_LABELS[nextStep as string]}
          </span>
        )}
        <button 
          onClick={handleNext}
          className="group flex items-center gap-4 px-10 py-4 bg-[#11b5a2] text-white rounded-2xl font-black uppercase tracking-[0.25em] text-[11px] transition-all shadow-xl shadow-[#11b5a2]/20 hover:bg-[#0fa391] hover:-translate-y-0.5 active:scale-95"
        >
          {nextStep ? "Étape Suivante" : "Terminer le Cycle"}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

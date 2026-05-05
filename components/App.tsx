"use client";

import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { Login } from "./Login";
import { InventoryManagement } from "./InventoryManagement";
import { HistoryView } from "./HistoryView";
import { EquipmentQualification } from "./EquipmentQualification";
import { SterilizationReception } from "./SterilizationReception";
import { PredesinfectionWizard } from "./steps/PredesinfectionWizard";
import { LavageWizard } from "./steps/Lavage";
import { Recomposition } from "./steps/Recomposition";
import { SterilizationWizard } from "./steps/Sterilization";
import { Dechargesterilization } from "./steps/Dechargesterilization";
import { StorageDistribution } from "./steps/StorageDistribution";
import { PatientLiaison } from "./PatientLiaison";
import { 
  Search, 
  Settings, 
  ShieldCheck, 
  Package, 
  Plus, 
  Filter, 
  ArrowRight,
  ChevronRight,
  Info
} from "lucide-react";

// Mock Dashboard Component
function Dashboard() {
  const [autoclaveStatus, setAutoclaveStatus] = useState<string>("Pending Tests");

  useEffect(() => {
    const status = localStorage.getItem('autoclave_status');
    if (status) setAutoclaveStatus(status);
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden text-slate-900">
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <section className="w-full max-w-7xl space-y-8 p-4">
          <div className="text-center space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1378ac]">
              Modules du cycle
            </p>
            <h2 className="text-3xl font-black tracking-tight text-[#0b4867]">
              Cycle de vie complet des dispositifs stériles
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Accès rapide aux postes opérationnels de la suite de stérilisation.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center items-stretch pb-10">
            <Link to="/qualification" className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-4 py-1.5 bg-white rounded-t-[1.5rem] border-x border-t border-[#d5e2ea] -mb-2 z-10 mx-6 shadow-sm">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Autoclave Status</span>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${autoclaveStatus === 'Qualified' ? 'bg-[#11b5a2]' : (autoclaveStatus === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-orange-400')}`} />
                  <span className={`text-[9px] font-black uppercase tracking-tight ${autoclaveStatus === 'Qualified' ? 'text-[#0b786e]' : (autoclaveStatus === 'Critical' ? 'text-red-600' : 'text-orange-600')}`}>
                    {autoclaveStatus}
                  </span>
                </div>
              </div>
              <DashboardCard
                step="00"
                title="Tests de contrôle"
                desc="Test Bowie-Dick quotidien et validation de l'équipement (Sécurité)."
                accent="border-[#0b4867]/20 bg-[#edf5f9] text-[#0b4867]"
              />
            </Link>
            
            <Link to="/predesinfection" className="flex">
              <DashboardCard
                step="01"
                title="Prédésinfection"
                desc="Trempage, identification conteneur et validation (Zone Sale)."
                accent="border-[#11b5a2]/35 bg-[#eafaf7] text-[#0b786e]"
              />
            </Link>

            <Link to="/sterilization-reception" className="flex">
              <DashboardCard
                step="02"
                title="Réception"
                desc="Origine, sécurité transport et validation physique à l'arrivée (Zone Sale)."
                accent="border-[#11b5a2]/35 bg-[#eafaf7] text-[#0b786e]"
              />
            </Link>

            <Link to="/lavage-chargement" className="flex">
              <DashboardCard
                step="03"
                title="Nettoyage"
                desc="Entrée machine, conformité cycle et libération (Zone Sale/Propre)."
                accent="border-[#1378ac]/25 bg-[#e8f4fb] text-[#1378ac]"
              />
            </Link>

            <Link to="/recomposition" className="flex">
              <DashboardCard
                step="04"
                title="Conditionnement"
                desc="Contrôle instruments, AI Vision et étiquetage (Zone Propre)."
                accent="border-[#0b4867]/20 bg-[#edf5f9] text-[#0b4867]"
              />
            </Link>

            <Link to="/sterilization-chargement" className="flex">
              <DashboardCard
                step="05"
                title="Stérilisation"
                desc="Chargement autoclave et validation sortie (Zone Propre/Stérile)."
                accent="border-[#11b5a2]/30 bg-[#f2fbfa] text-[#11b5a2]"
              />
            </Link>

            <Link to="/storage-distribution" className="flex">
              <DashboardCard
                step="06"
                title="Stockage & Distribution"
                desc="Arsenal, affectation bloc et traçabilité (Zone Stérile)."
                accent="border-[#1378ac]/20 bg-[#edf5f9] text-[#0b4867]"
              />
            </Link>

            <Link to="/patient-liaison" className="flex">
              <DashboardCard
                step="07"
                title="Liaison Patient"
                desc="Lier le matériel utilisé au dossier patient (Post-Opératoire)."
                accent="border-[#11b5a2]/35 bg-[#eafaf7] text-[#0b786e]"
              />
            </Link>

            <Link to="/inventory" className="flex">
              <DashboardCard
                step="08"
                title="Inventaire & Config"
                desc="Gestion du référentiel : boîtes, instruments et emballages."
                accent="border-[#0b4867]/20 bg-[#edf5f9] text-[#0b4867]"
              />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardCard({ step, title, desc, accent }: any) {
  return (
    <div className="group flex flex-col justify-between rounded-[2rem] border border-[#d5e2ea] bg-white/95 p-5 text-left shadow-[0_10px_30px_rgba(11,72,103,0.05)] transition-all hover:-translate-y-1 hover:border-[#1378ac]/40 hover:shadow-[0_20px_45px_rgba(11,72,103,0.1)] active:scale-[0.98] cursor-pointer w-full h-full">
      <div className="space-y-4">
        <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black tracking-[0.24em] ${accent}`}>
          Module {step}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black tracking-tight text-[#0b4867] leading-tight">{title}</h3>
          <p className="text-[11px] leading-relaxed text-slate-500 font-medium">{desc}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1378ac]">
        Accéder
        <span className="transition-transform group-hover:translate-x-1 text-sm">→</span>
      </div>
    </div>
  );
}

export function AppContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/qualification" element={<EquipmentQualification onValidated={() => {}} />} />
          <Route path="/predesinfection" element={<PredesinfectionWizard cycleId="2026-0001" onValidated={() => {}} />} />
          <Route path="/sterilization-reception" element={<SterilizationReception />} />
          <Route path="/lavage-chargement" element={<LavageWizard initialPhase={1} onPhaseChange={() => {}} onValidated={() => {}} />} />
          <Route path="/lavage-sortie" element={<LavageWizard initialPhase={2} onPhaseChange={() => {}} onValidated={() => {}} />} />
          <Route path="/recomposition" element={<Recomposition onValidated={() => {}} />} />
          <Route path="/sterilization-chargement" element={<SterilizationWizard initialPhase={1} onPhaseChange={() => {}} onValidated={() => {}} />} />
          <Route path="/sterilization-sortie" element={<Dechargesterilization onValidated={() => {}} />} />
          <Route path="/storage-distribution" element={<StorageDistribution onValidated={() => {}} />} />
          <Route path="/patient-liaison" element={<PatientLiaison />} />
          <Route path="/maintenance" element={<div className="bg-white p-10 rounded-3xl border border-[#d5e2ea] shadow-sm"><h2 className="text-2xl font-bold text-[#0b4867]">Gestion de Maintenance</h2><p className="mt-4 text-slate-500">Interface de maintenance en attente de configuration.</p></div>} />
          {/* Add more routes here */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

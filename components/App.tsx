"use client";

import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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

type CardVariant = "primary" | "secondary" | "muted";

function DashboardCard({
  step,
  title,
  desc,
  variant = "primary",
  statusDot,
}: {
  step: string;
  title: string;
  desc: string;
  variant?: CardVariant;
  statusDot?: { color: string; text: string; textColor: string };
}) {
  const badge: Record<CardVariant, string> = {
    primary: "bg-primary-muted text-primary border-primary/20",
    secondary: "bg-secondary-muted text-secondary border-secondary/20",
    muted: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:scale-[0.98] cursor-pointer w-full h-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge[variant]}`}>
            Module {step}
          </span>
          {statusDot && (
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${statusDot.textColor}`}>
              <span className={`size-1.5 rounded-full ${statusDot.color}`} />
              {statusDot.text}
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-foreground leading-tight">{title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary">
        Accéder
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </div>
  );
}

function Dashboard() {
  const [autoclaveStatus, setAutoclaveStatus] = useState<string>("Pending Tests");

  useEffect(() => {
    const status = localStorage.getItem("autoclave_status");
    if (status) setAutoclaveStatus(status);
  }, []);

  const autoclaveColor =
    autoclaveStatus === "Qualified"
      ? { dot: "bg-success", text: "text-success" }
      : autoclaveStatus === "Critical"
        ? { dot: "bg-destructive animate-pulse", text: "text-destructive" }
        : { dot: "bg-warning", text: "text-warning" };

  return (
    <div className="flex flex-col text-foreground">
      <section className="w-full max-w-7xl mx-auto space-y-8 py-6">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Modules du cycle
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Cycle de vie complet des dispositifs stériles
          </h2>
          <p className="text-sm text-muted-foreground">
            Accès rapide aux postes opérationnels de la suite de stérilisation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
          <Link to="/qualification" className="flex">
            <DashboardCard
              step="00"
              title="Tests de contrôle"
              desc="Test Bowie-Dick quotidien et validation de l'équipement (Sécurité)."
              variant="primary"
              statusDot={{ color: autoclaveColor.dot, text: autoclaveStatus, textColor: autoclaveColor.text }}
            />
          </Link>

          <Link to="/predesinfection" className="flex">
            <DashboardCard step="01" title="Prédésinfection" desc="Trempage, identification conteneur et validation (Zone Sale)." variant="secondary" />
          </Link>

          <Link to="/sterilization-reception" className="flex">
            <DashboardCard step="02" title="Réception" desc="Origine, sécurité transport et validation physique à l'arrivée (Zone Sale)." variant="secondary" />
          </Link>

          <Link to="/lavage-chargement" className="flex">
            <DashboardCard step="03" title="Nettoyage" desc="Entrée machine, conformité cycle et libération (Zone Sale/Propre)." variant="primary" />
          </Link>

          <Link to="/recomposition" className="flex">
            <DashboardCard step="04" title="Conditionnement" desc="Contrôle instruments, AI Vision et étiquetage (Zone Propre)." variant="primary" />
          </Link>

          <Link to="/sterilization-chargement" className="flex">
            <DashboardCard step="05" title="Stérilisation" desc="Chargement autoclave et validation sortie (Zone Propre/Stérile)." variant="secondary" />
          </Link>

          <Link to="/storage-distribution" className="flex">
            <DashboardCard step="06" title="Stockage" desc="Arsenal, affectation bloc et traçabilité (Zone Stérile)." variant="primary" />
          </Link>

          <Link to="/inventory" className="flex">
            <DashboardCard step="07" title="Inventaire & Config" desc="Gestion du référentiel : boîtes, instruments et emballages." variant="muted" />
          </Link>
        </div>
      </section>
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
      <AuthProvider>
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
          <Route path="/sterilization-chargement" element={<SterilizationWizard onValidated={() => {}} />} />
          <Route path="/sterilization-sortie" element={<Dechargesterilization onValidated={() => {}} />} />
          <Route path="/storage-distribution" element={<StorageDistribution onValidated={() => {}} />} />

          <Route path="/maintenance" element={<div className="bg-white p-10 rounded-3xl border border-[#d5e2ea] shadow-sm"><h2 className="text-2xl font-bold text-[#0b4867]">Gestion de Maintenance</h2><p className="mt-4 text-slate-500">Interface de maintenance en attente de configuration.</p></div>} />
          {/* Add more routes here */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

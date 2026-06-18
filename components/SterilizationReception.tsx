"use client";

import { useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import type { ReceptionRecord, ReceptionSource } from "@/lib/reception/types";

type AgentDirectoryEntry = {
  id: string;
  name: string;
  role: string;
};

const SOURCE_OPTIONS: Array<{ value: ReceptionSource; label: string }> = [
  { value: "service-bloc", label: "Service / Bloc Opératoire" },
  { value: "stock-sterile", label: "Stock Stérile" },
  { value: "externe", label: "Externe (Neuf/Réparation)" },
];

const AGENT_DIRECTORY: Record<string, AgentDirectoryEntry> = {
  "BADGE-001": { id: "BADGE-001", name: "Amina Benali", role: "Agent Qualite" },
  "BADGE-002": { id: "BADGE-002", name: "Youssef El Mansouri", role: "Agent Sterilisation" },
  "BADGE-003": { id: "BADGE-003", name: "Salma Idrissi", role: "Superviseur de Quart" },
};

const DEFAULT_CYCLE_ID = "2026-0001";

function normalizeScan(value: string) {
  return value.trim().toUpperCase();
}

async function saveReceptionRecord(record: ReceptionRecord) {
  const response = await fetch("/api/receptions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error("Failed to save reception record");
  }

  await fetch(`/api/cycles/${encodeURIComponent(DEFAULT_CYCLE_ID)}/events`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-reception`,
      ts: record.timestamp,
      type: "state_changed",
      payload: {
        module: "sterilization-reception",
        source: record.source,
        tray_id: record.tray_id,
        transport_id: record.transport_id,
        agent_id: record.agent_id,
        pre_disinfection_status: record.pre_disinfection_status,
      },
    }),
  });
}

export function SterilizationReception() {
  const [source, setSource] = useState<ReceptionSource | "">("");
  const [preDisinfectionStatus, setPreDisinfectionStatus] = useState(false);
  const [trayScanValue, setTrayScanValue] = useState("");
  const [trayId, setTrayId] = useState("");
  const [transportScanValue, setTransportScanValue] = useState("");
  const [transportId, setTransportId] = useState("");
  const [agentScanValue, setAgentScanValue] = useState("");
  const [agent, setAgent] = useState<AgentDirectoryEntry | null>(null);
  const [agentScanError, setAgentScanError] = useState("");
  const [trayScanError, setTrayScanError] = useState("");
  const [transportScanError, setTransportScanError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const requiresPreDisinfection = source === "service-bloc";

  const isFormValid = useMemo(() => {
    return (
      Boolean(source) &&
      (!requiresPreDisinfection || preDisinfectionStatus) &&
      Boolean(trayId) &&
      Boolean(transportId) &&
      Boolean(agent) &&
      !trayScanError &&
      !transportScanError &&
      !agentScanError
    );
  }, [agent, agentScanError, preDisinfectionStatus, requiresPreDisinfection, source, transportId, transportScanError, trayId, trayScanError]);

  const resetForm = () => {
    setSource("");
    setPreDisinfectionStatus(false);
    setTrayScanValue("");
    setTrayId("");
    setTransportScanValue("");
    setTransportId("");
    setAgentScanValue("");
    setAgent(null);
    setTrayScanError("");
    setTransportScanError("");
    setAgentScanError("");
    setSubmitError("");
  };

  const resetTransportAndAgentStep = () => {
    setTransportScanValue("");
    setTransportId("");
    setTransportScanError("");
    setAgentScanValue("");
    setAgent(null);
    setAgentScanError("");
  };

  const resetAgentStep = () => {
    setAgentScanValue("");
    setAgent(null);
    setAgentScanError("");
  };

  const handleSourceSimulation = (nextSource: ReceptionSource) => {
    setSource(nextSource);
    setTrayScanValue("");
    setTrayId("");
    setTrayScanError("");
    resetTransportAndAgentStep();
    setSuccessMessage("");
    setSubmitError("");
    if (nextSource !== "service-bloc") {
      setPreDisinfectionStatus(false);
    }
  };

  const handleTrayScan = () => {
    const normalized = normalizeScan(trayScanValue);
    if (!normalized) return;

    resetTransportAndAgentStep();
    setTrayId(normalized);
    setTrayScanError("");
    setSubmitError("");
    setSuccessMessage("");
    setTrayScanValue("");
  };

  const handleTransportScan = () => {
    if (!trayId) {
      setTransportScanError("Scannez d'abord le bac de trempage.");
      return;
    }

    const normalized = normalizeScan(transportScanValue);
    if (!normalized) return;

    resetAgentStep();
    setTransportId(normalized);
    setTransportScanError("");
    setSubmitError("");
    setSuccessMessage("");
    setTransportScanValue("");
  };

  const handleAgentScan = () => {
    if (!trayId) {
      setAgent(null);
      setAgentScanError("Scannez d'abord le bac de trempage.");
      return;
    }

    if (!transportId) {
      setAgent(null);
      setAgentScanError("Renseignez d'abord le moyen de transport.");
      return;
    }

    const normalized = normalizeScan(agentScanValue);
    if (!normalized) return;

    const match = AGENT_DIRECTORY[normalized];
    if (!match) {
      setAgent(null);
      setAgentScanError("Badge non reconnu. Veuillez rescanner un badge valide.");
      return;
    }

    setAgent(match);
    setAgentScanError("");
    setSuccessMessage("");
    setAgentScanValue("");
  };

  const handleSubmit = async () => {
    if (!isFormValid || !source || !agent || !trayId || !transportId) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    const record: ReceptionRecord = {
      source,
      tray_id: trayId,
      transport_id: transportId,
      agent_id: agent.id,
      pre_disinfection_status: requiresPreDisinfection ? preDisinfectionStatus : false,
      timestamp: new Date().toISOString(),
    };

    try {
      await saveReceptionRecord(record);
      setSuccessMessage("Reception enregistree avec succes. Le poste est pret pour la saisie suivante.");
      resetForm();
    } catch {
      setSubmitError("La validation a echoue. Verifiez la connexion et reessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const simulateTrayStep = () => {
    setTrayScanValue("BAC-TREM-001");
    setTimeout(() => {
      const normalized = normalizeScan("BAC-TREM-001");
      resetTransportAndAgentStep();
      setTrayId(normalized);
      setTrayScanError("");
      setSubmitError("");
      setSuccessMessage("");
      setTrayScanValue("");
    }, 0);
  };

  const simulateTransportStep = () => {
    if (!trayId) return;
    setTransportScanValue("ARMOIRE-TRANS-01");
    setTimeout(() => {
      const normalized = normalizeScan("ARMOIRE-TRANS-01");
      resetAgentStep();
      setTransportId(normalized);
      setTransportScanError("");
      setSubmitError("");
      setSuccessMessage("");
      setTransportScanValue("");
    }, 0);
  };

  const simulateAgentStep = () => {
    if (!source) {
      handleSourceSimulation("service-bloc");
      setPreDisinfectionStatus(true);
    } else if (requiresPreDisinfection && !preDisinfectionStatus) {
      setPreDisinfectionStatus(true);
    }

    if (!trayId) {
      const normalizedTray = normalizeScan("BAC-TREM-001");
      setTrayId(normalizedTray);
      setTrayScanValue("");
      setTrayScanError("");
    }

    if (!transportId) {
      const normalizedTransport = normalizeScan("ARMOIRE-TRANS-01");
      setTransportId(normalizedTransport);
      setTransportScanValue("");
      setTransportScanError("");
    }

    const simulatedBadge = "BADGE-001";
    setAgentScanValue(simulatedBadge);
    setTimeout(() => {
      const match = AGENT_DIRECTORY[simulatedBadge];
      if (!match) return;
      setAgent(match);
      setAgentScanError("");
      setSubmitError("");
      setSuccessMessage("");
      setAgentScanValue("");
    }, 0);
  };

  const originValidated = Boolean(source) && (!requiresPreDisinfection || preDisinfectionStatus);
  const traceabilityValidated = Boolean(trayId) && Boolean(transportId);
  const quickActionLabel = !source
    ? "Choisir la source"
    : requiresPreDisinfection && !preDisinfectionStatus
      ? "Valider pre-desinfection"
      : !trayId
        ? "Scanner le bac"
        : !transportId
          ? "Scanner le transport"
          : !agent
            ? "Scanner le badge"
            : null;

  const triggerSimulation = () => {
    if (!source) handleSourceSimulation("service-bloc");
    else if (requiresPreDisinfection && !preDisinfectionStatus) setPreDisinfectionStatus(true);
    else if (!trayId) simulateTrayStep();
    else if (!transportId) simulateTransportStep();
    else if (!agent) simulateAgentStep();
  };

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden">
      <header className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] shrink-0">
        <section className="rounded-3xl border border-[#d5e2ea] bg-white/95 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center rounded-full border border-[#b8cad6] bg-[#edf5f9] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#1378ac]">
                Phase 02 • Reception
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[#0b4867]">
                Réception
              </h1>
              <p className="max-w-2xl text-sm font-medium text-slate-500">
                Controle d&apos;origine, verification physique du transport et tracabilite agent avant entree en zone sale.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <InfoTile label="Cycle" value={DEFAULT_CYCLE_ID} />
              <InfoTile label="Statut" value={isFormValid ? "Pret a valider" : "En attente"} />
              <InfoTile label="Reception" value={successMessage ? "Validee" : "A traiter"} />
            </div>
          </div>
        </section>

        <ReceptionOperatorPanel
          confirmed={Boolean(agent)}
          waitingText="Scanner le badge"
          helperText={transportId ? "Badge requis pour finaliser la reception." : "Disponible apres validation du moyen de transport."}
          name={agent?.name ?? ""}
          role={agent ? `${agent.role} • ${agent.id}` : ""}
          onSimulate={simulateAgentStep}
          onReset={resetAgentStep}
        />
      </header>

      <div className="flex-1 grid gap-4 lg:grid-cols-2 min-h-0 overflow-hidden">
        <ReceptionSection
          index="01"
          title="Origine & Pre-traitement"
          scanned={originValidated}
          icon="🚚"
          waitingText="Selectionner la source"
          forceShow
        >
          <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <div className="grid gap-3 md:grid-cols-3">
              {SOURCE_OPTIONS.map((option) => {
                const selected = source === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSourceSimulation(option.value)}
                    className={`rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                      selected
                        ? "border-[#1378ac] bg-[#1378ac] text-white shadow-lg shadow-[#1378ac]/20"
                        : "border-[#d5e2ea] bg-white text-slate-500 hover:border-[#1378ac]/30 hover:text-[#1378ac]"
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                      {option.value === "service-bloc" ? "Service / Bloc" : option.value === "stock-sterile" ? "Stock Sterile" : "Externe"}
                    </p>
                    <p className={`mt-1 text-[11px] font-semibold ${selected ? "text-white/85" : "text-slate-400"}`}>
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DataCard label="Source retenue" value={source ? SOURCE_OPTIONS.find((option) => option.value === source)?.label ?? source : "Aucune source"} color="blue" />
              <DataCard label="Cycle" value={DEFAULT_CYCLE_ID} color="emerald" />
            </div>

            {requiresPreDisinfection ? (
              <div className={`rounded-2xl border-2 p-4 transition-all ${
                preDisinfectionStatus
                  ? "border-[#11b5a2] bg-[#eafaf7]"
                  : "border-[#d5e2ea] bg-[#f8fbfd]"
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b4867]">
                      Controle complementaire
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Validation de la pre-desinfection pour le materiel provenant du bloc.
                    </p>
                  </div>
                  {preDisinfectionStatus ? (
                    <span className="rounded-full border border-[#bdece4] bg-white px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#0b786e]">
                      Validee
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPreDisinfectionStatus((value) => !value)}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                      preDisinfectionStatus
                        ? "border-[#11b5a2] bg-[#11b5a2] text-white shadow-md"
                        : "border-[#d5e2ea] bg-white text-slate-400"
                    }`}
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded border-2 ${
                      preDisinfectionStatus ? "border-white bg-white text-[#11b5a2]" : "border-[#cfdbe3]"
                    }`}>
                      ✓
                    </span>
                    Validation Pre-desinfection
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreDisinfectionStatus(true)}
                    className="rounded-xl border border-[#1378ac]/20 bg-[#edf5f9] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#1378ac] transition hover:border-[#1378ac] hover:bg-white"
                  >
                    Simuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#d5e2ea] bg-[#f8fbfd] p-4">
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 h-4 w-4 text-[#1378ac]" />
                  <p className="text-sm font-medium text-slate-500">
                    Aucun controle complementaire requis pour cette source. Poursuivre avec la tracabilite materielle.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ReceptionSection>

        <ReceptionSection
          index="02"
          title="Tracabilite Reception"
          scanned={traceabilityValidated}
          icon="🧾"
          waitingText="Scanner le bac"
          forceShow
        >
          <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <ScanField
              label="Identification du Bac (Trempage)"
              value={trayScanValue}
              placeholder="Scan Bac de Trempage"
              onChange={setTrayScanValue}
              onSubmit={handleTrayScan}
              isValidated={Boolean(trayId)}
              onSimulate={simulateTrayStep}
            />

            <FieldSummary
              label="Bac detecte"
              value={trayId}
              emptyValue="Aucun scan enregistre"
            />

            {trayScanError ? <StatusHint tone="error" message={trayScanError} /> : null}

            <ScanField
              label="Moyen de Transport"
              value={transportScanValue}
              placeholder="Scanner ou saisir le moyen de transport"
              onChange={setTransportScanValue}
              onSubmit={handleTransportScan}
              isValidated={Boolean(transportId)}
              disabled={!trayId}
              onSimulate={simulateTransportStep}
            />

            <FieldSummary
              label="Transport detecte"
              value={transportId}
              emptyValue={trayId ? "Aucun transport enregistre" : "Disponible apres validation du bac"}
            />

            {transportScanError ? <StatusHint tone="error" message={transportScanError} /> : null}
          </div>
        </ReceptionSection>
      </div>

      <div className="shrink-0 flex items-center justify-end bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#d5e2ea] shadow-lg mt-auto gap-4">
        <div className="w-full max-w-md space-y-3">
          {submitError ? <StatusHint tone="error" message={submitError} /> : null}
          {successMessage ? <StatusHint tone="success" message={successMessage} /> : null}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full flex items-center justify-center gap-4 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl bg-[#11b5a2] text-white hover:-translate-y-1 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed disabled:border disabled:border-slate-200 disabled:shadow-none"
          >
            <CheckCircle2 className="h-5 w-5" />
            {isSubmitting ? "Validation..." : "Valider la réception"}
          </button>
        </div>
      </div>

      {quickActionLabel ? (
        <button
          onClick={triggerSimulation}
          className="fixed bottom-32 right-10 flex items-center gap-3 rounded-full bg-[#0b4867] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-[#0a3952] hover:scale-105 active:scale-95 group z-[40]"
        >
          <span className="text-xl text-[#8de7da] animate-pulse">⌁</span>
          <span>{quickActionLabel}</span>
        </button>
      ) : null}
    </div>
  );
}

function ReceptionSection({
  index,
  title,
  scanned,
  icon,
  waitingText,
  children,
  forceShow,
}: {
  index: string;
  title: string;
  scanned: boolean;
  icon: string;
  waitingText: string;
  children: React.ReactNode;
  forceShow?: boolean;
}) {
  return (
    <section className={`bg-white/95 p-5 rounded-3xl border shadow-sm transition-all duration-500 flex flex-col overflow-hidden ${
      scanned ? "border-[#11b5a2] ring-4 ring-[#eafaf7]" : "border-[#d5e2ea]"
    }`}>
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white shadow-md">
            {index}
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-[#0b4867]">{title}</h2>
        </div>
        {scanned ? (
          <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2 py-0.5 text-[8px] font-semibold uppercase text-[#0b786e]">
            Validé
          </span>
        ) : null}
      </div>

      {!scanned && !forceShow ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400 p-4">
          <div className="text-3xl opacity-50">{icon}</div>
          <p className="font-bold text-[9px] uppercase tracking-[0.2em] text-center">{waitingText}</p>
        </div>
      ) : children}
    </section>
  );
}

function ReceptionOperatorPanel({
  confirmed,
  waitingText,
  helperText,
  name,
  role,
  onSimulate,
  onReset,
}: {
  confirmed: boolean;
  waitingText: string;
  helperText: string;
  name: string;
  role: string;
  onSimulate: () => void;
  onReset: () => void;
}) {
  return (
    <section className={`rounded-3xl border bg-white/95 p-4 shadow-sm transition-all duration-500 ${
      confirmed ? "border-[#11b5a2] ring-4 ring-[#eafaf7]" : "border-[#d5e2ea]"
    }`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white shadow-lg">
            03
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-[#0b4867]">
            Agent responsable
          </h2>
        </div>
        {confirmed ? (
          <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">
            Validé
          </span>
        ) : null}
      </div>

      {!confirmed ? (
        <div className="space-y-3">
          <div className="flex h-[78px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400">
            <p className="text-center text-[9px] font-bold uppercase tracking-[0.18em]">
              {waitingText}
            </p>
          </div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {helperText}
          </p>
          <button
            type="button"
            onClick={onSimulate}
            className="w-full py-3 rounded-xl bg-[#1378ac] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-md hover:bg-[#0f6a98] transition-all"
          >
            Simuler le badge
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl bg-[#0b4867] p-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#0a3952] bg-[#1378ac] text-lg shadow-inner">
                👩‍🔬
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-tight truncate">{name}</p>
                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#8de7da] truncate">
                  {role}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#1378ac] hover:border-[#1378ac] transition-all"
          >
            Changer d&apos;agent
          </button>
        </div>
      )}
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#d5e2ea] bg-[#f8fbfd] px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black tracking-tight text-[#0b4867]">{value}</p>
    </div>
  );
}

function ScanField({
  label,
  value,
  placeholder,
  onChange,
  onSubmit,
  isValidated = false,
  disabled = false,
  onSimulate,
  simulateDisabled = disabled,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isValidated?: boolean;
  disabled?: boolean;
  onSimulate?: () => void;
  simulateDisabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {onSimulate ? (
            <button
              type="button"
              onClick={onSimulate}
              disabled={simulateDisabled}
              className="rounded-xl border border-[#1378ac]/20 bg-[#edf5f9] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#1378ac] transition hover:border-[#1378ac] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Simuler
            </button>
          ) : null}
          {isValidated ? <CheckCircle2 className="h-4 w-4 shrink-0 text-[#11b5a2]" /> : null}
        </div>
      </div>
      <div className="flex gap-3">
        <input
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-[#d5e2ea] bg-[#f8fbfd] px-4 py-3 text-sm font-semibold text-[#0b4867] outline-none transition placeholder:text-slate-400 focus:border-[#1378ac] focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="rounded-2xl border border-[#1378ac]/20 bg-[#edf5f9] px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#1378ac] transition hover:border-[#1378ac] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Scanner
        </button>
      </div>
    </div>
  );
}

function FieldSummary({
  label,
  value,
  emptyValue,
}: {
  label: string;
  value: string;
  emptyValue: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#d5e2ea] bg-[#f8fbfd] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-base font-black text-[#0b4867]">
        {value || emptyValue}
      </p>
    </div>
  );
}

function DataCard({ label, value, color }: { label: string; value: string; color: "emerald" | "blue" }) {
  const styles = color === "emerald"
    ? { bg: "bg-[#eafaf7]", text: "text-[#0b786e]", border: "border-[#bdece4]" }
    : { bg: "bg-[#edf5f9]", text: "text-[#1378ac]", border: "border-[#b8cad6]" };

  return (
    <div className={`rounded-2xl border p-4 shrink-0 ${styles.bg} ${styles.border}`}>
      <p className={`mb-1 text-[8px] font-semibold uppercase tracking-[0.24em] ${styles.text}`}>{label}</p>
      <p className="text-sm font-semibold tracking-tight text-[#0b4867]">{value}</p>
    </div>
  );
}

function StatusHint({
  tone,
  message,
}: {
  tone: "info" | "success" | "error";
  message: string;
}) {
  const styles =
    tone === "success"
      ? "border-[#bdece4] bg-[#eafaf7] text-[#0b786e]"
      : tone === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-[#d5e2ea] bg-[#f8fbfd] text-slate-500";

  return (
    <div className={`flex items-start gap-3 rounded-[1.25rem] border p-4 text-sm font-semibold ${styles}`}>
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

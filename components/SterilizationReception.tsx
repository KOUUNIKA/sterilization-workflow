"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Truck } from "lucide-react";
import type { ReceptionRecord, ReceptionSource } from "@/lib/reception/types";
import { useAuth } from "@/contexts/AuthContext";
import { useFooterActions } from "@/contexts/FooterActionsContext";

const SOURCE_OPTIONS: Array<{ value: ReceptionSource; label: string }> = [
  { value: "service-bloc", label: "Service / Bloc Opératoire" },
  { value: "stock-sterile", label: "Stock Stérile" },
  { value: "externe", label: "Externe (Neuf/Réparation)" },
];

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
        trayId: record.trayId,
        transportId: record.transportId,
        agentId: record.agentId,
        preDisinfectionStatus: record.preDisinfectionStatus,
      },
    }),
  });
}

export function SterilizationReception() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qualified, setQualified] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/qualification/today?machineId=AUTOCLAVE-02")
      .then((r) => r.json())
      .then((d) => setQualified(!!d.qualified))
      .catch(() => setQualified(false));
  }, []);

  const [source, setSource] = useState<ReceptionSource | "">("");
  const [preDisinfectionStatus, setPreDisinfectionStatus] = useState(false);
  const [trayScanValue, setTrayScanValue] = useState("");
  const [trayId, setTrayId] = useState("");
  const [transportScanValue, setTransportScanValue] = useState("");
  const [transportId, setTransportId] = useState("");
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
      !trayScanError &&
      !transportScanError
    );
  }, [preDisinfectionStatus, requiresPreDisinfection, source, transportId, transportScanError, trayId, trayScanError]);

  const resetForm = () => {
    setSource("");
    setPreDisinfectionStatus(false);
    setTrayScanValue("");
    setTrayId("");
    setTransportScanValue("");
    setTransportId("");
    setTrayScanError("");
    setTransportScanError("");
    setSubmitError("");
  };

  const resetTransportStep = () => {
    setTransportScanValue("");
    setTransportId("");
    setTransportScanError("");
  };

  const handleSourceSimulation = (nextSource: ReceptionSource) => {
    setSource(nextSource);
    setTrayScanValue("");
    setTrayId("");
    setTrayScanError("");
    resetTransportStep();
    setSuccessMessage("");
    setSubmitError("");
    if (nextSource !== "service-bloc") {
      setPreDisinfectionStatus(false);
    }
  };

  const handleTrayScan = () => {
    const normalized = normalizeScan(trayScanValue);
    if (!normalized) return;

    resetTransportStep();
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

    setTransportId(normalized);
    setTransportScanError("");
    setSubmitError("");
    setSuccessMessage("");
    setTransportScanValue("");
  };

  const handleSubmit = async () => {
    if (!isFormValid || !source || !trayId || !transportId) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    const record: ReceptionRecord = {
      source,
      trayId,
      transportId,
      agentId: user?.badgeCode ?? "BADGE-001",
      preDisinfectionStatus: requiresPreDisinfection ? preDisinfectionStatus : false,
      cycleId: DEFAULT_CYCLE_ID,
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
    setTrayScanValue("TRAY-CHI-001");
    setTimeout(() => {
      const normalized = normalizeScan("TRAY-CHI-001");
      resetTransportStep();
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
      setTransportId(normalized);
      setTransportScanError("");
      setSubmitError("");
      setSuccessMessage("");
      setTransportScanValue("");
    }, 0);
  };

  const simulateAll = () => {
    if (!source) handleSourceSimulation("service-bloc");
    if (requiresPreDisinfection || !source) setPreDisinfectionStatus(true);
    const normalizedTray = normalizeScan("TRAY-CHI-001");
    setTrayId(normalizedTray);
    setTrayScanValue("");
    setTrayScanError("");
    const normalizedTransport = normalizeScan("ARMOIRE-TRANS-01");
    setTransportId(normalizedTransport);
    setTransportScanValue("");
    setTransportScanError("");
    setSubmitError("");
    setSuccessMessage("");
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
          : null;

  const triggerSimulation = () => {
    if (!source) handleSourceSimulation("service-bloc");
    else if (requiresPreDisinfection && !preDisinfectionStatus) setPreDisinfectionStatus(true);
    else if (!trayId) simulateTrayStep();
    else if (!transportId) simulateTransportStep();
    else simulateAll();
  };

  const submitRef = useRef<() => Promise<void>>(async () => {});
  submitRef.current = handleSubmit;
  const stableSubmit = useCallback(async () => { await submitRef.current(); }, []);
  const { setOverride } = useFooterActions();

  useEffect(() => {
    setOverride({
      submitLabel: "Valider la réception",
      submittingLabel: "Validation...",
      doneLabel: "Étape suivante",
      onSubmit: stableSubmit,
      isReady: isFormValid && !isSubmitting,
      isSubmitting: isSubmitting,
      isDone: Boolean(successMessage),
      saveError: submitError || null,
    });
    return () => setOverride(null);
  }, [isFormValid, isSubmitting, submitError, successMessage, stableSubmit, setOverride]);

  if (qualified === null) return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (!qualified) return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-warning-muted border border-warning/20">
        <AlertCircle className="size-8 text-warning" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">Qualification requise</h2>
        <p className="mt-1 text-sm text-muted-foreground">La qualification journalière du stérilisateur n&apos;a pas encore été effectuée.</p>
      </div>
      <button onClick={() => navigate("/qualification")} className="interactive-primary flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-medium uppercase tracking-wide">
        Aller à la qualification
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-4 text-foreground overflow-hidden">
      <header className="shrink-0">
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
                Phase 02 · Réception
              </div>
              <h1 className="text-lg font-semibold text-foreground">Réception</h1>
            </div>
            <div className="flex gap-2 shrink-0">
              <InfoTile label="Cycle" value={DEFAULT_CYCLE_ID} />
              <InfoTile label="Statut" value={isFormValid ? "Prêt" : "En attente"} />
              <InfoTile label="Réception" value={successMessage ? "Validée" : "À traiter"} />
            </div>
          </div>
        </section>

      </header>

      <div className="shrink-0 flex items-center px-1">
        <StepNode label="Origine & Pré-traitement" done={originValidated} active={!originValidated} />
        <div className={`flex-1 h-px transition-colors ${originValidated ? "bg-primary" : "bg-border"}`} />
        <StepNode label="Traçabilité" done={traceabilityValidated} active={originValidated && !traceabilityValidated} />
      </div>

      <div className="flex-1 grid gap-4 lg:grid-cols-2 min-h-0 overflow-hidden">
        <ReceptionSection title="Origine & Pré-traitement" scanned={originValidated}>
          <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-300 overflow-hidden">
            <div className="grid gap-2 md:grid-cols-3">
              {SOURCE_OPTIONS.map((option) => {
                const selected = source === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSourceSimulation(option.value)}
                    className={`rounded-lg border-2 px-3 py-2.5 text-left transition-all ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide">
                      {option.value === "service-bloc" ? "Service / Bloc" : option.value === "stock-sterile" ? "Stock Stérile" : "Externe"}
                    </p>
                    <p className={`mt-0.5 text-xs ${selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <DataCard label="Source retenue" value={source ? SOURCE_OPTIONS.find((o) => o.value === source)?.label ?? source : "Aucune source"} variant="primary" />
              <DataCard label="Cycle" value={DEFAULT_CYCLE_ID} variant="secondary" />
            </div>

            {requiresPreDisinfection ? (
              <div className={`rounded-xl border-2 p-4 transition-all ${
                preDisinfectionStatus ? "border-secondary bg-secondary-muted" : "border-border bg-muted"
              }`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Contrôle complémentaire</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Validation de la pré-désinfection pour le matériel du bloc.</p>
                  </div>
                  {preDisinfectionStatus && (
                    <span className="rounded-full border border-secondary/20 bg-card px-2.5 py-0.5 text-xs font-medium text-secondary">Validée</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreDisinfectionStatus((v) => !v)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-medium uppercase tracking-wide transition-all ${
                      preDisinfectionStatus ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <span className={`flex size-4 items-center justify-center rounded border-2 text-[10px] ${
                      preDisinfectionStatus ? "border-secondary-foreground bg-secondary-foreground/20 text-secondary-foreground" : "border-border"
                    }`}>✓</span>
                    Pré-désinfection
                  </button>
                  <button type="button" onClick={() => setPreDisinfectionStatus(true)} className="interactive-muted rounded-lg px-3 py-2 text-xs font-medium">
                    Simuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted p-4">
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 size-4 text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">Aucun contrôle complémentaire requis. Poursuivre avec la traçabilité matérielle.</p>
                </div>
              </div>
            )}
          </div>
        </ReceptionSection>

        <ReceptionSection title="Traçabilité Réception" scanned={traceabilityValidated}>
          <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-300 overflow-hidden">
            <ScanField
              label="Identification du Bac (Trempage)"
              value={trayScanValue}
              placeholder="Scan Bac de Trempage"
              onChange={setTrayScanValue}
              onSubmit={handleTrayScan}
              isValidated={Boolean(trayId)}
              onSimulate={simulateTrayStep}
            />
            <FieldSummary label="Bac détecté" value={trayId} emptyValue="Aucun scan enregistré" />
            {trayScanError && <StatusHint tone="error" message={trayScanError} />}

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
            <FieldSummary label="Transport détecté" value={transportId} emptyValue={trayId ? "Aucun transport enregistré" : "Disponible après validation du bac"} />
            {transportScanError && <StatusHint tone="error" message={transportScanError} />}
          </div>
        </ReceptionSection>
      </div>

      {quickActionLabel && (
        <div className="fixed bottom-32 right-6 z-[100]">
          <div className="bg-card rounded-xl p-2.5 shadow-lg border border-border flex flex-col gap-2 min-w-[160px]">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-center">Demo</p>
            <button onClick={triggerSimulation} className="interactive-primary flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium">
              {quickActionLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceptionSection({
  title,
  scanned,
  children,
}: {
  title: string;
  scanned: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`bg-card p-5 rounded-xl border transition-all duration-300 flex flex-col overflow-hidden ${
      scanned ? "border-secondary" : "border-border"
    }`}>
      <div className="mb-4 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {scanned && (
          <span className="rounded-full border border-secondary/20 bg-secondary-muted px-2 py-0.5 text-xs font-medium text-secondary">Validé</span>
        )}
      </div>
      {children}
    </section>
  );
}


function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted px-2.5 py-2 min-w-0">
      <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground truncate">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-foreground whitespace-nowrap">{value}</p>
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
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
        <div className="flex items-center gap-2">
          {onSimulate && (
            <button type="button" onClick={onSimulate} disabled={simulateDisabled}
              className="interactive-muted rounded-lg px-2.5 py-1 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              Simuler
            </button>
          )}
          {isValidated && <CheckCircle2 className="size-4 shrink-0 text-secondary" />}
        </div>
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmit(); } }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button type="button" onClick={onSubmit} disabled={disabled || !value.trim()}
          className="interactive-primary rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed">
          Scanner
        </button>
      </div>
    </div>
  );
}

function FieldSummary({ label, value, emptyValue }: { label: string; value: string; emptyValue: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value || emptyValue}</p>
    </div>
  );
}

function DataCard({ label, value, variant }: { label: string; value: string; variant: "primary" | "secondary" }) {
  const styles = variant === "secondary"
    ? "bg-secondary-muted border-secondary/20 text-secondary"
    : "bg-primary-muted border-primary/20 text-primary";

  return (
    <div className={`rounded-lg border p-3 shrink-0 ${styles}`}>
      <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide">{label}</p>
      <p className="text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

function StepNode({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-3">
      <div className={`size-2.5 rounded-full border-2 transition-all ${
        done ? "bg-primary border-primary" : active ? "bg-card border-primary ring-2 ring-primary/20" : "bg-card border-border"
      }`} />
      <span className={`text-[9px] font-medium uppercase tracking-wide whitespace-nowrap ${
        done ? "text-primary" : active ? "text-foreground" : "text-muted-foreground"
      }`}>{label}</span>
    </div>
  );
}

function StatusHint({ tone, message }: { tone: "info" | "success" | "error"; message: string }) {
  const styles =
    tone === "success" ? "border-secondary/20 bg-secondary-muted text-secondary" :
    tone === "error" ? "border-destructive/20 bg-destructive/5 text-destructive" :
    "border-border bg-muted text-muted-foreground";

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 text-xs font-medium ${styles}`}>
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

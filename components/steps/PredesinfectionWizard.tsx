"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFooterActions } from "@/contexts/FooterActionsContext";

type Priority = "standard" | "urgent";
type InstrumentStatus = "expected" | "missing" | "added" | "partial";

type InstrumentLine = {
  id: string;
  name: string;
  designation: string;
  quantity: number;
  expectedQuantity: number;
  status: InstrumentStatus;
};

interface PredesinfectionWizardProps {
  cycleId: string;
  onValidated?: (isValid: boolean) => void;
}

export function PredesinfectionWizard({ cycleId, onValidated }: PredesinfectionWizardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qualified, setQualified] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/qualification/today?machineId=AUTOCLAVE-02")
      .then((r) => r.json())
      .then((d) => setQualified(!!d.qualified))
      .catch(() => setQualified(false));
  }, []);

  const [priority, setPriority] = useState<Priority>("standard");
  const [boxName, setBoxName] = useState("");
  const [trayScanned, setTrayScanned] = useState(false);
  const [boxScanned, setBoxScanned] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!boxName) return;
    fetch(`/api/trays/${encodeURIComponent(boxName)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.tray?.composition?.length) {
          setInstruments(
            data.tray.composition.map((c: { name: string; category: string; expectedQuantity: number }, i: number) => ({
              id: `comp-${i}`,
              name: c.name,
              designation: c.category,
              quantity: c.expectedQuantity,
              expectedQuantity: c.expectedQuantity,
              status: "expected" as InstrumentStatus,
            }))
          );
        }
      });
  }, [boxName]);

  const [provenance] = useState("SALLE OP n° 04");
  const [soakingSummary] = useState({
    detergent: "Anioxyde 1000",
    duration: "10 min",
    dilution: "0,5%",
    dosage: "50 mL/L",
    waterVolume: "12 L",
  });

  const [instruments, setInstruments] = useState<InstrumentLine[]>([]);

  const missingCount = instruments.filter(i => i.status === "missing").length;
  const partialCount = instruments.filter(i => i.status === "partial").length;
  const hasDiscrepancies = missingCount > 0 || partialCount > 0;

  const isComplete = trayScanned && boxScanned && missingCount === 0 && partialCount === 0;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onValidated?.(isComplete); }, [isComplete]);

  const handleValidate = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/predesinfection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cycleId,
          priority,
          boxName,
          provenance,
          detergent: soakingSummary.detergent,
          dilution: soakingSummary.dilution,
          dosage: soakingSummary.dosage,
          waterVolume: soakingSummary.waterVolume,
          duration: soakingSummary.duration,
          operatorBadge: user?.badgeCode ?? "BADGE-001",
          instruments: instruments.map(({ name, designation, quantity, id, status }) => ({
            name,
            designation,
            quantity,
            code: id,
            status,
          })),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur serveur");
      }
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const handleGlobalReset = () => {
    setTrayScanned(false);
    setBoxScanned(false);
    setBoxName("");
    setPriority("standard");
    setInstruments([]);
    setShowResetConfirm(false);
  };

  const toggleMissing = (id: string) => {
    setInstruments(prev => prev.map(ins =>
      ins.id === id && ins.status !== "added"
        ? { ...ins, status: ins.status === "missing" ? "expected" : "missing" }
        : ins
    ));
  };

  const deleteInstrument = (id: string) => {
    setInstruments(prev => prev.filter(ins => ins.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setInstruments(prev => prev.map(ins => {
      if (ins.id !== id) return ins;
      const newQty = Math.max(1, ins.quantity + delta);
      let newStatus = ins.status;
      if (ins.status !== "added" && ins.status !== "missing") {
        newStatus = newQty !== ins.expectedQuantity ? "partial" : "expected";
      }
      return { ...ins, quantity: newQty, status: newStatus };
    }));
  };

  const triggerSimulation = () => {
    if (!trayScanned) setTrayScanned(true);
    else if (!boxScanned) {
      setBoxScanned(true);
      setBoxName("TRAY-CHI-001");
    }
  };

  const quickActionLabel = !trayScanned
    ? "Scanner le bac"
    : !boxScanned
      ? "Scanner le conteneur"
      : null;

  const submitRef = useRef<() => Promise<void>>(async () => {});
  submitRef.current = handleValidate;
  const stableSubmit = useCallback(async () => { await submitRef.current(); }, []);
  const stableReset = useCallback(() => setShowResetConfirm(true), []);
  const { setOverride } = useFooterActions();

  useEffect(() => {
    setOverride({
      submitLabel: "Valider l'étape",
      submittingLabel: "Enregistrement...",
      doneLabel: "Étape suivante",
      onSubmit: stableSubmit,
      isReady: isComplete && !saving,
      isSubmitting: saving,
      isDone: saved,
      onReset: stableReset,
      saveError: saveError ?? ((missingCount > 0 || partialCount > 0) ? `${missingCount + partialCount} instrument(s) à corriger — validation bloquée` : null),
    });
    return () => setOverride(null);
  }, [isComplete, saving, saved, saveError, missingCount, partialCount, stableSubmit, stableReset, setOverride]);

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
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        <header className="shrink-0">
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
                  Phase 01
                </div>
                <h1 className="text-lg font-semibold text-foreground">Prédésinfection</h1>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoTile label="Cycle" value={cycleId} />
                <InfoTile label="Statut" value={isComplete ? "Prêt à valider" : "En cours"} />
              </div>
            </div>
          </section>

        </header>

        {/* Step queue indicator */}
        <div className="flex items-center shrink-0 px-1">
          <StepNode label="Bac de trempage" done={trayScanned} active={!trayScanned} />
          <div className={`flex-1 h-px transition-colors ${trayScanned ? "bg-primary" : "bg-border"}`} />
          <StepNode label="Identification conteneur" done={boxScanned} active={trayScanned && !boxScanned} />
        </div>

        <div className="grid gap-4 xl:grid-cols-2 flex-1 min-h-[400px]">
          {/* LEFT — Bac de trempage */}
          <section className={`flex flex-col rounded-xl border bg-card p-4 transition-all duration-300 overflow-hidden ${
            trayScanned ? "border-secondary" : "border-border"
          }`}>
            <div className="mb-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Bac de trempage</h2>
              </div>
              <div className="flex items-center gap-2">
                {trayScanned && (
                  <button
                    onClick={() => setTrayScanned(false)}
                    className="interactive-muted flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium"
                  >
                    <Pencil className="size-3" />
                    Modifier
                  </button>
                )}
                {trayScanned && (
                  <span className="rounded-full border border-secondary/20 bg-secondary-muted px-2 py-0.5 text-xs font-medium text-secondary">Scanné</span>
                )}
              </div>
            </div>

            {!trayScanned ? (
              <div className="flex-1 flex">
                <ScanPlaceholder label="Scanner le bac" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 space-y-3 animate-in fade-in duration-300">
                <div className="grid gap-2 sm:grid-cols-2 shrink-0">
                  <div className="rounded-lg border border-secondary/20 bg-secondary-muted p-3 flex flex-col justify-center">
                    <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-secondary">Provenance</p>
                    <p className="text-xs font-semibold text-foreground">{provenance}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(soakingSummary).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-border bg-muted p-1.5">
                        <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{key}</p>
                        <p className="text-xs font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <InstrumentTable
                    rows={instruments}
                    onToggleMissing={toggleMissing}
                    onUpdateQuantity={updateQuantity}
                    onDelete={deleteInstrument}
                  />
                </div>
              </div>
            )}
          </section>

          {/* RIGHT — Identification conteneur */}
          <section className={`flex flex-col rounded-xl border bg-card p-4 transition-all duration-300 overflow-hidden ${
            boxScanned ? "border-secondary" : "border-border"
          }`}>
            <div className="mb-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Identification conteneur</h2>
              </div>
              <div className="flex items-center gap-2">
                {boxScanned && (
                  <button
                    onClick={() => { setBoxScanned(false); setBoxName(""); }}
                    className="interactive-muted flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium"
                  >
                    <Pencil className="size-3" />
                    Modifier
                  </button>
                )}
                {boxScanned && (
                  <span className="rounded-full border border-secondary/20 bg-secondary-muted px-2 py-0.5 text-xs font-medium text-secondary">Identifié</span>
                )}
              </div>
            </div>

            {!boxScanned ? (
              <div className="flex-1 flex">
                <ScanPlaceholder label="Scanner le conteneur" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between rounded-lg border border-secondary/20 bg-secondary-muted p-3 shrink-0">
                  <div>
                    <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-secondary">ID conteneur</p>
                    <p className="text-sm font-semibold text-foreground">{boxName}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted p-2.5 shrink-0">
                  <p className="mb-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">Priorité</p>
                  <div className="grid grid-cols-2 gap-2">
                    <PriorityButton
                      active={priority === "standard"}
                      label="Standard"
                      activeClass="border-primary bg-primary text-primary-foreground"
                      onClick={() => setPriority("standard")}
                    />
                    <PriorityButton
                      active={priority === "urgent"}
                      label="Urgent"
                      activeClass="border-destructive bg-destructive text-white"
                      onClick={() => setPriority("urgent")}
                    />
                  </div>
                </div>

                {hasDiscrepancies && (
                  <div className="rounded-lg border border-warning/20 bg-warning-muted p-3 shrink-0 space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-warning">Écarts relevés</p>
                    {missingCount > 0 && (
                      <div className="flex items-center gap-2 text-xs font-medium text-destructive">
                        <span className="size-1.5 rounded-full bg-destructive shrink-0" />
                        {missingCount} instrument{missingCount > 1 ? "s" : ""} manquant{missingCount > 1 ? "s" : ""}
                      </div>
                    )}
                    {partialCount > 0 && (
                      <div className="flex items-center gap-2 text-xs font-medium text-warning">
                        <span className="size-1.5 rounded-full bg-warning shrink-0" />
                        {partialCount} quantité{partialCount > 1 ? "s" : ""} modifiée{partialCount > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                )}

                {!hasDiscrepancies && instruments.length > 0 && (
                  <div className="rounded-lg border border-secondary/20 bg-secondary-muted p-3 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-medium text-secondary">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      Contenu conforme à l&apos;attendu
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-card rounded-xl p-8 max-w-sm w-full shadow-lg border border-border animate-in zoom-in-95 duration-200">
            <div className="size-14 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-5 mx-auto">
              <AlertCircle className="size-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground text-center mb-2">Tout réinitialiser ?</h3>
            <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
              Êtes-vous sûr de vouloir effacer toutes les données de ce lot ? Cette action est irréversible.
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

      {/* Demo toolbox */}
      {quickActionLabel && (
        <div className="fixed bottom-32 right-6 z-[100]">
          <div className="bg-card rounded-xl p-2.5 shadow-lg border border-border flex flex-col gap-2 min-w-[160px]">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-center">Demo</p>
            <button
              onClick={triggerSimulation}
              className="interactive-primary flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
            >
              {quickActionLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted px-2.5 py-1.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ScanPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted text-muted-foreground p-4">
      <p className="px-2 text-center text-xs font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

function PriorityButton({
  active, label, activeClass, onClick,
}: {
  active: boolean; label: string; activeClass: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-lg border-2 py-1.5 px-3 text-xs font-medium uppercase tracking-wide transition-all ${
        active ? activeClass : "border-border bg-card text-muted-foreground hover:border-primary/30"
      }`}
    >
      {label}
    </button>
  );
}

function InstrumentTable({
  rows,
  onToggleMissing,
  onUpdateQuantity,
  onDelete,
}: {
  rows: InstrumentLine[];
  onToggleMissing: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
}) {
  const missingCount = rows.filter(r => r.status === "missing").length;
  const partialCount = rows.filter(r => r.status === "partial").length;

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-muted px-3 py-1.5 shrink-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Instruments identifiés
        </span>
        <div className="flex items-center gap-1">
          {missingCount > 0 && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-medium text-white">
              {missingCount} manquant{missingCount > 1 ? "s" : ""}
            </span>
          )}
          {partialCount > 0 && (
            <span className="rounded-full bg-warning px-2 py-0.5 text-[10px] font-medium text-white">
              {partialCount} qté modifiée{partialCount > 1 ? "s" : ""}
            </span>
          )}
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
            {rows.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left table-fixed border-collapse">
          <thead className="sticky top-0 z-10 border-b border-border bg-card">
            <tr>
              <th className="w-[85px] px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Qté</th>
              <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Nom</th>
              <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Désignation</th>
              <th className="w-8 px-2 py-1.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`text-xs transition-colors group ${
                  row.status === "missing" ? "bg-destructive/5" :
                  row.status === "partial" ? "bg-warning/5" :
                  row.status === "added" ? "bg-warning/5" :
                  "hover:bg-muted"
                }`}
              >
                <td className="px-2 py-1">
                  <div className="flex items-center justify-center gap-1 rounded-lg bg-muted border border-border p-0.5">
                    <button
                      onClick={() => onUpdateQuantity(row.id, -1)}
                      className="flex h-5 w-5 items-center justify-center rounded-md bg-card text-muted-foreground border border-border hover:text-primary hover:border-primary transition-all active:scale-90"
                    >
                      <Minus className="size-2.5" />
                    </button>
                    <span className={`w-4 text-center font-semibold text-xs ${
                      row.status === "missing" ? "text-destructive line-through" :
                      row.status === "partial" ? "text-warning" :
                      row.status === "added" ? "text-warning" :
                      "text-primary"
                    }`}>
                      {row.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(row.id, 1)}
                      className="flex h-5 w-5 items-center justify-center rounded-md bg-card text-muted-foreground border border-border hover:text-primary hover:border-primary transition-all active:scale-90"
                    >
                      <Plus className="size-2.5" />
                    </button>
                  </div>
                </td>
                <td className={`px-2 py-1.5 font-medium truncate ${
                  row.status === "missing" ? "text-destructive line-through" : "text-foreground"
                }`}>
                  {row.name}
                </td>
                <td className={`px-2 py-1.5 truncate ${
                  row.status === "missing" ? "text-destructive/50" :
                  row.status === "partial" ? "text-warning" :
                  row.status === "added" ? "text-warning" :
                  "text-muted-foreground"
                }`}>
                  {row.status === "partial"
                    ? <span>{row.designation} <span className="text-[10px] text-warning font-medium">(attendu: ×{row.expectedQuantity})</span></span>
                    : row.designation}
                </td>
                <td className="px-2 py-1.5 text-center">
                  {row.status === "added" ? (
                    <button
                      onClick={() => onDelete(row.id)}
                      className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggleMissing(row.id)}
                      title={row.status === "missing" ? "Marquer comme présent" : "Marquer comme manquant"}
                      className={`flex h-6 w-6 items-center justify-center rounded-md transition-all active:scale-90 ${
                        row.status === "missing"
                          ? "text-destructive bg-destructive/10 hover:bg-destructive/20"
                          : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      }`}
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function StepNode({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-3">
      <div className={`size-2.5 rounded-full border-2 transition-all ${
        done
          ? "bg-primary border-primary"
          : active
          ? "bg-card border-primary ring-2 ring-primary/20"
          : "bg-card border-border"
      }`} />
      <span className={`text-[9px] font-medium uppercase tracking-wide whitespace-nowrap ${
        done ? "text-primary" : active ? "text-foreground" : "text-muted-foreground"
      }`}>
        {label}
      </span>
    </div>
  );
}

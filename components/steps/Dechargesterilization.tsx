"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFooterActions } from "@/contexts/FooterActionsContext";
import {
  RotateCcw,
  AlertCircle,
  ChevronLeft,
  CheckCircle2,
  X,
  Package,
  Loader2,
} from "lucide-react";

interface ConformityChecks {
  passage: boolean;
  physico: boolean;
  siccite: boolean;
  integrite: boolean;
}

interface DechargesterilizationProps {
  onPhaseChange?: (phase: 1 | 2) => void;
  onValidated?: (isValid: boolean) => void;
}

export function Dechargesterilization({ onValidated }: DechargesterilizationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [qualified, setQualified] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/qualification/today?machineId=AUTOCLAVE-02")
      .then((r) => r.json())
      .then((d) => setQualified(!!d.qualified))
      .catch(() => setQualified(false));
  }, []);

  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [checks, setChecks] = useState<ConformityChecks>({
    passage: false,
    physico: false,
    siccite: false,
    integrite: false,
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [loadEventId, setLoadEventId] = useState<string | null>(null);
  const [loadedTrays, setLoadedTrays] = useState<string[]>([]);
  const [trayInfoMap, setTrayInfoMap] = useState<Record<string, string>>({});
  const [loadingTrays, setLoadingTrays] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedEventId = localStorage.getItem("sterilization_load_event_id");
    if (!storedEventId) return;
    setLoadEventId(storedEventId);
    setLoadingTrays(true);
    fetch(`/api/sterilization/load/${storedEventId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.load?.trays?.length) {
          setLoadedTrays(data.load.trays);
          if (data.load.trayDetails) {
            setTrayInfoMap(
              Object.fromEntries(
                (data.load.trayDetails as { serial: string; label: string }[]).map((d) => [d.serial, d.label])
              )
            );
          }
        }
      })
      .finally(() => setLoadingTrays(false));
  }, []);

  const toggleCheck = (key: keyof ConformityChecks) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksValid = checks.passage && checks.physico && checks.siccite && checks.integrite;
  const isCycleValidated = scannedItems.length > 0 && allChecksValid;

  useEffect(() => {
    onValidated?.(isCycleValidated);
  }, [isCycleValidated, onValidated]);

  const handleGlobalReset = () => {
    setScannedItems([]);
    setChecks({ passage: false, physico: false, siccite: false, integrite: false });
    setShowResetConfirm(false);
  };

  const handleSubmit = async () => {
    if (!loadEventId) {
      setSaveError("Aucun chargement trouvé — revenez à l'étape de chargement");
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/sterilization/unload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loadEventId,
          operatorBadge: user?.badgeCode ?? "BADGE-001",
          checks,
          trays: scannedItems,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setSaveError(err.error ?? "Erreur lors de la validation");
        return;
      }
      localStorage.removeItem("sterilization_load_event_id");
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const simulateCheckAll = () =>
    setChecks({ passage: true, physico: true, siccite: true, integrite: true });

  const simulateItemScan = () => {
    if (loadedTrays.length > 0 && scannedItems.length < loadedTrays.length) {
      setScannedItems((prev) => [...prev, loadedTrays[scannedItems.length]]);
    }
  };

  const noLoadFound = !loadingTrays && !loadEventId;

  const submitRef = useRef<() => Promise<void>>(async () => {});
  submitRef.current = handleSubmit;
  const stableSubmit = useCallback(async () => { await submitRef.current(); }, []);
  const stableReset = useCallback(() => setShowResetConfirm(true), []);
  const { setOverride } = useFooterActions();

  useEffect(() => {
    setOverride({
      submitLabel: "Libérer la charge",
      submittingLabel: "Enregistrement...",
      doneLabel: "Étape suivante",
      onSubmit: stableSubmit,
      isReady: isCycleValidated && !saving,
      isSubmitting: saving,
      isDone: saved,
      onReset: stableReset,
      saveError: saveError,
    });
    return () => setOverride(null);
  }, [isCycleValidated, saving, saved, saveError, stableSubmit, stableReset, setOverride]);

  if (noLoadFound) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 text-center px-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-warning-muted border border-warning/20">
          <AlertCircle className="size-8 text-warning" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Aucun chargement actif</p>
          <p className="text-sm font-medium text-muted-foreground mt-2 max-w-sm leading-relaxed">
            Vous devez d&apos;abord compléter la phase de chargement avant de valider la sortie.
          </p>
        </div>
        <button
          onClick={() => navigate("/sterilization-chargement")}
          className="interactive-muted flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-medium uppercase tracking-wide"
        >
          <ChevronLeft className="size-4" />
          Retour au chargement
        </button>
      </div>
    );
  }

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
        <p className="mt-1 text-sm font-medium text-muted-foreground">La qualification journalière du stérilisateur n&apos;a pas encore été effectuée.</p>
      </div>
      <button onClick={() => navigate("/qualification")} className="interactive-primary flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-medium uppercase tracking-wide">
        Aller à la qualification
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden relative">

      {/* Demo simulation panel */}
      <div className="fixed bottom-32 right-6 z-[100]">
        <div className="bg-card rounded-xl p-2.5 shadow-lg border border-border flex flex-col gap-2 min-w-[160px]">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-center">Demo</p>
          <button onClick={simulateCheckAll} className="interactive-muted flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium">
            Checks OK
          </button>
          <button
            onClick={simulateItemScan}
            disabled={loadedTrays.length === 0 || scannedItems.length >= loadedTrays.length}
            className="interactive-primary flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:border disabled:border-border"
          >
            Scanner objet
          </button>
        </div>
      </div>

      <div className="shrink-0 flex items-center px-1">
        <StepNode label="Scan sortie" done={scannedItems.length > 0} active={scannedItems.length === 0} />
        <div className={`flex-1 h-px transition-colors ${scannedItems.length > 0 ? "bg-primary" : "bg-border"}`} />
        <StepNode label="Conformité" done={allChecksValid} active={scannedItems.length > 0 && !allChecksValid} />
      </div>

      <header className="shrink-0 flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-1">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
            Phase 04 · Déchargement
          </div>
          <h1 className="text-base font-semibold text-foreground">
            Sortie Autoclave &amp; Libération
          </h1>
        </div>
        <div className="flex rounded-lg border border-border bg-muted p-1 gap-1 shrink-0">
          <button
            onClick={() => navigate("/sterilization-chargement")}
            className={`px-4 py-1.5 rounded-md text-xs font-medium uppercase tracking-wide transition-all ${
              location.pathname === "/sterilization-chargement" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Chargement
          </button>
          <button
            onClick={() => navigate("/sterilization-sortie")}
            className={`px-4 py-1.5 rounded-md text-xs font-medium uppercase tracking-wide transition-all ${
              location.pathname === "/sterilization-sortie" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Validation
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">

        {/* LEFT: Scan items */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-[10px] font-medium uppercase tracking-wide text-foreground">Scan Sortie</h2>
            {scannedItems.length > 0 && (
              <button
                onClick={() => setScannedItems([])}
                className="interactive-muted flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium uppercase tracking-wide"
              >
                <RotateCcw className="size-3" />
                Réinitialiser
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {loadingTrays ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <p className="text-[10px] font-medium uppercase tracking-wide">Chargement du cycle...</p>
              </div>
            ) : scannedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted text-muted-foreground p-4">
                <Package className="size-8 opacity-30" />
                <p className="text-[10px] font-medium uppercase tracking-wide text-center">En attente scan sortie</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {scannedItems.map((item, i) => (
                  <div key={i} className="group relative flex items-center gap-3 rounded-lg border border-secondary/20 bg-secondary-muted p-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                      <Package className="size-4 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{item}</p>
                      <p className="text-[10px] font-medium text-secondary uppercase tracking-wide mt-0.5">
                        {trayInfoMap[item] ?? "—"}
                      </p>
                    </div>
                    <CheckCircle2 className="size-4 text-secondary shrink-0" />
                    <button
                      onClick={() => setScannedItems((prev) => prev.filter((_, idx) => idx !== i))}
                      className="shrink-0 size-5 rounded-full bg-destructive text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {scannedItems.length > 0 && (
            <div className="shrink-0 mt-3 rounded-lg border border-border bg-muted p-3 text-center">
              <p className="text-[10px] font-medium text-primary uppercase tracking-wide">
                {scannedItems.length} / {loadedTrays.length} objet(s) scanné(s)
              </p>
            </div>
          )}
        </section>

        {/* RIGHT: Conformity checks + Agent */}
        <div className="flex flex-col gap-4 min-h-0 overflow-hidden">

          {/* Conformity checks */}
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[10px] font-medium uppercase tracking-wide text-foreground">Contrôles de conformité</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CheckButton active={checks.passage} label="Indicateurs de passage" onClick={() => toggleCheck("passage")} />
              <CheckButton active={checks.physico} label="Physico-Chimiques" onClick={() => toggleCheck("physico")} />
              <CheckButton active={checks.siccite} label="Siccité emballage" onClick={() => toggleCheck("siccite")} />
              <CheckButton active={checks.integrite} label="Intégrité Condit." onClick={() => toggleCheck("integrite")} />
            </div>
          </section>

        </div>
      </div>

      {/* Reset modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" onClick={() => setShowResetConfirm(false)} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[101] bg-card rounded-xl border border-border p-6 max-w-sm w-full shadow-lg animate-in zoom-in-95 duration-200">
            <div className="size-14 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-5 mx-auto">
              <AlertCircle className="size-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground text-center mb-2">Tout effacer ?</h3>
            <p className="text-sm font-medium text-muted-foreground text-center mb-6">
              Êtes-vous sûr de vouloir effacer toutes les données de déchargement pour ce cycle ?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="interactive-muted py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide"
              >
                Annuler
              </button>
              <button
                onClick={handleGlobalReset}
                className="interactive-danger py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
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

function CheckButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
        active ? "border-secondary bg-secondary-muted text-secondary" : "border-border bg-card text-muted-foreground"
      }`}
    >
      <div className={`flex size-4 shrink-0 items-center justify-center rounded border-2 text-[10px] ${
        active ? "border-secondary bg-secondary text-secondary-foreground" : "border-border"
      }`}>
        {active && "✓"}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

"use client";

import { type ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFooterActions } from "@/contexts/FooterActionsContext";
import {
  Pencil,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

type DashboardSectionProps = {
  title: string;
  scanned: boolean;
  children: ReactNode;
  forceShow?: boolean;
};

type DataCardProps = {
  label: string;
  value: string;
};

type StatusButtonProps = {
  active: boolean;
  onClick: () => void;
  label: string;
  variant: "secondary" | "warning";
};

type CheckItemProps = {
  label: string;
  checked: boolean;
  onClick: () => void;
};

type WashingMode = "AUTOMATIQUE" | "MANUEL" | "ULTRASONS";

type UltrasonicParameters = {
  temperature: string;
  duration: string;
};

const WASHING_TRACE_STORAGE_KEY = "washing_cycle_trace";
const AUTO_CYCLE_DEFAULT = "Cycle standard instruments";
const WASHING_MODE_OPTIONS: Array<{
  value: WashingMode;
  label: string;
  description: string;
}> = [
  {
    value: "AUTOMATIQUE",
    label: "AUTOMATIQUE",
    description: "Laveur-desinfecteur standard",
  },
  {
    value: "MANUEL",
    label: "MANUEL",
    description: "Brossage manuel",
  },
  {
    value: "ULTRASONS",
    label: "ULTRASONS",
    description: "Bain a ultrasons par cavitation",
  },
];

function formatWashingMode(mode: WashingMode) {
  if (mode === "AUTOMATIQUE") return "Automatique";
  if (mode === "MANUEL") return "Manuel";
  return "Ultrasons";
}

interface LavageWizardProps {
  initialPhase?: 1 | 2;
  onPhaseChange?: (phase: 1 | 2) => void;
  onValidated?: (isValid: boolean) => void;
}

export function LavageWizard({ initialPhase = 1, onPhaseChange, onValidated }: LavageWizardProps) {
  const [phase, setPhase] = useState<1 | 2>(initialPhase); // 1: Chargement (Entrée), 2: Déchargement (Sortie)
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qualified, setQualified] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/qualification/today?machineId=AUTOCLAVE-02")
      .then((r) => r.json())
      .then((d) => setQualified(!!d.qualified))
      .catch(() => setQualified(false));
  }, []);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setPhase(initialPhase);
  }, [initialPhase]);

  const handlePhaseChange = (newPhase: 1 | 2) => {
    setPhase(newPhase);
    onPhaseChange?.(newPhase);
    if (newPhase === 1) navigate("/lavage-chargement");
    else navigate("/lavage-sortie");
  };
  
  const [panierScanned, setPanierScanned] = useState(false);
  const [laveurScanned, setLaveurScanned] = useState(false);
  const [washingModes, setWashingModes] = useState<WashingMode[]>(["AUTOMATIQUE"]);
  const [selectedAutoCycle, setSelectedAutoCycle] = useState(AUTO_CYCLE_DEFAULT);
  const [manualChecks, setManualChecks] = useState({
    dosage: false,
    brushing: false,
    rinsing: false
  });
  const [ultrasonicParameters, setUltrasonicParameters] = useState<UltrasonicParameters>({
    temperature: "",
    duration: "",
  });
  const [laveurStatus, setLaveurStatus] = useState<"ready" | "maintenance">("ready");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loadedTrays, setLoadedTrays] = useState<string[]>([]);
  const [trayScanInput, setTrayScanInput] = useState("");

  const isAutomaticOnly = washingModes.length === 1 && washingModes[0] === "AUTOMATIQUE";
  const includesManual = washingModes.includes("MANUEL");
  const includesUltrasons = washingModes.includes("ULTRASONS");
  const isManualProtocolComplete = !includesManual || (manualChecks.dosage && manualChecks.brushing && manualChecks.rinsing);
  const isUltrasonicProtocolComplete =
    !includesUltrasons ||
    (ultrasonicParameters.temperature.trim().length > 0 &&
      ultrasonicParameters.duration.trim().length > 0);
  const areCombinedProtocolsComplete = isManualProtocolComplete && isUltrasonicProtocolComplete;
  const activeWashingModeLabels = washingModes.map(formatWashingMode);

  const toggleWashingMode = (mode: WashingMode) => {
    setWashingModes((previousModes) => {
      if (previousModes.includes(mode)) {
        if (previousModes.length === 1) return previousModes;
        return previousModes.filter((currentMode) => currentMode !== mode);
      }

      if (mode === "AUTOMATIQUE") {
        return ["AUTOMATIQUE"];
      }

      return [...previousModes.filter((currentMode) => currentMode !== "AUTOMATIQUE"), mode];
    });
  };

  useEffect(() => {
    localStorage.setItem(
      WASHING_TRACE_STORAGE_KEY,
      JSON.stringify({
        mode: washingModes.join(","),
        machineCode: "LAVEUSE-01",
        cycleName: isAutomaticOnly ? selectedAutoCycle : null,
        temperature: includesUltrasons ? ultrasonicParameters.temperature : null,
        duration: includesUltrasons ? ultrasonicParameters.duration : null,
        washing_mode: activeWashingModeLabels,
        laveur_status: isAutomaticOnly ? laveurStatus : null,
        updated_at: new Date().toISOString(),
      }),
    );
  }, [
    activeWashingModeLabels,
    includesManual,
    includesUltrasons,
    isAutomaticOnly,
    laveurStatus,
    manualChecks,
    selectedAutoCycle,
    ultrasonicParameters,
  ]);

  const handleGlobalReset = () => {
    if (phase === 1) {
      setPanierScanned(false);
      setLaveurScanned(false);
      setWashingModes(["AUTOMATIQUE"]);
      setSelectedAutoCycle(AUTO_CYCLE_DEFAULT);
      setManualChecks({ dosage: false, brushing: false, rinsing: false });
      setUltrasonicParameters({ temperature: "", duration: "" });
      setLaveurStatus("ready");
      setLoadedTrays([]);
      setTrayScanInput("");
    } else {
      setSortieCycleValidated(false);
      setSortiePanierScanned(false);
      setConformity({
        programme: false,
        parameters: false,
        dosage: false,
        stability: false,
        cleanliness: false
      });
    }
    setShowResetConfirm(false);
  };

  const [sortieCycleValidated, setSortieCycleValidated] = useState(false);
  const [sortiePanierScanned, setSortiePanierScanned] = useState(false);
  const [conformity, setConformity] = useState({
    programme: false,
    parameters: false,
    dosage: false,
    stability: false,
    cleanliness: false
  });

  const handlePhase1Submit = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch("/api/lavage/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: washingModes.join(","),
          machineCode: "LAVEUSE-01",
          cycleName: isAutomaticOnly ? selectedAutoCycle : null,
          temperature: includesUltrasons ? ultrasonicParameters.temperature : null,
          duration: includesUltrasons ? ultrasonicParameters.duration : null,
          operatorBadge: user?.badgeCode ?? "BADGE-001",
          trays: loadedTrays,
        }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? "Erreur serveur")
      }
      const { eventId } = (await res.json()) as { eventId: string }
      navigate(`/lavage-sortie?eventId=${eventId}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setSaving(false)
    }
  }

  const handlePhase2Submit = async () => {
    const eventId = searchParams.get("eventId")
    if (!eventId) {
      setSaveError("Session de lavage introuvable — recommencez depuis le chargement.")
      return
    }
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/lavage/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conformiteProgramme: conformity.programme,
          conformiteParametres: conformity.parameters,
          conformitePosition: conformity.dosage,
          conformiteSiccite: conformity.stability,
          conformiteVisuelle: conformity.cleanliness,
          validatedByBadge: user?.badgeCode ?? "BADGE-001",
        }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? "Erreur serveur")
      }
      setSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setSaving(false)
    }
  }

  const triggerSimulation = () => {
    if (phase === 1) {
      if (!panierScanned) {
        setPanierScanned(true);
        if (loadedTrays.length === 0) setLoadedTrays(["TRAY-CHI-001"]);
      }
      else if (!isAutomaticOnly) {
        if (!areCombinedProtocolsComplete) {
          setManualChecks({ dosage: true, brushing: true, rinsing: true });
          if (includesUltrasons) {
            setUltrasonicParameters({ temperature: "45", duration: "10" });
          }
        }
      }
      else if (!laveurScanned) setLaveurScanned(true);
      else if (laveurStatus !== "ready") setLaveurStatus("ready");
    } else {
      if (!sortieCycleValidated) {
        setConformity({ programme: true, parameters: true, dosage: true, stability: true, cleanliness: true });
        setSortieCycleValidated(true);
      }
      else if (!sortiePanierScanned) setSortiePanierScanned(true);
    }
  };

  const isPhase1Complete = isAutomaticOnly
    ? panierScanned && loadedTrays.length > 0 && laveurScanned && laveurStatus === "ready"
    : panierScanned && loadedTrays.length > 0 && areCombinedProtocolsComplete;
  const isPhase2Complete = sortieCycleValidated && sortiePanierScanned;

  useEffect(() => {
    onValidated?.(phase === 1 ? isPhase1Complete : isPhase2Complete);
  }, [phase, isPhase1Complete, isPhase2Complete, onValidated]);
  const quickActionLabel =
    phase === 1
      ? !panierScanned
        ? "Scanner le panier"
        : !isAutomaticOnly
          ? !areCombinedProtocolsComplete
            ? "Completer le protocole"
            : null
          : !laveurScanned
            ? "Scanner le laveur"
            : laveurStatus !== "ready"
              ? "Remettre le laveur pret"
              : null
      : !sortieCycleValidated
        ? "Valider conformité"
        : !sortiePanierScanned
          ? "Scanner sortie"
          : null;
  const phaseSubmitRef = useRef<() => Promise<void>>(async () => {});
  phaseSubmitRef.current = phase === 1 ? handlePhase1Submit : handlePhase2Submit;
  const stableSubmit = useCallback(async () => { await phaseSubmitRef.current(); }, []);
  const stableReset = useCallback(() => setShowResetConfirm(true), []);
  const { setOverride } = useFooterActions();

  useEffect(() => {
    const isReady = phase === 1 ? isPhase1Complete : isPhase2Complete;
    setOverride({
      submitLabel: phase === 1 ? "Valider le chargement" : "Valider la sortie",
      submittingLabel: "Enregistrement...",
      doneLabel: "Étape suivante",
      onSubmit: stableSubmit,
      isReady,
      isSubmitting: saving,
      isDone: saved,
      onReset: stableReset,
      saveError,
    });
    return () => setOverride(null);
  }, [phase, isPhase1Complete, isPhase2Complete, saving, saved, saveError, stableSubmit, stableReset, setOverride]);

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
                Phase 03 · Nettoyage
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                {phase === 1 ? "Entrée Laveur" : "Sortie Laveur"}
              </h1>
            </div>
            <div className="flex rounded-lg border border-border bg-muted p-1 shrink-0">
              <button
                onClick={() => handlePhaseChange(1)}
                className={`px-4 py-2 rounded-md text-xs font-medium uppercase tracking-wide transition-all ${location.pathname === "/lavage-chargement" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Chargement
              </button>
              <button
                onClick={() => handlePhaseChange(2)}
                disabled={phase === 1 && !searchParams.get("eventId")}
                className={`px-4 py-2 rounded-md text-xs font-medium uppercase tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed ${location.pathname === "/lavage-sortie" ? "bg-secondary text-secondary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Déchargement
              </button>
            </div>
          </div>

          {phase === 1 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">Mode de lavage</p>
              <div className="grid gap-2 md:grid-cols-3">
                {WASHING_MODE_OPTIONS.map((option) => {
                  const selected = washingModes.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleWashingMode(option.value)}
                      className={`rounded-lg border-2 px-3 py-2.5 text-left transition-all ${
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border-2 text-[10px] transition-all ${
                          selected ? "border-primary-foreground bg-primary-foreground/20 text-primary-foreground" : "border-border"
                        }`}>
                          {selected && "✓"}
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide">{option.label}</p>
                          <p className={`mt-0.5 text-xs ${selected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{option.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                AUTOMATIQUE est exclusif. MANUEL et ULTRASONS peuvent être combinés.
              </p>
            </div>
          )}
        </section>

      </header>

      {phase === 1 && (
        <div className="shrink-0 flex items-center px-1">
          <StepNode label="Panier" done={panierScanned} active={!panierScanned} />
          <div className={`flex-1 h-px transition-colors ${panierScanned ? "bg-primary" : "bg-border"}`} />
          <StepNode
            label={isAutomaticOnly ? "Laveur" : "Protocole"}
            done={isAutomaticOnly ? laveurScanned : areCombinedProtocolsComplete}
            active={panierScanned && !(isAutomaticOnly ? laveurScanned : areCombinedProtocolsComplete)}
          />
        </div>
      )}
      {phase === 2 && (
        <div className="shrink-0 flex items-center px-1">
          <StepNode label="Conformité" done={sortieCycleValidated} active={!sortieCycleValidated} />
          <div className={`flex-1 h-px transition-colors ${sortieCycleValidated ? "bg-primary" : "bg-border"}`} />
          <StepNode label="Traçabilité" done={sortiePanierScanned} active={sortieCycleValidated && !sortiePanierScanned} />
        </div>
      )}

      <div className="flex-1 grid gap-4 lg:grid-cols-2 min-h-0 overflow-hidden">
        {phase === 1 && (
          <>
            <DashboardSection
              title={isAutomaticOnly ? "Panier" : "Scan Instruments"}
              scanned={panierScanned}
              onEdit={() => setPanierScanned(false)}
            >
              <div className="flex flex-col h-full space-y-3 animate-in fade-in duration-300 overflow-hidden">
                {!isAutomaticOnly && (
                  <div className="bg-warning-muted border border-warning/20 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="size-4 text-warning shrink-0" />
                    <p className="text-xs font-medium text-warning">
                      {includesManual && includesUltrasons ? "Protocole combiné thermo-sensible actif" : "Protocole thermo-sensible requis"}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Plateaux chargés</p>
                  <div className="flex gap-2">
                    <input
                      value={trayScanInput}
                      onChange={(e) => setTrayScanInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const ref = trayScanInput.trim().toUpperCase();
                          if (ref && !loadedTrays.includes(ref)) setLoadedTrays((p) => [...p, ref]);
                          setTrayScanInput("");
                        }
                      }}
                      placeholder="Scanner ou saisir le plateau"
                      className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const ref = trayScanInput.trim().toUpperCase();
                        if (ref && !loadedTrays.includes(ref)) setLoadedTrays((p) => [...p, ref]);
                        setTrayScanInput("");
                      }}
                      disabled={!trayScanInput.trim()}
                      className="interactive-primary rounded-lg px-3 py-2.5 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {loadedTrays.length === 0 ? (
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted py-6">
                      <p className="text-xs font-medium text-muted-foreground">Aucun plateau chargé</p>
                    </div>
                  ) : (
                    loadedTrays.map((ref) => (
                      <div key={ref} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-secondary" />
                          <p className="text-sm font-semibold text-foreground">{ref}</p>
                        </div>
                        <button type="button" onClick={() => setLoadedTrays((p) => p.filter((t) => t !== ref))} className="interactive-muted rounded-md p-1">
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DashboardSection>

            <DashboardSection
              title={isAutomaticOnly ? "Laveur" : includesManual && includesUltrasons ? "Protocoles combinés" : includesUltrasons ? "Bain à ultrasons" : "Protocole manuel"}
              scanned={isAutomaticOnly ? laveurScanned : areCombinedProtocolsComplete}
              onEdit={() => isAutomaticOnly ? setLaveurScanned(false) : (setManualChecks({ dosage: false, brushing: false, rinsing: false }), setUltrasonicParameters({ temperature: "", duration: "" }))}
              forceShow={!isAutomaticOnly}
            >
              {!isAutomaticOnly ? (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {includesManual && (
                    <>
                      <CheckItem label="Dosage détergent & Temp. eau" checked={manualChecks.dosage} onClick={() => setManualChecks({ ...manualChecks, dosage: !manualChecks.dosage })} />
                      <CheckItem label="Brossage mécanique minutieux" checked={manualChecks.brushing} onClick={() => setManualChecks({ ...manualChecks, brushing: !manualChecks.brushing })} />
                      <CheckItem label="Rinçage abondant & séchage" checked={manualChecks.rinsing} onClick={() => setManualChecks({ ...manualChecks, rinsing: !manualChecks.rinsing })} />
                    </>
                  )}
                  {includesUltrasons && (
                    <div className="rounded-lg border border-primary/20 bg-primary-muted p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-primary">Paramètres Ultrasons</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">Conditions du bain pour la traçabilité.</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isUltrasonicProtocolComplete ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}>
                          {isUltrasonicProtocolComplete ? "Complété" : "En attente"}
                        </span>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <label className="block">
                          <span className="text-xs font-medium text-muted-foreground">Température (°C)</span>
                          <input type="number" min="0" value={ultrasonicParameters.temperature}
                            onChange={(e) => setUltrasonicParameters({ ...ultrasonicParameters, temperature: e.target.value })}
                            className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-primary"
                            placeholder="Ex: 45" />
                        </label>
                        <label className="block">
                          <span className="text-xs font-medium text-muted-foreground">Durée (min)</span>
                          <input type="number" min="0" value={ultrasonicParameters.duration}
                            onChange={(e) => setUltrasonicParameters({ ...ultrasonicParameters, duration: e.target.value })}
                            className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-primary"
                            placeholder="Ex: 10" />
                        </label>
                      </div>
                    </div>
                  )}
                  <div className="p-3 bg-muted border border-border rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground text-center">
                      {includesManual && includesUltrasons ? "Respecter les temps de contact et la séquence du bain" : "Respecter les temps de contact"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <DataCard label="Machine" value="LAVEUSE-01" />
                  <label className="block">
                    <span className="text-xs font-medium text-muted-foreground">Cycle standard</span>
                    <select value={selectedAutoCycle} onChange={(e) => setSelectedAutoCycle(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-primary">
                      <option value="Cycle standard instruments">Cycle standard instruments</option>
                      <option value="Cycle microchirurgie">Cycle microchirurgie</option>
                      <option value="Cycle rincage renforce">Cycle rinçage renforcé</option>
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <StatusButton active={laveurStatus === "ready"} onClick={() => setLaveurStatus(laveurStatus === "ready" ? "maintenance" : "ready")} variant="secondary" label="Prêt" />
                    <StatusButton active={laveurStatus === "maintenance"} onClick={() => setLaveurStatus("maintenance")} variant="warning" label="Maintenance" />
                  </div>
                </div>
              )}
            </DashboardSection>
          </>
        )}

        {phase === 2 && (
          <>
            <DashboardSection title="Conformité" scanned={sortieCycleValidated} forceShow onEdit={() => setSortieCycleValidated(false)}>
              <div className="flex flex-col h-full space-y-3 animate-in fade-in duration-300 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                  <CheckItem label="Conformité du programme : programme de nettoyage validé." checked={conformity.programme} onClick={() => setConformity({ ...conformity, programme: !conformity.programme })} />
                  <CheckItem label="Paramètres critiques : température, A0, pression et dosages conformes." checked={conformity.parameters} onClick={() => setConformity({ ...conformity, parameters: !conformity.parameters })} />
                  <CheckItem label="Positionnement de la charge : matériel en position correcte." checked={conformity.dosage} onClick={() => setConformity({ ...conformity, dosage: !conformity.dosage })} />
                  <CheckItem label="Siccité de la charge : absence totale d'humidité résiduelle." checked={conformity.stability} onClick={() => setConformity({ ...conformity, stability: !conformity.stability })} />
                  <CheckItem label="Propreté visuelle : absence de résidus ou de souillures." checked={conformity.cleanliness} onClick={() => setConformity({ ...conformity, cleanliness: !conformity.cleanliness })} />
                </div>
                <button
                  onClick={() => setSortieCycleValidated(true)}
                  className={`shrink-0 w-full rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide transition-all ${Object.values(conformity).every(v => v) ? "interactive-secondary" : "bg-muted text-muted-foreground cursor-not-allowed border border-border"}`}
                >
                  Valider Conformité
                </button>
              </div>
            </DashboardSection>

            <DashboardSection title="Traçabilité" scanned={sortiePanierScanned} onEdit={() => setSortiePanierScanned(false)}>
              <div className="space-y-3 animate-in fade-in duration-300">
                {loadedTrays.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Plateaux lavés</p>
                    {loadedTrays.map((ref) => (
                      <div key={ref} className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2.5">
                        <CheckCircle2 className="size-4 text-secondary shrink-0" />
                        <p className="text-sm font-semibold text-foreground">{ref}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-border bg-muted p-4 text-center">
                    <p className="text-xs font-medium text-muted-foreground">Aucun plateau enregistré</p>
                  </div>
                )}
                <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-primary/20 bg-primary-muted p-5 text-center">
                  <CheckCircle2 className="size-6 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase">Charge validée</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Cycle LD-12333</p>
                  </div>
                </div>
              </div>
            </DashboardSection>
          </>
        )}
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

      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-card rounded-xl p-8 max-w-sm w-full shadow-lg border border-border animate-in zoom-in-95 duration-200">
            <div className="size-14 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-5 mx-auto">
              <AlertCircle className="size-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground text-center mb-2">Tout effacer ?</h3>
            <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
              Êtes-vous sûr de vouloir effacer toutes les données pour ce cycle de lavage ?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="interactive-muted py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide">Annuler</button>
              <button onClick={handleGlobalReset} className="interactive-danger py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSection({ title, scanned, children, forceShow, onEdit }: DashboardSectionProps & { onEdit?: () => void }) {
  return (
    <section className={`bg-card p-5 rounded-xl border shadow-sm transition-all duration-300 flex flex-col overflow-hidden ${scanned ? "border-secondary" : "border-border"}`}>
      <div className="mb-4 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-2">
          {scanned && (
            <button
              onClick={onEdit}
              className="interactive-muted flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium"
            >
              <Pencil className="size-3" />
              Modifier
            </button>
          )}
          {scanned && <span className="rounded-full border border-secondary/20 bg-secondary-muted px-2.5 py-0.5 text-[10px] font-medium uppercase text-secondary">Validé</span>}
        </div>
      </div>

      {!scanned && !forceShow ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted p-4">
          <p className="text-xs font-medium text-muted-foreground text-center">En attente de scan</p>
        </div>
      ) : children}
    </section>
  );
}

function DataCard({ label, value }: DataCardProps) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary-muted p-4 shrink-0">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-primary">{label}</p>
      <p className="text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function StatusButton({ active, onClick, label, variant }: StatusButtonProps) {
  const activeClass = variant === "secondary"
    ? "border-secondary bg-secondary text-secondary-foreground"
    : "border-warning bg-warning text-white";
  return (
    <button onClick={onClick} className={`flex items-center justify-center rounded-lg border-2 px-3 py-2.5 text-xs font-medium uppercase tracking-wide transition-all ${active ? activeClass : "border-border bg-muted text-muted-foreground"}`}>
      {label}
    </button>
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

function CheckItem({ label, checked, onClick }: CheckItemProps) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all shrink-0 ${checked ? "border-secondary bg-secondary-muted text-secondary" : "border-border bg-card text-muted-foreground"}`}>
      <div className={`flex size-4 shrink-0 items-center justify-center rounded border-2 transition-all text-[10px] ${checked ? "border-secondary bg-secondary text-secondary-foreground" : "border-border"}`}>
        {checked && "✓"}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

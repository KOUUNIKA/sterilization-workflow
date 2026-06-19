"use client";

import { type ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFooterActions } from "@/contexts/FooterActionsContext";
import {
  Pencil,
  AlertCircle,
  CheckCircle2,
  X,
  Package,
  Wrench,
  Thermometer,
} from "lucide-react";

type DashboardSectionProps = {
  title: string;
  scanned: boolean;
  icon: ReactNode;
  waitingText: string;
  children: ReactNode;
  forceShow?: boolean;
  onEdit?: () => void;
};

type DataCardProps = {
  label: string;
  value: string;
  color: "purple" | "emerald";
};

type StatusButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  color: "emerald" | "orange";
};

interface SterilizationWizardProps {
  onValidated?: (isValid: boolean) => void;
}

type BtCycleType = "Standard" | "Duo" | "Flex" | "Express";
type SteamCycleType = "instruments" | "caoutchouc";

type SteamCycleOption = {
  id: SteamCycleType;
  title: string;
  temp: string;
  duration: string;
  description: string;
};



export function SterilizationWizard({ onValidated }: SterilizationWizardProps) {
  const { user } = useAuth();
  const steamCycleOptions: SteamCycleOption[] = [
    {
      id: "instruments",
      title: "CYCLE INSTRUMENTS",
      temp: "134°C",
      duration: "18 min",
      description: "Standard instrumentation, stainless steel, and textiles.",
    },
    {
      id: "caoutchouc",
      title: "CYCLE CAOUTCHOUC",
      temp: "121°C",
      duration: "20 min",
      description: "Rubber, silicone, and heat-sensitive plastics.",
    },
  ];
  const navigate = useNavigate();
  const [qualified, setQualified] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/qualification/today?machineId=AUTOCLAVE-02")
      .then((r) => r.json())
      .then((d) => setQualified(!!d.qualified))
      .catch(() => setQualified(false));
  }, []);

  const [pendingTrays, setPendingTrays] = useState<{ serialNumber: string; label: string }[]>([]);

  useEffect(() => {
    fetch("/api/trays/pending-sterilization")
      .then((r) => r.json())
      .then((d) => setPendingTrays(d.trays ?? []))
      .catch(() => {});
  }, []);

  const [autoclaveStatus, setAutoclaveStatus] = useState<"ready" | "maintenance" | null>(null);
  const [sterilizationType, setSterilizationType] = useState<"vapeur" | "basse_temp">("vapeur");
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [btCycleType, setBtCycleType] = useState<BtCycleType>("Standard");
  const [cassetteData, setCassetteData] = useState({
    id: "",
    lotNumber: "",
    serialNumber: "",
    expiryDate: "",
    insertionDate: "",
    dosesRemaining: 0,
    dosesRequired: 1
  });
  const [showDoseHistory, setShowDoseHistory] = useState(false);
  const [doseConsumptionAnimating, setDoseConsumptionAnimating] = useState(false);
  const [doseHistory, setDoseHistory] = useState<
    { usedAt: string; doseUsed: number; loadEventId: string; loadTimestamp: string }[]
  >([]);
  const [btIncompatibilityError, setBtIncompatibilityError] = useState<string | null>(null);
  const [selectedSteamCycle, setSelectedSteamCycle] = useState<SteamCycleType | null>(null);
  const [steamCycleConfirmed, setSteamCycleConfirmed] = useState(false);
  const [sortingLoadMetadata, setSortingLoadMetadata] = useState<{
    highPrionRisk?: boolean;
    thermosensitive?: boolean;
  } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const formatDateFr = (dateValue: string) => {
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-FR");
  };

  const getDiscardDate = (openDate: string) => {
    const base = new Date(openDate);
    if (Number.isNaN(base.getTime())) return null;
    base.setDate(base.getDate() + 14);
    return base;
  };

  const discardDate = getDiscardDate(cassetteData.insertionDate);
  const isCassetteExpired = discardDate ? new Date() > discardDate : false;
  const isCassetteEmpty = cassetteData.id !== "" && cassetteData.dosesRemaining < cassetteData.dosesRequired;
  const normalizedScannedItems = scannedItems.map((item) => item.toUpperCase());
  const hasHighPrionRisk =
    Boolean(sortingLoadMetadata?.highPrionRisk) ||
    normalizedScannedItems.some((item) => item.includes("PRION"));
  const hasThermosensitiveLoad =
    Boolean(sortingLoadMetadata?.thermosensitive) ||
    normalizedScannedItems.some(
      (item) =>
        item.includes("THERMO") ||
        item.includes("CAOUTCHOUC") ||
        item.includes("RUBBER") ||
        item.includes("PLASTIC") ||
        item.includes("SILICONE"),
    );
  const recommendedSteamCycle: SteamCycleType = hasHighPrionRisk
    ? "instruments"
    : hasThermosensitiveLoad
      ? "caoutchouc"
      : "instruments";
  const selectedSteamCycleOption =
    steamCycleOptions.find((option) => option.id === selectedSteamCycle) ?? null;
  const handleGlobalReset = () => {
    setScannedItems([]);
    setAutoclaveStatus(null);
    setSelectedSteamCycle(null);
    setSteamCycleConfirmed(false);
    setCassetteData(prev => ({
      ...prev,
      id: "",
      lotNumber: "",
      serialNumber: "",
    }));
    setShowDoseHistory(false);
    setDoseConsumptionAnimating(false);
    setShowResetConfirm(false);
  };

  const [isCriticalError, setIsCriticalError] = useState(false);
  const [loadEventId, setLoadEventId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [trayInfoMap, setTrayInfoMap] = useState<Record<string, string>>({});

  const fetchTrayLabel = (serial: string) => {
    fetch(`/api/trays/${serial}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.tray?.type?.label) {
          setTrayInfoMap((prev) => ({ ...prev, [serial]: data.tray.type.label }))
        }
      })
  }

  useEffect(() => {
    const criticalError = localStorage.getItem('machine_critical_error');
    setIsCriticalError(criticalError === 'true');
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sorting_load_metadata");
      setSortingLoadMetadata(raw ? JSON.parse(raw) : null);
    } catch {
      setSortingLoadMetadata(null);
    }
  }, []);

  const triggerSimulation = () => {
    if (scannedItems.length < pendingTrays.length) {
      const serial = pendingTrays[scannedItems.length].serialNumber;
      setScannedItems((prev) => [...prev, serial]);
      fetchTrayLabel(serial);
      setBtIncompatibilityError(null);
    } else if (!autoclaveStatus) {
      setAutoclaveStatus("ready");
      if (sterilizationType === "vapeur") {
        setSelectedSteamCycle(recommendedSteamCycle);
        setSteamCycleConfirmed(false);
      }
    } else if (sterilizationType === "vapeur" && !selectedSteamCycle) {
      setSelectedSteamCycle(recommendedSteamCycle);
      setSteamCycleConfirmed(false);
    } else if (sterilizationType === "vapeur" && !steamCycleConfirmed) {
      setSteamCycleConfirmed(true);
    }
  };

  useEffect(() => {
    if (sterilizationType !== "vapeur") return;
    if (hasHighPrionRisk) {
      setSelectedSteamCycle("instruments");
      setSteamCycleConfirmed(false);
    } else if (!selectedSteamCycle) {
      setSelectedSteamCycle(recommendedSteamCycle);
    }
  }, [sterilizationType, hasHighPrionRisk, recommendedSteamCycle, selectedSteamCycle]);

  useEffect(() => {
    if (sterilizationType !== "basse_temp") return
    fetch("/api/cassettes/active")
      .then((r) => r.ok ? r.json() : { cassette: null })
      .then((data) => {
        if (data.cassette) {
          setCassetteData({
            id: data.cassette.id,
            lotNumber: data.cassette.lotNumber,
            serialNumber: data.cassette.serialNumber,
            expiryDate: data.cassette.expiryDate,
            insertionDate: data.cassette.insertionDate,
            dosesRemaining: data.cassette.dosesRemaining,
            dosesRequired: data.cassette.dosesRequired,
          })
          setDoseHistory(data.cassette.doseHistory ?? [])
        }
      })
  }, [sterilizationType])

  const isCassetteValid = cassetteData.id !== "" && !isCassetteExpired && !isCassetteEmpty;

  const confirmSteamCycleSelection = () => {
    setSteamCycleConfirmed(true);
  };

  const handleCassetteScan = (rawValue: string) => {
    const scannedId = rawValue.trim();
    if (!scannedId) return;
    const now = new Date();
    const normalized = scannedId.toUpperCase();
    const lotSuffix = normalized.slice(-4) || "0000";
    const serialSuffix = normalized.slice(-6) || "000000";
    setCassetteData((prev) => ({
      ...prev,
      id: normalized,
      lotNumber: `LOT-${lotSuffix}`,
      serialNumber: `SN-${serialSuffix}`,
      insertionDate: now.toISOString().slice(0, 10),
    }));
    setAutoclaveStatus("ready");
  };

  const consumeCassetteDose = () => {
    if (sterilizationType !== "basse_temp" || !cassetteData.id || !isCassetteValid) return;
    setDoseConsumptionAnimating(true);
    setCassetteData((prev) => ({
      ...prev,
      dosesRemaining: Math.max(0, prev.dosesRemaining - prev.dosesRequired),
    }));
    setTimeout(() => setDoseConsumptionAnimating(false), 900);
  };

  const isSteamSelectionReady =
    sterilizationType !== "vapeur" ||
    (autoclaveStatus === "ready" && selectedSteamCycle !== null && steamCycleConfirmed);

  const isPhase1Complete = scannedItems.length > 0 &&
    autoclaveStatus === "ready" &&
    (sterilizationType === "basse_temp" ? isCassetteValid && !btIncompatibilityError : isSteamSelectionReady);

  useEffect(() => {
    onValidated?.(isPhase1Complete);
  }, [isPhase1Complete, onValidated]);

  const handleLoadSubmit = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    const cycle = steamCycleOptions.find((o) => o.id === selectedSteamCycle);
    try {
      const res = await fetch("/api/sterilization/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sterilizationType,
          cycleType: sterilizationType === "vapeur" ? (selectedSteamCycle ?? "instruments") : btCycleType,
          targetTemp: cycle?.temp,
          targetDuration: cycle?.duration,
          operatorBadge: user?.badgeCode ?? "BADGE-001",
          trays: scannedItems,
          ...(sterilizationType === "basse_temp" && cassetteData.id ? { cassetteId: cassetteData.id } : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setSaveError(err.error ?? "Erreur lors du chargement");
        return;
      }
      const { eventId } = await res.json();
      setLoadEventId(eventId);
      localStorage.setItem("sterilization_load_event_id", eventId);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const quickActionLabel =
    pendingTrays.length === 0
      ? null
      : scannedItems.length < pendingTrays.length
        ? "Scanner emballage"
        : !autoclaveStatus
          ? "Scanner autoclave"
          : sterilizationType === "vapeur" && !selectedSteamCycle
            ? "Choisir cycle"
            : sterilizationType === "vapeur" && !steamCycleConfirmed
              ? "Confirmer cycle"
            : null;

  const submitRef = useRef<() => Promise<void>>(async () => {});
  submitRef.current = handleLoadSubmit;
  const stableSubmit = useCallback(async () => { await submitRef.current(); }, []);
  const stableReset = useCallback(() => setShowResetConfirm(true), []);
  const { setOverride } = useFooterActions();

  useEffect(() => {
    setOverride({
      submitLabel: sterilizationType === "basse_temp" ? "Start Cycle" : "Load Machine",
      submittingLabel: "Enregistrement...",
      doneLabel: "Étape suivante",
      onSubmit: stableSubmit,
      isReady: isPhase1Complete && !isCriticalError,
      isSubmitting: saving,
      isDone: saved,
      onReset: stableReset,
      saveError: isCriticalError ? "Machine erreur critique" : saveError,
    });
    return () => setOverride(null);
  }, [sterilizationType, isPhase1Complete, isCriticalError, saving, saved, saveError, stableSubmit, stableReset, setOverride]);

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
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      <header className="shrink-0">
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
                Phase 04 · Stérilisation
              </div>
              <h1 className="text-base font-semibold text-foreground">
                Entrée Autoclave
              </h1>
            </div>

            <div className="flex rounded-lg border border-border bg-muted p-1 gap-1 shrink-0">
              <button className="px-4 py-1.5 rounded-md text-xs font-medium uppercase tracking-wide bg-card text-foreground shadow-sm">
                Chargement
              </button>
              <button
                onClick={() => navigate("/sterilization-sortie")}
                className="px-4 py-1.5 rounded-md text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-all"
              >
                Validation
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Type de Stérilisation :</p>
            <div className="flex rounded-lg border border-border bg-muted p-1 gap-1">
              <button
                onClick={() => setSterilizationType("vapeur")}
                className={`px-4 py-1.5 rounded-md text-xs font-medium uppercase tracking-wide transition-all ${
                  sterilizationType === "vapeur" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Vapeur d&apos;eau
              </button>
              <button
                onClick={() => setSterilizationType("basse_temp")}
                className={`px-4 py-1.5 rounded-md text-xs font-medium uppercase tracking-wide transition-all ${
                  sterilizationType === "basse_temp" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Basse Température
              </button>
            </div>
          </div>
        </section>

      </header>

      <div className="flex-1 grid gap-4 lg:grid-cols-2 min-h-0 overflow-hidden">
        <DashboardSection
          title={sterilizationType === "basse_temp" ? "Charge BT" : "Chariot"}
          scanned={scannedItems.length > 0}
          icon={<Package className="size-8" />}
          waitingText={
            sterilizationType === "basse_temp"
              ? "SCAN_CODE_BARRES_PANIER"
              : pendingTrays.length === 0
                ? "Aucun plateau en attente de stérilisation"
                : "Scanner les emballages"
          }
          onEdit={() => {
            setScannedItems([]);
            setBtIncompatibilityError(null);
          }}
        >
          <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            {sterilizationType === "basse_temp" && (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="SCAN_CODE_BARRES_PANIER"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.toUpperCase().includes("INOX") || val.toUpperCase().includes("PLATEAU")) {
                        setBtIncompatibilityError("Incompatible Load: This item requires High-Temperature Steam Sterilization.");
                      } else {
                        setScannedItems(prev => [...prev, val]);
                        setBtIncompatibilityError(null);
                      }
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                {btIncompatibilityError && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="size-4 text-destructive shrink-0" />
                    <p className="text-xs font-medium text-destructive">{btIncompatibilityError}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="flex flex-col gap-2">
                {scannedItems.map((item, i) => (
                  <div key={i} className="group relative flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/40 transition-colors">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-muted border border-primary/20">
                      <Package className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{item}</p>
                      <p className="text-[10px] font-medium text-primary uppercase tracking-wide mt-0.5">
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
            </div>
            <div className="shrink-0 rounded-lg border border-border bg-muted p-3 text-center">
              <p className="text-[10px] font-medium text-primary uppercase tracking-wide">{scannedItems.length} objet(s) scanné(s)</p>
            </div>
          </div>
        </DashboardSection>

        <DashboardSection
          title={sterilizationType === "basse_temp" ? "Unité & Cassette" : "Autoclave"}
          scanned={autoclaveStatus !== null && (sterilizationType === "basse_temp" ? isCassetteValid : steamCycleConfirmed)}
          icon={<Thermometer className="size-8" />}
          waitingText={sterilizationType === "vapeur" ? "Scanner l'autoclave" : "SCAN_CASSETTE"}
          onEdit={() => {
            setAutoclaveStatus(null);
            setSelectedSteamCycle(null);
            setSteamCycleConfirmed(false);
            setCassetteData(prev => ({ ...prev, id: "", lotNumber: "", serialNumber: "" }));
            setShowDoseHistory(false);
          }}
          forceShow={sterilizationType === "basse_temp"}
        >
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <DataCard
              label="Machine"
              value={sterilizationType === "vapeur" ? "AUTOCLAVE N° 02" : "STÉRILISATEUR BT-01"}
              color="purple"
            />

            {sterilizationType === "basse_temp" ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Cycle BT</label>
                  <select
                    value={btCycleType}
                    onChange={(e) => setBtCycleType(e.target.value as BtCycleType)}
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground outline-none cursor-pointer transition focus:border-primary focus:bg-card"
                  >
                    <option value="Standard">Standard (56°C)</option>
                    <option value="Duo">Duo (50°C)</option>
                    <option value="Flex">Flex (47°C)</option>
                    <option value="Express">Express (56°C)</option>
                  </select>
                </div>

                <div className="rounded-lg border border-border bg-muted p-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Paramètres Réf.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-foreground">TEMP CIBLE</span>
                    <span className="text-xs font-semibold text-primary">
                      {btCycleType === "Standard" || btCycleType === "Express" ? "56°C" : btCycleType === "Duo" ? "50°C" : "47°C"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="SCAN_CASSETTE (H2O2)"
                    className={`w-full rounded-lg border-2 px-3 py-2.5 text-sm font-medium outline-none transition-all ${
                      cassetteData.id
                        ? (isCassetteValid ? "border-secondary bg-card text-foreground" : "border-destructive bg-destructive/5 text-destructive")
                        : "border-border bg-muted text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card"
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCassetteScan((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  {cassetteData.id && (
                    <div className="space-y-2 animate-in fade-in duration-500">
                      <div className="rounded-lg border border-border bg-muted p-3 space-y-2">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Cassette Active</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-card border border-border p-2">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Lot Number</p>
                            <p className="text-xs font-semibold text-foreground mt-1">{cassetteData.lotNumber || "—"}</p>
                          </div>
                          <div className="rounded-lg bg-card border border-border p-2">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Serial Number</p>
                            <p className="text-xs font-semibold text-foreground mt-1">{cassetteData.serialNumber || "—"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-card border border-border p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Doses H2O2 restantes</span>
                          <span className={`text-xs font-semibold ${isCassetteEmpty ? "text-destructive" : "text-secondary"}`}>
                            {cassetteData.dosesRemaining}/5
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full transition-all duration-700 ${isCassetteEmpty ? "bg-destructive" : "bg-secondary"} ${doseConsumptionAnimating ? "animate-pulse" : ""}`}
                            style={{ width: `${Math.max(0, Math.min(100, (cassetteData.dosesRemaining / 5) * 100))}%` }}
                          />
                        </div>
                      </div>

                      <div className="rounded-lg bg-card border border-border p-3 flex items-center justify-between gap-3">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                          isCassetteExpired
                            ? "border-destructive/20 bg-destructive/5 text-destructive"
                            : "border-secondary/20 bg-secondary-muted text-secondary"
                        }`}>
                          Ouverte: {formatDateFr(cassetteData.insertionDate)} • Rebut: {discardDate ? discardDate.toLocaleDateString("fr-FR") : "—"}
                        </span>
                        <button
                          onClick={() => setShowDoseHistory((prev) => !prev)}
                          className="shrink-0 text-[10px] font-medium text-primary hover:underline transition-colors uppercase tracking-wide"
                        >
                          Voir historique
                        </button>
                      </div>

                      {showDoseHistory && (
                        <div className="rounded-lg border border-border bg-muted p-3 space-y-2">
                          {doseHistory.slice(0, 4).map((entry) => (
                            <div key={`${entry.loadEventId}-${entry.usedAt}`} className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                              <span>{new Date(entry.loadTimestamp).toLocaleDateString("fr-FR")}</span>
                              <span>{new Date(entry.usedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} — {entry.doseUsed} dose</span>
                            </div>
                          ))}
                          {doseHistory.length === 0 && (
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Aucun historique pour cette cassette.</p>
                          )}
                        </div>
                      )}

                      {!isCassetteValid && (
                        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2 text-center">
                          <p className="text-[10px] font-medium text-destructive uppercase tracking-wide">Cassette expirée ou vide. Démarrage cycle bloqué.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3">
                  <StatusButton
                    active={autoclaveStatus === "ready"}
                    onClick={() => setAutoclaveStatus(autoclaveStatus === "ready" ? null : "ready")}
                    color="emerald"
                    icon={<CheckCircle2 className="size-5" />}
                    label="Prêt"
                  />
                  <StatusButton
                    active={autoclaveStatus === "maintenance"}
                    onClick={() => setAutoclaveStatus("maintenance")}
                    color="orange"
                    icon={<Wrench className="size-5" />}
                    label="Maint."
                  />
                </div>

                {autoclaveStatus === "ready" && (
                  <div className="rounded-xl border border-border bg-muted p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Cycle Selection</p>
                        <h3 className="text-sm font-semibold text-foreground">Choix du cycle vapeur</h3>
                      </div>
                      {hasHighPrionRisk && (
                        <span className="rounded-full border border-destructive/20 bg-destructive/5 px-2.5 py-0.5 text-[10px] font-medium uppercase text-destructive">
                          Risque Prion
                        </span>
                      )}
                    </div>

                    {hasHighPrionRisk && (
                      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="size-4 text-destructive shrink-0" />
                        <p className="text-xs font-medium text-destructive">Risque prion détecté : cycle 134°C obligatoire.</p>
                      </div>
                    )}

                    <div className="grid gap-3">
                      {steamCycleOptions.map((option) => {
                        const isSelected = selectedSteamCycle === option.id;
                        const isRecommended = recommendedSteamCycle === option.id;
                        const isDisabled = hasHighPrionRisk && option.id === "caoutchouc";
                        const showMaterialWarning = hasThermosensitiveLoad && option.id === "instruments" && !hasHighPrionRisk;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              setSelectedSteamCycle(option.id);
                              setSteamCycleConfirmed(false);
                            }}
                            className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                              isDisabled
                                ? "cursor-not-allowed border-destructive/20 bg-destructive/5 opacity-70"
                                : isSelected
                                  ? "border-primary bg-card shadow-sm"
                                  : isRecommended
                                    ? "border-secondary bg-card"
                                    : "border-border bg-card hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-foreground">{option.title}</span>
                                  {isRecommended && (
                                    <span className="rounded-full border border-secondary/20 bg-secondary-muted px-2.5 py-0.5 text-[10px] font-medium uppercase text-secondary">
                                      Recommandé
                                    </span>
                                  )}
                                  {showMaterialWarning && (
                                    <span className="rounded-full border border-warning/20 bg-warning-muted px-2.5 py-0.5 text-[10px] font-medium uppercase text-warning">
                                      Matériaux sensibles
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-medium text-muted-foreground leading-relaxed">{option.description}</p>
                              </div>

                              <div className="shrink-0 rounded-lg bg-primary-muted px-4 py-3 text-center border border-primary/20 min-w-[110px]">
                                <p className="text-base font-semibold text-primary leading-none">{option.temp}</p>
                                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{option.duration}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {hasThermosensitiveLoad && !hasHighPrionRisk && (
                      <div className="bg-warning-muted border border-warning/20 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="size-4 text-warning shrink-0" />
                        <p className="text-xs font-medium text-warning">Charge thermosensible détectée : préférer le cycle 121°C.</p>
                      </div>
                    )}

                    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Sélection active</span>
                        {steamCycleConfirmed && (
                          <span className="rounded-full border border-secondary/20 bg-secondary-muted px-2.5 py-0.5 text-[10px] font-medium uppercase text-secondary">
                            Confirmé
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedSteamCycleOption
                          ? `${selectedSteamCycleOption.title} • ${selectedSteamCycleOption.temp} / ${selectedSteamCycleOption.duration}`
                          : "Aucun cycle sélectionné"}
                      </p>
                      <button
                        type="button"
                        onClick={confirmSteamCycleSelection}
                        disabled={!selectedSteamCycle || autoclaveStatus !== "ready"}
                        className={`w-full rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide transition-all ${
                          selectedSteamCycle && autoclaveStatus === "ready"
                            ? "interactive-primary"
                            : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                        }`}
                      >
                        Confirmer le cycle avant chargement
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        </DashboardSection>
      </div>

      {doseConsumptionAnimating && (
        <div className="fixed bottom-28 right-8 z-[90] rounded-full bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground animate-in fade-in zoom-in duration-500">
          Dose consommée -1
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" onClick={() => setShowResetConfirm(false)} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[101] bg-card rounded-xl border border-border p-6 max-w-sm w-full shadow-lg animate-in zoom-in-95 duration-200">
            <div className="size-14 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-5 mx-auto">
              <AlertCircle className="size-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground text-center mb-2">Tout effacer ?</h3>
            <p className="text-sm font-medium text-muted-foreground text-center mb-6">
              Êtes-vous sûr de vouloir effacer toutes les données pour ce cycle de stérilisation ?
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

      {/* Demo simulation panel */}
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

function DashboardSection({ title, scanned, icon, waitingText, children, forceShow, onEdit }: DashboardSectionProps) {
  return (
    <section className={`flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all duration-500 overflow-hidden ${scanned ? "border-secondary" : "border-border"}`}>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-2">
          {scanned && (
            <button
              onClick={onEdit}
              className="interactive-muted flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium uppercase tracking-wide"
            >
              <Pencil className="size-3" />
              Modifier
            </button>
          )}
          {scanned && (
            <span className="rounded-full border border-secondary/20 bg-secondary-muted px-2.5 py-0.5 text-[10px] font-medium uppercase text-secondary">
              Validé
            </span>
          )}
        </div>
      </div>

      {!scanned && !forceShow ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted text-muted-foreground p-4">
          <div className="opacity-50">{icon}</div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-center">{waitingText}</p>
        </div>
      ) : children}
    </section>
  );
}

function DataCard({ label, value, color }: DataCardProps) {
  const isPrimary = color === "purple";
  return (
    <div className={`rounded-lg border p-3 shrink-0 ${isPrimary ? "bg-primary-muted border-primary/20" : "bg-secondary-muted border-secondary/20"}`}>
      <p className={`mb-1 text-[10px] font-medium uppercase tracking-wide ${isPrimary ? "text-primary" : "text-secondary"}`}>{label}</p>
      <p className="text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function StatusButton({ active, onClick, icon, label, color }: StatusButtonProps) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
      active
        ? color === "emerald"
          ? "border-secondary bg-secondary-muted text-secondary"
          : "border-warning bg-warning-muted text-warning"
        : "border-border bg-card text-muted-foreground hover:border-primary/40"
    }`}>
      {icon}
      <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
    </button>
  );
}


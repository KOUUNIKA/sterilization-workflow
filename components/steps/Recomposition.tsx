"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFooterActions } from "@/contexts/FooterActionsContext";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Package,
  Search,
  ClipboardList,
  Lightbulb,
  Scissors,
  X,
} from "lucide-react";

type InstrumentStatus = "validated" | "missing" | "defective" | "pending";

type Instrument = {
  id: string;
  serialNumber: string;
  name: string;
  status: InstrumentStatus;
  category: string;
  rackLocation: string;
};

type PendingTray = {
  id: string;
  serialNumber: string;
  type: { label: string };
  lastWashedAt: string;
};

export function Recomposition({ onValidated }: { onValidated?: (isValid: boolean) => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qualified, setQualified] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/qualification/today?machineId=AUTOCLAVE-02")
      .then((r) => r.json())
      .then((d) => setQualified(!!d.qualified))
      .catch(() => setQualified(false));
  }, []);

  const [traySerial, setTraySerial] = useState("");
  const [trayId, setTrayId] = useState<string | null>(null);
  const [trayLabel, setTrayLabel] = useState("");
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loadingTray, setLoadingTray] = useState(false);
  const [trayError, setTrayError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [pendingTrays, setPendingTrays] = useState<PendingTray[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  const [filter, setFilter] = useState<"all" | InstrumentStatus>("all");
  const [packagingProtocol, setPackagingProtocol] = useState("CONTENEUR RIGIDE + FILTRE H600");
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [selectedForDefect, setSelectedForDefect] = useState<Instrument | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [predesinfectionFlags, setPredesinfectionFlags] = useState<{ name: string; designation: string; quantity: number; status: string }[]>([]);

  const [scanInput, setScanInput] = useState("");
  const [scanFeedback, setScanFeedback] = useState<"success" | "error" | null>(null);

  const fetchPendingTrays = async () => {
    setLoadingPending(true);
    try {
      const res = await fetch("/api/trays/pending-recomposition");
      if (res.ok) {
        const { trays } = await res.json();
        setPendingTrays(trays);
      }
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchPendingTrays();
  }, []);

  const handleTrayScan = async (serial: string) => {
    const s = serial.trim();
    if (!s) return;
    setLoadingTray(true);
    setTrayError(null);
    try {
      const res = await fetch(`/api/trays/${encodeURIComponent(s)}`);
      if (!res.ok) {
        setTrayError("Plateau non trouvé");
        return;
      }
      const { tray } = await res.json();
      setTrayId(tray.id);
      setTrayLabel(tray.type.label);
      setTraySerial(s);
      setInstruments(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tray.instruments.map((i: any) => ({
          id: i.id,
          serialNumber: i.serialNumber,
          name: i.type.name,
          category: i.type.category,
          status: "pending" as InstrumentStatus,
          rackLocation: "",
        }))
      );
      setScanInput("");
      setScanFeedback(null);
      fetch(`/api/trays/${encodeURIComponent(s)}/predesinfection-flags`)
        .then(r => r.ok ? r.json() : { flags: [] })
        .then(data => setPredesinfectionFlags(data.flags ?? []));
    } finally {
      setLoadingTray(false);
    }
  };

  const handleInstrumentScan = (raw: string) => {
    const serial = raw.trim();
    if (!serial) return;
    const match = instruments.find(
      (i) => i.serialNumber.toLowerCase() === serial.toLowerCase() && i.status !== "validated"
    );
    if (match) {
      setInstruments((prev) =>
        prev.map((i) => i.id === match.id ? { ...i, status: "validated" as InstrumentStatus } : i)
      );
      setScanFeedback("success");
    } else {
      setScanFeedback("error");
    }
    setScanInput("");
    setTimeout(() => setScanFeedback(null), 1500);
  };

  const toggleValidation = (id: string) => {
    setInstruments((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? { ...inst, status: inst.status === "validated" ? "missing" : "validated" }
          : inst
      )
    );
  };

  const changeStatus = (id: string, newStatus: InstrumentStatus) => {
    setInstruments((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, status: newStatus } : inst))
    );
  };

  const handleNextStep = () => {
    if (counts.pending > 0) return;
    setShowPrintPreview(true);
  };

  const handleGlobalReset = () => {
    setTraySerial("");
    setTrayId(null);
    setTrayLabel("");
    setInstruments([]);
    setLoadingTray(false);
    setTrayError(null);
    setSaving(false);
    setSaveError(null);
    setPredesinfectionFlags([]);
    setScanInput("");
    setScanFeedback(null);
    setPackagingProtocol("CONTENEUR RIGIDE + FILTRE H600");
    setShowResetConfirm(false);
  };

  const openDefectModal = (inst: Instrument) => {
    setSelectedForDefect(inst);
    setShowDefectModal(true);
  };

  const handleDefectResolution = () => {
    if (selectedForDefect) {
      setInstruments((prev) =>
        prev.map((inst) =>
          inst.id === selectedForDefect.id ? { ...inst, status: "validated" } : inst
        )
      );
      setShowDefectModal(false);
    }
  };

  const handleConfirmRecomposition = async () => {
    if (!trayId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/recomposition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trayId,
          packagingProtocol,
          operatorBadge: user?.badgeCode ?? "BADGE-001",
          instruments: instruments.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            rackLocation: i.rackLocation || "N/A",
            status: i.status,
            justification: null,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setSaveError(err.error ?? "Erreur lors de l'enregistrement");
        return;
      }
      setShowPrintPreview(false);
      handleGlobalReset();
      fetchPendingTrays();
    } finally {
      setSaving(false);
    }
  };

  const counts = useMemo(
    () => ({
      all: instruments.length,
      validated: instruments.filter((i) => i.status === "validated").length,
      missing: instruments.filter((i) => i.status === "missing").length,
      defective: instruments.filter((i) => i.status === "defective").length,
      pending: instruments.filter((i) => i.status === "pending").length,
    }),
    [instruments]
  );

  const filteredInstruments = useMemo(() => {
    if (filter === "all") return instruments;
    return instruments.filter((i) => i.status === filter);
  }, [instruments, filter]);


  const isInventoryComplete = instruments.length > 0 && counts.pending === 0;
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 6);

  useEffect(() => {
    onValidated?.(isInventoryComplete);
  }, [isInventoryComplete, onValidated]);

  const submitRef = useRef<() => Promise<void>>(async () => {});
  submitRef.current = async () => { handleNextStep(); };
  const stableSubmit = useCallback(async () => { await submitRef.current(); }, []);
  const stableReset = useCallback(() => setShowResetConfirm(true), []);
  const { setOverride } = useFooterActions();

  useEffect(() => {
    if (!trayId) {
      setOverride(null);
      return;
    }
    setOverride({
      submitLabel: "Étiquetage & Validation",
      submittingLabel: "Enregistrement...",
      doneLabel: "Étape suivante",
      onSubmit: stableSubmit,
      isReady: counts.pending === 0,
      isSubmitting: false,
      isDone: false,
      onReset: stableReset,
      saveError: null,
    });
    return () => setOverride(null);
  }, [trayId, counts.pending, stableSubmit, stableReset, setOverride]);

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
      {!trayId ? (
        /* ── Scan Screen ── */
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar px-1 animate-in fade-in duration-500">

          <div className="flex flex-col items-center pt-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-muted border border-primary/20 mb-4">
              <Package className="size-8 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Conditionnement</h2>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Sélectionner ou scanner un plateau</p>
          </div>

          {/* Pending Queue */}
          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Plateaux en attente de conditionnement</span>
              </div>
              {loadingPending ? (
                <Loader2 className="size-3.5 text-muted-foreground animate-spin" />
              ) : (
                <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                  pendingTrays.length > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground border border-border"
                }`}>
                  {pendingTrays.length} plateau{pendingTrays.length !== 1 ? "x" : ""}
                </span>
              )}
            </div>

            {!loadingPending && pendingTrays.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <CheckCircle2 className="size-8 text-secondary" />
                <p className="text-[10px] font-medium uppercase tracking-wide">Aucun plateau en attente</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingTrays.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTrayScan(t.serialNumber)}
                    disabled={loadingTray}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-all group disabled:opacity-40 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-muted border border-primary/20 group-hover:bg-primary/10 transition-colors">
                        <Package className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.serialNumber}</p>
                        <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{t.type.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Lavé le</p>
                        <p className="text-[10px] font-medium text-foreground">
                          {new Date(t.lastWashedAt).toLocaleString("fr-FR", {
                            day: "2-digit", month: "2-digit",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary-muted border border-primary/20 group-hover:bg-primary transition-all">
                        {loadingTray
                          ? <Loader2 className="size-3.5 animate-spin text-primary group-hover:text-primary-foreground" />
                          : <ChevronRight className="size-4 text-primary group-hover:text-primary-foreground" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Manual Scan */}
          <section className="rounded-xl border border-border bg-card shadow-sm p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Scanner manuellement</span>
            </div>

            {trayError && (
              <div className="mb-4 bg-destructive/5 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="size-4 text-destructive shrink-0" />
                <p className="text-xs font-medium text-destructive">{trayError}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={traySerial}
                onChange={(e) => setTraySerial(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrayScan(traySerial)}
                placeholder="Numéro de série du plateau..."
                className="flex-1 w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card"
              />
              <button
                onClick={() => handleTrayScan(traySerial)}
                disabled={loadingTray || !traySerial.trim()}
                className="interactive-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wide disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:border disabled:border-border"
              >
                {loadingTray && <Loader2 className="size-4 animate-spin" />}
                {loadingTray ? "Chargement..." : "Scanner"}
              </button>
            </div>
          </section>

          <div className="pb-4" />
        </div>
      ) : (
        /* ── Main Workspace ── */
        <div className="flex-1 flex flex-col gap-4 min-h-0 animate-in slide-in-from-bottom-4 duration-500">

          {/* Header */}
          <header className="shrink-0 bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1">Plateau scanné</span>
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary-muted border border-primary/20">
                    <Package className="size-4 text-primary" />
                  </div>
                  <span className="text-base font-semibold text-foreground">{traySerial}</span>
                </div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-wide text-primary mb-1">Dispositif Cible</span>
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary-muted border border-primary/20">
                    <Package className="size-4 text-primary" />
                  </div>
                  <span className="text-base font-semibold text-foreground">{trayLabel}</span>
                </div>
              </div>
            </div>
            <div className="hidden xl:inline-flex items-center rounded-full border border-secondary/20 bg-secondary-muted px-3 py-1 text-xs font-medium text-secondary">
              <div className="h-2 w-2 rounded-full bg-secondary animate-pulse mr-2" />
              Secteur : Zone Propre • Poste 04
            </div>
          </header>

          {predesinfectionFlags.length > 0 && (
            <div className="shrink-0 rounded-lg border border-warning/20 bg-warning-muted px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-warning shrink-0" />
                <span className="text-[10px] font-medium uppercase tracking-wide text-warning">Écarts relevés en prédésinfection</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {predesinfectionFlags.map((f, i) => (
                  <span key={i} className={`text-[10px] font-medium flex items-center gap-1.5 ${
                    f.status === "missing" ? "text-destructive" : "text-warning"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      f.status === "missing" ? "bg-destructive" : "bg-warning"
                    }`} />
                    {f.status === "missing" && `Manquant — ${f.name} ×${f.quantity}`}
                    {f.status === "partial" && `Qté modifiée — ${f.name} ×${f.quantity}`}
                    {f.status === "added" && `Non prévu — ${f.name} ×${f.quantity}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 grid gap-4 lg:grid-cols-[1fr_0.8fr] min-h-0 overflow-hidden">

            {/* Left Column */}
            <div className="flex flex-col gap-4 min-h-0">

              {/* Composition Panel */}
              <section className="flex-1 rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Composition attendue</h3>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {instruments.length} instrument{instruments.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
                  {instruments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 opacity-50">
                      <ClipboardList className="size-8" />
                      <p className="text-[10px] font-medium uppercase tracking-wide">Aucun instrument</p>
                    </div>
                  ) : (
                    instruments.map((inst) => (
                      <div
                        key={inst.id}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                          inst.status === "validated" ? "border-secondary/20 bg-secondary-muted text-secondary" :
                          inst.status === "missing" ? "border-destructive/20 bg-destructive/5 text-destructive" :
                          inst.status === "defective" ? "border-warning/20 bg-warning-muted text-warning" :
                          "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold truncate">{inst.name}</p>
                          <p className="text-[8px] font-mono font-medium mt-0.5 uppercase tracking-wider opacity-70">{inst.serialNumber}</p>
                        </div>
                        <span className={`shrink-0 ml-3 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase ${
                          inst.status === "validated" ? "border-secondary/20 bg-secondary-muted text-secondary" :
                          inst.status === "missing" ? "border-destructive/20 bg-destructive/5 text-destructive" :
                          inst.status === "defective" ? "border-warning/20 bg-warning-muted text-warning" :
                          "border-border bg-muted text-muted-foreground"
                        }`}>
                          {inst.status === "validated" ? "Conforme" :
                           inst.status === "missing" ? "Manquant" :
                           inst.status === "defective" ? "Défectueux" :
                           "En attente"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Packaging Section */}
              <section
                className={`shrink-0 rounded-xl bg-primary p-4 text-primary-foreground shadow-sm transition-all duration-700 ${
                  isInventoryComplete ? "translate-y-0 opacity-100" : "opacity-30 grayscale pointer-events-none"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                      <Package className="size-5 text-primary-foreground/80" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">Conditionnement</h3>
                      <p className="text-[10px] font-medium text-primary-foreground/60 uppercase tracking-wide mt-0.5">Protocoles de validation requis</p>
                    </div>
                  </div>
                  <div className="flex gap-8 items-center">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-primary-foreground/40 mb-1">Standard emballage</span>
                      <select
                        value={packagingProtocol}
                        onChange={(e) => setPackagingProtocol(e.target.value)}
                        className="bg-transparent text-xs font-semibold text-primary-foreground text-right appearance-none cursor-pointer outline-none border-b border-primary-foreground/20"
                      >
                        <option value="CONTENEUR RIGIDE + FILTRE H600" className="bg-primary text-primary-foreground">CONTENEUR RIGIDE + FILTRE H600</option>
                        <option value="SACHET DOUBLE" className="bg-primary text-primary-foreground">SACHET DOUBLE</option>
                        <option value="FEUILLE DE STÉRILISATION" className="bg-primary text-primary-foreground">FEUILLE DE STÉRILISATION</option>
                      </select>
                    </div>
                    <div className="h-8 w-px bg-primary-foreground/10" />
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-primary-foreground/40 mb-1">Calcul péremption (D+6M)</span>
                      <span className="text-xs font-semibold text-destructive">{expiryDate.toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column — Inventory */}
            <section className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden min-h-0">
              <div className="p-4 border-b border-border bg-muted shrink-0">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-medium uppercase tracking-wide text-foreground">Inventaire & Conformité</h3>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {counts.validated}/{counts.all} validés
                  </span>
                </div>

                {/* Scan input */}
                <div className={`mb-4 rounded-lg border-2 transition-all duration-200 p-3 ${
                  scanFeedback === "success" ? "border-secondary bg-secondary-muted" :
                  scanFeedback === "error" ? "border-destructive bg-destructive/5" :
                  "border-dashed border-border bg-card"
                }`}>
                  <p className={`text-[10px] font-medium uppercase tracking-wide mb-2 ${
                    scanFeedback === "success" ? "text-secondary" :
                    scanFeedback === "error" ? "text-destructive" :
                    "text-muted-foreground"
                  }`}>
                    {scanFeedback === "success" ? "Instrument validé" :
                     scanFeedback === "error" ? "Numéro non reconnu" :
                     "Scanner un instrument"}
                  </p>
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInstrumentScan(scanInput)}
                    placeholder="N° série ou code-barre…"
                    autoFocus
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card"
                  />
                  <p className="text-[10px] font-medium text-muted-foreground mt-1.5 uppercase tracking-wide">Appuyer sur Entrée pour valider</p>
                </div>

                {/* Filter tabs */}
                <div className="flex rounded-lg border border-border bg-muted p-1 gap-1">
                  <FilterBtn active={filter === "all"} label="Tous" count={counts.all} onClick={() => setFilter("all")} />
                  <FilterBtn active={filter === "validated"} label="Valides" count={counts.validated} onClick={() => setFilter("validated")} />
                  <FilterBtn active={filter === "missing"} label="Manquants" count={counts.missing} onClick={() => setFilter("missing")} />
                  <FilterBtn active={filter === "defective"} label="Défauts" count={counts.defective} onClick={() => setFilter("defective")} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-card">
                {filteredInstruments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 opacity-50">
                    <Search className="size-8" />
                    <p className="text-[10px] font-medium uppercase tracking-wide">Aucun instrument à afficher</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredInstruments.map((inst) => (
                      <div
                        key={inst.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          inst.status === "validated" ? "border-secondary/20 bg-secondary-muted text-secondary" :
                          inst.status === "missing" ? "border-destructive/20 bg-destructive/5 text-destructive" :
                          inst.status === "defective" ? "border-warning/20 bg-warning-muted text-warning" :
                          "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => toggleValidation(inst.id)}
                            className={`flex size-4 shrink-0 items-center justify-center rounded border-2 text-[10px] transition-all ${
                              inst.status === "validated"
                                ? "border-secondary bg-secondary text-secondary-foreground"
                                : "border-border bg-card"
                            }`}
                          >
                            {inst.status === "validated" && "✓"}
                          </button>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate">{inst.name}</p>
                            <p className="text-[9px] font-medium font-mono mt-0.5 opacity-70 tracking-wider">{inst.serialNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <div className="relative">
                            <select
                              value={inst.status}
                              onChange={(e) => changeStatus(inst.id, e.target.value as InstrumentStatus)}
                              className={`text-[10px] font-medium uppercase px-2 py-1.5 rounded-lg border appearance-none pr-6 cursor-pointer outline-none transition-all ${
                                inst.status === "validated" ? "border-secondary/20 bg-secondary-muted text-secondary" :
                                inst.status === "missing" ? "border-destructive/20 bg-destructive/5 text-destructive" :
                                inst.status === "defective" ? "border-warning/20 bg-warning-muted text-warning" :
                                "border-border bg-muted text-muted-foreground"
                              }`}
                            >
                              <option value="validated">Conforme</option>
                              <option value="missing">Manquant</option>
                              <option value="defective">Défectueux</option>
                              <option value="pending">En attente</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                              <ChevronDown className="size-2.5" />
                            </div>
                          </div>

                          {inst.status === "defective" && (
                            <button
                              onClick={() => openDefectModal(inst)}
                              className="interactive-danger rounded-lg px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide"
                            >
                              Signaler
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Demo simulation panel */}
      {!trayId && pendingTrays[0] && (
        <div className="fixed bottom-32 right-6 z-[100]">
          <div className="bg-card rounded-xl p-2.5 shadow-lg border border-border flex flex-col gap-2 min-w-[160px]">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-center">Demo</p>
            <button
              onClick={() => handleTrayScan(pendingTrays[0].serialNumber)}
              disabled={loadingTray}
              className="interactive-primary flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
            >
              {pendingTrays[0].serialNumber}
            </button>
          </div>
        </div>
      )}

      {/* Anomaly Modal */}
      {showDefectModal && selectedForDefect && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" onClick={() => setShowDefectModal(false)} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[101] bg-card rounded-xl border border-border p-6 max-w-xl w-full shadow-lg animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="size-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Signaler un défaut</h3>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mt-0.5">Flux de gestion des anomalies</p>
                </div>
              </div>
              <button onClick={() => setShowDefectModal(false)} className="interactive-muted rounded-lg p-2">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Heure de détection</label>
                <div className="rounded-lg border border-border bg-muted px-3 py-2.5 text-xs font-medium text-foreground">
                  {new Date().toLocaleString("fr-FR", {
                    hour: "2-digit", minute: "2-digit", second: "2-digit",
                    day: "2-digit", month: "2-digit", year: "numeric",
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Instrument critique</label>
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-destructive">{selectedForDefect.name}</p>
                    <p className="text-[10px] font-medium font-mono text-destructive/60 mt-1 uppercase tracking-wide">{selectedForDefect.serialNumber}</p>
                  </div>
                  <Scissors className="size-8 text-destructive/20" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Cause du défaut qualité</label>
                <div className="relative">
                  <select className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground outline-none appearance-none cursor-pointer transition focus:border-primary focus:bg-card">
                    <option>Mors émoussés / Usure structurelle</option>
                    <option>Oxydation apparente (Corrosion)</option>
                    <option>Fissure visible / Rupture métal</option>
                    <option>Dysfonctionnement articulation</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ChevronDown className="size-4" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-secondary/20 bg-secondary-muted p-4">
                <div className="flex items-center gap-3 mb-2 text-secondary">
                  <Lightbulb className="size-5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide block">Suggestion intelligente</span>
                    <span className="text-[10px] font-medium text-secondary/70">Moteur d&apos;allocation de stock</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Instrument de remplacement à localiser en zone de remplacement.
                </p>
              </div>

              <button
                onClick={handleDefectResolution}
                className="interactive-secondary w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide"
              >
                Valider le remplacement et enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button type="button" onClick={() => setShowPrintPreview(false)} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[111] bg-card rounded-xl border border-border p-6 max-w-lg w-full shadow-lg animate-in zoom-in-95 duration-200 flex flex-col items-center">

            <div className="w-full border-4 border-foreground p-6 space-y-4 font-mono text-[11px] uppercase relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 bg-foreground text-card text-[8px] font-semibold tracking-widest rotate-45 translate-x-6 -translate-y-2 w-32 text-center">VALIDÉ</div>
              <div className="text-center border-b-4 border-foreground pb-4 mb-4">
                <p className="text-xl font-semibold tracking-tight text-foreground">ÉTIQUETTE TRAÇABILITÉ</p>
                <p className="text-[9px] font-medium tracking-widest mt-1 text-muted-foreground">Sterilization Workflow v2.4.0</p>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-end border-b border-dashed border-border pb-1">
                  <span className="font-medium text-muted-foreground">Dispositif:</span>
                  <span className="font-semibold text-sm text-foreground">{trayLabel}</span>
                </div>
                <div className="flex justify-between items-end border-b border-dashed border-border pb-1">
                  <span className="font-medium text-muted-foreground">Plateau:</span>
                  <span className="font-semibold text-sm text-foreground">{traySerial}</span>
                </div>
                <div className="flex justify-between items-end border-b border-dashed border-border pb-1">
                  <span className="font-medium text-muted-foreground">Destination:</span>
                  <span className="font-semibold text-sm text-foreground">BLOC OP CENTRAL n°03</span>
                </div>
                <div className="flex justify-between items-end border-b border-dashed border-border pb-1">
                  <span className="font-medium text-muted-foreground">Date Recomp.:</span>
                  <span className="font-semibold text-sm text-foreground">{new Date().toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex justify-between items-end border-b-2 border-foreground pb-1 text-destructive">
                  <span className="font-semibold">DATE PÉREMPTION:</span>
                  <span className="font-semibold text-lg underline">{expiryDate.toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex justify-between items-end bg-muted p-3 rounded-lg border border-border">
                  <span className="font-medium text-muted-foreground">Emballage:</span>
                  <span className="font-semibold text-sm text-primary">{packagingProtocol}</span>
                </div>
              </div>
              <div className="pt-6 flex flex-col items-center gap-3">
                <div className="bg-foreground h-14 w-full flex items-center justify-center">
                  <div className="flex gap-1 h-8 w-full px-4">
                    {[...Array(40)].map((_, i) => (
                      <div key={i} className="bg-card h-full" style={{ width: Math.random() > 0.5 ? "2px" : "4px" }} />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] font-semibold tracking-widest text-foreground">BC-42-2026-X8-ST</p>
              </div>
            </div>

            {saveError && (
              <div className="mt-4 bg-destructive/5 border border-destructive/20 rounded-lg p-3 flex items-center gap-2 w-full">
                <AlertCircle className="size-4 text-destructive shrink-0" />
                <p className="text-xs font-medium text-destructive">{saveError}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3 w-full">
              <button
                onClick={() => setShowPrintPreview(false)}
                disabled={saving}
                className="flex-1 interactive-muted rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide disabled:opacity-40"
              >
                Fermer
              </button>
              <button
                onClick={handleConfirmRecomposition}
                disabled={saving}
                className="flex-1 interactive-secondary flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:border disabled:border-border"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                {saving ? "Enregistrement..." : "Confirmer & Imprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" onClick={() => setShowResetConfirm(false)} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[101] bg-card rounded-xl border border-border p-6 max-w-sm w-full shadow-lg animate-in zoom-in-95 duration-200">
            <div className="size-14 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-5 mx-auto">
              <AlertCircle className="size-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground text-center mb-2">Tout effacer ?</h3>
            <p className="text-sm font-medium text-muted-foreground text-center mb-6">
              Êtes-vous sûr de vouloir effacer toutes les données de cette recomposition ? Cette action est irréversible.
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

function FilterBtn({
  active, label, count, onClick,
}: {
  active: boolean; label: string; count: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className="hidden sm:inline">{label}</span>
      <span className={`px-1.5 py-0.5 rounded text-[10px] ${active ? "bg-muted" : "bg-muted/50"}`}>{count}</span>
    </button>
  );
}

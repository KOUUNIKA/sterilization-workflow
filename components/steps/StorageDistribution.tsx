"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Pencil,
  AlertCircle,
  CheckCircle2,
  Package,
  Building2,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFooterActions } from "@/contexts/FooterActionsContext";

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

export function StorageDistribution({ onValidated }: { onValidated?: (isValid: boolean) => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qualified, setQualified] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/qualification/today?machineId=AUTOCLAVE-02")
      .then((r) => r.json())
      .then((d) => setQualified(!!d.qualified))
      .catch(() => setQualified(false));
  }, []);

  const [storageItem, setStorageItem] = useState("");
  const [storageRoom, setStorageRoom] = useState("");
  const [storageShelf, setStorageShelf] = useState("");
  const [storageConfirmed, setStorageConfirmed] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [pendingStorage, setPendingStorage] = useState<{ id: string; serialNumber: string; label: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasPlaced, setHasPlaced] = useState(false);
  const [trayFlags, setTrayFlags] = useState<{ name: string; designation: string; quantity: number; status: string }[]>([]);

  useEffect(() => {
    fetch("/api/trays/pending-storage")
      .then((r) => r.ok ? r.json() : { trays: [] })
      .then((data) => setPendingStorage(data.trays ?? []));
  }, []);

  useEffect(() => {
    if (!storageItem) { setTrayFlags([]); return; }
    fetch(`/api/trays/${encodeURIComponent(storageItem)}/predesinfection-flags`)
      .then((r) => r.ok ? r.json() : { flags: [] })
      .then((data) => setTrayFlags(data.flags ?? []));
  }, [storageItem]);

  const isStorageComplete = storageItem !== "" && storageRoom !== "" && storageShelf !== "" && storageConfirmed;

  useEffect(() => {
    onValidated?.(isStorageComplete);
  }, [isStorageComplete, onValidated]);

  const handleGlobalReset = () => {
    setStorageItem("");
    setStorageRoom("");
    setStorageShelf("");
    setStorageConfirmed(false);
    setShowResetConfirm(false);
  };

  const triggerSimulation = () => {
    if (!storageItem) {
      const next = pendingStorage[0];
      if (next) setStorageItem(next.serialNumber);
    } else if (!storageRoom) {
      setStorageRoom("BLOC OPÉRATOIRE N°03");
    } else if (!storageShelf) {
      setStorageShelf("RAYONNAGE-B / ÉTAGE-03");
    } else if (!storageConfirmed) {
      setStorageConfirmed(true);
    }
  };

  const quickActionLabel = !storageItem
    ? "Scanner dispositif"
    : !storageRoom
      ? "Scanner salle"
      : !storageShelf
        ? "Scanner emplacement"
        : !storageConfirmed
          ? "Valider entrée"
          : null;

  const handleStoreSubmit = async () => {
    setSaving(true);
    setSaveError(null);
    const res = await fetch("/api/storage/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ traySerial: storageItem, room: storageRoom, shelf: storageShelf, operatorBadge: user?.badgeCode ?? "BADGE-001" }),
    });
    if (!res.ok) {
      setSaveError((await res.json()).error ?? "Erreur");
      setSaving(false);
      return;
    }
    setSaving(false);
    setPendingStorage((prev) => prev.filter((t) => t.serialNumber !== storageItem));
    setHasPlaced(true);
    setStorageItem("");
    setStorageRoom("");
    setStorageShelf("");
    setStorageConfirmed(false);
  };

  const submitRef = useRef<() => Promise<void>>(async () => {});
  submitRef.current = handleStoreSubmit;
  const stableSubmit = useCallback(async () => { await submitRef.current(); }, []);
  const stableReset = useCallback(() => setShowResetConfirm(true), []);
  const { setOverride } = useFooterActions();

  useEffect(() => {
    setOverride({
      submitLabel: "Placer le dispositif",
      submittingLabel: "Enregistrement...",
      doneLabel: "Terminer le cycle",
      onSubmit: stableSubmit,
      isReady: isStorageComplete,
      isSubmitting: saving,
      isDone: hasPlaced && !isStorageComplete,
      onReset: stableReset,
      saveError: saveError,
    });
    return () => setOverride(null);
  }, [isStorageComplete, saving, hasPlaced, saveError, stableSubmit, stableReset, setOverride]);

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

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
            Phase 05 · Stockage & Distribution
          </div>
          <h1 className="text-base font-semibold text-foreground">Placement Arsenal</h1>
          <p className="text-[10px] font-medium text-muted-foreground">Affectation salle + emplacement</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Secteur: <span className="text-foreground">Logistique</span></div>
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Cycle: <span className="text-primary">2026-0001</span></div>
        </div>
      </header>

      <div className="shrink-0 flex items-center px-1">
        <StepNode label="Dispositif" done={Boolean(storageItem)} active={!storageItem} />
        <div className={`flex-1 h-px transition-colors ${storageItem ? "bg-primary" : "bg-border"}`} />
        <StepNode label="Salle" done={Boolean(storageRoom)} active={Boolean(storageItem) && !storageRoom} />
        <div className={`flex-1 h-px transition-colors ${storageRoom ? "bg-primary" : "bg-border"}`} />
        <StepNode label="Emplacement" done={Boolean(storageShelf)} active={Boolean(storageRoom) && !storageShelf} />
        <div className={`flex-1 h-px transition-colors ${storageShelf ? "bg-primary" : "bg-border"}`} />
        <StepNode label="Confirmation" done={storageConfirmed} active={Boolean(storageShelf) && !storageConfirmed} />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Top row: 3 scan sections */}
          <div className="grid md:grid-cols-3 gap-4 shrink-0">

            {/* 1 — Dispositif */}
            <section className={`rounded-xl border bg-card p-4 shadow-sm transition-all ${storageItem ? "border-secondary" : "border-border"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-medium uppercase tracking-wide text-foreground">Scan dispositif</h3>
                </div>
                {storageItem && (
                  <button onClick={() => setStorageItem("")} className="interactive-muted flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium uppercase tracking-wide">
                    <Pencil className="size-3" /> Modifier
                  </button>
                )}
              </div>
              {!storageItem ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted py-6 text-muted-foreground text-center">
                  <Package className="size-6 opacity-40" />
                  <p className="text-[10px] font-medium uppercase tracking-wide">Attente Scan</p>
                </div>
              ) : (
                <div className="space-y-2 animate-in zoom-in">
                  <div className="rounded-lg border border-secondary/20 bg-secondary-muted p-3 text-center">
                    <p className="text-sm font-semibold text-foreground">{storageItem}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-secondary">Stérile · Validé</p>
                  </div>
                  {trayFlags.length > 0 && (
                    <div className="rounded-lg border border-warning/20 bg-warning-muted p-3 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="size-3.5 text-warning shrink-0" />
                        <p className="text-[10px] font-medium text-warning uppercase tracking-wide">Écarts prédésinfection</p>
                      </div>
                      {trayFlags.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${f.status === "missing" ? "bg-destructive" : "bg-warning"}`} />
                          <span className={f.status === "missing" ? "text-destructive" : "text-warning"}>
                            {f.status === "missing" ? "Manquant" : "Non prévu"} — {f.name} ×{f.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 2 — Salle de destination */}
            <section className={`rounded-xl border bg-card p-4 shadow-sm transition-all ${storageRoom ? "border-secondary" : "border-border opacity-50"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-medium uppercase tracking-wide text-foreground">Salle de destination</h3>
                </div>
                {storageRoom && (
                  <button onClick={() => { setStorageRoom(""); setStorageShelf(""); setStorageConfirmed(false); }} className="interactive-muted flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium uppercase tracking-wide">
                    <Pencil className="size-3" /> Modifier
                  </button>
                )}
              </div>
              {!storageRoom ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted py-6 text-muted-foreground text-center">
                  <Building2 className="size-6 opacity-40" />
                  <p className="text-[10px] font-medium uppercase tracking-wide">Scanner Salle</p>
                </div>
              ) : (
                <div className="animate-in zoom-in rounded-lg border border-secondary/20 bg-secondary-muted p-3 text-center">
                  <p className="text-sm font-semibold text-foreground">{storageRoom}</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-secondary">Destination validée</p>
                </div>
              )}
            </section>

            {/* 3 — Emplacement */}
            <section className={`rounded-xl border bg-card p-4 shadow-sm transition-all ${storageShelf ? "border-secondary" : "border-border opacity-50"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-medium uppercase tracking-wide text-foreground">Emplacement</h3>
                </div>
                {storageShelf && (
                  <button onClick={() => { setStorageShelf(""); setStorageConfirmed(false); }} className="interactive-muted flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium uppercase tracking-wide">
                    <Pencil className="size-3" /> Modifier
                  </button>
                )}
              </div>
              {!storageShelf ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted py-6 text-muted-foreground text-center">
                  <Layers className="size-6 opacity-40" />
                  <p className="text-[10px] font-medium uppercase tracking-wide">Scanner Rayon</p>
                </div>
              ) : (
                <div className="animate-in zoom-in rounded-lg border border-secondary/20 bg-secondary-muted p-3 text-center">
                  <p className="text-sm font-semibold text-foreground">{storageShelf}</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-secondary">Position validée</p>
                </div>
              )}
            </section>
          </div>

          {/* Confirmation panel */}
          <section className={`rounded-xl border bg-card p-4 shadow-sm transition-all ${storageConfirmed ? "border-secondary" : "border-border"}`}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-[10px] font-medium uppercase tracking-wide text-foreground">Confirmation de placement</h3>
            </div>

            {!storageRoom || !storageShelf ? (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted py-8">
                <p className="text-xs font-medium text-muted-foreground">Complétez les étapes 1 à 3 pour confirmer</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-muted p-3">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Salle de destination</p>
                    <p className="text-sm font-semibold text-foreground">{storageRoom}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted p-3">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Emplacement</p>
                    <p className="text-sm font-semibold text-foreground">{storageShelf}</p>
                  </div>
                </div>
                {storageConfirmed ? (
                  <div className="rounded-lg border border-secondary/20 bg-secondary-muted p-3 flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-secondary shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-secondary">Placement confirmé</p>
                      <p className="text-[10px] font-medium text-secondary/70">Archivage système ok</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setStorageConfirmed(true)}
                    className="interactive-primary w-full rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide"
                  >
                    Valider l&apos;entrée
                  </button>
                )}
              </div>
            )}
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
              Êtes-vous sûr de vouloir effacer les données de placement en cours ?
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
    </div>
  );
}

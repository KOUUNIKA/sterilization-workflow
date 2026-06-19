"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Pencil, Save, History, X } from "lucide-react";
import { MODULE_LABELS } from "../types";

type WorkflowNotesPanelProps = {
  moduleKey: string;
};

type HistoryEntry = {
  id: string;
  note: string;
  author: string;
  badgeCode: string;
  createdAt: string;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) + " · " + formatTime(d);
}

export function WorkflowNotesPanel({ moduleKey }: WorkflowNotesPanelProps) {
  const [note, setNote] = useState("");
  const [author, setAuthor] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/workflow-notes?moduleKey=${encodeURIComponent(moduleKey)}`);
        if (!res.ok) return;
        const payload = (await res.json()) as {
          note: { note: string; author: string; updatedAt: string } | null;
        };
        if (!isMounted) return;
        setNote(payload.note?.note ?? "");
        setAuthor(payload.note?.author ?? null);
        setDraftNote(payload.note?.note ?? "");
        setSavedAt(payload.note?.updatedAt ?? null);
      } catch {
        if (!isMounted) return;
      }
    };
    load();
    return () => { isMounted = false; };
  }, [moduleKey]);

  useEffect(() => {
    if (!isModalOpen && !isHistoryOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsModalOpen(false); setIsHistoryOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, isHistoryOpen]);

  const openHistory = async () => {
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/workflow-notes?moduleKey=${encodeURIComponent(moduleKey)}&history=true`);
      const payload = (await res.json()) as { history: HistoryEntry[] };
      setHistory(payload.history ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSave = async () => {
    const nextNote = draftNote.trim();
    setIsSaving(true);
    try {
      const res = await fetch("/api/workflow-notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ moduleKey, note: nextNote, badgeCode: "BADGE-001" }),
      });
      if (!res.ok) throw new Error();
      const payload = (await res.json()) as { note: { note: string; author: string; updatedAt: string } };
      setNote(payload.note.note);
      setAuthor(payload.note.author);
      setDraftNote(payload.note.note);
      setSavedAt(payload.note.updatedAt);
      setIsModalOpen(false);
    } catch {
      // keep modal open on error
    } finally {
      setIsSaving(false);
    }
  };

  const hasNote = note.trim().length > 0;
  const moduleLabel = MODULE_LABELS[moduleKey] ?? "Étape";

  return (
    <>
      <section className="mb-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-primary">Notes</p>
            <h2 className="mt-0.5 text-base font-semibold text-foreground">Notes de l&apos;étape</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {moduleLabel}
            </span>
            <button
              type="button"
              onClick={openHistory}
              className="interactive-muted inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium"
            >
              <History className="size-3.5" />
              Historique
            </button>
            <button
              type="button"
              onClick={() => { setDraftNote(note); setIsModalOpen(true); }}
              className="interactive-primary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
            >
              <FileText className="size-3.5" />
              Ajouter une note
            </button>
          </div>
        </div>

        {hasNote && (
          <div className="mt-4 rounded-xl border border-border bg-muted px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Note récente</p>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">{note}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {author && <span className="text-primary font-medium">{author}</span>}
                    {author && savedAt && " · "}
                    {savedAt ? formatTime(new Date(savedAt)) : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setDraftNote(note); setIsModalOpen(true); }}
                  className="interactive-muted inline-flex size-8 shrink-0 items-center justify-center rounded-lg"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Add / Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
          <button type="button" onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[101] flex h-full w-full flex-col bg-card shadow-lg sm:h-auto sm:max-w-2xl sm:rounded-xl sm:border sm:border-border sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-primary">Notes</p>
                <h2 className="mt-0.5 text-lg font-semibold text-foreground">{moduleLabel}</h2>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="interactive-muted rounded-lg p-2">
                <X className="size-4" />
              </button>
            </div>
            <textarea
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              rows={8}
              placeholder="Saisir une observation ou note..."
              className="mt-5 min-h-[260px] w-full flex-1 resize-y rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card"
            />
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button type="button" onClick={() => setIsModalOpen(false)} className="interactive-muted rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wide">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wide transition-all ${
                  isSaving ? "bg-muted text-muted-foreground cursor-not-allowed border border-border" : "interactive-primary"
                }`}
              >
                <Save className="size-3.5" />
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History drawer */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-end sm:items-center sm:justify-center p-0 sm:p-4">
          <button type="button" onClick={() => setIsHistoryOpen(false)} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[101] flex h-[80vh] w-full flex-col bg-card shadow-lg sm:h-auto sm:max-h-[70vh] sm:max-w-lg sm:rounded-xl sm:border sm:border-border">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-primary">Historique</p>
                <h2 className="mt-0.5 text-base font-semibold text-foreground">{moduleLabel}</h2>
              </div>
              <button type="button" onClick={() => setIsHistoryOpen(false)} className="interactive-muted rounded-lg p-2">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {historyLoading ? (
                <p className="text-center text-xs text-muted-foreground py-8">Chargement...</p>
              ) : history.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">Aucune note pour cette étape.</p>
              ) : (
                history.map((entry, i) => (
                  <div key={entry.id} className={`rounded-xl border px-4 py-3 ${i === 0 ? "border-primary/30 bg-primary-muted" : "border-border bg-muted"}`}>
                    {i === 0 && (
                      <span className="mb-2 inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                        Dernière note
                      </span>
                    )}
                    <p className="text-sm font-medium text-foreground">{entry.note}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      <span className="text-primary font-medium">{entry.author}</span>
                      {" · "}
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

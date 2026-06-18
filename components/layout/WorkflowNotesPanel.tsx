"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Pencil, Save } from "lucide-react";
import { MODULE_LABELS } from "../types";

type WorkflowNotesPanelProps = {
  moduleKey: string;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function WorkflowNotesPanel({ moduleKey }: WorkflowNotesPanelProps) {
  const [note, setNote] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadNote = async () => {
      try {
        const response = await fetch(`/api/workflow-notes?moduleKey=${encodeURIComponent(moduleKey)}`, {
          method: "GET",
          headers: { "content-type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to load workflow note");
        }

        const payload = (await response.json()) as { note: { note: string; updatedAt: string } | null };

        if (!isMounted) return;

        const nextNote = payload.note?.note ?? "";
        setNote(nextNote);
        setDraftNote(nextNote);
        setSavedAt(payload.note?.updatedAt ?? null);
      } catch {
        if (!isMounted) return;
        setNote("");
        setDraftNote("");
        setSavedAt(null);
      }
    };

    loadNote();

    return () => {
      isMounted = false;
    };
  }, [moduleKey]);

  useEffect(() => {
    if (!isModalOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  const recentNotes = useMemo(() => {
    if (!note.trim()) return [];

    return [
      {
        content: note,
        updatedAt: savedAt,
      },
    ];
  }, [note, savedAt]);

  const handleSave = async () => {
    const nextNote = draftNote.trim();
    const optimisticSavedAt = new Date().toISOString();

    setNote(nextNote);
    setSavedAt(optimisticSavedAt);
    setIsSaving(true);

    try {
      const response = await fetch("/api/workflow-notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          moduleKey,
          note: nextNote,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save workflow note");
      }

      const payload = (await response.json()) as { note: { note: string; updatedAt: string } };
      setNote(payload.note.note);
      setDraftNote(payload.note.note);
      setSavedAt(payload.note.updatedAt);
      setIsModalOpen(false);
    } catch {
      setSavedAt(null);
    } finally {
      setIsSaving(false);
    }
  };

  const moduleLabel = MODULE_LABELS[moduleKey] ?? "Étape";

  return (
    <>
      <section className="mb-4 rounded-[2rem] border border-[#d5e2ea] bg-white/95 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#1378ac]">
              Notes
            </p>
            <h2 className="mt-1 text-lg font-black tracking-tight text-[#0b4867]">
              Notes de l&apos;étape
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[#d5e2ea] bg-[#f8fbfd] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              {moduleLabel}
            </span>
            <button
              type="button"
              onClick={() => {
                setDraftNote(note);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1378ac] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[#1378ac]/20 transition hover:bg-[#0f6a98]"
            >
              <FileText className="h-4 w-4" />
              Ajouter une note
            </button>
          </div>
        </div>

        {recentNotes.length > 0 ? (
          <div className="mt-4 rounded-[1.5rem] border border-[#d5e2ea] bg-[#f8fbfd] px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Notes récentes
            </p>
            <div className="mt-3 space-y-3">
              {recentNotes.map((entry, index) => (
                <div key={`${moduleKey}-${index}`} className="rounded-2xl border border-[#d5e2ea] bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-[#0b4867]">{entry.content}</p>
                      <p className="mt-2 text-[11px] font-semibold text-slate-400">
                        {entry.updatedAt ? `Mis à jour à ${formatTime(new Date(entry.updatedAt))}` : "Note locale"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDraftNote(note);
                        setIsModalOpen(true);
                      }}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 transition hover:border-[#1378ac]/20 hover:text-[#1378ac]"
                      aria-label={`Modifier la note de ${moduleLabel}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
            aria-label="Fermer la fenêtre de notes"
          />
          <div className="relative z-[101] flex h-full w-full flex-col bg-white shadow-2xl sm:h-auto sm:max-w-2xl sm:rounded-[2rem] sm:border sm:border-[#d5e2ea] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#1378ac]">
                  Notes
                </p>
                <h2 className="mt-1 text-xl font-black text-[#0b4867]">
                  {`Add Note: ${moduleLabel}`}
                </h2>
              </div>
              <span className="rounded-full border border-[#d5e2ea] bg-[#f8fbfd] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                {moduleLabel}
              </span>
            </div>

            <textarea
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              rows={8}
              placeholder="Type your observation or note here..."
              className="mt-5 min-h-[260px] w-full flex-1 resize-y rounded-2xl border border-[#d5e2ea] bg-[#f8fbfd] px-4 py-4 text-base font-medium text-[#0b4867] outline-none transition placeholder:text-slate-400 focus:border-[#1378ac] focus:bg-white"
            />

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-transparent bg-transparent px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1378ac] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[#1378ac]/20 transition hover:bg-[#0f6a98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, History, MessageSquare } from "lucide-react";

type HistoryZone = "zone-sale" | "zone-propre" | "zone-sterile";
type HistoryCriticality = "normal" | "urgent" | "risque";
type TimeFilter = "all" | "today" | "last-4h" | "last-24h" | "custom-minutes";

type HistoryStatus = "Active" | "Validé";

type HistoryRow = {
  id: string;
  boxId: string;
  boxName: string;
  zone: HistoryZone;
  criticality: HistoryCriticality;
  phase: string;
  startTime: string;
  status: HistoryStatus;
  details: string[];
  agent: string;
  note: string;
};

const STORAGE_KEY = "workflow_history_notes";
const WASHING_TRACE_STORAGE_KEY = "washing_cycle_trace";

type WashingTrace = {
  washing_mode?: string[];
  selected_cycle?: string | null;
  ultrasonic_parameters?: {
    temperature_c?: string;
    duration_min?: string;
  } | null;
};

const BASE_HISTORY_ROWS: HistoryRow[] = [
  {
    id: "phase-sterilisation",
    boxId: "BOX-VISC-001",
    boxName: "Boîte Petite Chirurgie Orthopédique #01",
    zone: "zone-sterile",
    criticality: "normal",
    phase: "Stérilisation",
    startTime: "2026-04-14T13:45:00",
    status: "Active",
    details: ["Cycle vapeur 134°C", "A0: 3120", "Charge: 6 plateaux"],
    agent: "Amina Benali",
    note: "",
  },
  {
    id: "phase-conditionnement",
    boxId: "BOX-VISC-001",
    boxName: "Boîte Petite Chirurgie Orthopédique #01",
    zone: "zone-propre",
    criticality: "normal",
    phase: "Conditionnement",
    startTime: "2026-04-14T11:30:00",
    status: "Validé",
    details: ["Sachets scellés", "Indicateur interne vérifié", "Lot: COND-240414"],
    agent: "Amina Benali",
    note: "Indicateur chimique placé à l'intérieur.",
  },
  {
    id: "phase-nettoyage",
    boxId: "BOX-VISC-001",
    boxName: "Boîte Petite Chirurgie Orthopédique #01",
    zone: "zone-sale",
    criticality: "normal",
    phase: "Nettoyage",
    startTime: "2026-04-14T09:05:00",
    status: "Validé",
    details: ["Laveur LD-02", "A0: 3250", "Détergent: Anioxyde"],
    agent: "Salma Idrissi",
    note: "",
  },
  {
    id: "phase-reception",
    boxId: "BOX-VISC-001",
    boxName: "Boîte Petite Chirurgie Orthopédique #01",
    zone: "zone-sale",
    criticality: "urgent",
    phase: "Réception",
    startTime: "2026-04-14T08:20:00",
    status: "Validé",
    details: ["Transport: ARMOIRE-TRANS-01", "Bac: BAC-TREM-001", "H2O2 Area: 812 mg-sec/l"],
    agent: "Amina Benali",
    note: "",
  },
  {
    id: "phase-sterilisation-box2",
    boxId: "BOX-CELIO-002",
    boxName: "Boîte CELIO #02",
    zone: "zone-sterile",
    criticality: "normal",
    phase: "Stérilisation",
    startTime: "2026-04-14T12:40:00",
    status: "Active",
    details: ["Cycle vapeur 134°C", "A0: 3050", "Charge: 4 plateaux"],
    agent: "Salma Idrissi",
    note: "",
  },
  {
    id: "phase-conditionnement-box2",
    boxId: "BOX-CELIO-002",
    boxName: "Boîte CELIO #02",
    zone: "zone-propre",
    criticality: "normal",
    phase: "Conditionnement",
    startTime: "2026-04-14T11:00:00",
    status: "Validé",
    details: ["Sachet double", "Lot: COND-240414-B", "Indicateur interne OK"],
    agent: "Salma Idrissi",
    note: "",
  },
];

function formatStartTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(ms: number) {
  const safeMs = Math.max(ms, 0);
  const totalMinutes = Math.floor(safeMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
  }

  return `${totalMinutes} min`;
}

export function HistoryView() {
  const [now, setNow] = useState(() => new Date());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [washingTrace, setWashingTrace] = useState<WashingTrace | null>(null);
  const [selectedRow, setSelectedRow] = useState<HistoryRow | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [selectedBoxId, setSelectedBoxId] = useState("BOX-VISC-001");
  const [selectedZone, setSelectedZone] = useState<HistoryZone | "all">("all");
  const [selectedCriticality, setSelectedCriticality] = useState<HistoryCriticality | "all">("all");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>("all");
  const [customMinutes, setCustomMinutes] = useState("120");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setNotes(raw ? (JSON.parse(raw) as Record<string, string>) : {});
    } catch {
      setNotes({});
    }

    try {
      const rawTrace = localStorage.getItem(WASHING_TRACE_STORAGE_KEY);
      setWashingTrace(rawTrace ? (JSON.parse(rawTrace) as WashingTrace) : null);
    } catch {
      setWashingTrace(null);
    }
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const allRows = useMemo(() => {
    return BASE_HISTORY_ROWS.map((row) => ({
      ...row,
      details:
        row.phase === "Nettoyage" && washingTrace
          ? buildCleaningDetails(row.details, washingTrace)
          : row.details,
      note: notes[row.id] ?? row.note,
    }));
  }, [notes, washingTrace]);

  const boxOptions = useMemo(() => {
    const uniqueBoxes = new Map<string, { id: string; name: string }>();

    allRows.forEach((row) => {
      if (!uniqueBoxes.has(row.boxId)) {
        uniqueBoxes.set(row.boxId, { id: row.boxId, name: row.boxName });
      }
    });

    return Array.from(uniqueBoxes.values());
  }, [allRows]);

  const rows = useMemo(() => {
    return allRows.filter((row) => {
      if (row.boxId !== selectedBoxId) return false;
      if (selectedZone !== "all" && row.zone !== selectedZone) return false;
      if (selectedCriticality !== "all" && row.criticality !== selectedCriticality) return false;

      if (selectedTimeFilter === "all") return true;

      const rowTime = new Date(row.startTime).getTime();
      const nowTime = now.getTime();

      if (selectedTimeFilter === "today") {
        const rowDate = new Date(row.startTime);
        return rowDate.toDateString() === now.toDateString();
      }

      if (selectedTimeFilter === "last-4h") {
        return nowTime - rowTime <= 4 * 60 * 60 * 1000;
      }

      if (selectedTimeFilter === "last-24h") {
        return nowTime - rowTime <= 24 * 60 * 60 * 1000;
      }

      if (selectedTimeFilter === "custom-minutes") {
        const minutes = Number(customMinutes);
        if (Number.isNaN(minutes) || minutes <= 0) return true;
        return nowTime - rowTime <= minutes * 60 * 1000;
      }

      return true;
    });
  }, [allRows, customMinutes, now, selectedBoxId, selectedCriticality, selectedTimeFilter, selectedZone]);

  const selectedBox = boxOptions.find((box) => box.id === selectedBoxId) ?? boxOptions[0] ?? null;

  const openNote = (row: HistoryRow) => {
    setSelectedRow(row);
    setDraftNote(row.note);
  };

  const saveNote = () => {
    if (!selectedRow) return;

    const nextNotes = {
      ...notes,
      [selectedRow.id]: draftNote.trim(),
    };

    setNotes(nextNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextNotes));
    setSelectedRow(null);
  };

  return (
    <div className="h-full flex flex-col gap-6 text-slate-900">
      <section className="rounded-[2rem] border border-[#d5e2ea] bg-white/95 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b8cad6] bg-[#edf5f9] px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-[#1378ac]">
              <History className="h-3.5 w-3.5" />
              Vue Historique
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#0b4867]">
              Historique par boîte
            </h1>
            <p className="max-w-3xl text-sm font-medium text-slate-500">
              Suivi détaillé des phases, paramètres techniques, durée par étape et notes opératoires pour chaque boîte.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HistoryMetric label="Phases suivies" value={String(rows.length)} />
            <HistoryMetric label="Étape active" value={rows[0]?.phase ?? "Aucune"} />
            <HistoryMetric label="Boîte sélectionnée" value={selectedBox?.boxId ?? "--"} />
          </div>
        </div>
      </section>

      <section className="min-h-0 flex-1 rounded-[2rem] border border-[#d5e2ea] bg-white/95 shadow-sm overflow-hidden">
        <div className="border-b border-[#d5e2ea] bg-[#f8fbfd] px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#1378ac]">
                  Table d&apos;historique
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Calcul automatique de la durée dans chaque phase pour la boîte sélectionnée.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(260px,340px)_minmax(260px,1fr)]">
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Boîte
                  </span>
                  <select
                    value={selectedBoxId}
                    onChange={(event) => setSelectedBoxId(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#d5e2ea] bg-white px-4 py-3 text-sm font-semibold text-[#0b4867] outline-none transition focus:border-[#1378ac]"
                  >
                    {boxOptions.map((box) => (
                      <option key={box.id} value={box.id}>
                        {box.name} ({box.id})
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-2xl border border-[#d5e2ea] bg-white px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Identification
                  </p>
                  <p className="mt-1 text-sm font-black text-[#0b4867]">{selectedBox?.boxName ?? "Aucune boîte"}</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    {selectedBox?.id ?? "--"} • Mise à jour {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#1378ac]">
                Les filtres
              </p>
              <div className="mt-3 grid gap-3 xl:grid-cols-3">
                <div className="rounded-2xl border border-[#d5e2ea] bg-white px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Les filtres par zone
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <FilterChip label="Toutes" active={selectedZone === "all"} onClick={() => setSelectedZone("all")} />
                    <FilterChip label="Zone Sale" active={selectedZone === "zone-sale"} onClick={() => setSelectedZone("zone-sale")} />
                    <FilterChip label="Zone Propre" active={selectedZone === "zone-propre"} onClick={() => setSelectedZone("zone-propre")} />
                    <FilterChip label="Zone Stérile" active={selectedZone === "zone-sterile"} onClick={() => setSelectedZone("zone-sterile")} />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d5e2ea] bg-white px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Filtres Critiques (Urgent & Risque)
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <FilterChip label="Tous" active={selectedCriticality === "all"} onClick={() => setSelectedCriticality("all")} />
                    <FilterChip label="Urgent" active={selectedCriticality === "urgent"} onClick={() => setSelectedCriticality("urgent")} />
                    <FilterChip label="Risque" active={selectedCriticality === "risque"} onClick={() => setSelectedCriticality("risque")} />
                    <FilterChip label="Normal" active={selectedCriticality === "normal"} onClick={() => setSelectedCriticality("normal")} />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d5e2ea] bg-white px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Filtres Temporels
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <FilterChip label="Tout" active={selectedTimeFilter === "all"} onClick={() => setSelectedTimeFilter("all")} />
                    <FilterChip label="Aujourd'hui" active={selectedTimeFilter === "today"} onClick={() => setSelectedTimeFilter("today")} />
                    <FilterChip label="4h" active={selectedTimeFilter === "last-4h"} onClick={() => setSelectedTimeFilter("last-4h")} />
                    <FilterChip label="24h" active={selectedTimeFilter === "last-24h"} onClick={() => setSelectedTimeFilter("last-24h")} />
                    <FilterChip label="Intervalle" active={selectedTimeFilter === "custom-minutes"} onClick={() => setSelectedTimeFilter("custom-minutes")} />
                  </div>
                  <div className="mt-3">
                    <label className="block">
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Minutes pour l&apos;intervalle de recherche
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={customMinutes}
                        onChange={(event) => {
                          setCustomMinutes(event.target.value);
                          setSelectedTimeFilter("custom-minutes");
                        }}
                        className="mt-2 w-full rounded-2xl border border-[#d5e2ea] bg-[#f8fbfd] px-4 py-3 text-sm font-semibold text-[#0b4867] outline-none transition focus:border-[#1378ac] focus:bg-white"
                        placeholder="Ex: 120"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-auto h-full">
          <table className="w-full min-w-[1120px] text-left border-collapse">
            <thead className="sticky top-0 z-10 border-b border-[#d5e2ea] bg-white">
              <tr>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Boîte</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Zone</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Priorité</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Début</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Phase</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Statut</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Détails</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Durée dans l&apos;étape</th>
                <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Ajouter une note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf5f9]">
              {rows.map((row, index) => {
                const previousRow = index === 0 ? null : rows[index - 1];
                const durationTarget = previousRow ? new Date(previousRow.startTime) : now;
                const durationMs = durationTarget.getTime() - new Date(row.startTime).getTime();
                const isCurrentPhase = index === 0 && row.status === "Active";
                const hasNote = row.note.trim().length > 0;
                const noteEditable = row.status === "Active" || row.status === "Validé";

                return (
                  <tr key={row.id} className="align-top transition-colors hover:bg-[#f8fbfd]">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-black text-[#0b4867]">{row.boxId}</p>
                        <p className="mt-1 text-[11px] font-semibold text-slate-400">{row.boxName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-[#d5e2ea] bg-[#f8fbfd] px-3 py-1 text-[10px] font-black text-slate-500">
                        {row.zone === "zone-sale" ? "Zone Sale" : row.zone === "zone-propre" ? "Zone Propre" : "Zone Stérile"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase ${
                          row.criticality === "urgent"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : row.criticality === "risque"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-[#d5e2ea] bg-[#f8fbfd] text-slate-500"
                        }`}
                      >
                        {row.criticality}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-black text-[#0b4867]">{formatStartTime(row.startTime)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-black text-[#0b4867]">{row.phase}</p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-400">{row.agent}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                          row.status === "Active"
                            ? "border-[#1378ac]/20 bg-[#edf5f9] text-[#1378ac]"
                            : "border-[#bdece4] bg-[#eafaf7] text-[#0b786e]"
                        }`}
                      >
                        {row.status === "Validé" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        {row.details.map((detail) => (
                          <div
                            key={`${row.id}-${detail}`}
                            className="inline-flex mr-2 rounded-full border border-[#d5e2ea] bg-[#f8fbfd] px-3 py-1 text-[10px] font-black text-slate-500"
                          >
                            {detail}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {isCurrentPhase ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#1378ac]/20 bg-[#edf5f9] px-3 py-1 text-[10px] font-black text-[#1378ac] animate-pulse">
                          En cours ({formatDuration(durationMs)})
                        </span>
                      ) : (
                        <span className="text-sm font-black text-[#0b4867]">{formatDuration(durationMs)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => openNote(row)}
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-all touch-manipulation ${
                          hasNote
                            ? "border-[#1378ac]/20 bg-[#1378ac] text-white shadow-lg shadow-[#1378ac]/20"
                            : "border-slate-200 bg-white text-slate-300 hover:border-[#1378ac]/20 hover:text-[#1378ac]"
                        } ${noteEditable ? "cursor-pointer" : "cursor-default"}`}
                        aria-label={hasNote ? `Modifier la note de ${row.phase}` : `Ajouter une note à ${row.phase}`}
                      >
                        <MessageSquare className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRow ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setSelectedRow(null)}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
            aria-label="Fermer la note"
          />
          <div className="relative z-[101] w-full max-w-2xl rounded-[2rem] border border-[#d5e2ea] bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[#0b4867]">
                  {`Note de l'étape : ${selectedRow.phase}`}
                </h2>
                <p className="mt-1 text-[11px] font-semibold text-slate-400">
                  {selectedRow.boxName} • {selectedRow.boxId}
                </p>
              </div>
              <span className="rounded-full border border-[#d5e2ea] bg-[#f8fbfd] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                {formatStartTime(selectedRow.startTime)}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Contenu
                </span>
                <textarea
                  value={draftNote}
                  onChange={(event) => setDraftNote(event.target.value)}
                  rows={8}
                  placeholder="Ajouter une note opératoire..."
                  className="mt-2 min-h-[220px] w-full rounded-2xl border border-[#d5e2ea] bg-[#f8fbfd] px-4 py-4 text-base font-medium text-[#0b4867] outline-none transition placeholder:text-slate-400 focus:border-[#1378ac] focus:bg-white"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveNote}
                className="rounded-xl bg-[#1378ac] px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[#1378ac]/20 transition hover:bg-[#0f6a98]"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function buildCleaningDetails(baseDetails: string[], washingTrace: WashingTrace) {
  const details = [...baseDetails];

  if (washingTrace.washing_mode?.length) {
    details.unshift(`Mode: ${washingTrace.washing_mode.join(" + ")}`);
  }

  if (washingTrace.selected_cycle) {
    details.push(`Cycle: ${washingTrace.selected_cycle}`);
  }

  if (washingTrace.ultrasonic_parameters) {
    const { temperature_c, duration_min } = washingTrace.ultrasonic_parameters;

    if (temperature_c) {
      details.push(`Ultrasons: ${temperature_c}°C`);
    }

    if (duration_min) {
      details.push(`Duree ultrasons: ${duration_min} min`);
    }
  }

  return Array.from(new Set(details));
}

function HistoryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#d5e2ea] bg-[#f8fbfd] px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black tracking-tight text-[#0b4867]">{value}</p>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] transition ${
        active
          ? "border-[#1378ac] bg-[#1378ac] text-white shadow-lg shadow-[#1378ac]/20"
          : "border-[#d5e2ea] bg-[#f8fbfd] text-slate-500 hover:border-[#1378ac]/30 hover:text-[#1378ac]"
      }`}
    >
      {label}
    </button>
  );
}

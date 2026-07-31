"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Clock3, History, Package, Search, Wrench, X } from "lucide-react";

type ApiTray = { id: string; serialNumber: string; label: string };

type InstrumentItem = {
  id: string;
  instrumentSerial: string;
  name: string;
  category: string;
  status: "validated" | "missing" | "defective" | "pending";
  justification: string | null;
};

type ApiEvent = {
  id: string;
  type: string;
  phase: string;
  timestamp: string;
  operator: string;
  zone: "zone-sale" | "zone-propre" | "zone-sterile";
  criticality: "normal" | "urgent" | "risque";
  details: string[];
  instruments?: InstrumentItem[];
};

type Cycle = {
  cycleId: string;
  index: number;
  events: ApiEvent[];
  startTime: string;
  endTime: string | null;
  status: "Terminé" | "En cours" | "Incomplet";
  stepsCompleted: number;
};


const ORDERED_STEPS = [
  "RECEPTION",
  "PRE_DISINFECTION",
  "WASH",
  "RECOMPOSITION",
  "STERILIZATION_LOAD",
  "STERILIZATION_UNLOAD",
  "STORED",
];

const INSTRUMENT_STATUS_CLASS: Record<string, string> = {
  validated: "border-secondary/20 bg-secondary-muted text-secondary",
  missing: "border-destructive/20 bg-destructive/5 text-destructive",
  defective: "border-warning/20 bg-warning-muted text-warning",
  pending: "border-border bg-muted text-muted-foreground",
};

function buildCycle(index: number, events: ApiEvent[]): Cycle {
  const types = new Set(events.map((e) => e.type));
  const storedEvent = events.find((e) => e.type === "STORED");
  const receptionEvent = events.find((e) => e.type === "RECEPTION");
  const anchor = receptionEvent ?? events.find((e) => e.type === "PRE_DISINFECTION") ?? events[0];
  const cycleId = anchor ? `#${anchor.id.substring(0, 8).toUpperCase()}` : `#${index.toString().padStart(4, "0")}`;

  let status: "Terminé" | "En cours" | "Incomplet";
  if (storedEvent) {
    status = "Terminé";
  } else if (events.length > 1) {
    status = "En cours";
  } else {
    status = "Incomplet";
  }

  return {
    cycleId,
    index,
    events: [...events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ),
    startTime: receptionEvent?.timestamp ?? events[0].timestamp,
    endTime: storedEvent?.timestamp ?? null,
    status,
    stepsCompleted: ORDERED_STEPS.filter((t) => types.has(t)).length,
  };
}

// Split on STORED events: each STORED closes a cycle.
// PRE_DISINFECTION has an earlier timestamp than its linked RECEPTION, so
// splitting on RECEPTION would misattribute PRE_DISINFECTION to the wrong cycle.
function groupIntoCycles(events: ApiEvent[]): Cycle[] {
  const ascending = [...events].reverse();
  const cycles: Cycle[] = [];
  let current: ApiEvent[] = [];

  for (const e of ascending) {
    current.push(e);
    if (e.type === "STORED") {
      cycles.push(buildCycle(cycles.length + 1, current));
      current = [];
    }
  }
  if (current.length > 0) {
    cycles.push(buildCycle(cycles.length + 1, current));
  }

  return cycles.reverse();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryView() {
  const [trays, setTrays] = useState<ApiTray[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTraySerial, setSelectedTraySerial] = useState("");
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [cycleFilter, setCycleFilter] = useState<"all" | "Terminé" | "En cours" | "Incomplet">("all");
  const [expandedInstrumentEvents, setExpandedInstrumentEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/trays")
      .then((r) => r.json())
      .then((d: { trays: ApiTray[] }) => {
        setTrays(d.trays);
        if (d.trays.length > 0) setSelectedTraySerial(d.trays[0].serialNumber);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTraySerial) return;
    setLoading(true);
    setSelectedCycle(null);
    fetch(`/api/history/tray/${encodeURIComponent(selectedTraySerial)}`)
      .then((r) => r.json())
      .then((d: { events: ApiEvent[] }) => setEvents(d.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [selectedTraySerial]);

  useEffect(() => {
    setExpandedInstrumentEvents(new Set());
  }, [selectedCycle?.cycleId]);

  const selectedTray = trays.find((t) => t.serialNumber === selectedTraySerial) ?? null;

  const filteredTrays = useMemo(() => {
    if (!searchQuery.trim()) return trays;
    const q = searchQuery.toLowerCase();
    return trays.filter(
      (t) =>
        t.serialNumber.toLowerCase().includes(q) ||
        t.label.toLowerCase().includes(q)
    );
  }, [trays, searchQuery]);

  const cycles = useMemo(() => groupIntoCycles(events), [events]);

  const filteredCycles = useMemo(() => {
    if (cycleFilter === "all") return cycles;
    return cycles.filter((c) => c.status === cycleFilter);
  }, [cycles, cycleFilter]);

  const toggleInstruments = (eventId: string) => {
    setExpandedInstrumentEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const metrics = [
    { label: "Total cycles", value: String(cycles.length) },
    { label: "Terminés", value: String(cycles.filter((c) => c.status === "Terminé").length) },
    { label: "Boîte sélectionnée", value: selectedTraySerial || "—" },
  ];

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
              <History className="h-3.5 w-3.5" />
              Vue Historique
            </div>
            <h1 className="text-xl font-semibold text-foreground">Traçabilité des boîtes</h1>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-border bg-muted px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main area: tray picker + cycle list */}
      <div className="min-h-0 flex-1 flex gap-4">
        {/* Tray picker */}
        <section className="w-60 shrink-0 rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
          <div className="shrink-0 p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Chercher une boîte…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted pl-8 pr-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-card"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredTrays.length === 0 ? (
              <p className="p-4 text-xs font-medium text-muted-foreground text-center">
                Aucune boîte trouvée
              </p>
            ) : (
              filteredTrays.map((t) => (
                <button
                  key={t.serialNumber}
                  type="button"
                  onClick={() => {
                    setSelectedTraySerial(t.serialNumber);
                    setSearchQuery("");
                  }}
                  className={`w-full px-3 py-2.5 text-left transition-colors border-b border-border last:border-b-0 ${
                    t.serialNumber === selectedTraySerial
                      ? "bg-primary-muted"
                      : "hover:bg-muted"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold truncate ${
                      t.serialNumber === selectedTraySerial ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {t.serialNumber}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-0.5 truncate">
                    {t.label}
                  </p>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Cycle list */}
        <section className="min-h-0 flex-1 rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="shrink-0 px-4 py-3 border-b border-border flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {selectedTray?.label ?? "Sélectionner une boîte"}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground">
                {selectedTraySerial || "—"}
              </p>
            </div>
            <div className="flex rounded-lg border border-border bg-muted p-1 gap-1 shrink-0">
              {(["all", "Terminé", "En cours", "Incomplet"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCycleFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-medium transition-colors ${
                    cycleFilter === f
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "Tous" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Cycles */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-7 w-7 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            ) : filteredCycles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Package className="size-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">
                  {events.length === 0
                    ? "Aucun cycle enregistré pour cette boîte"
                    : "Aucun cycle ne correspond au filtre"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredCycles.map((cycle) => (
                  <CycleRow
                    key={cycle.cycleId}
                    cycle={cycle}
                    selected={selectedCycle?.cycleId === cycle.cycleId}
                    onClick={() =>
                      setSelectedCycle(
                        selectedCycle?.cycleId === cycle.cycleId ? null : cycle
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Cycle detail modal */}
      {selectedCycle && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setSelectedCycle(null)}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            aria-label="Fermer"
          />
          <div className="relative z-[51] w-full max-w-lg bg-card rounded-xl border border-border shadow-sm flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="shrink-0 flex items-center justify-between p-4 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {formatDateTime(selectedCycle.startTime)} — {selectedTray?.label ?? selectedTraySerial}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                  {formatDate(selectedCycle.startTime)}
                  {selectedCycle.endTime
                    ? ` → ${formatDate(selectedCycle.endTime)}`
                    : " · En cours"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCycle(null)}
                className="interactive-muted flex items-center justify-center size-8 rounded-lg"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Event timeline */}
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {selectedCycle.events.map((event, idx) => {
                const isLast = idx === selectedCycle.events.length - 1;
                const isRecompo =
                  event.type === "RECOMPOSITION" &&
                  event.instruments &&
                  event.instruments.length > 0;
                const instrumentsExpanded = expandedInstrumentEvents.has(event.id);

                return (
                  <div key={event.id} className="relative">
                    {/* Vertical connector */}
                    {!isLast && (
                      <div className="absolute left-[12px] top-[26px] bottom-[-12px] w-px bg-border" />
                    )}
                    <div className="flex gap-3">
                      {/* Step dot */}
                      <div
                        className={`shrink-0 mt-0.5 size-[26px] rounded-full flex items-center justify-center border-2 ${
                          event.type === "STORED"
                            ? "border-secondary bg-secondary-muted"
                            : event.criticality === "risque"
                              ? "border-destructive bg-destructive/5"
                              : "border-primary bg-primary-muted"
                        }`}
                      >
                        {event.type === "STORED" ? (
                          <CheckCircle2 className="size-3 text-secondary" />
                        ) : (
                          <Clock3 className="size-3 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground">{event.phase}</p>
                          <p className="text-[10px] font-medium text-muted-foreground shrink-0">
                            {formatDateTime(event.timestamp)}
                          </p>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                          {event.operator}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {event.details.map((d) => (
                            <span
                              key={d}
                              className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                            >
                              {d}
                            </span>
                          ))}
                        </div>

                        {/* Instruments section for RECOMPOSITION */}
                        {isRecompo && (
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => toggleInstruments(event.id)}
                              className="interactive-muted inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wide"
                            >
                              <Wrench className="size-3" />
                              {instrumentsExpanded
                                ? "Masquer instruments"
                                : `Voir instruments (${event.instruments!.length})`}
                            </button>

                            {instrumentsExpanded && (
                              <div className="mt-2 rounded-xl border border-border bg-muted overflow-hidden">
                                {event.instruments!.map((inst) => (
                                  <div
                                    key={inst.id}
                                    className="flex items-center gap-2 px-3 py-2 border-b border-border last:border-b-0"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-semibold text-foreground truncate">
                                        {inst.name}
                                      </p>
                                      <p className="text-[9px] font-medium text-muted-foreground">
                                        {inst.instrumentSerial} · {inst.category}
                                      </p>
                                    </div>
                                    <span
                                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase ${
                                        INSTRUMENT_STATUS_CLASS[inst.status] ??
                                        INSTRUMENT_STATUS_CLASS.pending
                                      }`}
                                    >
                                      {inst.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function CycleRow({
  cycle,
  selected,
  onClick,
}: {
  cycle: Cycle;
  selected: boolean;
  onClick: () => void;
}) {
  const statusClass = {
    Terminé: "border-secondary/20 bg-secondary-muted text-secondary",
    "En cours": "border-primary/20 bg-primary-muted text-primary",
    Incomplet: "border-warning/20 bg-warning-muted text-warning",
  }[cycle.status];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-4 py-3.5 text-left flex items-center gap-4 transition-colors ${
        selected ? "bg-primary-muted" : "hover:bg-muted"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-semibold text-foreground">{formatDateTime(cycle.startTime)}</p>
          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase ${statusClass}`}>
            {cycle.status}
          </span>
        </div>
        <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
          {formatDate(cycle.startTime)}
          {cycle.endTime ? ` → ${formatDate(cycle.endTime)}` : " → En cours"}
        </p>
        {/* Step progress bar */}
        <div className="mt-1.5 flex items-center gap-1">
          {ORDERED_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < cycle.stepsCompleted ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
          <span className="ml-1 text-[9px] font-medium text-muted-foreground">
            {cycle.stepsCompleted}/7
          </span>
        </div>
      </div>

      <ChevronRight
        className={`shrink-0 size-4 text-muted-foreground transition-transform ${
          selected ? "rotate-90" : ""
        }`}
      />
    </button>
  );
}

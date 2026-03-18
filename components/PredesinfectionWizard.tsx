"use client";

import { useState } from "react";

type Priority = "standard" | "urgent";

type InstrumentLine = {
  id: string;
  name: string;
  designation: string;
  quantity: number;
};

interface PredesinfectionWizardProps {
  cycleId: string;
}

export function PredesinfectionWizard({ cycleId }: PredesinfectionWizardProps) {
  const [priority, setPriority] = useState<Priority>("standard");
  const [boxName, setBoxName] = useState("");
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  const [trayScanned, setTrayScanned] = useState(false);
  const [boxScanned, setBoxScanned] = useState(false);

  const [provenance] = useState("SALLE OP n° 04");
  const [soakingSummary] = useState({
    detergent: "Anioxyde 1000",
    duration: "10 min",
    dilution: "0,5%",
    dosage: "50 mL/L",
    waterVolume: "12 L",
  });
  const [instruments] = useState<InstrumentLine[]>([
    { id: "ins-1", quantity: 4, name: "Ciseaux", designation: "Mayo Droit 14cm" },
    { id: "ins-2", quantity: 2, name: "Pinces", designation: "Hémostatiques Kocher" },
    { id: "ins-3", quantity: 1, name: "Porte-aiguille", designation: "Mayo-Hegar 16cm" },
    { id: "ins-4", quantity: 6, name: "Ecarteurs", designation: "Farabeuf 15cm" },
    { id: "ins-11", quantity: 4, name: "Ciseaux", designation: "Mayo Droit 14cm" },
    { id: "ins-12", quantity: 2, name: "Pinces", designation: "Hémostatiques Kocher" },
    { id: "ins-13", quantity: 1, name: "Porte-aiguille", designation: "Mayo-Hegar 16cm" },
    { id: "ins-14", quantity: 6, name: "Ecarteurs", designation: "Farabeuf 15cm" },
  ]);
  const [unusedInstruments] = useState<InstrumentLine[]>([
    { id: "un-1", quantity: 2, name: "Lame", designation: "Bistouri n°15 (non utilisée)" },
    { id: "un-2", quantity: 1, name: "Canule", designation: "Aspiration Chirurgicale (neuve)" },
  ]);

  const triggerSimulation = () => {
    if (!trayScanned) setTrayScanned(true);
    else if (!boxScanned) {
      setBoxScanned(true);
      setBoxName("CONTENEUR_A1");
    } else if (!operatorConfirmed) {
      setOperatorConfirmed(true);
    }
  };

  const isComplete = trayScanned && boxScanned && operatorConfirmed;
  const quickActionLabel = !trayScanned
    ? "Scanner le bac"
    : !boxScanned
      ? "Scanner le conteneur"
      : !operatorConfirmed
        ? "Scanner le badge"
        : null;

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        <header className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr] shrink-0">
          <section className="rounded-3xl border border-[#d5e2ea] bg-white/95 p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center rounded-full border border-[#b8cad6] bg-[#edf5f9] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#1378ac]">
                  Phase 01
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[#0b4867]">
                  Prédésinfection
                </h1>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoTile label="Cycle" value={cycleId} />
                <InfoTile
                  label="Statut"
                  value={isComplete ? "Prêt à valider" : "En cours"}
                />
              </div>
            </div>
          </section>

          <section
            className={`rounded-3xl border bg-white/95 p-4 shadow-sm transition-all duration-500 ${
              operatorConfirmed
                ? "border-[#11b5a2] ring-4 ring-[#eafaf7]"
                : "border-[#d5e2ea]"
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white shadow-lg">
                  03
                </span>
                <h2 className="text-sm font-semibold tracking-tight text-[#0b4867]">
                  Agent responsable
                </h2>
              </div>
              {operatorConfirmed && (
                <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">
                  Validé
                </span>
              )}
            </div>

            {!operatorConfirmed ? (
              <div className="flex h-[60px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400">
                <p className="text-center text-[9px] font-bold uppercase tracking-[0.18em]">
                  Scanner le badge
                </p>
              </div>
            ) : (
                <div className="rounded-2xl bg-[#0b4867] p-2.5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#0a3952] bg-[#1378ac] text-lg shadow-inner">
                    👩‍🔬
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-tight truncate">Amina BENALI</p>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#8de7da] truncate">
                      Agent de stérilisation
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </header>

        <div className="grid gap-4 xl:grid-cols-2 flex-1 min-h-[400px]">
          <section
            className={`flex flex-col rounded-3xl border bg-white/95 p-4 shadow-sm transition-all duration-500 overflow-hidden ${
              trayScanned ? "border-[#11b5a2] ring-4 ring-[#eafaf7]" : "border-[#d5e2ea]"
            }`}
          >
            <div className="mb-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white shadow-lg">
                  01
                </span>
                <h2 className="text-sm font-semibold tracking-tight text-[#0b4867]">
                  Bac de trempage
                </h2>
              </div>
              {trayScanned && (
                <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">
                  Scanné
                </span>
              )}
            </div>

            {!trayScanned ? (
              <div className="flex-1 flex">
                <ScanPlaceholder icon="🛁" label="Scanner le bac" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-2 sm:grid-cols-2 shrink-0">
                  <div className="rounded-2xl border border-[#bdece4] bg-[#eafaf7] p-3 flex flex-col justify-center">
                    <p className="mb-0.5 text-[8px] font-semibold uppercase tracking-[0.24em] text-[#0b786e]">
                      Provenance
                    </p>
                    <p className="text-xs font-semibold tracking-tight text-[#0b4867]">
                      {provenance}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(soakingSummary).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="rounded-xl border border-[#d5e2ea] bg-[#f8fbfd] p-1.5">
                        <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          {key}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-700">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <CompactTable
                    title="Instruments identifiés"
                    count={instruments.length}
                    rows={instruments}
                  />
                </div>
              </div>
            )}
          </section>

          <section
            className={`flex flex-col rounded-3xl border bg-white/95 p-4 shadow-sm transition-all duration-500 overflow-hidden ${
              boxScanned ? "border-[#11b5a2] ring-4 ring-[#eafaf7]" : "border-[#d5e2ea]"
            }`}
          >
            <div className="mb-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white shadow-lg">
                  02
                </span>
                <h2 className="text-sm font-semibold tracking-tight text-[#0b4867]">
                  Identification conteneur
                </h2>
              </div>
              {boxScanned && (
                <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">
                  Identifié
                </span>
              )}
            </div>

            {!boxScanned ? (
              <div className="flex-1 flex">
                <ScanPlaceholder icon="📦" label="Scanner le conteneur" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between rounded-2xl border border-[#bdece4] bg-[#eafaf7] p-3 shrink-0">
                  <div>
                    <p className="mb-0.5 text-[8px] font-semibold uppercase tracking-[0.24em] text-[#0b786e]">
                      ID conteneur
                    </p>
                    <p className="text-sm font-semibold tracking-tight text-[#0b4867]">
                      {boxName}
                    </p>
                  </div>
                  <div className="text-2xl opacity-20">📦</div>
                </div>

                <div className="rounded-2xl border border-[#d5e2ea] bg-[#f8fbfd] p-2.5 shrink-0">
                  <p className="mb-2 text-center text-[8px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Priorité
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <PriorityButton
                      active={priority === "standard"}
                      label="Standard"
                      icon="🐢"
                      activeClass="border-[#1378ac] bg-[#1378ac] text-white"
                      onClick={() => setPriority("standard")}
                    />
                    <PriorityButton
                      active={priority === "urgent"}
                      label="Urgent"
                      icon="🚀"
                      activeClass="border-[#0b4867] bg-[#0b4867] text-white"
                      onClick={() => setPriority("urgent")}
                    />
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <CompactTable
                    title="Instruments non utilisés"
                    count={unusedInstruments.length}
                    rows={unusedInstruments}
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Footer Actions - Always Visible */}
      <div className="shrink-0 flex items-center justify-center bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-[#d5e2ea] shadow-lg mt-auto">
        <button
          onClick={() => alert("Prédésinfection Terminée !")}
          disabled={!isComplete}
          className={`group relative rounded-xl px-12 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-300 ${
            isComplete
              ? "bg-[#1378ac] text-white hover:bg-[#0f6a98] shadow-md"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isComplete && (
            <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[#11b5a2] p-1 text-[8px] text-white shadow-lg">
              ✓
            </span>
          )}
          Valider l&apos;étape
        </button>

        {quickActionLabel && (
          <button
            onClick={triggerSimulation}
            className="absolute right-6 flex items-center gap-2 rounded-full bg-[#0b4867] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-md transition-all hover:bg-[#0a3952] group"
          >
            <span className="text-lg text-[#8de7da]">⌁</span>
            <span>{quickActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d5e2ea] bg-[#f8fbfd] px-2.5 py-1.5">
      <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold text-[#0b4867]">{value}</p>
    </div>
  );
}

function ScanPlaceholder({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400 p-4">
      <div className="text-2xl opacity-50">{icon}</div>
      <p className="px-2 text-center text-[9px] font-bold uppercase tracking-[0.2em]">
        {label}
      </p>
    </div>
  );
}

function PriorityButton({
  active,
  label,
  icon,
  activeClass,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: string;
  activeClass: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg border-2 py-1.5 px-3 transition-all ${
        active
          ? activeClass
          : "border-[#d5e2ea] bg-white text-slate-400 hover:border-[#b8cad6]"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="text-[8px] font-semibold uppercase tracking-[0.2em]">
        {label}
      </span>
    </button>
  );
}

function CompactTable({
  title,
  count,
  rows,
}: {
  title: string;
  count: number;
  rows: InstrumentLine[];
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-[#d5e2ea] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#d5e2ea] bg-[#f8fbfd] px-3 py-1.5 shrink-0">
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </span>
        <span className="rounded-full bg-[#1378ac] px-2 py-0.5 text-[8px] font-semibold text-white">
          {count}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left table-fixed">
          <thead className="sticky top-0 z-10 border-b border-[#d5e2ea] bg-white">
            <tr>
              <th className="w-10 px-2 py-1.5 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Qté
              </th>
              <th className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Nom
              </th>
              <th className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Désignation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf5f9]">
            {rows.map((row) => (
              <tr key={row.id} className="text-[10px] transition-colors hover:bg-[#f8fbfd]">
                <td className="px-2 py-1.5 text-center font-semibold text-[#1378ac]">
                  x{row.quantity}
                </td>
                <td className="px-2 py-1.5 font-semibold text-slate-800 truncate">{row.name}</td>
                <td className="px-2 py-1.5 font-medium text-slate-500 truncate">{row.designation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

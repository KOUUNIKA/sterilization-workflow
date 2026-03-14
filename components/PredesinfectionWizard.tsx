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
      ? "Scanner le contenant"
      : !operatorConfirmed
        ? "Scanner le badge"
        : null;

  return (
    <div className="min-h-screen px-6 py-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr]">
          <section className="rounded-3xl border border-[#d5e2ea] bg-white/95 p-5 shadow-[0_20px_45px_rgba(11,72,103,0.08)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full border border-[#b8cad6] bg-[#edf5f9] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1378ac]">
                  Phase 01
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#0b4867]">
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
            className={`rounded-3xl border bg-white/95 p-5 shadow-[0_20px_45px_rgba(11,72,103,0.08)] transition-all duration-500 ${
              operatorConfirmed
                ? "border-[#11b5a2] ring-4 ring-[#eafaf7]"
                : "border-[#d5e2ea]"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1378ac] text-sm font-semibold text-white shadow-lg">
                  03
                </span>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#0b4867]">
                    Agent responsable
                  </h2>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Badge opérateur
                  </p>
                </div>
              </div>
              {operatorConfirmed && (
                <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">
                  Validé
                </span>
              )}
            </div>

            {!operatorConfirmed ? (
              <div className="flex min-h-[150px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400">
                <div className="text-4xl opacity-50">👤</div>
                <p className="px-4 text-center text-xs font-bold uppercase tracking-[0.18em]">
                  Scanner le badge de l&apos;agent
                </p>
              </div>
            ) : (
                <div className="rounded-2xl bg-[#0b4867] p-4 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#0a3952] bg-[#1378ac] text-2xl shadow-inner">
                    👩‍🔬
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold tracking-tight">Amina BENALI</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8de7da]">
                      Agent de stérilisation
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
                  <span>Habilitation</span>
                  <span className="text-white">Zone propre</span>
                </div>
              </div>
            )}
          </section>
        </header>

        <div className="grid gap-5 xl:grid-cols-[1.03fr_0.97fr]">
          <section
            className={`rounded-3xl border bg-white/95 p-5 shadow-[0_20px_45px_rgba(11,72,103,0.08)] transition-all duration-500 ${
              trayScanned ? "border-[#11b5a2] ring-4 ring-[#eafaf7]" : "border-[#d5e2ea]"
            }`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1378ac] text-sm font-semibold text-white shadow-lg">
                  01
                </span>
                <h2 className="text-lg font-semibold tracking-tight text-[#0b4867]">
                  Bac de trempage
                </h2>
              </div>
              {trayScanned && (
                <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">
                  Scanné
                </span>
              )}
            </div>

            {!trayScanned ? (
              <ScanPlaceholder icon="🛁" label="Scanner le code-barres du bac" />
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl border border-[#bdece4] bg-[#eafaf7] p-5">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0b786e]">
                      Provenance
                    </p>
                    <p className="text-lg font-semibold tracking-tight text-[#0b4867]">
                      {provenance}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(soakingSummary).map(([key, value]) => (
                      <div key={key} className="rounded-xl border border-[#d5e2ea] bg-[#f8fbfd] p-3">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          {key}
                        </p>
                        <p className="text-sm font-semibold text-slate-700">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <CompactTable
                  title="Instruments identifiés"
                  count={instruments.length}
                  rows={instruments}
                />
              </div>
            )}
          </section>

          <section
            className={`rounded-3xl border bg-white/95 p-5 shadow-[0_20px_45px_rgba(11,72,103,0.08)] transition-all duration-500 ${
              boxScanned ? "border-[#11b5a2] ring-4 ring-[#eafaf7]" : "border-[#d5e2ea]"
            }`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1378ac] text-sm font-semibold text-white shadow-lg">
                  02
                </span>
                <h2 className="text-lg font-semibold tracking-tight text-[#0b4867]">
                  Identification contenant
                </h2>
              </div>
              {boxScanned && (
                <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">
                  Identifié
                </span>
              )}
            </div>

            {!boxScanned ? (
              <ScanPlaceholder icon="📦" label="Scanner le code-barres du contenant" />
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between rounded-2xl border border-[#bdece4] bg-[#eafaf7] p-5">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0b786e]">
                      ID contenant
                    </p>
                    <p className="text-xl font-semibold tracking-tight text-[#0b4867]">
                      {boxName}
                    </p>
                  </div>
                  <div className="text-4xl opacity-20">📦</div>
                </div>

                <div className="rounded-2xl border border-[#d5e2ea] bg-[#f8fbfd] p-4">
                  <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Niveau de priorité
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <PriorityButton
                      active={priority === "standard"}
                      label="Standard"
                      icon="🐢"
                      activeClass="border-[#1378ac] bg-[#1378ac] text-white shadow-xl scale-105"
                      onClick={() => setPriority("standard")}
                    />
                    <PriorityButton
                      active={priority === "urgent"}
                      label="Urgent"
                      icon="🚀"
                      activeClass="border-[#0b4867] bg-[#0b4867] text-white shadow-xl scale-105"
                      onClick={() => setPriority("urgent")}
                    />
                  </div>
                </div>

                <CompactTable
                  title="Instruments non utilisés"
                  count={unusedInstruments.length}
                  rows={unusedInstruments}
                />

                <div className="flex items-start gap-4 rounded-2xl border border-[#b8cad6] bg-[#edf5f9] p-4">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1378ac]">
                      Instruction de transfert
                    </p>
                    <p className="text-xs font-medium leading-relaxed text-slate-600">
                      Transférer les instruments vers le contenant{" "}
                      <span className="font-semibold text-[#0b4867] underline">{boxName}</span>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

      </div>

      <button
        onClick={() => alert("Prédésinfection Terminée !")}
        disabled={!isComplete}
        className={`fixed bottom-8 left-8 z-50 group relative rounded-2xl px-12 py-4 text-xs font-semibold uppercase tracking-[0.22em] transition-all duration-500 shadow-[0_20px_40px_rgba(11,72,103,0.14)] ${
          isComplete
            ? "bg-[#1378ac] text-white hover:bg-[#0f6a98] hover:-translate-y-1.5 active:scale-95"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        {isComplete && (
          <span className="absolute -top-3 -right-3 rounded-full bg-[#11b5a2] p-2 text-xs text-white shadow-lg">
            ✓
          </span>
        )}
        Valider l&apos;étape
      </button>

      {quickActionLabel && (
        <button
          onClick={triggerSimulation}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-full bg-[#0b4867] px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_24px_45px_rgba(11,72,103,0.28)] transition-all hover:bg-[#0a3952] hover:scale-105 active:scale-95 group"
        >
          <span className="text-xl text-[#8de7da]">⌁</span>
          <span>{quickActionLabel}</span>
        </button>
      )}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d5e2ea] bg-[#f8fbfd] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#0b4867]">{value}</p>
    </div>
  );
}

function ScanPlaceholder({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400">
      <div className="text-4xl opacity-50">{icon}</div>
      <p className="px-4 text-center text-xs font-bold uppercase tracking-[0.2em]">
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
      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
        active
          ? activeClass
          : "border-[#d5e2ea] bg-white text-slate-400 hover:border-[#b8cad6]"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-center">
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
    <div className="overflow-hidden rounded-2xl border border-[#d5e2ea] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#d5e2ea] bg-[#f8fbfd] px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </span>
        <span className="rounded-full bg-[#1378ac] px-2.5 py-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      </div>
      <table className="w-full text-left">
        <thead className="border-b border-[#d5e2ea] bg-white">
          <tr>
            <th className="w-14 px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Qté
            </th>
            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Nom
            </th>
            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Désignation
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#edf5f9]">
          {rows.map((row) => (
            <tr key={row.id} className="text-xs transition-colors hover:bg-[#f8fbfd]">
              <td className="px-4 py-2.5 text-center text-sm font-semibold text-[#1378ac]">
                x{row.quantity}
              </td>
              <td className="px-4 py-2.5 font-semibold text-slate-800">{row.name}</td>
              <td className="px-4 py-2.5 font-medium text-slate-500">{row.designation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

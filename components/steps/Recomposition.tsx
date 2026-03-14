"use client";

import { useState } from "react";

type InstrumentLine = {
  id: string;
  name: string;
  quantity: number;
  status: "pending" | "validated" | "defective" | "missing";
  packageType: string;
  expiryDate: string;
};

export function Recomposition() {
  const [basketScanned, setBasketScanned] = useState(false);
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  const [showDefectPanel, setShowDefectPanel] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentLine | null>(null);
  
  const [instruments, setInstruments] = useState<InstrumentLine[]>([
    { id: "INST-1022", name: "Pince Kocher 14cm", quantity: 2, status: "pending", packageType: "Papier tissé", expiryDate: "04/03/2028" },
    { id: "INST-1023", name: "Ciseaux Mayo", quantity: 1, status: "pending", packageType: "Conteneur", expiryDate: "04/03/2028" },
    { id: "INST-1024", name: "Porte-aiguille", quantity: 1, status: "pending", packageType: "Papier tissé", expiryDate: "04/03/2028" },
  ]);

  const [agentBadge, setAgentBadge] = useState({ name: "", role: "" });

  const triggerSimulation = () => {
    if (!basketScanned) {
      setBasketScanned(true);
    } else if (!operatorConfirmed) {
      setAgentBadge({ name: "MME. AMINA ALAMI", role: "AGENT STÉRILISATION (IBODE)" });
      setOperatorConfirmed(true);
    }
  };

  const updateStatus = (id: string, status: InstrumentLine["status"]) => {
    setInstruments(prev => prev.map(inst => inst.id === id ? { ...inst, status } : inst));
    if (status === "defective") {
      const inst = instruments.find(i => i.id === id);
      setSelectedInstrument(inst || null);
      setShowDefectPanel(true);
    }
  };

  const allInstrumentsValidated = instruments.every(inst => inst.status !== "pending");
  const isComplete = basketScanned && operatorConfirmed && allInstrumentsValidated;
  const quickActionLabel = !basketScanned
    ? "Scanner le panier"
    : !operatorConfirmed
      ? "Scanner le badge"
      : null;

  return (
    <div className="min-h-screen px-6 py-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
          <section className="rounded-3xl border border-[#d5e2ea] bg-white/95 p-5 shadow-[0_20px_45px_rgba(11,72,103,0.08)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center rounded-full border border-[#b8cad6] bg-[#edf5f9] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1378ac]">
                  Phase 03 • Recomposition
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#0b4867]">Recomposition</h1>
                <p className="text-sm font-medium text-slate-500">Contrôle, état et emballage en vue compacte.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <HeaderTile label="Secteur" value="Zone propre" />
                <HeaderTile label="Statut" value={isComplete ? "Prêt à imprimer" : "En cours"} />
              </div>
            </div>
          </section>

          <TopOperatorPanel
            confirmed={operatorConfirmed}
            waitingText="Scanner le badge de l'opérateur recomposition"
            name={agentBadge.name}
            role={agentBadge.role}
          />
        </header>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.35fr] xl:items-start">
          <section className={`bg-white/95 p-6 rounded-3xl border shadow-[0_20px_45px_rgba(11,72,103,0.08)] transition-all duration-500 flex flex-col ${basketScanned ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1378ac] text-sm font-semibold text-white shadow-lg">01</span>
                <h2 className="text-xl font-semibold tracking-tight text-[#0b4867]">Identification panier</h2>
              </div>
              {basketScanned && <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#0b786e]">Scanné</span>}
            </div>
            
            {!basketScanned ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-10 text-slate-400">
                <div className="text-6xl opacity-50">🧺</div>
                <p className="font-bold text-sm uppercase tracking-[0.2em] text-center px-4">Scanner le code-barres du panier de lavage</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between rounded-2xl border border-[#bdece4] bg-[#eafaf7] p-6">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0b786e]">Panier identifié</p>
                    <p className="text-3xl font-semibold tracking-tight text-[#0b4867]">Boîte chirurgie générale #42</p>
                  </div>
                  <div className="text-5xl opacity-20">🧺</div>
                </div>
              </div>
            )}
          </section>

          <section className={`bg-white/95 p-6 rounded-3xl border shadow-[0_20px_45px_rgba(11,72,103,0.08)] transition-all duration-500 flex flex-col ${basketScanned ? 'border-[#d5e2ea] opacity-100 xl:row-span-2' : 'border-[#d5e2ea] opacity-40 pointer-events-none xl:row-span-2'}`}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1378ac] text-sm font-semibold text-white shadow-lg">02</span>
                <h2 className="text-xl font-semibold tracking-tight text-[#0b4867]">Contrôle & état</h2>
              </div>
              {allInstrumentsValidated && <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#0b786e]">Vérifié</span>}
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#d5e2ea] bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#0b4867] text-white text-[10px] font-semibold uppercase tracking-[0.18em]">
                  <tr>
                    <th className="p-4">ID instrument</th>
                    <th className="p-4">Désignation</th>
                    <th className="p-4 text-center">Quantité</th>
                    <th className="p-4 text-center">Statut / Action</th>
                    <th className="p-4 text-center">Emballage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf5f9]">
                  {instruments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-[#f8fbfd] transition-colors">
                      <td className="p-4 font-mono text-xs font-semibold text-[#1378ac]">{inst.id}</td>
                      <td className="p-4 text-sm font-semibold text-slate-700">{inst.name}</td>
                      <td className="p-4 text-center text-lg font-semibold">x{inst.quantity}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => updateStatus(inst.id, "validated")}
                            className={`rounded-xl px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] transition-all ${inst.status === "validated" ? "bg-[#11b5a2] text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-[#eafaf7] hover:text-[#0b786e]"}`}
                          >
                            Valide
                          </button>
                          <button 
                            onClick={() => updateStatus(inst.id, "defective")}
                            className={`rounded-xl px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] transition-all ${inst.status === "defective" ? "bg-[#0b4867] text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-[#edf5f9] hover:text-[#0b4867]"}`}
                          >
                            Défect.
                          </button>
                          <button 
                            onClick={() => updateStatus(inst.id, "missing")}
                            className={`rounded-xl px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] transition-all ${inst.status === "missing" ? "bg-[#d6455d] text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-[#fdecef] hover:text-[#d6455d]"}`}
                          >
                            Manquant
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center text-xs font-medium text-slate-400">{inst.packageType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showDefectPanel && selectedInstrument && (
              <div className="mt-6 rounded-2xl border border-[#b8cad6] bg-[#edf5f9] p-6 animate-in zoom-in duration-500">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1378ac]">Signalement défaut : {selectedInstrument.name}</h3>
                  <button onClick={() => setShowDefectPanel(false)} className="font-semibold text-[#1378ac]">✕</button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-xl border border-white bg-white p-4 shadow-sm">
                    <h4 className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] opacity-40">Agent</h4>
                    <p className="text-xs font-medium text-slate-700">{agentBadge.name || "---"}</p>
                  </div>
                  <div className="rounded-xl border border-white bg-white p-4 shadow-sm">
                    <h4 className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] opacity-40">Type défaut</h4>
                    <p className="text-xs font-medium text-slate-700">Mors émoussés</p>
                  </div>
                  <div className="rounded-xl border border-white bg-white p-4 shadow-sm">
                    <h4 className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] opacity-40">Localisation stock</h4>
                    <p className="text-xs font-medium text-slate-700">Armoire B - T04</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <button onClick={() => setShowDefectPanel(false)} className="rounded-xl bg-[#11b5a2] px-12 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
                    Valider le remplacement
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>

        <div className="flex justify-center pb-10 pt-2">
          <button 
            onClick={() => alert('Étiquette Imprimée !')}
            disabled={!isComplete}
            className={`group relative rounded-2xl px-24 py-5 text-sm font-semibold uppercase tracking-[0.22em] transition-all duration-500 shadow-[0_20px_40px_rgba(11,72,103,0.14)] ${isComplete ? 'bg-[#1378ac] text-white hover:bg-[#0f6a98] hover:-translate-y-1.5 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {isComplete && <span className="absolute -top-3 -right-3 rounded-full bg-[#11b5a2] p-2 text-xs font-semibold text-white shadow-lg">✓</span>}
            Imprimer l&apos;étiquette
          </button>
        </div>

      </div>

      {quickActionLabel && (
        <button
          onClick={triggerSimulation}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl bg-[#0b4867] px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_24px_45px_rgba(11,72,103,0.28)] transition-all hover:bg-[#0a3952] hover:scale-105 active:scale-95 group"
        >
          <span className="text-xl text-[#8de7da]">⌁</span>
          <span>{quickActionLabel}</span>
        </button>
      )}

    </div>
  );
}

function HeaderTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d5e2ea] bg-[#f8fbfd] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#0b4867]">{value}</p>
    </div>
  );
}

function TopOperatorPanel({
  confirmed,
  waitingText,
  name,
  role,
}: {
  confirmed: boolean;
  waitingText: string;
  name: string;
  role: string;
}) {
  return (
    <section
      className={`rounded-3xl border bg-white/95 p-5 shadow-[0_20px_45px_rgba(11,72,103,0.08)] transition-all duration-500 ${
        confirmed ? "border-[#11b5a2] ring-4 ring-[#eafaf7]" : "border-[#d5e2ea]"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1378ac] text-sm font-semibold text-white shadow-lg">
            03
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[#0b4867]">Agent responsable</h2>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Badge recomposition
            </p>
          </div>
        </div>
        {confirmed && (
          <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">
            Validé
          </span>
        )}
      </div>

      {!confirmed ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400">
          <div className="text-4xl opacity-50">👤</div>
          <p className="px-4 text-center text-xs font-bold uppercase tracking-[0.18em]">
            {waitingText}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0b4867] p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#0a3952] bg-[#1378ac] text-2xl shadow-inner">
              👩‍🔬
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold tracking-tight">{name}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8de7da]">
                {role}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

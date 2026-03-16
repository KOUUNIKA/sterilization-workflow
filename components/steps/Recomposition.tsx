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
    { id: "INST-1025", name: "Pince Péan", quantity: 4, status: "pending", packageType: "Papier tissé", expiryDate: "04/03/2028" },
    { id: "INST-1026", name: "Ciseaux Metzenbaum", quantity: 1, status: "pending", packageType: "Conteneur", expiryDate: "04/03/2028" },
    { id: "INST-1027", name: "Pince à dissection", quantity: 2, status: "pending", packageType: "Papier tissé", expiryDate: "04/03/2028" },
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
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden">
      {/* Top Panels */}
      <header className="grid gap-4 xl:grid-cols-[1fr_0.8fr] shrink-0">
        <section className="rounded-3xl border border-[#d5e2ea] bg-white/95 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-0.5">
              <div className="inline-flex items-center rounded-full border border-[#b8cad6] bg-[#edf5f9] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#1378ac]">
                Phase 03 • Recomposition
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[#0b4867]">Recomposition</h1>
              <p className="text-[10px] font-medium text-slate-500">Contrôle, état et emballage.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <HeaderTile label="Secteur" value="Zone propre" />
              <HeaderTile label="Statut" value={isComplete ? "Prêt" : "En cours"} />
            </div>
          </div>
        </section>

        <TopOperatorPanel
          confirmed={operatorConfirmed}
          waitingText="Scanner le badge"
          name={agentBadge.name}
          role={agentBadge.role}
        />
      </header>

      {/* Main Grid Area */}
      <div className="flex-1 grid gap-4 xl:grid-cols-[0.8fr_1.2fr] min-h-0 overflow-hidden">
        {/* Left Column: Identification */}
        <section className={`bg-white/95 p-5 rounded-3xl border shadow-sm transition-all duration-500 flex flex-col overflow-hidden shrink-0 ${basketScanned ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
          <div className="mb-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white shadow-lg">01</span>
              <h2 className="text-sm font-semibold tracking-tight text-[#0b4867]">Identification panier</h2>
            </div>
            {basketScanned && <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">Scanné</span>}
          </div>
          
          {!basketScanned ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400 p-6">
              <div className="text-4xl opacity-50">🧺</div>
              <p className="font-bold text-[9px] uppercase tracking-[0.2em] text-center">Scanner le panier</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between rounded-2xl border border-[#bdece4] bg-[#eafaf7] p-4">
                <div>
                  <p className="mb-1 text-[8px] font-semibold uppercase tracking-[0.24em] text-[#0b786e]">Identifié</p>
                  <p className="text-base font-semibold tracking-tight text-[#0b4867]">Boîte chirurgie #42</p>
                </div>
                <div className="text-3xl opacity-20">🧺</div>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Instrument Table */}
        <section className={`bg-white/95 p-5 rounded-3xl border shadow-sm transition-all duration-500 flex flex-col overflow-hidden ${basketScanned ? 'border-[#d5e2ea]' : 'opacity-40 pointer-events-none'}`}>
          <div className="mb-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white shadow-lg">02</span>
              <h2 className="text-sm font-semibold tracking-tight text-[#0b4867]">Contrôle & état</h2>
            </div>
            {allInstrumentsValidated && <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">Vérifié</span>}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col rounded-2xl border border-[#d5e2ea] bg-white shadow-sm min-h-[200px]">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left table-fixed">
                <thead className="sticky top-0 z-10 bg-[#0b4867] text-white text-[9px] font-semibold uppercase tracking-[0.18em]">
                  <tr>
                    <th className="p-3 w-24">ID</th>
                    <th className="p-3">Désignation</th>
                    <th className="p-3 w-16 text-center">Qté</th>
                    <th className="p-3 w-48 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf5f9]">
                  {instruments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-[#f8fbfd] transition-colors text-[11px]">
                      <td className="p-3 font-mono font-semibold text-[#1378ac] truncate">{inst.id}</td>
                      <td className="p-3 font-semibold text-slate-700 truncate">{inst.name}</td>
                      <td className="p-3 text-center text-sm font-semibold">x{inst.quantity}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1.5">
                          <StatusBtn active={inst.status === "validated"} label="V" color="teal" onClick={() => updateStatus(inst.id, "validated")} />
                          <StatusBtn active={inst.status === "defective"} label="D" color="blue" onClick={() => updateStatus(inst.id, "defective")} />
                          <StatusBtn active={inst.status === "missing"} label="M" color="red" onClick={() => updateStatus(inst.id, "missing")} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showDefectPanel && selectedInstrument && (
            <div className="mt-4 rounded-xl border border-[#b8cad6] bg-[#edf5f9] p-4 shrink-0 animate-in zoom-in duration-300">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#1378ac]">Signalement : {selectedInstrument.name}</h3>
                <button onClick={() => setShowDefectPanel(false)} className="text-sm font-bold text-[#1378ac]">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                 <div className="rounded-xl bg-white p-2.5 shadow-sm text-center">
                    <p className="text-[7px] font-bold uppercase opacity-40">Défaut</p>
                    <p className="text-[10px] font-semibold text-slate-700">Mors émoussés</p>
                 </div>
                 <div className="rounded-xl bg-white p-2.5 shadow-sm text-center">
                    <p className="text-[7px] font-bold uppercase opacity-40">Stock</p>
                    <p className="text-[10px] font-semibold text-slate-700">Armoire B</p>
                 </div>
              </div>
              <button onClick={() => setShowDefectPanel(false)} className="w-full rounded-xl bg-[#11b5a2] py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white shadow-md hover:bg-[#0fa391] transition-all">
                Valider remplacement
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Footer Section */}
      <footer className="shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-[#d5e2ea] shadow-lg mt-auto">
        <button 
          onClick={() => alert('Étiquette Imprimée !')}
          disabled={!isComplete}
          className={`group relative rounded-xl px-10 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-300 ${isComplete ? 'bg-[#1378ac] text-white hover:bg-[#0f6a98] shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          {isComplete && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[#11b5a2] p-1 text-[8px] font-semibold text-white shadow-lg">✓</span>}
          Imprimer l&apos;étiquette
        </button>

        {quickActionLabel && (
          <button
            onClick={triggerSimulation}
            className="flex items-center gap-2 rounded-full bg-[#0b4867] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-md transition-all hover:bg-[#0a3952] group"
          >
            <span className="text-lg text-[#8de7da]">⌁</span>
            <span>{quickActionLabel}</span>
          </button>
        )}
      </footer>
    </div>
  );
}

function StatusBtn({ active, label, color, onClick }: { active: boolean, label: string, color: 'teal'|'blue'|'red', onClick: () => void }) {
  const colors = {
    teal: active ? 'bg-[#11b5a2] text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-[#eafaf7]',
    blue: active ? 'bg-[#0b4867] text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-[#edf5f9]',
    red: active ? 'bg-[#d6455d] text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-[#fdecef]',
  };
  return (
    <button onClick={onClick} className={`h-8 w-8 rounded-lg text-[9px] font-bold uppercase transition-all ${colors[color]}`}>
      {label}
    </button>
  );
}

function HeaderTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#d5e2ea] bg-[#f8fbfd] px-2.5 py-1.5">
      <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-0.5 text-[10px] font-semibold text-[#0b4867]">{value}</p>
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
    <section className={`rounded-3xl border bg-white/95 p-4 shadow-sm transition-all duration-500 ${confirmed ? "border-[#11b5a2] ring-4 ring-[#eafaf7]" : "border-[#d5e2ea]"}`}>
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white">03</span>
          <h2 className="text-sm font-semibold tracking-tight text-[#0b4867]">Agent responsable</h2>
        </div>
        {confirmed && <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2.5 py-1 text-[8px] font-semibold uppercase text-[#0b786e]">Validé</span>}
      </div>

      {!confirmed ? (
        <div className="mt-2 h-[45px] flex items-center justify-center rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em]">{waitingText}</p>
        </div>
      ) : (
        <div className="mt-2 rounded-2xl bg-[#0b4867] p-2.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0a3952] bg-[#1378ac] text-lg">👩‍🔬</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-tight truncate">{name}</p>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#8de7da] truncate">{role}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import { type ReactNode, useState } from "react";

type DashboardSectionProps = {
  index: string;
  title: string;
  scanned: boolean;
  icon: string;
  waitingText: string;
  children: ReactNode;
};

type DataCardProps = {
  label: string;
  value: string;
  color: "emerald" | "blue";
};

type StatusButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  color: "emerald" | "orange";
};

type CheckItemProps = {
  label: string;
  checked: boolean;
  onClick: () => void;
};

interface LavageWizardProps {
  initialPhase?: 1 | 2;
  onPhaseChange?: (phase: 1 | 2) => void;
}

export function LavageWizard({ initialPhase = 1, onPhaseChange }: LavageWizardProps) {
  const [phase, setPhase] = useState<1 | 2>(initialPhase); // 1: Chargement (Entrée), 2: Déchargement (Sortie)

  const handlePhaseChange = (newPhase: 1 | 2) => {
    setPhase(newPhase);
    onPhaseChange?.(newPhase);
  };
  
  const [panierScanned, setPanierScanned] = useState(false);
  const [laveurScanned, setLaveurScanned] = useState(false);
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  const [laveurStatus, setLaveurStatus] = useState<"ready" | "maintenance">("ready");

  const [sortieCycleValidated, setSortieCycleValidated] = useState(false);
  const [sortiePanierScanned, setSortiePanierScanned] = useState(false);
  const [sortieOperatorConfirmed, setSortieOperatorConfirmed] = useState(false);
  const [conformity, setConformity] = useState({
    programme: false,
    parameters: false,
    dosage: false,
    stability: false,
    cleanliness: false
  });

  const triggerSimulation = () => {
    if (phase === 1) {
      if (!panierScanned) setPanierScanned(true);
      else if (!laveurScanned) setLaveurScanned(true);
      else if (!operatorConfirmed) setOperatorConfirmed(true);
    } else {
      if (!sortieCycleValidated) {
        setConformity({ programme: true, parameters: true, dosage: true, stability: true, cleanliness: true });
        setSortieCycleValidated(true);
      }
      else if (!sortiePanierScanned) setSortiePanierScanned(true);
      else if (!sortieOperatorConfirmed) setSortieOperatorConfirmed(true);
    }
  };

  const isPhase1Complete = panierScanned && laveurScanned && operatorConfirmed && laveurStatus === "ready";
  const isPhase2Complete = sortieCycleValidated && sortiePanierScanned && sortieOperatorConfirmed;
  const quickActionLabel =
    phase === 1
      ? !panierScanned
        ? "Scanner le panier"
        : !laveurScanned
          ? "Scanner le laveur"
          : !operatorConfirmed
            ? "Scanner le badge"
            : null
      : !sortieCycleValidated
        ? "Valider conformité"
        : !sortiePanierScanned
          ? "Scanner sortie"
          : !sortieOperatorConfirmed
            ? "Scanner badge"
            : null;
  const operatorState =
    phase === 1
      ? {
          title: "Opérateur",
          subtitle: "Entrée",
          confirmed: operatorConfirmed,
          name: "Dr. Karim ALAOUI",
          role: "Responsable Lavage",
        }
      : {
          title: "Responsable",
          subtitle: "Sortie",
          confirmed: sortieOperatorConfirmed,
          name: "Salma BENANI",
          role: "Responsable Déchargement",
        };

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden">
      <header className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] shrink-0">
        <section className="rounded-3xl border border-[#d5e2ea] bg-white/95 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center rounded-full border border-[#b8cad6] bg-[#edf5f9] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#1378ac]">
                Phase 02 • Lavage
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[#0b4867]">
                {phase === 1 ? "Entrée Laveur" : "Sortie Laveur"}
              </h1>
            </div>

            <div className="flex rounded-xl border border-[#d5e2ea] bg-white/95 p-1 shadow-sm shrink-0">
              <button
                onClick={() => handlePhaseChange(1)}
                className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-[0.2em] transition-all ${phase === 1 ? 'bg-[#1378ac] text-white shadow-md' : 'text-slate-400 hover:text-[#0b4867]'}`}
              >
                Lavage
              </button>
              <button
                onClick={() => handlePhaseChange(2)}
                className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-[0.2em] transition-all ${phase === 2 ? 'bg-[#11b5a2] text-white shadow-md' : 'text-slate-400 hover:text-[#0b4867]'}`}
              >
                Sortie
              </button>
            </div>
          </div>
        </section>

        <TopOperatorPanel
          title={operatorState.title}
          subtitle={operatorState.subtitle}
          confirmed={operatorState.confirmed}
          waitingText="Scanner le badge"
          name={operatorState.name}
          role={operatorState.role}
        />
      </header>

      <div className="flex-1 grid gap-4 lg:grid-cols-2 min-h-0 overflow-hidden">
        {phase === 1 && (
          <>
            <DashboardSection index="01" title="Panier" scanned={panierScanned} icon="🛒" waitingText="Scanner le panier">
              <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <DataCard label="ID Panier" value="PAN-2026-X8" color="blue" />
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                      <div key={i} className="rounded-lg border border-[#d5e2ea] bg-[#f8fbfd] p-3 text-center">
                        <p className="text-[7px] font-bold text-slate-400 uppercase">Inst. {i}</p>
                        <p className="text-[11px] font-bold text-[#1378ac]">x{i + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DashboardSection>

            <DashboardSection index="02" title="Laveur" scanned={laveurScanned} icon="⚙️" waitingText="Scanner le laveur">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DataCard label="Machine" value="LD-UNIT-02" color="emerald" />
                <div className="grid grid-cols-2 gap-3">
                  <StatusButton active={laveurStatus === 'ready'} onClick={() => setLaveurStatus("ready")} color="emerald" icon="✅" label="Ready" />
                  <StatusButton active={laveurStatus === 'maintenance'} onClick={() => setLaveurStatus("maintenance")} color="orange" icon="🛠️" label="Maint." />
                </div>
              </div>
            </DashboardSection>
          </>
        )}

        {phase === 2 && (
          <>
            <DashboardSection index="01" title="Conformité" scanned={sortieCycleValidated} icon="📋" waitingText="Vérification">
              <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                  <CheckItem label="Programme" checked={conformity.programme} onClick={() => setConformity({...conformity, programme: !conformity.programme})} />
                  <CheckItem label="Paramètres" checked={conformity.parameters} onClick={() => setConformity({...conformity, parameters: !conformity.parameters})} />
                  <CheckItem label="Dosage" checked={conformity.dosage} onClick={() => setConformity({...conformity, dosage: !conformity.dosage})} />
                  <CheckItem label="Stabilité" checked={conformity.stability} onClick={() => setConformity({...conformity, stability: !conformity.stability})} />
                  <CheckItem label="Propreté" checked={conformity.cleanliness} onClick={() => setConformity({...conformity, cleanliness: !conformity.cleanliness})} />
                </div>
                <button 
                  onClick={() => setSortieCycleValidated(true)}
                  className={`shrink-0 w-full rounded-xl py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${Object.values(conformity).every(v => v) ? 'bg-[#11b5a2] text-white shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  Valider Conformité
                </button>
              </div>
            </DashboardSection>

            <DashboardSection index="02" title="Traçabilité" scanned={sortiePanierScanned} icon="🛒" waitingText="Scanner sortie">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DataCard label="Panier" value="PAN-2026-X8" color="blue" />
                <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[#b8cad6] bg-[#edf5f9] p-6 text-center">
                  <span className="text-3xl text-[#1378ac]">✓</span>
                  <div>
                    <p className="text-[#1378ac] text-xs font-bold uppercase">Charge validée</p>
                    <p className="mt-0.5 text-[8px] font-semibold text-slate-400 uppercase tracking-widest">Cycle LD-12333</p>
                  </div>
                </div>
              </div>
            </DashboardSection>
          </>
        )}
      </div>

      <footer className="shrink-0 flex items-center justify-center bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-[#d5e2ea] shadow-lg mt-auto">
        {phase === 1 ? (
          <button 
            onClick={() => { alert('Cycle Lavage Lancé !'); handlePhaseChange(2); }}
            disabled={!isPhase1Complete}
            className={`group relative rounded-xl px-12 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-300 shadow-md ${isPhase1Complete ? 'bg-[#1378ac] text-white hover:bg-[#0f6a98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {isPhase1Complete && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[#11b5a2] p-1.5 text-[8px] text-white shadow-lg">✓</span>}
            Lancer le Cycle
          </button>
        ) : (
          <button 
            onClick={() => alert('Cycle Lavage Terminé et Libéré !')}
            disabled={!isPhase2Complete}
            className={`group relative rounded-xl px-12 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-300 shadow-md ${isPhase2Complete ? 'bg-[#11b5a2] text-white hover:bg-[#0fa391]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {isPhase2Complete && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-white p-1.5 text-[8px] font-semibold text-[#11b5a2] shadow-lg">✓</span>}
            Libérer la Charge
          </button>
        )}

        {quickActionLabel && (
          <button
            onClick={triggerSimulation}
            className={`absolute right-6 flex items-center gap-2 rounded-full px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-md transition-all group ${phase === 1 ? 'bg-[#0b4867]' : 'bg-[#11b5a2]'}`}
          >
            <span className="text-lg text-white/85">⌁</span>
            <span>{quickActionLabel}</span>
          </button>
        )}
      </footer>
    </div>
  );
}

function DashboardSection({ index, title, scanned, icon, waitingText, children }: DashboardSectionProps) {
  return (
    <section className={`bg-white/95 p-5 rounded-3xl border shadow-sm transition-all duration-500 flex flex-col overflow-hidden ${scanned ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white shadow-md">{index}</span>
          <h2 className="text-sm font-semibold tracking-tight text-[#0b4867]">{title}</h2>
        </div>
        {scanned && <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2 py-0.5 text-[8px] font-semibold uppercase text-[#0b786e]">Validé</span>}
      </div>
      
      {!scanned ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400 p-4">
          <div className="text-3xl opacity-50">{icon}</div>
          <p className="font-bold text-[9px] uppercase tracking-[0.2em] text-center">{waitingText}</p>
        </div>
      ) : children}
    </section>
  );
}

function DataCard({ label, value, color }: DataCardProps) {
  const styles = color === 'emerald' 
    ? { bg: 'bg-[#eafaf7]', text: 'text-[#0b786e]', border: 'border-[#bdece4]' }
    : { bg: 'bg-[#edf5f9]', text: 'text-[#1378ac]', border: 'border-[#b8cad6]' };
  
  return (
    <div className={`rounded-2xl border p-4 shrink-0 ${styles.bg} ${styles.border}`}>
      <p className={`mb-1 text-[8px] font-semibold uppercase tracking-[0.24em] ${styles.text}`}>{label}</p>
      <p className="text-lg font-semibold tracking-tight text-[#0b4867]">{value}</p>
    </div>
  );
}

function StatusButton({ active, onClick, icon, label, color }: StatusButtonProps) {
  const activeClass = color === 'emerald' ? 'border-[#11b5a2] bg-[#11b5a2] text-white shadow-md' : 'border-[#0b4867] bg-[#0b4867] text-white shadow-md';
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${active ? activeClass : 'border-[#d5e2ea] bg-white text-slate-400'}`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-center text-[8px] font-bold uppercase tracking-[0.1em]">{label}</span>
    </button>
  );
}

function TopOperatorPanel({ title, subtitle, confirmed, waitingText, name, role }: any) {
  return (
    <section className={`rounded-3xl border bg-white/95 p-4 shadow-sm transition-all duration-500 ${confirmed ? "border-[#11b5a2] ring-4 ring-[#eafaf7]" : "border-[#d5e2ea]"}`}>
      <div className="flex items-center justify-between shrink-0 mb-2">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white shadow-md">03</span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-[#0b4867] truncate">{title}</h2>
          </div>
        </div>
        {confirmed && <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2.5 py-1 text-[8px] font-semibold uppercase text-[#0b786e]">Validé</span>}
      </div>
      {!confirmed ? (
        <div className="h-[55px] flex items-center justify-center rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em]">{waitingText}</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0b4867] p-2.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#0a3952] bg-[#1378ac] text-lg shadow-inner">👩‍🔬</div>
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

function CheckItem({ label, checked, onClick }: CheckItemProps) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all shrink-0 ${checked ? 'border-[#11b5a2] bg-[#eafaf7] text-[#0b786e] shadow-sm' : 'border-[#d5e2ea] bg-white text-slate-400'}`}>
      <div className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-all ${checked ? 'border-[#11b5a2] bg-[#11b5a2] text-white' : 'border-[#cfdbe3]'}`}>
        {checked && "✓"}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{label}</span>
    </button>
  );
}

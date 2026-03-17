"use client";

import { type ReactNode, useState } from "react";

interface ConformityChecks {
  passage: boolean;
  physico: boolean;
  siccite: boolean;
  integrite: boolean;
}

type DashboardSectionProps = {
  title: string;
  scanned: boolean;
  icon: string;
  waitingText: string;
  children: ReactNode;
};

type DataCardProps = {
  label: string;
  value: string;
  color: "purple" | "emerald";
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

interface SterilizationWizardProps {
  initialPhase?: 1 | 2;
  onPhaseChange?: (phase: 1 | 2) => void;
}

export function SterilizationWizard({ initialPhase = 1, onPhaseChange }: SterilizationWizardProps) {
  const [phase, setPhase] = useState<1 | 2>(initialPhase); // 1: Chargement, 2: Déchargement

  const handlePhaseChange = (newPhase: 1 | 2) => {
    setPhase(newPhase);
    onPhaseChange?.(newPhase);
  };

  const [autoclaveStatus, setAutoclaveStatus] = useState<"ready" | "maintenance" | null>(null);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [agentBadge, setAgentBadge] = useState({ name: "", role: "" });

  const [sortieScannedItems, setSortieScannedItems] = useState<string[]>([]);
  const [sortieAgentBadge, setSortieAgentBadge] = useState({ name: "", role: "" });
  const [checks, setChecks] = useState<ConformityChecks>({
    passage: false,
    physico: false,
    siccite: false,
    integrite: false,
  });

  const triggerSimulation = () => {
    if (phase === 1) {
      if (scannedItems.length < 3) {
        const ids = ["EMB-9920", "EMB-4412", "EMB-3301", "EMB-7721", "EMB-2200", "EMB-1100", "EMB-0011"];
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        setScannedItems((prev) => [...prev, `${randomId}-${prev.length + 1}`]);
      } else if (!autoclaveStatus) {
        setAutoclaveStatus("ready");
      } else if (!agentBadge.name) {
        setAgentBadge({ name: "MME. AMINA ALAMI", role: "AGENT STÉRILISATION" });
      }
    } else {
      const allChecksValid = Object.values(checks).every(v => v);
      if (!allChecksValid) {
        setChecks({ passage: true, physico: true, siccite: true, integrite: true });
      } else if (sortieScannedItems.length < 3) {
        const id = `EMB-SORTIE-${Math.floor(1000 + Math.random() * 9000)}`;
        setSortieScannedItems((prev) => [...prev, id]);
      } else if (!sortieAgentBadge.name) {
        setSortieAgentBadge({ name: "MME. AMINA ALAMI", role: "AGENT STÉRILISATION" });
      }
    }
  };

  const isPhase1Complete = scannedItems.length > 0 && autoclaveStatus === "ready" && agentBadge.name !== "";
  const isPhase2Complete = Object.values(checks).every(v => v) && sortieScannedItems.length > 0 && sortieAgentBadge.name !== "";
  const quickActionLabel =
    phase === 1
      ? scannedItems.length < 3
        ? "Scanner emballage"
        : !autoclaveStatus
          ? "Scanner autoclave"
          : !agentBadge.name
            ? "Scanner badge"
            : null
      : !Object.values(checks).every(v => v)
        ? "Valider contrôles"
        : sortieScannedItems.length < 3
          ? "Scanner sortie"
          : !sortieAgentBadge.name
            ? "Scanner badge"
            : null;
  const operatorState =
    phase === 1
      ? {
          title: "Opérateur",
          subtitle: "Chargement",
          confirmed: agentBadge.name !== "",
          name: agentBadge.name,
          role: agentBadge.role,
        }
      : {
          title: "Validation",
          subtitle: "Responsable",
          confirmed: sortieAgentBadge.name !== "",
          name: sortieAgentBadge.name,
          role: sortieAgentBadge.role,
        };

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden">
      <header className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] shrink-0">
        <section className="rounded-3xl border border-[#d5e2ea] bg-white/95 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center rounded-full border border-[#b8cad6] bg-[#edf5f9] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#1378ac]">
                Phase 04 • Stérilisation
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[#0b4867]">
                {phase === 1 ? "Entrée Autoclave" : "Sortie Autoclave"}
              </h1>
            </div>

            <div className="flex rounded-xl border border-[#d5e2ea] bg-white/95 p-1 shadow-sm shrink-0">
              <button 
                onClick={() => handlePhaseChange(1)}
                className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-[0.2em] transition-all ${phase === 1 ? 'bg-[#1378ac] text-white shadow-md' : 'text-slate-400 hover:text-[#0b4867]'}`}
              >
                Chargement
              </button>
              <button 
                onClick={() => handlePhaseChange(2)}
                className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-[0.2em] transition-all ${phase === 2 ? 'bg-[#11b5a2] text-white shadow-md' : 'text-slate-400 hover:text-[#0b4867]'}`}
              >
                Validation
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
        {phase === 1 ? (
          <>
            <DashboardSection title="Chariot" scanned={scannedItems.length > 0} icon="🧺" waitingText="Scanner les emballages">
              <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="flex flex-wrap gap-2">
                    {scannedItems.map((item, i) => (
                      <div key={i} className="rounded-xl border border-[#b8cad6] bg-[#edf5f9] px-3 py-2 text-[10px] font-semibold text-[#1378ac] shadow-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 p-3 bg-[#f8fbfd] rounded-xl border border-[#d5e2ea] text-center">
                   <p className="text-[10px] font-bold text-[#1378ac] uppercase tracking-widest">{scannedItems.length} objet(s) scanné(s)</p>
                </div>
              </div>
            </DashboardSection>

            <DashboardSection title="Autoclave" scanned={autoclaveStatus !== null} icon="♨️" waitingText="Scanner l'autoclave">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <DataCard label="Machine" value="AUTOCLAVE N° 02" color="purple" />
                <div className="grid gap-3">
                  <StatusButton active={autoclaveStatus === 'ready'} onClick={() => setAutoclaveStatus("ready")} color="emerald" icon="✅" label="Ready" />
                  <StatusButton active={autoclaveStatus === 'maintenance'} onClick={() => setAutoclaveStatus("maintenance")} color="orange" icon="🛠️" label="Maint." />
                </div>
              </div>
            </DashboardSection>
          </>
        ) : (
          <>
            <DashboardSection title="Conformité" scanned={Object.values(checks).every(v => v)} icon="📋" waitingText="Vérification">
              <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                  <CheckItem label="Indicateurs passage" checked={checks.passage} onClick={() => setChecks({...checks, passage: !checks.passage})} />
                  <CheckItem label="Physico-chimiques" checked={checks.physico} onClick={() => setChecks({...checks, physico: !checks.physico})} />
                  <CheckItem label="Siccité emballage" checked={checks.siccite} onClick={() => setChecks({...checks, siccite: !checks.siccite})} />
                  <CheckItem label="Intégrité condit." checked={checks.integrite} onClick={() => setChecks({...checks, integrite: !checks.integrite})} />
                </div>
              </div>
            </DashboardSection>

            <DashboardSection title="Libération" scanned={sortieScannedItems.length > 0} icon="📦" waitingText="Scan sortie">
              <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="flex flex-wrap gap-2">
                    {sortieScannedItems.map((item, i) => (
                      <div key={i} className="rounded-xl border border-[#bdece4] bg-[#eafaf7] px-3 py-2 text-[10px] font-semibold text-[#0b786e] shadow-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                {sortieScannedItems.length > 0 && (
                  <div className="shrink-0 rounded-xl bg-[#11b5a2] p-3 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-md">
                    Charge liée au Cycle N°2026-001
                  </div>
                )}
              </div>
            </DashboardSection>
          </>
        )}
      </div>

      <footer className="shrink-0 flex items-center justify-center bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-[#d5e2ea] shadow-lg mt-auto">
        {phase === 1 ? (
          <button 
            onClick={() => { alert('Cycle Stérilisation Lancé !'); handlePhaseChange(2); }}
            disabled={!isPhase1Complete}
            className={`group relative rounded-xl px-12 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-300 shadow-md ${isPhase1Complete ? 'bg-[#1378ac] text-white hover:bg-[#0f6a98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {isPhase1Complete && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[#11b5a2] p-1.5 text-[8px] text-white shadow-lg">✓</span>}
            Démarrer le Cycle
          </button>
        ) : (
          <button 
            onClick={() => alert('Charge Libérée !')}
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

function DashboardSection({ title, scanned, icon, waitingText, children }: DashboardSectionProps) {
  return (
    <section className={`flex flex-col rounded-3xl border bg-white/95 p-5 shadow-sm transition-all duration-500 overflow-hidden ${scanned ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-sm font-semibold tracking-tight text-[#0b4867]">{title}</h2>
        {scanned && <span className="rounded-lg bg-[#eafaf7] px-2 py-0.5 text-[9px] font-semibold uppercase text-[#0b786e]">✓</span>}
      </div>
      
      {!scanned ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400 p-4">
          <div className="text-3xl opacity-50">{icon}</div>
          <p className="font-bold text-[9px] uppercase tracking-widest text-center">{waitingText}</p>
        </div>
      ) : children}
    </section>
  );
}

function DataCard({ label, value, color }: DataCardProps) {
  const styles = color === 'purple' 
    ? { bg: 'bg-[#edf5f9]', text: 'text-[#1378ac]', border: 'border-[#b8cad6]' }
    : { bg: 'bg-[#eafaf7]', text: 'text-[#0b786e]', border: 'border-[#bdece4]' };
  
  return (
    <div className={`rounded-2xl border p-4 shrink-0 ${styles.bg} ${styles.border}`}>
      <p className={`mb-1 text-[8px] font-semibold uppercase tracking-[0.24em] ${styles.text}`}>{label}</p>
      <p className="text-lg font-semibold tracking-tight text-[#0b4867]">{value}</p>
    </div>
  );
}

function StatusButton({ active, onClick, icon, label, color }: StatusButtonProps) {
  const activeClass = color === 'emerald' ? 'border-[#11b5a2] bg-[#11b5a2] text-white shadow-md scale-105' : 'border-[#0b4867] bg-[#0b4867] text-white shadow-md scale-105';
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition-all ${active ? activeClass : 'border-[#d5e2ea] bg-white text-slate-400'}`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-center text-[8px] font-bold uppercase tracking-[0.18em]">{label}</span>
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

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

export function SterilizationWizard() {
  const [phase, setPhase] = useState<1 | 2>(1); // 1: Chargement, 2: Déchargement

  // --- Phase 1: Chargement States ---
  const [autoclaveStatus, setAutoclaveStatus] = useState<"ready" | "maintenance" | null>(null);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [agentBadge, setAgentBadge] = useState({ name: "", role: "" });

  // --- Phase 2: Déchargement States ---
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
        const ids = ["EMB-9920", "EMB-4412", "EMB-3301", "EMB-7721"];
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        setScannedItems((prev) => [...prev, `${randomId}-${prev.length + 1}`]);
      } else if (!autoclaveStatus) {
        setAutoclaveStatus("ready");
      } else if (!agentBadge.name) {
        setAgentBadge({ name: "MME. AMINA ALAMI", role: "AGENT STÉRILISATION (IBODE)" });
      }
    } else {
      const allChecksValid = Object.values(checks).every(v => v);
      if (!allChecksValid) {
        setChecks({ passage: true, physico: true, siccite: true, integrite: true });
      } else if (sortieScannedItems.length < 3) {
        const id = `EMB-SORTIE-${Math.floor(1000 + Math.random() * 9000)}`;
        setSortieScannedItems((prev) => [...prev, id]);
      } else if (!sortieAgentBadge.name) {
        setSortieAgentBadge({ name: "MME. AMINA ALAMI", role: "AGENT STÉRILISATION (IBODE)" });
      }
    }
  };

  const isPhase1Complete = scannedItems.length > 0 && autoclaveStatus === "ready" && agentBadge.name !== "";
  const isPhase2Complete = Object.values(checks).every(v => v) && sortieScannedItems.length > 0 && sortieAgentBadge.name !== "";
  const quickActionLabel =
    phase === 1
      ? scannedItems.length < 3
        ? "Scanner un emballage"
        : !autoclaveStatus
          ? "Scanner l'autoclave"
          : !agentBadge.name
            ? "Scanner le badge"
            : null
      : !Object.values(checks).every(v => v)
        ? "Valider les controles"
        : sortieScannedItems.length < 3
          ? "Scanner un emballage"
          : !sortieAgentBadge.name
            ? "Scanner le badge"
            : null;
  const operatorState =
    phase === 1
      ? {
          title: "Opérateur",
          subtitle: "Badge chargement",
          confirmed: agentBadge.name !== "",
          waitingText: "Scanner le badge",
          name: agentBadge.name,
          role: agentBadge.role,
          badgeId: "ID: A-7789",
        }
      : {
          title: "Validation",
          subtitle: "Badge responsable",
          confirmed: sortieAgentBadge.name !== "",
          waitingText: "Scanner badge responsable",
          name: sortieAgentBadge.name,
          role: sortieAgentBadge.role,
          badgeId: "ID: A-7789",
        };

  return (
    <div className="min-h-screen px-6 py-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
          <section className="rounded-3xl border border-[#d5e2ea] bg-white/95 p-5 shadow-[0_20px_45px_rgba(11,72,103,0.08)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center rounded-full border border-[#b8cad6] bg-[#edf5f9] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1378ac]">
                  Phase 04 • Stérilisation
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#0b4867]">
                  {phase === 1 ? "Entrée Autoclave" : "Sortie Autoclave"}
                </h1>
              </div>

              <div className="flex rounded-xl border border-[#d5e2ea] bg-white/95 p-1.5 shadow-sm">
                <button 
                  onClick={() => setPhase(1)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] transition-all ${phase === 1 ? 'bg-[#1378ac] text-white shadow-lg' : 'text-slate-400 hover:text-[#0b4867]'}`}
                >
                  01. Chargement
                </button>
                <button 
                  onClick={() => setPhase(2)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] transition-all ${phase === 2 ? 'bg-[#11b5a2] text-white shadow-lg' : 'text-slate-400 hover:text-[#0b4867]'}`}
                >
                  02. Validation
                </button>
              </div>
            </div>
          </section>

          <TopOperatorPanel
            title={operatorState.title}
            subtitle={operatorState.subtitle}
            confirmed={operatorState.confirmed}
            waitingText={operatorState.waitingText}
            name={operatorState.name}
            role={operatorState.role}
            badgeId={operatorState.badgeId}
          />
        </header>

        {phase === 1 && (
          <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DashboardSection title="01. Chariot" scanned={scannedItems.length > 0} icon="🧺" waitingText="Scanner les emballages">
              <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-wrap gap-2">
                  {scannedItems.map((item, i) => (
                    <div key={i} className="rounded-xl border border-[#b8cad6] bg-[#edf5f9] px-3 py-2 text-xs font-semibold text-[#1378ac]">
                      {item}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                  {scannedItems.length} objet(s) sur le chariot
                </p>
              </div>
            </DashboardSection>

            <DashboardSection title="02. Autoclave" scanned={autoclaveStatus !== null} icon="♨️" waitingText="Scanner l'autoclave">
              <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                <DataCard label="Machine Identifiée" value="AUTOCLAVE N° 02" color="purple" />
                <div className="grid gap-4">
                  <StatusButton 
                    active={autoclaveStatus === 'ready'} 
                    onClick={() => setAutoclaveStatus("ready")} 
                    color="emerald" 
                    icon="✅" 
                    label="Prêt à l'emploi" 
                  />
                  <StatusButton 
                    active={autoclaveStatus === 'maintenance'} 
                    onClick={() => setAutoclaveStatus("maintenance")} 
                    color="orange" 
                    icon="🛠️" 
                    label="En maintenance" 
                  />
                </div>
              </div>
            </DashboardSection>
          </div>
        )}

        {phase === 2 && (
          <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DashboardSection title="01. Conformité" scanned={Object.values(checks).every(v => v)} icon="📋" waitingText="Vérification indicateurs">
              <div className="grid gap-3 animate-in fade-in zoom-in duration-500">
                <CheckItem label="Indicateurs passage" checked={checks.passage} onClick={() => setChecks({...checks, passage: !checks.passage})} />
                <CheckItem label="Physico-chimiques" checked={checks.physico} onClick={() => setChecks({...checks, physico: !checks.physico})} />
                <CheckItem label="Siccité emballage" checked={checks.siccite} onClick={() => setChecks({...checks, siccite: !checks.siccite})} />
                <CheckItem label="Intégrité condit." checked={checks.integrite} onClick={() => setChecks({...checks, integrite: !checks.integrite})} />
              </div>
            </DashboardSection>

            <DashboardSection title="02. Libération" scanned={sortieScannedItems.length > 0} icon="📦" waitingText="Scan emballages sortie">
              <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-wrap gap-2">
                  {sortieScannedItems.map((item, i) => (
                    <div key={i} className="rounded-xl border border-[#bdece4] bg-[#eafaf7] px-3 py-2 text-xs font-semibold text-[#0b786e]">
                      {item}
                    </div>
                  ))}
                </div>
                {sortieScannedItems.length > 0 && (
                  <div className="rounded-xl bg-[#11b5a2] p-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                    Charge liée au Cycle N°2026-001
                  </div>
                )}
              </div>
            </DashboardSection>
          </div>
        )}

        <div className="flex justify-center pb-10 pt-2">
          {phase === 1 ? (
            <button 
              onClick={() => { alert('Cycle Stérilisation Lancé !'); setPhase(2); }}
              disabled={!isPhase1Complete}
              className={`group relative rounded-2xl px-20 py-5 text-sm font-semibold uppercase tracking-[0.22em] transition-all duration-500 shadow-[0_20px_40px_rgba(11,72,103,0.14)] ${isPhase1Complete ? 'bg-[#1378ac] text-white hover:bg-[#0f6a98] hover:-translate-y-1.5 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {isPhase1Complete && <span className="absolute -top-3 -right-3 rounded-full bg-[#11b5a2] p-2 text-xs text-white shadow-lg">✓</span>}
              Démarrer le Cycle
            </button>
          ) : (
            <button 
              onClick={() => alert('Charge Libérée !')}
              disabled={!isPhase2Complete}
              className={`group relative rounded-2xl px-20 py-5 text-sm font-semibold uppercase tracking-[0.22em] transition-all duration-500 shadow-[0_20px_40px_rgba(11,72,103,0.14)] ${isPhase2Complete ? 'bg-[#11b5a2] text-white hover:bg-[#0fa391] hover:-translate-y-1.5 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {isPhase2Complete && <span className="absolute -top-3 -right-3 rounded-full bg-white p-2 text-xs font-semibold text-[#11b5a2] shadow-lg">✓</span>}
              Libérer la Charge
            </button>
          )}
        </div>

      </div>

      {quickActionLabel && (
        <button
          onClick={triggerSimulation}
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_24px_45px_rgba(11,72,103,0.28)] transition-all hover:scale-105 active:scale-95 group ${phase === 1 ? 'bg-[#0b4867] hover:bg-[#0a3952]' : 'bg-[#11b5a2] hover:bg-[#0fa391]'}`}
        >
          <span className="text-xl text-white/85">⌁</span>
          <span>{quickActionLabel}</span>
        </button>
      )}

    </div>
  );
}

// --- Reusable Dashboard Components ---

function DashboardSection({
  title,
  scanned,
  icon,
  waitingText,
  children,
}: DashboardSectionProps) {
  return (
    <section className={`flex min-h-[500px] flex-col rounded-3xl border bg-white/95 p-8 shadow-[0_20px_45px_rgba(11,72,103,0.08)] transition-all duration-500 ${scanned ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-[#0b4867]">{title}</h2>
        {scanned && <span className="rounded-lg bg-[#eafaf7] px-2 py-1 text-xs font-semibold uppercase text-[#0b786e]">✓</span>}
      </div>
      
      {!scanned ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400">
          <div className="text-4xl opacity-50">{icon}</div>
          <p className="font-bold text-xs uppercase tracking-widest text-center px-4">{waitingText}</p>
        </div>
      ) : children}
    </section>
  );
}

function DataCard({ label, value, color }: DataCardProps) {
  const bg = color === 'purple' ? 'bg-[#edf5f9]' : 'bg-[#eafaf7]';
  const text = color === 'purple' ? 'text-[#1378ac]' : 'text-[#0b786e]';
  const border = color === 'purple' ? 'border-[#b8cad6]' : 'border-[#bdece4]';
  
  return (
    <div className={`rounded-xl border ${border} ${bg} p-4`}>
      <p className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${text}`}>{label}</p>
      <p className="text-lg font-semibold tracking-tight text-[#0b4867]">{value}</p>
    </div>
  );
}

function StatusButton({
  active,
  onClick,
  icon,
  label,
  color,
}: StatusButtonProps) {
  const activeClass = color === 'emerald' ? 'border-[#11b5a2] bg-[#11b5a2] text-white shadow-xl scale-105' : 'border-[#0b4867] bg-[#0b4867] text-white shadow-xl scale-105';
  
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-6 transition-all ${active ? activeClass : 'border-[#d5e2ea] bg-white text-slate-400'}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-center text-[10px] font-semibold uppercase tracking-[0.18em]">{label}</span>
    </button>
  );
}

function TopOperatorPanel({
  title,
  subtitle,
  confirmed,
  waitingText,
  name,
  role,
  badgeId,
}: {
  title: string;
  subtitle: string;
  confirmed: boolean;
  waitingText: string;
  name: string;
  role: string;
  badgeId: string;
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
            <h2 className="text-lg font-semibold tracking-tight text-[#0b4867]">{title}</h2>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>
        {confirmed && <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-3 py-1 text-[10px] font-semibold uppercase text-[#0b786e]">Validé</span>}
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
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
            <span>Badge</span>
            <span className="text-white">{badgeId}</span>
          </div>
        </div>
      )}
    </section>
  );
}

function CheckItem({ label, checked, onClick }: CheckItemProps) {
  return (
    <button 
      onClick={onClick} 
      className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${checked ? 'border-[#11b5a2] bg-[#eafaf7] text-[#0b786e]' : 'border-[#d5e2ea] bg-white text-slate-400'}`}
    >
      <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${checked ? 'border-[#11b5a2] bg-[#11b5a2] text-white' : 'border-[#cfdbe3]'}`}>
        {checked && "✓"}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] leading-tight">{label}</span>
    </button>
  );
}

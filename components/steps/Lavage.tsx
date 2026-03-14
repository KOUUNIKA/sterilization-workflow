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

type InstrumentItemProps = {
  id: number;
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

export function LavageWizard() {
  const [phase, setPhase] = useState<1 | 2>(1); // 1: Chargement (Entrée), 2: Déchargement (Sortie)
  
  // Phase 1: Chargement States
  const [panierScanned, setPanierScanned] = useState(false);
  const [laveurScanned, setLaveurScanned] = useState(false);
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  const [laveurStatus, setLaveurStatus] = useState<"ready" | "maintenance">("ready");

  // Phase 2: Déchargement States
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
        ? "Valider la conformite"
        : !sortiePanierScanned
          ? "Scanner le panier sortie"
          : !sortieOperatorConfirmed
            ? "Scanner le badge responsable"
            : null;
  const operatorState =
    phase === 1
      ? {
          title: "Opérateur",
          subtitle: "Badge entrée",
          confirmed: operatorConfirmed,
          name: "Dr. Karim ALAOUI",
          role: "Responsable Zone Lavage",
          badgeId: "ID: K-9982",
        }
      : {
          title: "Responsable",
          subtitle: "Badge libération",
          confirmed: sortieOperatorConfirmed,
          name: "Salma BENANI",
          role: "Responsable Déchargement",
          badgeId: "ID: S-1104",
        };

  return (
    <div className="min-h-screen px-6 py-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="grid gap-4 xl:grid-cols-[1.2fr_0.85fr]">
          <section className="rounded-3xl border border-[#d5e2ea] bg-white/95 p-5 shadow-[0_20px_45px_rgba(11,72,103,0.08)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center rounded-full border border-[#b8cad6] bg-[#edf5f9] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1378ac]">
                  Phase 02 • Lavage
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#0b4867]">
                  {phase === 1 ? "Entrée Laveur" : "Sortie Laveur"}
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
                  02. Déchargement
                </button>
              </div>
            </div>
          </section>

          <TopOperatorPanel
            title={operatorState.title}
            subtitle={operatorState.subtitle}
            confirmed={operatorState.confirmed}
            waitingText={
              phase === 1
                ? "Scanner le badge de l'opérateur"
                : "Scanner le badge du responsable"
            }
            name={operatorState.name}
            role={operatorState.role}
            badgeId={operatorState.badgeId}
          />
        </header>

        <div className={`grid gap-6 ${phase === 1 ? "xl:grid-cols-2" : "xl:grid-cols-2"}`}>
          {phase === 1 && (
            <>
              <DashboardSection 
                index="01"
                title="Panier" 
                scanned={panierScanned} 
                icon="🛒" 
                waitingText="Scanner le code-barres du panier"
              >
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DataCard label="Identifiant Panier" value="PAN-2026-X8" color="emerald" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <InstrumentItem key={i} id={i} />
                    ))}
                  </div>
                </div>
              </DashboardSection>

              <DashboardSection 
                index="02"
                title="Laveur" 
                scanned={laveurScanned} 
                icon="⚙️" 
                waitingText="Scanner le code-barres du laveur"
              >
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DataCard label="Machine Identifiée" value="LD-UNIT-02" color="emerald" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <StatusButton 
                      active={laveurStatus === 'ready'} 
                      onClick={() => setLaveurStatus("ready")} 
                      color="emerald" 
                      icon="✅" 
                      label="Prêt à l'emploi" 
                    />
                    <StatusButton 
                      active={laveurStatus === 'maintenance'} 
                      onClick={() => setLaveurStatus("maintenance")} 
                      color="orange" 
                      icon="🛠️" 
                      label="En maintenance" 
                    />
                  </div>
                </div>
              </DashboardSection>

            </>
          )}

          {phase === 2 && (
            <>
              <DashboardSection 
                index="01"
                title="Conformité" 
                scanned={sortieCycleValidated} 
                icon="📋" 
                waitingText="Validation paramètres critiques"
              >
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CheckItem label="Programme" checked={conformity.programme} onClick={() => setConformity({...conformity, programme: !conformity.programme})} />
                    <CheckItem label="Paramètres" checked={conformity.parameters} onClick={() => setConformity({...conformity, parameters: !conformity.parameters})} />
                    <CheckItem label="Dosage" checked={conformity.dosage} onClick={() => setConformity({...conformity, dosage: !conformity.dosage})} />
                    <CheckItem label="Stabilité" checked={conformity.stability} onClick={() => setConformity({...conformity, stability: !conformity.stability})} />
                    <CheckItem label="Propreté" checked={conformity.cleanliness} onClick={() => setConformity({...conformity, cleanliness: !conformity.cleanliness})} />
                  </div>
                  <button 
                    onClick={() => setSortieCycleValidated(true)}
                    className={`w-full rounded-xl py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${Object.values(conformity).every(v => v) ? 'bg-[#11b5a2] text-white shadow-xl hover:bg-[#0fa391]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    Valider la conformité du cycle
                  </button>
                </div>
              </DashboardSection>

              <DashboardSection 
                index="02"
                title="Traçabilité Sortie" 
                scanned={sortiePanierScanned} 
                icon="🛒" 
                waitingText="Scanner le panier à la sortie"
              >
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DataCard label="Panier Identifié" value="PAN-2026-X8" color="emerald" />
                  <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-[#b8cad6] bg-[#edf5f9] p-8 text-center">
                    <span className="text-4xl">✓</span>
                    <div>
                      <p className="text-[#1378ac] text-sm font-semibold uppercase tracking-[0.22em]">Charge validée</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Cycle LD-12333 • Secteur lavage</p>
                    </div>
                  </div>
                </div>
              </DashboardSection>

            </>
          )}
        </div>

        {/* Final Action Button */}
        <div className="flex justify-center pb-10 pt-2">
          {phase === 1 ? (
            <button 
              onClick={() => { alert('Cycle Lavage Lancé !'); setPhase(2); }}
              disabled={!isPhase1Complete}
              className={`group relative rounded-2xl px-24 py-5 text-sm font-semibold uppercase tracking-[0.22em] transition-all duration-500 shadow-[0_20px_40px_rgba(11,72,103,0.14)] ${isPhase1Complete ? 'bg-[#1378ac] text-white hover:bg-[#0f6a98] hover:-translate-y-1.5 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {isPhase1Complete && <span className="absolute -top-3 -right-3 rounded-full bg-[#11b5a2] p-2 text-xs text-white shadow-lg">✓</span>}
              Lancer le Cycle
            </button>
          ) : (
            <button 
              onClick={() => alert('Cycle Lavage Terminé et Libéré !')}
              disabled={!isPhase2Complete}
              className={`group relative rounded-2xl px-24 py-5 text-sm font-semibold uppercase tracking-[0.22em] transition-all duration-500 shadow-[0_20px_40px_rgba(11,72,103,0.14)] ${isPhase2Complete ? 'bg-[#11b5a2] text-white hover:bg-[#0fa391] hover:-translate-y-1.5 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
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

// --- Sub-components to keep code clean ---

function DashboardSection({
  index,
  title,
  scanned,
  icon,
  waitingText,
  children,
}: DashboardSectionProps) {
  return (
    <section className={`bg-white/95 p-6 rounded-3xl border shadow-[0_20px_45px_rgba(11,72,103,0.08)] transition-all duration-500 flex flex-col ${scanned ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1378ac] text-sm font-semibold text-white shadow-lg">{index}</span>
          <h2 className="text-xl font-semibold tracking-tight text-[#0b4867]">{title}</h2>
        </div>
        {scanned && <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#0b786e]">Validé</span>}
      </div>
      
      {!scanned ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] py-10 text-slate-400">
          <div className="text-6xl opacity-50">{icon}</div>
          <p className="font-bold text-sm uppercase tracking-[0.2em] text-center px-4">{waitingText}</p>
        </div>
      ) : children}
    </section>
  );
}

function DataCard({ label, value, color }: DataCardProps) {
  const bg = color === 'emerald' ? 'bg-[#eafaf7]' : 'bg-[#edf5f9]';
  const text = color === 'emerald' ? 'text-[#0b786e]' : 'text-[#1378ac]';
  const border = color === 'emerald' ? 'border-[#bdece4]' : 'border-[#b8cad6]';
  
  return (
    <div className={`rounded-2xl border p-6 ${bg} ${border}`}>
      <p className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] ${text}`}>{label}</p>
      <p className="text-2xl font-semibold tracking-tight text-[#0b4867]">{value}</p>
    </div>
  );
}

function InstrumentItem({ id }: InstrumentItemProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-[#d5e2ea] bg-[#f8fbfd] p-4 text-center">
      <p className="mb-1 w-full truncate text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">Instrument {id}</p>
      <p className="text-sm font-semibold text-[#1378ac]">x{id + 2}</p>
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
      className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-8 transition-all ${active ? activeClass : 'border-[#d5e2ea] bg-white text-slate-400 hover:border-[#b8cad6] shadow-sm'}`}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-center text-[10px] font-semibold uppercase tracking-[0.2em]">{label}</span>
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
        {confirmed && (
          <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0b786e]">
            Validé
          </span>
        )}
      </div>

      {!confirmed ? (
        <div className="flex min-h-[170px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400">
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
      className={`flex w-full items-center gap-4 rounded-xl border-2 p-5 text-left transition-all ${checked ? 'border-[#11b5a2] bg-[#eafaf7] text-[#0b786e] shadow-lg' : 'border-[#d5e2ea] bg-white text-slate-400'}`}
    >
      <div className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${checked ? 'border-[#11b5a2] bg-[#11b5a2] text-white' : 'border-[#cfdbe3]'}`}>
        {checked && "✓"}
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] leading-tight">{label}</span>
    </button>
  );
}

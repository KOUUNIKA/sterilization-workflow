"use client";

import { useState } from "react";

interface ConformityChecks {
  passage: boolean;
  physico: boolean;
  siccite: boolean;
  integrite: boolean;
}

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

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header with Phase Toggle */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-full">Phase 03 • Stérilisation</div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              {phase === 1 ? "Entrée Autoclave" : "Sortie Autoclave"}
            </h1>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm">
            <button 
              onClick={() => setPhase(1)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${phase === 1 ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              01. Chargement
            </button>
            <button 
              onClick={() => setPhase(2)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${phase === 2 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              02. Validation
            </button>
          </div>
        </header>

        {/* --- PHASE 1: CHARGEMENT --- */}
        {phase === 1 && (
          <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Emballages */}
            <DashboardSection title="01. Chariot" scanned={scannedItems.length > 0} icon="🧺" waitingText="Scanner les emballages">
              <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-wrap gap-2">
                  {scannedItems.map((item, i) => (
                    <div key={i} className="bg-purple-50 px-3 py-2 rounded-xl border border-purple-100 text-xs font-black text-purple-700">
                      {item}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                  {scannedItems.length} objet(s) sur le chariot
                </p>
              </div>
            </DashboardSection>

            {/* Autoclave */}
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

            {/* Opérateur */}
            <DashboardSection title="03. Opérateur" scanned={agentBadge.name !== ""} icon="👤" waitingText="Scanner le badge">
              <OperatorCard name={agentBadge.name} role={agentBadge.role} badgeId="ID: A-7789" icon="👩‍🔬" />
            </DashboardSection>
          </div>
        )}

        {/* --- PHASE 2: DÉCHARGEMENT --- */}
        {phase === 2 && (
          <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Conformité */}
            <DashboardSection title="01. Conformité" scanned={Object.values(checks).every(v => v)} icon="📋" waitingText="Vérification indicateurs">
              <div className="grid gap-3 animate-in fade-in zoom-in duration-500">
                <CheckItem label="Indicateurs passage" checked={checks.passage} onClick={() => setChecks({...checks, passage: !checks.passage})} />
                <CheckItem label="Physico-chimiques" checked={checks.physico} onClick={() => setChecks({...checks, physico: !checks.physico})} />
                <CheckItem label="Siccité emballage" checked={checks.siccite} onClick={() => setChecks({...checks, siccite: !checks.siccite})} />
                <CheckItem label="Intégrité condit." checked={checks.integrite} onClick={() => setChecks({...checks, integrite: !checks.integrite})} />
              </div>
            </DashboardSection>

            {/* Sortie */}
            <DashboardSection title="02. Libération" scanned={sortieScannedItems.length > 0} icon="📦" waitingText="Scan emballages sortie">
              <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-wrap gap-2">
                  {sortieScannedItems.map((item, i) => (
                    <div key={i} className="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 text-xs font-black text-emerald-700">
                      {item}
                    </div>
                  ))}
                </div>
                {sortieScannedItems.length > 0 && (
                  <div className="p-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase text-center animate-bounce">
                    Charge liée au Cycle N°2026-001
                  </div>
                )}
              </div>
            </DashboardSection>

            {/* Opérateur Sortie */}
            <DashboardSection title="03. Validation" scanned={sortieAgentBadge.name !== ""} icon="👤" waitingText="Scanner badge responsable">
              <OperatorCard name={sortieAgentBadge.name} role={sortieAgentBadge.role} badgeId="ID: A-7789" icon="👩‍🔬" />
            </DashboardSection>
          </div>
        )}

        {/* Final Action Button */}
        <div className="flex justify-center pt-10 pb-20">
          {phase === 1 ? (
            <button 
              onClick={() => { alert('Cycle Stérilisation Lancé !'); setPhase(2); }}
              disabled={!isPhase1Complete}
              className={`group relative px-20 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all duration-500 shadow-2xl ${isPhase1Complete ? 'bg-slate-900 text-white hover:bg-black hover:-translate-y-2 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {isPhase1Complete && <span className="absolute -top-3 -right-3 bg-emerald-500 text-white p-2 rounded-full text-xs animate-bounce shadow-lg">✓</span>}
              Démarrer le Cycle
            </button>
          ) : (
            <button 
              onClick={() => alert('Charge Libérée !')}
              disabled={!isPhase2Complete}
              className={`group relative px-20 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all duration-500 shadow-2xl ${isPhase2Complete ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-2 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {isPhase2Complete && <span className="absolute -top-3 -right-3 bg-white text-emerald-600 p-2 rounded-full text-xs animate-bounce shadow-lg font-black">✓</span>}
              Libérer la Charge
            </button>
          )}
        </div>

      </div>

      {/* Floating Simulation Button */}
      <button 
        onClick={triggerSimulation}
        className={`fixed bottom-8 right-8 flex items-center gap-3 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl transition-all hover:scale-110 active:scale-95 group z-50 ${phase === 1 ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
      >
        <span className="text-xl group-hover:animate-pulse">⚡</span>
        <span>Simuler {phase === 1 ? 'Entrée' : 'Sortie'}</span>
      </button>

    </div>
  );
}

// --- Reusable Dashboard Components ---

function DashboardSection({ title, scanned, icon, waitingText, children }: any) {
  return (
    <section className={`bg-white p-8 rounded-[2.5rem] border shadow-sm transition-all duration-500 flex flex-col min-h-[500px] ${scanned ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black uppercase tracking-tight italic">{title}</h2>
        {scanned && <span className="text-emerald-500 font-black text-xs uppercase bg-emerald-50 px-2 py-1 rounded-lg">✓</span>}
      </div>
      
      {!scanned ? (
        <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2rem] text-slate-300 gap-4">
          <div className="text-4xl opacity-50">{icon}</div>
          <p className="font-bold text-xs uppercase tracking-widest text-center px-4">{waitingText}</p>
        </div>
      ) : children}
    </section>
  );
}

function DataCard({ label, value, color }: any) {
  const bg = color === 'purple' ? 'bg-purple-50' : 'bg-emerald-50';
  const text = color === 'purple' ? 'text-purple-600' : 'text-emerald-600';
  const border = color === 'purple' ? 'border-purple-100' : 'border-emerald-100';
  
  return (
    <div className={`p-4 ${bg} rounded-2xl border ${border}`}>
      <p className={`text-[10px] font-bold ${text} uppercase mb-1`}>{label}</p>
      <p className="text-lg font-black text-slate-800 tracking-tight">{value}</p>
    </div>
  );
}

function StatusButton({ active, onClick, icon, label, color }: any) {
  const activeClass = color === 'emerald' ? 'border-emerald-500 bg-emerald-500 text-white shadow-xl scale-105' : 'border-orange-500 bg-orange-500 text-white shadow-xl scale-105';
  
  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 ${active ? activeClass : 'border-slate-100 bg-white text-slate-400 grayscale hover:grayscale-0'}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-black uppercase text-[10px] tracking-widest text-center">{label}</span>
    </button>
  );
}

function OperatorCard({ name, role, badgeId, icon }: any) {
  return (
    <div className="animate-in fade-in zoom-in duration-500">
      <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl rotate-12">♨️</div>
        <div className="flex flex-col items-center text-center gap-4 relative z-10">
          <div className="h-24 w-24 bg-purple-500 rounded-full flex items-center justify-center text-5xl border-4 border-slate-800 shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
          <div className="space-y-1">
            <p className="text-2xl font-black italic tracking-tighter uppercase">{name}</p>
            <div className="h-1 w-12 bg-purple-500 mx-auto rounded-full"></div>
            <p className="text-purple-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">{role}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase italic">{badgeId}</p>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, checked, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${checked ? 'border-purple-500 bg-purple-50 text-purple-900' : 'border-slate-100 bg-white text-slate-400'}`}
    >
      <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${checked ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-200'}`}>
        {checked && "✓"}
      </div>
      <span className="text-[10px] font-black leading-tight uppercase tracking-widest">{label}</span>
    </button>
  );
}

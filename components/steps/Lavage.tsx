"use client";

import { useState } from "react";

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

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header with Phase Toggle */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">Phase 02 • Lavage</div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              {phase === 1 ? "Entrée Laveur" : "Sortie Laveur"}
            </h1>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm">
            <button 
              onClick={() => setPhase(1)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${phase === 1 ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              01. Chargement
            </button>
            <button 
              onClick={() => setPhase(2)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${phase === 2 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              02. Déchargement
            </button>
          </div>
        </header>

        {/* Vertical Dashboard Stack */}
        <div className="flex flex-col gap-10 max-w-3xl mx-auto">
          
          {/* --- PHASE 1: CHARGEMENT --- */}
          {phase === 1 && (
            <>
              {/* 01. Panier */}
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

              {/* 02. Laveur */}
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

              {/* 03. Opérateur */}
              <DashboardSection 
                index="03"
                title="Opérateur" 
                scanned={operatorConfirmed} 
                icon="👤" 
                waitingText="Scanner le badge de l'opérateur"
              >
                <div className="max-w-md mx-auto w-full">
                  <OperatorCard name="Dr. Karim ALAOUI" role="Responsable Zone Lavage" badgeId="ID: K-9982" />
                </div>
              </DashboardSection>
            </>
          )}

          {/* --- PHASE 2: DÉCHARGEMENT --- */}
          {phase === 2 && (
            <>
              {/* 01. Conformité */}
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
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${Object.values(conformity).every(v => v) ? 'bg-emerald-500 text-white shadow-xl hover:bg-emerald-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    Valider la conformité du cycle
                  </button>
                </div>
              </DashboardSection>

              {/* 02. Traçabilité */}
              <DashboardSection 
                index="02"
                title="Traçabilité Sortie" 
                scanned={sortiePanierScanned} 
                icon="🛒" 
                waitingText="Scanner le panier à la sortie"
              >
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DataCard label="Panier Identifié" value="PAN-2026-X8" color="emerald" />
                  <div className="p-8 bg-blue-50 border-4 border-dashed border-blue-200 rounded-[2.5rem] text-center flex flex-col items-center gap-3">
                    <span className="text-4xl">✓</span>
                    <div>
                      <p className="text-blue-600 font-black text-sm uppercase tracking-widest italic">Charge Validée</p>
                      <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase">Cycle LD-12333 • Secteur Lavage</p>
                    </div>
                  </div>
                </div>
              </DashboardSection>

              {/* 03. Libération */}
              <DashboardSection 
                index="03"
                title="Validation Libération" 
                scanned={sortieOperatorConfirmed} 
                icon="👤" 
                waitingText="Scanner le badge du responsable"
              >
                <div className="max-w-md mx-auto w-full">
                  <OperatorCard name="Salma BENANI" role="Responsable Déchargement" badgeId="ID: S-1104" />
                </div>
              </DashboardSection>
            </>
          )}
        </div>

        {/* Final Action Button */}
        <div className="flex justify-center pt-10 pb-20">
          {phase === 1 ? (
            <button 
              onClick={() => { alert('Cycle Lavage Lancé !'); setPhase(2); }}
              disabled={!isPhase1Complete}
              className={`group relative px-24 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all duration-500 shadow-2xl ${isPhase1Complete ? 'bg-slate-900 text-white hover:bg-black hover:-translate-y-2 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {isPhase1Complete && <span className="absolute -top-3 -right-3 bg-emerald-500 text-white p-2 rounded-full text-xs animate-bounce shadow-lg">✓</span>}
              Lancer le Cycle
            </button>
          ) : (
            <button 
              onClick={() => alert('Cycle Lavage Terminé et Libéré !')}
              disabled={!isPhase2Complete}
              className={`group relative px-24 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all duration-500 shadow-2xl ${isPhase2Complete ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-2 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
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
        className={`fixed bottom-8 right-8 flex items-center gap-3 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl transition-all hover:scale-110 active:scale-95 group z-50 ${phase === 1 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
      >
        <span className="text-xl group-hover:animate-pulse">⚡</span>
        <span>Simuler {phase === 1 ? 'Entrée' : 'Sortie'}</span>
      </button>

    </div>
  );
}

// --- Sub-components to keep code clean ---

function DashboardSection({ index, title, scanned, icon, waitingText, children }: any) {
  return (
    <section className={`bg-white p-10 rounded-[3rem] border shadow-md transition-all duration-500 flex flex-col ${scanned ? 'border-emerald-500 ring-8 ring-emerald-50' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-black italic shadow-lg">{index}</span>
          <h2 className="text-xl font-black uppercase tracking-tight italic">{title}</h2>
        </div>
        {scanned && <span className="text-emerald-500 font-black text-xs uppercase bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">Validé ✓</span>}
      </div>
      
      {!scanned ? (
        <div className="py-16 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300 gap-4">
          <div className="text-6xl opacity-50">{icon}</div>
          <p className="font-bold text-sm uppercase tracking-[0.2em] text-center px-4">{waitingText}</p>
        </div>
      ) : children}
    </section>
  );
}

function DataCard({ label, value, color }: any) {
  const bg = color === 'emerald' ? 'bg-emerald-50' : 'bg-blue-50';
  const text = color === 'emerald' ? 'text-emerald-600' : 'text-blue-600';
  const border = color === 'emerald' ? 'border-emerald-100' : 'border-blue-100';
  
  return (
    <div className={`p-6 ${bg} rounded-[2rem] border ${border}`}>
      <p className={`text-[10px] font-black ${text} uppercase tracking-widest mb-2`}>{label}</p>
      <p className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">{value}</p>
    </div>
  );
}

function InstrumentItem({ id }: any) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1 text-center w-full truncate">Instrument {id}</p>
      <p className="text-sm font-black text-blue-600">x{id + 2}</p>
    </div>
  );
}

function StatusButton({ active, onClick, icon, label, color }: any) {
  const activeClass = color === 'emerald' ? 'border-emerald-500 bg-emerald-500 text-white shadow-xl scale-105' : 'border-orange-500 bg-orange-500 text-white shadow-xl scale-105';
  
  return (
    <button 
      onClick={onClick}
      className={`p-8 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-3 ${active ? activeClass : 'border-white bg-white text-slate-300 grayscale hover:grayscale-0 hover:border-slate-100 shadow-sm'}`}
    >
      <span className="text-3xl">{icon}</span>
      <span className="font-black uppercase text-[10px] tracking-widest text-center">{label}</span>
    </button>
  );
}

function OperatorCard({ name, role, badgeId }: any) {
  return (
    <div className="animate-in fade-in zoom-in duration-500 w-full">
      <div className="p-10 bg-slate-900 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 p-4 opacity-5 text-[10rem] rotate-12">🧪</div>
        <div className="flex flex-col items-center text-center gap-6 relative z-10">
          <div className="h-32 w-32 bg-blue-500 rounded-full flex items-center justify-center text-6xl border-8 border-slate-800 shadow-inner group-hover:scale-110 transition-transform">👨‍🔬</div>
          <div className="space-y-2">
            <p className="text-3xl font-black italic tracking-tighter uppercase">{name}</p>
            <div className="h-1.5 w-16 bg-blue-500 mx-auto rounded-full"></div>
            <p className="text-blue-400 font-black uppercase text-xs tracking-[0.3em] mt-4">{role}</p>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-800 text-center">
          <div className="inline-block px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{badgeId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, checked, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full p-5 rounded-2xl border-4 transition-all text-left flex items-center gap-4 ${checked ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-lg' : 'border-white bg-white text-slate-300'}`}
    >
      <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
        {checked && "✓"}
      </div>
      <span className="text-xs font-black leading-tight uppercase tracking-widest">{label}</span>
    </button>
  );
}

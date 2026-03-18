"use client";

import { useState, useEffect, useMemo } from "react";

// --- TYPES ---
interface ConformityChecks {
  passage: boolean;
  physico: boolean;
  siccite: boolean;
  integrite: boolean;
  graphValidated: boolean; // For the checklist check
  graphConformity: boolean; // For the signature button
}

interface CycleData {
  temperature: number[];
  pressure: number[];
  timestamp: number[];
}

interface DechargesterilizationProps {
  onPhaseChange?: (phase: 1 | 2) => void;
}

export function Dechargesterilization({ onPhaseChange }: DechargesterilizationProps) {
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [agentBadge, setAgentBadge] = useState({ name: "", role: "" });
  const [checks, setChecks] = useState<ConformityChecks>({
    passage: false,
    physico: false,
    siccite: false,
    integrite: false,
    graphValidated: false,
    graphConformity: false,
  });

  const [cycleData, setCycleData] = useState<CycleData>({
    temperature: [],
    pressure: [],
    timestamp: [],
  });

  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- IOT SIMULATION ARCHITECTURE ---
  const getAutoclaveData = () => {
    setIsLoadingData(true);
    setTimeout(() => {
      const data: CycleData = {
        temperature: [],
        pressure: [],
        timestamp: [],
      };
      // Generate a realistic curve pattern matching image_12aa654d
      for (let i = 0; i <= 100; i++) {
        let temp = 25;
        let press = 1000;
        
        if (i < 30) {
          // PRÉ-TRAITEMENT (Vides et injections)
          const phase = i % 8;
          if (phase < 4) {
            press = 800 + (phase * 300);
            temp = 25 + (phase * 15);
          } else {
            press = 2000 - ((phase - 4) * 350);
            temp = 85 - ((phase - 4) * 10);
          }
        } else if (i < 70) {
          // PLATEAU
          press = 2200 + (Math.random() * 20);
          temp = 134.5 + (Math.random() * 0.2);
        } else if (i < 85) {
          // POST-TRAITEMENT (Chute)
          press = 2200 - ((i - 70) * 120);
          temp = 134.5 - ((i - 70) * 6);
        } else {
          // SÉCHAGE (Oscillations basses)
          const phase = i % 5;
          press = phase < 3 ? 500 : 200;
          temp = 45 - (i - 85);
        }
        
        data.pressure.push(press);
        data.temperature.push(temp);
        data.timestamp.push(i);
      }
      setCycleData(data);
      setIsLoadingData(false);
    }, 800);
  };

  useEffect(() => {
    getAutoclaveData();
  }, []);

  const toggleCheck = (key: keyof ConformityChecks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksValid = checks.passage && checks.physico && checks.siccite && checks.integrite && checks.graphValidated && checks.graphConformity;
  const isCycleValidated = agentBadge.name !== "" && scannedItems.length > 0 && allChecksValid;

  // Simulation helpers
  const simulateCheckAll = () => setChecks({ 
    passage: true, physico: true, siccite: true, integrite: true, 
    graphValidated: true, graphConformity: true 
  });
  const simulateItemScan = () => {
    const id = `EMB-SORTIE-${Math.floor(1000 + Math.random() * 9000)}`;
    setScannedItems((prev) => [...prev, id]);
  };
  const simulateBadgeScan = () => setAgentBadge({ name: "MME. AMINA ALAMI", role: "AGENT STÉRILISATION (IBODE)" });

  const chartPaths = useMemo(() => {
    if (cycleData.pressure.length === 0) return { pressure: "", temperature: "", lastPointPress: {x:0, y:0}, lastPointTemp: {x:0, y:0} };
    
    const width = 800;
    const height = 240;
    const padding = 50;

    const pressD = cycleData.pressure.map((p, i) => {
      const x = (i / 100) * (width - 2 * padding) + padding;
      const y = height - padding - ((p / 3500) * (height - 2 * padding));
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(" ");

    const tempD = cycleData.temperature.map((t, i) => {
      const x = (i / 100) * (width - 2 * padding) + padding;
      const y = height - padding - ((t / 150) * (height - 2 * padding));
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(" ");

    const lastIdx = cycleData.pressure.length - 1;
    const lastX = (lastIdx / 100) * (width - 2 * padding) + padding;
    const lastYPress = height - padding - ((cycleData.pressure[lastIdx] / 3500) * (height - 2 * padding));
    const lastYTemp = height - padding - ((cycleData.temperature[lastIdx] / 150) * (height - 2 * padding));

    return { 
      pressure: pressD, 
      temperature: tempD, 
      lastPointPress: {x: lastX, y: lastYPress},
      lastPointTemp: {x: lastX, y: lastYTemp}
    };
  }, [cycleData]);

  const renderChart = () => {
    if (isLoadingData) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-[#1378ac] animate-pulse">
          <span className="text-4xl mb-4">⌛</span>
          <p className="text-[10px] font-black uppercase tracking-widest italic">Chargement des données IoT...</p>
        </div>
      );
    }

    const width = 800;
    const height = 240;
    const padding = 50;

    return (
      <div className="relative w-full flex-1 flex flex-col">
        {/* Left Y-Axis labels (Absolute positioned like reference) */}
        <div className="absolute left-0 top-[45%] flex flex-col gap-1 items-end pr-4 text-[10px] font-black uppercase leading-none select-none pointer-events-none">
          <span className="text-[#d6455d]">Température</span>
          <span className="text-[#0b4867]">Pression</span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full overflow-visible">
          {/* 1. BACKGROUND GRID & VERTICAL PHASES */}
          {[0, 1000, 2000, 3000].map(val => {
            const y = height - padding - ((val / 3500) * (height - 2 * padding));
            return (
              <line key={val} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#d5e2ea" strokeWidth="1" className="opacity-50" />
            );
          })}

          {/* Phase Separators (Vertical Lines) */}
          {[padding + (width-2*padding)*0.3, padding + (width-2*padding)*0.7].map((x, i) => (
            <line key={i} x1={x} y1={10} x2={x} y2={height - padding} stroke="#d5e2ea" strokeWidth="1.5" />
          ))}

          {/* 2. DATA LINES */}
          <path d={chartPaths.pressure} fill="none" stroke="#0b4867" strokeWidth="3" strokeLinejoin="round" />
          <path d={chartPaths.temperature} fill="none" stroke="#d6455d" strokeWidth="2" strokeLinejoin="round" />

          {/* Markers at end */}
          <circle cx={chartPaths.lastPointPress.x} cy={chartPaths.lastPointPress.y} r="4" fill="#0b4867" />
          <circle cx={chartPaths.lastPointTemp.x} cy={chartPaths.lastPointTemp.y} r="4" fill="#d6455d" />

          {/* 3. PHASE LABELS AT TOP */}
          <g className="text-[11px] font-black uppercase tracking-[0.2em] fill-slate-800">
            <text x={padding + (width-2*padding)*0.15} y={15} textAnchor="middle">PRÉ-TRAITEMENT</text>
            <text x={padding + (width-2*padding)*0.5} y={15} textAnchor="middle">PLATEAU</text>
            <text x={padding + (width-2*padding)*0.85} y={15} textAnchor="middle">POST-TRAITEMENT</text>
          </g>

          {/* 4. BOXED ANNOTATIONS AT BOTTOM (Centered under peaks) */}
          <g className="text-[8px] font-black uppercase tracking-widest fill-slate-800">
            {/* Vide fractionné */}
            <rect x={padding + (width-2*padding)*0.08} y={height - 22} width="80" height="14" rx="2" fill="white" stroke="#d5e2ea" />
            <text x={padding + (width-2*padding)*0.08 + 40} y={height - 12} textAnchor="middle">Vide fractionné</text>

            {/* Montée en température */}
            <rect x={padding + (width-2*padding)*0.26} y={height - 22} width="85" height="14" rx="2" fill="white" stroke="#d5e2ea" />
            <text x={padding + (width-2*padding)*0.26 + 42.5} y={height - 12} textAnchor="middle">Montée en temp.</text>

            {/* Temps de stérilisation */}
            <rect x={padding + (width-2*padding)*0.4} y={height - 22} width="100" height="14" rx="2" fill="white" stroke="#d5e2ea" />
            <text x={padding + (width-2*padding)*0.4 + 50} y={height - 12} textAnchor="middle">Temps stérilisation</text>

            {/* Temps de séchage */}
            <rect x={padding + (width-2*padding)*0.65} y={height - 22} width="80" height="14" rx="2" fill="white" stroke="#d5e2ea" />
            <text x={padding + (width-2*padding)*0.65 + 40} y={height - 12} textAnchor="middle">Temps de séchage</text>
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden font-app relative">
      
      {/* Simulation Floating Buttons */}
      <div className="fixed bottom-24 right-10 flex flex-col gap-3 z-50">
        <button onClick={simulateCheckAll} className="bg-white border-2 border-[#1378ac] text-[#1378ac] p-4 rounded-2xl shadow-xl hover:scale-105 transition-all w-20 flex flex-col items-center">
          <span className="text-xl">📊</span>
          <span className="text-[8px] font-black uppercase mt-1 text-center">Check OK</span>
        </button>
        <button onClick={simulateItemScan} className="bg-[#1378ac] text-white p-4 rounded-2xl shadow-xl hover:scale-105 transition-all w-20 flex flex-col items-center">
          <span className="text-xl">📦</span>
          <span className="text-[8px] font-black uppercase mt-1 text-center">Scan</span>
        </button>
        <button onClick={simulateBadgeScan} className="bg-[#0b4867] text-white p-4 rounded-2xl shadow-xl hover:scale-105 transition-all w-20 flex flex-col items-center">
          <span className="text-xl">🪪</span>
          <span className="text-[8px] font-black uppercase mt-1 text-center">Badge</span>
        </button>
      </div>

      <header className="shrink-0 flex items-center justify-between border-b border-[#d5e2ea] pb-3">
        <div className="space-y-1">
          <div className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-[#0b4867] border border-purple-200">
            Phase 04 • Déchargement
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#0b4867] uppercase leading-none">
            Sortie Autoclave & Libération
          </h1>
        </div>
        <div className="flex rounded-xl border border-[#d5e2ea] bg-white/95 p-1.5 shadow-sm shrink-0 h-fit">
          <button onClick={() => onPhaseChange?.(1)} className="px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all text-slate-400 hover:text-[#0b4867]">Chargement</button>
          <button className="px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all bg-[#11b5a2] text-white shadow-md">Validation</button>
        </div>
      </header>

      {/* Main content Area - EXACT Grid matching image_12aa654d */}
      <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
        
        {/* TOP SECTION: 2/3 Chart, 1/3 Validation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 min-h-0 flex-[1.8]">
          
          {/* CHART SECTION (LEFT) */}
          <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-[#d5e2ea] relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#edf5f9] flex items-center justify-center text-xl shadow-inner border border-[#d5e2ea]">⏱️</div>
                <div>
                  <h2 className="text-lg font-black tracking-tighter text-[#0b4867] uppercase leading-none">Traçabilité Graphique IoT</h2>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5 leading-none">Cycle en temps réel • UNIT-STERI-02</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="bg-[#f8fbfd] px-3 py-2 rounded-xl border border-[#d5e2ea] text-center min-w-[100px]">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Temp. Max</p>
                  <p className="text-sm font-black text-[#d6455d]">134.5 °C</p>
                </div>
                <div className="bg-[#f8fbfd] px-3 py-2 rounded-xl border border-[#d5e2ea] text-center min-w-[100px]">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Press. Max</p>
                  <p className="text-sm font-black text-[#0b4867]">2142 mbar</p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 px-4">
              {renderChart()}
            </div>
          </section>

          {/* VALIDATION & SIGNATURE (RIGHT) */}
          <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-[#d5e2ea] flex flex-col gap-4 overflow-hidden">
            {/* Sensor cards header */}
            <div className="flex items-center justify-between shrink-0 mb-2">
              <div className="h-10 w-10 rounded-xl bg-[#edf5f9] flex items-center justify-center text-xl shadow-inner border border-[#d5e2ea]">⏱️</div>
              <div className="flex gap-2">
                <div className="bg-[#f8fbfd] px-2 py-1.5 rounded-lg border border-[#d5e2ea] text-center">
                  <p className="text-[6px] font-black text-slate-400 uppercase leading-none">Temp. Max</p>
                  <p className="text-[10px] font-black text-[#d6455d]">134.5 °C</p>
                </div>
                <div className="bg-[#f8fbfd] px-2 py-1.5 rounded-lg border border-[#d5e2ea] text-center">
                  <p className="text-[6px] font-black text-slate-400 uppercase leading-none">Press. Max</p>
                  <p className="text-[10px] font-black text-[#0b4867]">2142 mbar</p>
                </div>
              </div>
            </div>

            {/* Checklist Grid */}
            <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
              <CheckButton active={checks.graphValidated} label="Graphique Validé" onClick={() => toggleCheck("graphValidated")} />
              <div className="grid grid-cols-2 gap-2">
                <CheckButton active={checks.passage} label="Indicateurs de passage" onClick={() => toggleCheck("passage")} />
                <CheckButton active={checks.physico} label="Physico-Chimio" onClick={() => toggleCheck("physico")} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <CheckButton active={checks.siccite} label="SICCITE" onClick={() => toggleCheck("siccite")} />
                <CheckButton active={checks.integrite} label="Intégrité Condit." onClick={() => toggleCheck("integrite")} />
              </div>
            </div>

            {/* Signature Block */}
            <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-3">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1378ac]" /> Signature numérique
              </h3>
              <button 
                onClick={() => toggleCheck("graphConformity")}
                className={`w-full flex items-center justify-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all group ${
                  checks.graphConformity 
                  ? 'bg-[#eafaf7] border-[#11b5a2] text-[#0b786e]' 
                  : 'bg-[#f8fbfd] border-dashed border-[#d5e2ea] text-slate-400 hover:border-[#1378ac] hover:bg-white'
                }`}
              >
                {checks.graphConformity ? (
                  <>
                    <div className="h-8 w-8 rounded-full bg-[#11b5a2] text-white flex items-center justify-center text-sm shadow-md">✓</div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em]">Graphique Validé</p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl opacity-40 group-hover:scale-110 transition-transform">🖋️</div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em]">Cliquer pour signer</p>
                  </>
                )}
              </button>
            </div>
          </section>
        </div>

        {/* BOTTOM SECTION: SCAN + AGENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* SCAN SECTION */}
          <section className="bg-white rounded-[2.5rem] p-5 border border-[#d5e2ea] shadow-sm flex flex-col min-h-0 relative">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-black text-white shadow-md">📦</span>
                <h2 className="text-[10px] font-black uppercase tracking-widest text-[#0b4867]">Scan Sortie</h2>
              </div>
              <div className="h-6 w-12 bg-slate-100 rounded flex items-center justify-center opacity-40 grayscale">
                <span className="text-[10px]">|||||||</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-2 bg-[#f8fbfd] rounded-2xl border border-[#edf5f9] p-4">
              {scannedItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <span className="text-3xl mb-1 opacity-30">📦</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">En attente scan sortie</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {scannedItems.map((id, i) => (
                    <div key={i} className="bg-white text-[#1378ac] px-3 py-1.5 rounded-xl border border-[#b8cad6] text-[10px] font-black shadow-sm animate-in zoom-in">
                      {id}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* AGENT SECTION */}
          <section className="bg-white rounded-[2.5rem] p-5 border border-[#d5e2ea] shadow-sm flex flex-col min-h-0 relative">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0b4867] text-[10px] font-black text-white shadow-md">👥</span>
                <h2 className="text-[10px] font-black uppercase tracking-widest text-[#0b4867]">Agent Responsable</h2>
              </div>
              <div className="h-6 w-12 bg-slate-100 rounded flex items-center justify-center opacity-40 grayscale">
                <span className="text-[10px]">|||||||</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              {!agentBadge.name ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fbfd] rounded-2xl border-2 border-dashed border-[#d5e2ea] text-slate-300">
                  <span className="text-3xl mb-1 opacity-30">🪪</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-center px-6 leading-relaxed">Scanner badge agent</p>
                </div>
              ) : (
                <div className="flex-1 animate-in zoom-in bg-[#0b4867] rounded-[2rem] p-6 text-white flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[#1378ac]/10 group-hover:bg-transparent transition-colors" />
                  <div className="h-14 w-14 rounded-full bg-[#1378ac] flex items-center justify-center text-3xl mb-3 border-4 border-white/10 shadow-inner relative z-10">👩‍🔬</div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#8de7da] mb-1 leading-none relative z-10">Validation Identifiée</p>
                  <p className="text-xl font-black tracking-tighter uppercase italic relative z-10">{agentBadge.name}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* FOOTER ACTION BAR */}
      <footer className="shrink-0 flex items-center justify-center bg-white/95 backdrop-blur-md p-4 rounded-[2.5rem] border border-[#d5e2ea] mt-2 shadow-[0_-10px_40px_rgba(11,72,103,0.03)] z-30">
        <button 
          disabled={!isCycleValidated}
          onClick={() => alert("LIBÉRATION TERMINÉE !")}
          className={`group px-32 py-5 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.4em] shadow-2xl transition-all duration-500 ${
            isCycleValidated
            ? "bg-[#11b5a2] text-white hover:bg-[#0fa391] hover:scale-105 active:scale-95 shadow-[0_25px_50px_rgba(17,181,162,0.25)]" 
            : "bg-slate-200 text-slate-400 cursor-not-allowed grayscale opacity-60"
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">{isCycleValidated ? "🛡️" : "🔒"}</span>
            <span>Libérer la charge</span>
          </div>
        </button>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function CheckButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
        active 
        ? "bg-[#eafaf7] border-[#11b5a2] text-[#0b786e] shadow-md" 
        : "bg-white border-[#d5e2ea] text-slate-400 hover:border-[#1378ac]"
      }`}
    >
      <div className={`h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-all ${active ? "bg-[#11b5a2] border-[#11b5a2] text-white" : "border-[#d5e2ea]"}`}>
        {active && "✓"}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest leading-tight">{label}</span>
    </button>
  );
}

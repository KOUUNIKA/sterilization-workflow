"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Pencil, 
  RotateCcw, 
  Trash2, 
  UserMinus, 
  AlertCircle, 
  ChevronLeft,
  CheckCircle2,
  X,
  Plus,
  Info,
  Table as TableIcon,
  Activity
} from "lucide-react";

// --- CONSTANTS ---
const REGNAULT_TABLE = [
  { temp: 100, press: 1013 },
  { temp: 105, press: 1208 },
  { temp: 110, press: 1433 },
  { temp: 115, press: 1691 },
  { temp: 120, press: 1985 },
  { temp: 121, press: 2049 },
  { temp: 125, press: 2321 },
  { temp: 130, press: 2701 },
  { temp: 134, press: 3063 },
  { temp: 135, press: 3131 },
  { temp: 140, press: 3614 },
];

const getTheoreticalPressure = (temp: number) => {
  // Simple linear interpolation
  if (temp <= REGNAULT_TABLE[0].temp) return REGNAULT_TABLE[0].press;
  if (temp >= REGNAULT_TABLE[REGNAULT_TABLE.length - 1].temp) return REGNAULT_TABLE[REGNAULT_TABLE.length - 1].press;
  
  for (let i = 0; i < REGNAULT_TABLE.length - 1; i++) {
    const start = REGNAULT_TABLE[i];
    const end = REGNAULT_TABLE[i+1];
    if (temp >= start.temp && temp <= end.temp) {
      const ratio = (temp - start.temp) / (end.temp - start.temp);
      return start.press + ratio * (end.press - start.press);
    }
  }
  return 1013;
};

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
  onValidated?: (isValid: boolean) => void;
}

export function Dechargesterilization({ onPhaseChange, onValidated }: DechargesterilizationProps) {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRegnaultModal, setShowRegnaultModal] = useState(false);

  // Peak temperature for modal highlighting
  const peakTemp = useMemo(() => {
    if (cycleData.temperature.length === 0) return 0;
    return Math.max(...cycleData.temperature);
  }, [cycleData.temperature]);

  const handleGlobalReset = () => {
    setScannedItems([]);
    setAgentBadge({ name: "", role: "" });
    setChecks({
      passage: false,
      physico: false,
      siccite: false,
      integrite: false,
      graphValidated: false,
      graphConformity: false,
    });
    getAutoclaveData();
    setShowResetConfirm(false);
  };

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
          press = 3020 + (Math.random() * 40); // Realistic Absolute Pressure for 134°C
          temp = 134.2 + (Math.random() * 0.3);
        } else if (i < 85) {
          // POST-TRAITEMENT (Chute)
          press = 3020 - ((i - 70) * 180);
          temp = 134.2 - ((i - 70) * 6);
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

  useEffect(() => {
    onValidated?.(isCycleValidated);
  }, [isCycleValidated, onValidated]);

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
    if (cycleData.pressure.length === 0) return { pressure: "", temperature: "", theoretical: "", deltaArea: "", lastPointPress: {x:0, y:0}, lastPointTemp: {x:0, y:0} };
    
    const width = 800;
    const height = 300; // Even more height
    const paddingX = 50;
    const paddingY = 100; // Even more top padding for safety
    const safetyThreshold = 50; // 50 mbar

    const points = cycleData.pressure.map((p, i) => {
      const t = cycleData.temperature[i];
      const pTheor = getTheoreticalPressure(t);
      const x = (i / 100) * (width - 2 * paddingX) + paddingX;
      const yPress = height - 40 - ((p / 3500) * (height - paddingY - 40));
      const yTheor = height - 40 - ((pTheor / 3500) * (height - paddingY - 40));
      const yTemp = height - 40 - ((t / 150) * (height - paddingY - 40));
      
      return { x, yPress, yTheor, yTemp, delta: Math.abs(p - pTheor) };
    });

    const pressD = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.yPress}`).join(" ");
    const tempD = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.yTemp}`).join(" ");
    const theorD = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.yTheor}`).join(" ");

    // Create delta highlighting areas where delta > safetyThreshold
    let deltaAreaD = "";
    let inViolation = false;
    let violationStartIdx = 0;

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const isViolating = pt.delta > safetyThreshold && cycleData.temperature[i] > 100; // Only validate saturated steam above 100°C

      if (isViolating && !inViolation) {
        inViolation = true;
        violationStartIdx = i;
      } else if (!isViolating && inViolation) {
        // End of violation segment, create polygon
        const segmentPoints = points.slice(violationStartIdx, i);
        const topPath = segmentPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.yPress}`).join(" ");
        const bottomPath = [...segmentPoints].reverse().map((p) => `L ${p.x} ${p.yTheor}`).join(" ");
        deltaAreaD += ` ${topPath} ${bottomPath} Z`;
        inViolation = false;
      }
    }
    // Handle case where violation goes until the end
    if (inViolation) {
      const segmentPoints = points.slice(violationStartIdx);
      const topPath = segmentPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.yPress}`).join(" ");
      const bottomPath = [...segmentPoints].reverse().map((p) => `L ${p.x} ${p.yTheor}`).join(" ");
      deltaAreaD += ` ${topPath} ${bottomPath} Z`;
    }

    const lastIdx = cycleData.pressure.length - 1;
    const lastPoint = points[lastIdx];

    return { 
      pressure: pressD, 
      temperature: tempD, 
      theoretical: theorD,
      deltaArea: deltaAreaD,
      lastPointPress: {x: lastPoint.x, y: lastPoint.yPress},
      lastPointTemp: {x: lastPoint.x, y: lastPoint.yTemp}
    };
  }, [cycleData]);

  const renderChart = () => {
    if (isLoadingData) {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center text-[#1378ac] animate-pulse">
          <span className="text-4xl mb-4">⌛</span>
          <p className="text-[10px] font-black uppercase tracking-widest italic">Chargement des données IoT...</p>
        </div>
      );
    }

    const width = 800;
    const height = 400; // Fixed height for internal drawing
    const paddingX = 50;
    const paddingY = 120; // Increased top padding for labels

    return (
      <div className="relative w-full h-[400px] flex flex-col overflow-hidden">
        {/* Scrollable Container for SVG */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden custom-scrollbar pr-4" style={{ height: '400px' }}>
          <div style={{ width: '100%', height: '600px', position: 'relative' }}>
            {/* Left Y-Axis labels - Fixed to the left of the scrollable content */}
            <div className="absolute left-0 top-[40%] flex flex-col gap-1 items-end pr-4 text-[10px] font-black uppercase leading-none select-none pointer-events-none z-30 bg-white/80 backdrop-blur-sm p-2 rounded-r-xl border border-l-0 border-[#d5e2ea] shadow-sm">
              <span className="text-[#d6455d]">Température</span>
              <span className="text-[#0b4867]">Pression (abs)</span>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible z-10 relative">
              {/* 1. BACKGROUND GRID & VERTICAL PHASES */}
              {[0, 1000, 2000, 3000].map(val => {
                const y = height - 40 - ((val / 3500) * (height - paddingY - 40));
                return (
                  <line key={val} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#d5e2ea" strokeWidth="1" className="opacity-50" />
                );
              })}

              {/* Phase Separators (Vertical Lines) */}
              {[paddingX + (width-2*paddingX)*0.3, paddingX + (width-2*paddingX)*0.7].map((x, i) => (
                <line key={i} x1={x} y1={paddingY - 40} x2={x} y2={height - 40} stroke="#d5e2ea" strokeWidth="1.5" />
              ))}

              {/* 2. PHASE LABELS (Background Layer) */}
              <g className="text-[11px] font-black uppercase tracking-[0.2em] fill-slate-300 opacity-50">
                <text x={paddingX + (width-2*paddingX)*0.15} y={paddingY - 60} textAnchor="middle">PRÉ-TRAITEMENT</text>
                <text x={paddingX + (width-2*paddingX)*0.5} y={paddingY - 60} textAnchor="middle">PLATEAU</text>
                <text x={paddingX + (width-2*paddingX)*0.85} y={paddingY - 60} textAnchor="middle">POST-TRAITEMENT</text>
              </g>

              {/* 3. GHOST REFERENCE LINE (Z-INDEX BEHIND) */}
              <path d={chartPaths.theoretical} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" strokeLinejoin="round" />

              {/* 4. PHYSICAL VALIDATION LAYER (Delta Highlighting) */}
              {chartPaths.deltaArea && (
                <path 
                  d={chartPaths.deltaArea} 
                  fill="rgba(214, 69, 93, 0.15)" 
                  className="animate-pulse"
                  style={{ mixBlendMode: 'multiply' }}
                />
              )}

              {/* 5. MAIN DATA LINES (TOP LAYER) */}
              <path d={chartPaths.pressure} fill="none" stroke="#0b4867" strokeWidth="3" strokeLinejoin="round" />
              <path d={chartPaths.temperature} fill="none" stroke="#d6455d" strokeWidth="2" strokeLinejoin="round" />

              {/* Markers at end */}
              <circle cx={chartPaths.lastPointPress.x} cy={chartPaths.lastPointPress.y} r="4" fill="#0b4867" />
              <circle cx={chartPaths.lastPointTemp.x} cy={chartPaths.lastPointTemp.y} r="4" fill="#d6455d" />

              {/* 6. BOXED ANNOTATIONS AT BOTTOM */}
              <g className="text-[8px] font-black uppercase tracking-widest fill-slate-800">
                <rect x={paddingX + (width-2*paddingX)*0.08} y={height - 25} width="80" height="14" rx="2" fill="white" stroke="#d5e2ea" />
                <text x={paddingX + (width-2*paddingX)*0.08 + 40} y={height - 15} textAnchor="middle">Vide fractionné</text>

                <rect x={paddingX + (width-2*paddingX)*0.26} y={height - 25} width="85" height="14" rx="2" fill="white" stroke="#d5e2ea" />
                <text x={paddingX + (width-2*paddingX)*0.26 + 42.5} y={height - 15} textAnchor="middle">Montée en temp.</text>

                <rect x={paddingX + (width-2*paddingX)*0.4} y={height - 25} width="100" height="14" rx="2" fill="white" stroke="#d5e2ea" />
                <text x={paddingX + (width-2*paddingX)*0.4 + 50} y={height - 15} textAnchor="middle">Temps stérilisation</text>

                <rect x={paddingX + (width-2*paddingX)*0.65} y={height - 25} width="80" height="14" rx="2" fill="white" stroke="#d5e2ea" />
                <text x={paddingX + (width-2*paddingX)*0.65 + 40} y={height - 15} textAnchor="middle">Temps de séchage</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden font-app relative">
      
      {/* Simulation Floating Buttons - moved to fixed non-obstructive positions */}
      <div className="fixed bottom-32 right-10 flex flex-col gap-3 z-50">
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
            <div className="flex rounded-xl border border-[#d5e2ea] bg-white/95 p-1 shadow-sm shrink-0 h-fit">
              <button onClick={() => navigate("/sterilization-chargement")} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all ${location.pathname === "/sterilization-chargement" ? 'bg-[#1378ac] text-white shadow-md' : 'text-slate-400 hover:text-[#0b4867]'}`}>Chargement</button>
              <button onClick={() => navigate("/sterilization-sortie")} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all ${location.pathname === "/sterilization-sortie" ? 'bg-[#11b5a2] text-white shadow-md' : 'text-slate-400 hover:text-[#0b4867]'}`}>Validation</button>
            </div>
      </header>

      {/* Main content Area - EXACT Grid matching image_12aa654d */}
      <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
        
        {/* TOP SECTION: 2/3 Chart, 1/3 Validation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 min-h-0 flex-[1.8]">
          
          {/* CHART SECTION (LEFT) */}
          <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-[#d5e2ea] relative overflow-hidden flex flex-col h-[550px]">
            <div className="flex flex-col gap-4 mb-6 shrink-0 z-20 relative pointer-events-none">
              <div className="flex items-center justify-between pointer-events-auto">
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
                    <p className="text-sm font-black text-[#0b4867]">{peakTemp > 134 ? '3063' : '2142'} mbar</p>
                  </div>
                </div>
              </div>

              {/* TOOLBAR FOR REGNAULT CONTROLS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-50 pointer-events-auto">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                  <div className="w-3 h-0 border-t-2 border-dashed border-slate-300" />
                  Référence Regnault
                </div>
                <button 
                  onClick={() => setShowRegnaultModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#edf5f9] hover:bg-[#1378ac] text-[#1378ac] hover:text-white border border-[#1378ac]/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm group"
                >
                  <TableIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  Table Regnault
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 px-4 z-10 relative">
              {renderChart()}
            </div>
          </section>

          {/* VALIDATION & SIGNATURE (RIGHT) */}
          <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-[#d5e2ea] flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between shrink-0 mb-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm border border-[#d5e2ea]">⏱️</div>
              <div className="flex gap-2">
                <div className="bg-white px-3 py-1.5 rounded-lg border border-[#d5e2ea] text-center shadow-sm">
                  <p className="text-[6px] font-black text-slate-400 uppercase leading-none mb-1">Temp. Max</p>
                  <p className="text-sm font-black text-[#d6455d]">134.5 °C</p>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-[#d5e2ea] text-center shadow-sm">
                  <p className="text-[6px] font-black text-slate-400 uppercase leading-none mb-1">Press. Max</p>
                  <p className="text-sm font-black text-[#0b4867]">{peakTemp > 134 ? '3063' : '2142'} mbar</p>
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
              <div className="flex items-center gap-2">
                {scannedItems.length > 0 && (
                  <button 
                    onClick={() => setScannedItems([])}
                    className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-slate-400 hover:text-[#1378ac] hover:border-[#1378ac] transition-colors"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Réinitialiser
                  </button>
                )}
                <div className="h-6 w-12 bg-slate-100 rounded flex items-center justify-center opacity-40 grayscale">
                  <span className="text-[10px]">|||||||</span>
                </div>
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
                    <div key={i} className="group relative bg-white text-[#1378ac] px-3 py-1.5 rounded-xl border border-[#b8cad6] text-[10px] font-black shadow-sm animate-in zoom-in">
                      {id}
                      <button 
                        onClick={() => setScannedItems(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
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
              <div className="flex items-center gap-2">
                {agentBadge.name && (
                  <button 
                    onClick={() => setAgentBadge({ name: "", role: "" })}
                    className="flex items-center gap-1 text-[7px] font-black uppercase tracking-wider text-slate-400 hover:text-[#1378ac] transition-colors"
                  >
                    <UserMinus className="w-2.5 h-2.5" />
                    Changer
                  </button>
                )}
                <div className="h-6 w-12 bg-slate-100 rounded flex items-center justify-center opacity-40 grayscale">
                  <span className="text-[10px]">|||||||</span>
                </div>
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

      {/* Footer Actions */}
      <footer className="shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#d5e2ea] shadow-lg mt-auto gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            Étape précédente
          </button>
          
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Tout effacer
          </button>
        </div>

        <button
          onClick={() => navigate("/storage-distribution")}
          disabled={!isCycleValidated}
          className={`group relative flex items-center gap-3 rounded-xl px-12 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] transition-all duration-300 shadow-xl ${
            isCycleValidated
              ? "bg-[#1378ac] text-white hover:bg-[#0f6a98] hover:-translate-y-0.5 active:scale-95 shadow-[#1378ac]/20"
              : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200 shadow-none"
          }`}
        >
          {isCycleValidated && <CheckCircle2 className="w-4 h-4" />}
          Libérer la charge
        </button>
      </footer>

      {/* GLOBAL RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center uppercase tracking-tight mb-2">Tout effacer ?</h3>
            <p className="text-sm font-bold text-slate-500 text-center leading-relaxed mb-8">
              Êtes-vous sûr de vouloir effacer toutes les données de déchargement pour ce cycle ?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
              >
                Annuler
              </button>
              <button
                onClick={handleGlobalReset}
                className="py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGNAULT REFERENCE MODAL */}
      {showRegnaultModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#0b4867]/40 backdrop-blur-sm" onClick={() => setShowRegnaultModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-[#d5e2ea] animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#edf5f9] text-[#1378ac] flex items-center justify-center shadow-inner border border-[#d5e2ea]">
                  <TableIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#0b4867] uppercase tracking-tight">Table de Regnault</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relation Pression / Température</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRegnaultModal(false)}
                className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#f8fbfd] rounded-2xl border border-[#d5e2ea] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#edf5f9] border-b border-[#d5e2ea]">
                    <th className="py-3 px-6 text-[10px] font-black text-[#0b4867] uppercase tracking-widest">Température (°C)</th>
                    <th className="py-3 px-6 text-[10px] font-black text-[#0b4867] uppercase tracking-widest">Pression Absolue (mbar)</th>
                    <th className="py-3 px-6 text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded-full border border-[#d5e2ea] text-[8px] font-black text-[#1378ac] uppercase">Standard</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {REGNAULT_TABLE.map((row, i) => {
                    const isClosest = Math.abs(row.temp - peakTemp) < 2.5; // Highlight closest row
                    return (
                      <tr 
                        key={i} 
                        className={`border-b border-slate-100 transition-colors ${isClosest ? 'bg-[#eafaf7] text-[#0b786e]' : 'text-slate-600'}`}
                      >
                        <td className="py-2.5 px-6 font-black tabular-nums">{row.temp.toFixed(1)}</td>
                        <td className="py-2.5 px-6 font-bold tabular-nums">{row.press}</td>
                        <td className="py-2.5 px-6 text-right">
                          {isClosest && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#11b5a2] text-white rounded-full text-[8px] font-black uppercase animate-pulse">
                              Cycle Peak
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-orange-700 uppercase leading-relaxed">
                Note : Pour une stérilisation conforme à 134°C, la pression absolue théorique doit être de 3063 mbar. 
                Tout écart significatif (± 50 mbar) indique une possible présence d'air ou de gaz incondensables.
              </p>
            </div>
          </div>
        </div>
      )}
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

"use client";

import { useState, useMemo } from "react";

type InstrumentStatus = "validated" | "missing" | "defective" | "pending";

type Instrument = {
  id: string;
  name: string;
  status: InstrumentStatus;
  category: string;
  rackLocation: string;
};

export function Recomposition() {
  // --- States ---
  const [basketScanned, setBasketScanned] = useState(false);
  const [aiState, setAiState] = useState<"idle" | "analyzing" | "completed">("idle");
  const [filter, setFilter] = useState<"all" | InstrumentStatus>("all");
  
  const [instruments, setInstruments] = useState<Instrument[]>([
    { id: "KM-4210", name: "Pince Kocher Droite 14cm", status: "pending", category: "Pince", rackLocation: "RAYON-04 / BAC-12" },
    { id: "SM-1102", name: "Ciseaux Mayo Courbes", status: "pending", category: "Ciseaux", rackLocation: "RAYON-02 / BAC-05" },
    { id: "PH-9920", name: "Porte-aiguille Mayo-Hegar", status: "pending", category: "Porte-aiguille", rackLocation: "RAYON-08 / BAC-01" },
    { id: "EF-3341", name: "Ecarteur Farabeuf (Paire)", status: "pending", category: "Ecarteur", rackLocation: "RAYON-01 / BAC-22" },
    { id: "PD-5560", name: "Pince à dissection 1x2d", status: "pending", category: "Pince", rackLocation: "RAYON-04 / BAC-15" },
    { id: "BS-0004", name: "Bistouri Manche n°4", status: "pending", category: "Manche", rackLocation: "RAYON-09 / BAC-04" },
    { id: "KM-4211", name: "Pince Kocher Courbe 14cm", status: "pending", category: "Pince", rackLocation: "RAYON-04 / BAC-13" },
    { id: "SM-1103", name: "Ciseaux Metzenbaum", status: "pending", category: "Ciseaux", rackLocation: "RAYON-02 / BAC-06" },
  ]);

  const [showDefectModal, setShowDefectModal] = useState(false);
  const [selectedForDefect, setSelectedForDefect] = useState<Instrument | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // --- Logic ---
  const handleScan = () => setBasketScanned(true);

  const runAiRecognition = () => {
    setAiState("analyzing");
    setTimeout(() => {
      setInstruments(prev => prev.map((inst, idx) => ({
        ...inst,
        status: idx === 2 ? "missing" : idx === 4 ? "defective" : "validated"
      })));
      setAiState("completed");
    }, 2500);
  };

  const openDefectModal = (inst: Instrument) => {
    setSelectedForDefect(inst);
    setShowDefectModal(true);
  };

  const handleDefectResolution = () => {
    if (selectedForDefect) {
      setInstruments(prev => prev.map(inst => 
        inst.id === selectedForDefect.id ? { ...inst, status: "validated" } : inst
      ));
      setShowDefectModal(false);
    }
  };

  const counts = useMemo(() => ({
    all: instruments.length,
    validated: instruments.filter(i => i.status === "validated").length,
    missing: instruments.filter(i => i.status === "missing").length,
    defective: instruments.filter(i => i.status === "defective").length,
    pending: instruments.filter(i => i.status === "pending").length,
  }), [instruments]);

  const filteredInstruments = useMemo(() => {
    if (filter === "all") return instruments;
    return instruments.filter(i => i.status === filter);
  }, [instruments, filter]);

  const isInventoryComplete = counts.validated === counts.all;
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 6);

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden relative font-app">
      
      {!basketScanned ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-[#d5e2ea] shadow-sm animate-in fade-in duration-500">
          <div className="h-32 w-32 rounded-full bg-[#f4f8fb] flex items-center justify-center text-6xl mb-8 shadow-inner">🧺</div>
          <h2 className="text-3xl font-black text-[#0b4867] mb-3 tracking-tight">Recomposition & Conditionnement</h2>
          <p className="text-slate-500 mb-10 text-center max-w-md font-medium leading-relaxed">
            Initialisez le processus en scannant le code-barres du panier de lavage ou de la feuille de recomposition.
          </p>
          <button 
            onClick={handleScan}
            className="group flex items-center gap-4 bg-[#0b4867] text-white px-12 py-6 rounded-2xl font-black uppercase tracking-[0.25em] text-xs shadow-[0_20px_50px_rgba(11,72,103,0.3)] hover:bg-[#0a3952] hover:-translate-y-1 active:scale-95 transition-all"
          >
            <span className="text-2xl animate-pulse">⌁</span>
            Scanner le Panier
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 min-h-0 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* STEP 1 Header */}
          <header className="shrink-0 bg-white border border-[#d5e2ea] rounded-3xl p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Basket Traceability</span>
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-lg bg-[#edf5f9] flex items-center justify-center text-lg shadow-inner">🧺</span>
                  <span className="text-xl font-black tracking-tighter text-[#0b4867]">PAN-2026-X8</span>
                </div>
              </div>
              <div className="h-10 w-px bg-[#d5e2ea]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1378ac] mb-1">Target Device</span>
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-lg bg-[#e8f4fb] flex items-center justify-center text-lg shadow-inner">📦</span>
                  <span className="text-xl font-black tracking-tighter text-[#0b4867]">CHIRURGIE GENERALE #42</span>
                </div>
              </div>
            </div>
            <div className="hidden xl:flex items-center gap-3 bg-[#eafaf7] px-5 py-3 rounded-2xl border border-[#bdece4]">
              <div className="h-2 w-2 rounded-full bg-[#11b5a2] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b786e]">Secteur : Zone Propre • Poste 04</span>
            </div>
          </header>

          <div className="flex-1 grid gap-4 lg:grid-cols-[1fr_0.8fr] min-h-0 overflow-hidden">
            
            {/* Left Column */}
            <div className="flex flex-col gap-4 min-h-0">
              {/* STEP 2: Smart Recognition Area */}
              <section className="flex-1 bg-white rounded-[2rem] border border-[#d5e2ea] p-6 shadow-sm flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between mb-5 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-[#1378ac] text-white flex items-center justify-center text-[10px] font-black shadow-md">02</span>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Smart AI Recognition Table</h3>
                  </div>
                  {aiState === "completed" && (
                    <div className="flex items-center gap-2 bg-[#eafaf7] text-[#11b5a2] px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border border-[#bdece4] shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#11b5a2] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#11b5a2]"></span>
                      </span>
                      Deep Learning Active
                    </div>
                  )}
                </div>

                <div className="flex-1 rounded-[1.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
                  {aiState === "idle" && (
                    <button 
                      onClick={runAiRecognition}
                      className="group flex flex-col items-center gap-6 text-[#1378ac] hover:scale-105 transition-all"
                    >
                      <div className="h-24 w-24 rounded-[2rem] bg-white flex items-center justify-center text-5xl shadow-xl border border-[#d5e2ea] group-hover:border-[#1378ac] group-hover:shadow-[0_20px_40px_rgba(19,120,172,0.2)] transition-all">🤖</div>
                      <div className="text-center">
                        <span className="block font-black text-[11px] uppercase tracking-[0.3em]">Activer Vision IA</span>
                        <span className="text-[9px] text-slate-400 mt-1 block font-bold">Scanning Multimodal & OCR</span>
                      </div>
                    </button>
                  )}

                  {aiState === "analyzing" && (
                    <div className="flex flex-col items-center gap-8">
                      <div className="relative">
                        <div className="h-28 w-28 rounded-full border-[6px] border-[#1378ac]/10 border-t-[#1378ac] animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-3xl">👁️</div>
                      </div>
                      <div className="text-center">
                        <p className="text-[#1378ac] font-black text-[11px] uppercase tracking-[0.4em] animate-pulse">Analysis in Progress</p>
                        <p className="text-slate-400 text-[9px] mt-2 font-bold italic tracking-widest">Processing geometry, texture and ID-marks...</p>
                      </div>
                    </div>
                  )}

                  {aiState === "completed" && (
                    <div className="w-full h-full relative p-6 grid grid-cols-4 gap-4 overflow-hidden">
                      {instruments.map((inst, i) => (
                        <div key={i} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-3 text-center transition-all animate-in zoom-in duration-500 delay-[${i*50}ms] shadow-sm ${
                          inst.status === 'validated' ? 'border-[#11b5a2] bg-white' : 
                          inst.status === 'missing' ? 'border-[#f59e0b] bg-white' : 
                          'border-[#d6455d] bg-white'
                        }`}>
                          <div className="text-2xl mb-2">{inst.category === 'Pince' ? '✂️' : inst.category === 'Ciseaux' ? '📐' : '🔧'}</div>
                          <p className="text-[9px] font-black uppercase text-[#0b4867] truncate w-full tracking-tighter">{inst.id}</p>
                          <span className={`text-[8px] font-black uppercase mt-2 px-2 py-0.5 rounded-lg border ${
                            inst.status === 'validated' ? 'text-[#0b786e] bg-[#eafaf7] border-[#bdece4]' : 
                            inst.status === 'missing' ? 'text-[#b45309] bg-[#fff6e9] border-[#ffe4bc]' : 
                            'text-[#d6455d] bg-[#fdecef] border-[#f8d7da]'
                          }`}>{inst.status}</span>
                        </div>
                      ))}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#1378ac]/5 to-transparent h-1/2 w-full animate-scan pointer-events-none border-t-[3px] border-[#1378ac]/30" />
                    </div>
                  )}
                </div>
              </section>

              {/* STEP 5: Packaging Section */}
              <section className={`shrink-0 bg-[#0b4867] rounded-[2rem] p-6 text-white shadow-xl transition-all duration-700 ${isInventoryComplete ? 'translate-y-0 opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/10 shadow-inner">✉️</div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight leading-none">Conditionnement</h3>
                      <p className="text-[10px] font-bold text-[#8de7da] uppercase tracking-[0.2em] mt-1.5 opacity-80">Protocoles de validation requis</p>
                    </div>
                  </div>
                  <div className="flex gap-10 items-center">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 mb-1">Standard emballage</span>
                      <span className="text-sm font-black text-[#8de7da]">CONTENEUR RIGIDE + FILTRE H600</span>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 mb-1">Calcul péremption (D+6M)</span>
                      <span className="text-sm font-black text-[#d6455d] tracking-widest">{expiryDate.toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <section className="flex flex-col bg-white rounded-[2rem] border border-[#d5e2ea] shadow-sm overflow-hidden min-h-0">
              <div className="p-6 border-b border-[#d5e2ea] bg-[#f8fbfd] shrink-0">
                <div className="flex items-center gap-3 mb-5">
                  <span className="h-6 w-6 rounded-full bg-[#1378ac] text-white flex items-center justify-center text-[10px] font-black shadow-md">03</span>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0b4867]">Inventaire & Compliance</h3>
                </div>
                
                {/* Visual Category Tabs */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 border border-slate-200">
                  <FilterBtn active={filter === "all"} label="Tous" count={counts.all} color="slate" onClick={() => setFilter("all")} />
                  <FilterBtn active={filter === "validated"} label="Valides" count={counts.validated} color="teal" onClick={() => setFilter("validated")} />
                  <FilterBtn active={filter === "missing"} label="Manquants" count={counts.missing} color="amber" onClick={() => setFilter("missing")} />
                  <FilterBtn active={filter === "defective"} label="Défauts" count={counts.defective} color="red" onClick={() => setFilter("defective")} />
                </div>
              </div>

              {/* Scrollable Inventory List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#fcfdfe]">
                {filteredInstruments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 opacity-50 italic">
                    <span className="text-4xl">🔎</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">Aucun instrument à afficher</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredInstruments.map((inst) => (
                      <div key={inst.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all shadow-sm ${
                        inst.status === 'validated' ? 'bg-[#eafaf7]/40 border-[#bdece4] text-[#0b786e]' :
                        inst.status === 'missing' ? 'bg-[#fff6e9]/40 border-[#ffe4bc] text-[#b45309]' :
                        inst.status === 'defective' ? 'bg-[#fdecef]/40 border-[#f8d7da] text-[#d6455d]' :
                        'bg-white border-[#d5e2ea] text-slate-600'
                      }`}>
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg font-black shadow-sm shrink-0 ${
                            inst.status === 'validated' ? 'bg-[#11b5a2] text-white' :
                            inst.status === 'missing' ? 'bg-[#f59e0b] text-white' :
                            inst.status === 'defective' ? 'bg-[#d6455d] text-white' :
                            'bg-slate-100 text-slate-400'
                          }`}>
                            {inst.status === 'validated' ? '✓' : inst.status === 'missing' ? '?' : inst.status === 'defective' ? '!' : '•'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black truncate tracking-tight">{inst.name}</p>
                            <p className="text-[9px] font-black font-mono mt-0.5 opacity-60 tracking-wider">{inst.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          {inst.status === "defective" && (
                            <button 
                              onClick={() => openDefectModal(inst)}
                              className="px-4 py-2 bg-[#d6455d] text-white text-[9px] font-black uppercase rounded-xl shadow-[0_4px_12px_rgba(214,69,93,0.3)] hover:scale-105 transition-all"
                            >Log Defect</button>
                          )}
                          {inst.status === "missing" && (
                            <button 
                              onClick={() => setInstruments(prev => prev.map(i => i.id === inst.id ? {...i, status: 'validated'} : i))}
                              className="px-4 py-2 bg-[#f59e0b] text-white text-[9px] font-black uppercase rounded-xl shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:scale-105 transition-all"
                            >Found</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* STEP 6: Final Action */}
              <div className="p-6 border-t border-[#d5e2ea] bg-[#f8fbfd] shrink-0">
                <button 
                  onClick={() => setShowPrintPreview(true)}
                  disabled={!isInventoryComplete}
                  className={`w-full group flex items-center justify-center gap-5 py-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl ${
                    isInventoryComplete 
                      ? 'bg-[#1378ac] text-white hover:bg-[#0f6a98] hover:-translate-y-1.5 active:scale-95 shadow-[0_20px_40px_rgba(19,120,172,0.3)]' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🖨️</span>
                  Print Traceability Label
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* STEP 4: Anomaly Modal */}
      {showDefectModal && selectedForDefect && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b4867]/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="bg-[#d6455d] p-10 text-white relative">
              <button onClick={() => setShowDefectModal(false)} className="absolute top-8 right-8 text-2xl hover:scale-110 transition-transform opacity-60 hover:opacity-100 font-bold">✕</button>
              <div className="flex items-center gap-5 mb-4">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl border border-white/10 shadow-inner">⚠️</div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Log Defect</h3>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Anomaly Management Workflow</p>
                </div>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d6455d]" /> Agent Reporting
                  </label>
                  <div className="flex items-center gap-4 bg-[#f8fbfd] p-4 rounded-2xl border border-[#d5e2ea] shadow-inner">
                    <span className="text-2xl">👩‍🔬</span>
                    <span className="text-xs font-black text-[#0b4867]">Amina ALAMI</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d6455d]" /> Detection Time
                  </label>
                  <div className="bg-[#f8fbfd] p-4 rounded-2xl border border-[#d5e2ea] text-xs font-black text-slate-600 shadow-inner tracking-tight">
                    {new Date().toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d6455d]" /> Critical Asset Info
                </label>
                <div className="bg-[#fdecef]/60 p-5 rounded-3xl border border-[#f8d7da] flex items-center justify-between">
                  <div>
                    <p className="font-black text-[#d6455d] text-lg leading-none">{selectedForDefect.name}</p>
                    <p className="text-[9px] font-black font-mono text-[#d6455d]/60 mt-2 uppercase tracking-[0.2em]">{selectedForDefect.id}</p>
                  </div>
                  <span className="text-4xl opacity-20 grayscale">✂️</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d6455d]" /> Quality Defect Cause
                </label>
                <div className="relative">
                  <select className="w-full bg-[#f8fbfd] border-2 border-[#d5e2ea] rounded-2xl p-4 text-xs font-black text-[#0b4867] focus:ring-4 focus:ring-[#d6455d]/10 focus:border-[#d6455d] outline-none appearance-none transition-all cursor-pointer">
                    <option>Mors émoussés / Usure structurelle</option>
                    <option>Oxydation apparente (Corrosion)</option>
                    <option>Fissure visible / Rupture métal</option>
                    <option>Dysfonctionnement articulation</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#d6455d]">▼</div>
                </div>
              </div>

              {/* SMART SUGGESTION ALERT */}
              <div className="bg-[#eafaf7] border-2 border-[#bdece4] p-6 rounded-[2rem] shadow-lg relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] transition-transform group-hover:scale-110">💡</div>
                <div className="flex items-center gap-4 mb-3 text-[#0b786e]">
                  <span className="text-3xl animate-bounce">💡</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Smart Suggestion</span>
                    <span className="text-[8px] font-bold text-[#11b5a2] uppercase tracking-[0.1em]">AI Stock Allocation Engine</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed ml-1">
                  Asset de remplacement localisé au : <br/>
                  <span className="text-2xl font-black text-[#0b786e] tracking-tighter">{selectedForDefect.rackLocation}</span>
                </p>
              </div>

              <button 
                onClick={handleDefectResolution}
                className="w-full bg-[#11b5a2] text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-[0_20px_40px_rgba(17,181,162,0.3)] hover:bg-[#0fa391] hover:-translate-y-1 active:scale-95 transition-all"
              >Valider Remplacement & Log</button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL LABEL PREVIEW */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0b4867]/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 flex flex-col items-center animate-in slide-in-from-top-8 duration-500">
            <div className="w-full border-4 border-slate-900 p-8 space-y-6 font-mono text-[11px] uppercase relative overflow-hidden">
              {/* Security pattern */}
              <div className="absolute top-0 right-0 p-2 bg-slate-900 text-white text-[8px] font-black tracking-widest rotate-45 translate-x-6 -translate-y-2 w-32 text-center">VALID</div>
              
              <div className="text-center border-b-4 border-slate-900 pb-6 mb-6">
                <p className="text-2xl font-black tracking-tighter">ÉTIQUETTE TRAÇABILITÉ</p>
                <p className="text-[9px] font-black tracking-[0.4em] mt-2 opacity-60 italic">Sterilization Workflow v2.4.0</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-dashed border-slate-300 pb-1">
                  <span className="font-bold opacity-50">Dispositif:</span>
                  <span className="font-black text-sm tracking-tighter">CHIRURGIE GENERALE #42</span>
                </div>
                <div className="flex justify-between items-end border-b border-dashed border-slate-300 pb-1">
                  <span className="font-bold opacity-50">Destination:</span>
                  <span className="font-black text-sm tracking-tighter">BLOC OP CENTRAL n°03</span>
                </div>
                <div className="flex justify-between items-end border-b border-dashed border-slate-300 pb-1">
                  <span className="font-bold opacity-50">Date Recomp.:</span>
                  <span className="font-black text-sm tracking-tighter">{new Date().toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between items-end border-b-2 border-slate-900 pb-1 text-[#d6455d]">
                  <span className="font-black">DATE PÉREMPTION:</span>
                  <span className="font-black text-lg tracking-tight underline">{expiryDate.toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between items-end bg-slate-100 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold opacity-50">Position Arsenal:</span>
                  <span className="font-black text-lg text-[#1378ac] tracking-tighter">RAYON-B / SECT-04</span>
                </div>
              </div>

              <div className="pt-8 flex flex-col items-center gap-3">
                <div className="bg-slate-900 h-16 w-full flex items-center justify-center">
                   {/* Simulating barcode */}
                   <div className="flex gap-1 h-10 w-full px-4">
                      {[...Array(40)].map((_, i) => (
                        <div key={i} className="bg-white h-full" style={{ width: `${Math.random() > 0.5 ? '2px' : '4px'}` }} />
                      ))}
                   </div>
                </div>
                <p className="text-[10px] font-black tracking-[0.8em] text-slate-900">BC-42-2026-X8-ST</p>
              </div>
            </div>
            
            <div className="mt-10 flex gap-5 w-full">
              <button 
                onClick={() => setShowPrintPreview(false)} 
                className="flex-1 bg-slate-100 border border-slate-200 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-200 transition-all"
              >Fermer</button>
              <button 
                onClick={() => {alert('Impression lancée via le driver ZPL...'); setShowPrintPreview(false);}} 
                className="flex-1 bg-[#1378ac] text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-[0_15px_30px_rgba(19,120,172,0.3)] hover:bg-[#0f6a98] hover:-translate-y-1 active:scale-95 transition-all"
              >Confirmer & Imprimer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function FilterBtn({ active, label, count, color, onClick }: { active: boolean, label: string, count: number, color: string, onClick: () => void }) {
  const styles: any = {
    slate: active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50',
    teal: active ? 'bg-[#11b5a2] text-white shadow-md' : 'text-[#11b5a2] hover:bg-[#eafaf7]',
    amber: active ? 'bg-[#f59e0b] text-white shadow-md' : 'text-[#f59e0b] hover:bg-[#fff6e9]',
    red: active ? 'bg-[#d6455d] text-white shadow-md' : 'text-[#d6455d] hover:bg-[#fdecef]',
  };
  
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${styles[color]}`}
    >
      <span className="hidden sm:inline">{label}</span>
      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${active ? 'bg-white/20' : 'bg-slate-200/50'}`}>{count}</span>
    </button>
  );
}

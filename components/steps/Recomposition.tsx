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

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-full">Phase 03 • Recomposition</div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Recomposition</h1>
            <p className="text-slate-500 font-medium">Tableau de bord de contrôle et d'emballage des instruments</p>
          </div>
          <div className="text-right hidden md:block text-slate-400">
             <div className="text-[10px] font-bold uppercase tracking-widest">Secteur: <span className="text-slate-900 font-black">ZONE PROPRE</span></div>
             <div className="text-[10px] font-bold uppercase tracking-widest">Status: <span className="text-purple-600 italic">En cours</span></div>
          </div>
        </header>

        {/* Dashboard Stack (Vertical) */}
        <div className="flex flex-col gap-10 max-w-5xl mx-auto">
          
          {/* Section 1: Scan Panier */}
          <section className={`bg-white p-10 rounded-[3rem] border shadow-md transition-all duration-500 flex flex-col ${basketScanned ? 'border-emerald-500 ring-8 ring-emerald-50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white font-black italic shadow-lg">01</span>
                <h2 className="text-xl font-black uppercase tracking-tight italic">Identification Panier</h2>
              </div>
              {basketScanned && <span className="text-emerald-500 font-black text-xs uppercase bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">Scanné ✓</span>}
            </div>
            
            {!basketScanned ? (
              <div className="py-16 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300 gap-4">
                <div className="text-6xl opacity-50">🧺</div>
                <p className="font-bold text-sm uppercase tracking-[0.2em] text-center px-4">Scanner le code-barres du panier de lavage</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Panier Identifié</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">BOÎTE CHIRURGIE GÉNÉRALE #42</p>
                  </div>
                  <div className="text-5xl opacity-20">🧺</div>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Contrôle Instruments */}
          <section className={`bg-white p-10 rounded-[3rem] border shadow-md transition-all duration-500 flex flex-col ${basketScanned ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white font-black italic shadow-lg">02</span>
                <h2 className="text-xl font-black uppercase tracking-tight italic">Contrôle & État</h2>
              </div>
              {allInstrumentsValidated && <span className="text-emerald-500 font-black text-xs uppercase bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">Vérifié ✓</span>}
            </div>

            <div className="overflow-hidden border-2 border-slate-100 rounded-[2rem] bg-white shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-white text-[10px] font-black uppercase">
                  <tr>
                    <th className="p-6">ID instrument</th>
                    <th className="p-6">Désignation</th>
                    <th className="p-6 text-center">Quantité</th>
                    <th className="p-6 text-center">Statut / Action</th>
                    <th className="p-6 text-center">Emballage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {instruments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-6 font-mono font-bold text-blue-600 text-xs">{inst.id}</td>
                      <td className="p-6 font-black text-slate-700 uppercase italic text-sm">{inst.name}</td>
                      <td className="p-6 font-black text-center text-xl">x{inst.quantity}</td>
                      <td className="p-6">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => updateStatus(inst.id, "validated")}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${inst.status === "validated" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"}`}
                          >
                            Valide
                          </button>
                          <button 
                            onClick={() => updateStatus(inst.id, "defective")}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${inst.status === "defective" ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : "bg-slate-100 text-slate-400 hover:bg-orange-50 hover:text-orange-600"}`}
                          >
                            Défect.
                          </button>
                          <button 
                            onClick={() => updateStatus(inst.id, "missing")}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${inst.status === "missing" ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600"}`}
                          >
                            Manquant
                          </button>
                        </div>
                      </td>
                      <td className="p-6 text-center italic text-slate-400 font-bold text-xs">{inst.packageType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PANNEAU DÉFECTUEUX INTÉGRÉ */}
            {showDefectPanel && selectedInstrument && (
              <div className="mt-8 bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] p-8 animate-in zoom-in duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black uppercase text-blue-600 italic tracking-widest text-xs">Signalement défaut : {selectedInstrument.name}</h3>
                  <button onClick={() => setShowDefectPanel(false)} className="text-blue-400 font-black">✕</button>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="bg-white p-4 rounded-2xl border border-blue-50 shadow-sm">
                    <h4 className="text-[9px] font-black uppercase mb-1 opacity-40">Agent</h4>
                    <p className="text-xs font-bold text-slate-700 italic">{agentBadge.name || "---"}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-blue-50 shadow-sm">
                    <h4 className="text-[9px] font-black uppercase mb-1 opacity-40">Type Défaut</h4>
                    <p className="text-xs font-bold text-slate-700 italic">Mors émoussés</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-blue-50 shadow-sm">
                    <h4 className="text-[9px] font-black uppercase mb-1 opacity-40">Localisation stock</h4>
                    <p className="text-xs font-bold text-slate-700 italic">Armoire B - T04</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <button onClick={() => setShowDefectPanel(false)} className="bg-emerald-500 text-white px-12 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100">
                    Valider le remplacement
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Opérateur */}
          <section className={`bg-white p-10 rounded-[3rem] border shadow-md transition-all duration-500 flex flex-col ${operatorConfirmed ? 'border-emerald-500 ring-8 ring-emerald-50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white font-black italic shadow-lg">03</span>
                <h2 className="text-xl font-black uppercase tracking-tight italic">Agent Responsable</h2>
              </div>
              {operatorConfirmed && <span className="text-emerald-500 font-black text-xs uppercase bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">Validé ✓</span>}
            </div>

            {!operatorConfirmed ? (
              <div className="py-16 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300 gap-4">
                <div className="text-6xl opacity-50">👤</div>
                <p className="font-bold text-sm uppercase tracking-[0.2em] text-center px-4">Scanner le badge de l'opérateur recomposition</p>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-500 max-w-md mx-auto w-full">
                <div className="p-10 bg-slate-900 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 p-4 opacity-5 text-[10rem] rotate-12">📦</div>
                  <div className="flex flex-col items-center text-center gap-6 relative z-10">
                    <div className="h-32 w-32 bg-purple-500 rounded-full flex items-center justify-center text-6xl border-8 border-slate-800 shadow-inner group-hover:scale-110 transition-transform">👩‍🔬</div>
                    <div className="space-y-2">
                      <p className="text-3xl font-black italic tracking-tighter uppercase">{agentBadge.name}</p>
                      <div className="h-1.5 w-16 bg-purple-500 mx-auto rounded-full"></div>
                      <p className="text-purple-400 font-black uppercase text-xs tracking-[0.3em] mt-4">{agentBadge.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* Action Button at Bottom */}
        <div className="flex justify-center pt-10 pb-20">
          <button 
            onClick={() => alert('Étiquette Imprimée !')}
            disabled={!isComplete}
            className={`group relative px-24 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all duration-500 shadow-2xl ${isComplete ? 'bg-slate-900 text-white hover:bg-black hover:-translate-y-2 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {isComplete && <span className="absolute -top-3 -right-3 bg-emerald-500 text-white p-2 rounded-full text-xs animate-bounce shadow-lg font-black">✓</span>}
            Imprimer l'étiquette
          </button>
        </div>

      </div>

      {/* Floating Simulation Button */}
      <button 
        onClick={triggerSimulation}
        className="fixed bottom-8 right-8 flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-purple-700 hover:scale-110 transition-all active:scale-95 group z-50 border-4 border-white"
      >
        <span className="text-xl group-hover:animate-pulse">⚡</span>
        <span>Simulate Next Scan</span>
      </button>

    </div>
  );
}

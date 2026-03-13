"use client";

import { useState } from "react";

type Priority = "standard" | "urgent";

type InstrumentLine = {
  id: string;
  name: string;
  designation: string;
  quantity: number;
};

interface PredesinfectionWizardProps {
  cycleId: string;
}

export function PredesinfectionWizard({ cycleId }: PredesinfectionWizardProps) {
  const [priority, setPriority] = useState<Priority>("standard");
  const [boxName, setBoxName] = useState("");
  const [operatorBadge, setOperatorBadge] = useState("");
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  
  // Simulation States
  const [trayScanned, setTrayScanned] = useState(false);
  const [boxScanned, setBoxScanned] = useState(false);

  // Data Static
  const [provenance] = useState("SALLE OP n° 04");
  const [soakingSummary] = useState({
    detergent: "Anioxyde 1000",
    duration: "10 min",
    dilution: "0,5%",
    dosage: "50 mL/L",
    waterVolume: "12 L",
  });
  const [instruments] = useState<InstrumentLine[]>([
    { id: "ins-1", quantity: 4, name: "Ciseaux", designation: "Mayo Droit 14cm" },
    { id: "ins-2", quantity: 2, name: "Pinces", designation: "Hémostatiques Kocher" },
    { id: "ins-3", quantity: 1, name: "Porte-aiguille", designation: "Mayo-Hegar 16cm" },
    { id: "ins-4", quantity: 6, name: "Ecarteurs", designation: "Farabeuf 15cm" },
  ]);

  const [unusedInstruments] = useState<InstrumentLine[]>([
    { id: "un-1", quantity: 2, name: "Lame", designation: "Bistouri n°15 (non utilisée)" },
    { id: "un-2", quantity: 1, name: "Canule", designation: "Aspiration Chirurgicale (neuve)" },
  ]);

  const triggerSimulation = () => {
    if (!trayScanned) setTrayScanned(true);
    else if (!boxScanned) { setBoxScanned(true); setBoxName("CONTENEUR_A1"); }
    else if (!operatorConfirmed) { setOperatorBadge("OP-7789"); setOperatorConfirmed(true); }
  };

  const isComplete = trayScanned && boxScanned && operatorConfirmed;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-block px-3 py-1 bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full">Phase 01</div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Prédésinfection</h1>
            <p className="text-slate-500 font-medium">Tableau de bord de traçabilité des bacs de trempage</p>
          </div>
          <div className="text-right hidden md:block text-slate-400">
             <div className="text-[10px] font-bold uppercase tracking-widest">Cycle ID: <span className="text-slate-900">{cycleId}</span></div>
             <div className="text-[10px] font-bold uppercase tracking-widest">Status: <span className="text-rose-600 italic">En cours</span></div>
          </div>
        </header>

        {/* Dashboard Stack (Vertical) */}
        <div className="flex flex-col gap-10 max-w-3xl mx-auto">
          
          {/* Section 1: Bac de trempage */}
          <section className={`bg-white p-10 rounded-[3rem] border shadow-md transition-all duration-500 flex flex-col ${trayScanned ? 'border-emerald-500 ring-8 ring-emerald-50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white font-black italic shadow-lg">01</span>
                <h2 className="text-xl font-black uppercase tracking-tight italic">Bac de Trempage</h2>
              </div>
              {trayScanned && <span className="text-emerald-500 font-black text-xs uppercase bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">Scanné ✓</span>}
            </div>
            
            {!trayScanned ? (
              <div className="py-16 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300 gap-4">
                <div className="text-6xl opacity-50">🛁</div>
                <p className="font-bold text-sm uppercase tracking-[0.2em] text-center px-4">Scanner le code-barres du bac</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Provenance</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tight">{provenance}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(soakingSummary).map(([k, v]) => (
                      <div key={k} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{k}</p>
                        <p className="text-sm font-black text-slate-700">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden border-2 border-slate-100 rounded-[2rem] bg-white shadow-sm">
                  <div className="bg-slate-50 px-6 py-3 border-b-2 border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-500 italic">Instruments Identifiés</span>
                    <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{instruments.length}</span>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-white border-b">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">Qté</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Désignation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {instruments.map((inst) => (
                        <tr key={inst.id} className="hover:bg-slate-50 transition-colors text-xs">
                          <td className="px-6 py-4 font-black text-rose-600 text-lg text-center">x{inst.quantity}</td>
                          <td className="px-6 py-4 text-slate-800 font-black uppercase italic">{inst.name}</td>
                          <td className="px-6 py-4 text-slate-500 font-bold">{inst.designation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Contenant */}
          <section className={`bg-white p-10 rounded-[3rem] border shadow-md transition-all duration-500 flex flex-col ${boxScanned ? 'border-emerald-500 ring-8 ring-emerald-50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white font-black italic shadow-lg">02</span>
                <h2 className="text-xl font-black uppercase tracking-tight italic">Identification Contenant</h2>
              </div>
              {boxScanned && <span className="text-emerald-500 font-black text-xs uppercase bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">Identifié ✓</span>}
            </div>

            {!boxScanned ? (
              <div className="py-16 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300 gap-4">
                <div className="text-6xl opacity-50">📦</div>
                <p className="font-bold text-sm uppercase tracking-[0.2em] text-center px-4">Scanner le code-barres du contenant</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">ID Contenant</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">{boxName}</p>
                  </div>
                  <div className="text-5xl opacity-20">📦</div>
                </div>
                
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Niveau de Priorité</p>
                  <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                    <button 
                      onClick={() => setPriority("standard")}
                      className={`p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-3 ${priority === 'standard' ? 'border-emerald-500 bg-emerald-500 text-white shadow-2xl scale-105' : 'border-white bg-white text-slate-300 hover:border-emerald-100'}`}
                    >
                      <span className="text-3xl">🐢</span>
                      <span className="font-black uppercase text-xs tracking-widest text-center">Standard</span>
                    </button>
                    <button 
                      onClick={() => setPriority("urgent")}
                      className={`p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-3 ${priority === 'urgent' ? 'border-rose-500 bg-rose-500 text-white shadow-2xl scale-105' : 'border-white bg-white text-slate-300 hover:border-rose-100'}`}
                    >
                      <span className="text-3xl">🚀</span>
                      <span className="font-black uppercase text-xs tracking-widest text-center">Urgent</span>
                    </button>
                  </div>
                </div>

                {/* Instruments non utilisés */}
                <div className="overflow-hidden border-2 border-slate-100 rounded-[2rem] bg-white shadow-sm">
                  <div className="bg-slate-50 px-6 py-3 border-b-2 border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-500 italic">Instruments non utilisés (ouverts)</span>
                    <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{unusedInstruments.length}</span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">Qté</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Désignation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {unusedInstruments.map((inst) => (
                        <tr key={inst.id} className="hover:bg-slate-50 transition-colors text-xs">
                          <td className="px-6 py-4 font-black text-blue-600 text-lg text-center">x{inst.quantity}</td>
                          <td className="px-6 py-4 text-slate-800 font-black uppercase italic">{inst.name}</td>
                          <td className="px-6 py-4 text-slate-500 font-bold">{inst.designation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100 flex items-start gap-4">
                   <span className="text-2xl">📝</span>
                   <div>
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Instruction de transfert</p>
                     <p className="text-xs text-slate-600 leading-relaxed font-bold italic">
                       Veuillez transférer physiquement tous les instruments du bac de trempage vers le contenant <span className="text-blue-700 underline">{boxName}</span>.
                     </p>
                   </div>
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Opérateur */}
          <section className={`bg-white p-10 rounded-[3rem] border shadow-md transition-all duration-500 flex flex-col ${operatorConfirmed ? 'border-emerald-500 ring-8 ring-emerald-50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white font-black italic shadow-lg">03</span>
                <h2 className="text-xl font-black uppercase tracking-tight italic">Agent Responsable</h2>
              </div>
              {operatorConfirmed && <span className="text-emerald-500 font-black text-xs uppercase bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">Validé ✓</span>}
            </div>

            {!operatorConfirmed ? (
              <div className="py-16 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300 gap-4">
                <div className="text-6xl opacity-50">👤</div>
                <p className="font-bold text-sm uppercase tracking-[0.2em] text-center px-4">Scanner le badge de l'agent</p>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-500 max-w-md mx-auto w-full">
                <div className="p-10 bg-slate-900 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 p-4 opacity-5 text-[10rem] rotate-12">🧪</div>
                  <div className="flex flex-col items-center text-center gap-6 relative z-10">
                    <div className="h-32 w-32 bg-rose-500 rounded-full flex items-center justify-center text-6xl border-8 border-slate-800 shadow-inner group-hover:scale-110 transition-transform">👩‍🔬</div>
                    <div className="space-y-2">
                      <p className="text-3xl font-black italic tracking-tighter uppercase">Amina BENALI</p>
                      <div className="h-1.5 w-16 bg-rose-500 mx-auto rounded-full"></div>
                      <p className="text-rose-400 font-black uppercase text-xs tracking-[0.3em] mt-4">Agent de stérilisation</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-800 text-center">
                    <div className="inline-block px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Habilitation: Zone Propre
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* Validation Button at Bottom */}
        <div className="flex justify-center pt-10 pb-20">
          <button 
            onClick={() => alert('Prédésinfection Terminée !')}
            disabled={!isComplete}
            className={`group relative px-20 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all duration-500 shadow-2xl ${isComplete ? 'bg-slate-900 text-white hover:bg-black hover:-translate-y-2 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {isComplete && <span className="absolute -top-3 -right-3 bg-emerald-500 text-white p-2 rounded-full text-xs animate-bounce shadow-lg">✓</span>}
            Valider l'Étape
          </button>
        </div>

      </div>

      {/* Floating Simulation Button */}
      <button 
        onClick={triggerSimulation}
        className="fixed bottom-8 right-8 flex items-center gap-3 bg-rose-600 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-rose-700 hover:scale-110 transition-all active:scale-95 group z-50"
      >
        <span className="text-xl group-hover:animate-pulse">⚡</span>
        <span>Simulate Next Scan</span>
      </button>

    </div>
  );
}

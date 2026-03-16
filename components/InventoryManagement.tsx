"use client";

import React, { useState } from "react";

type TabType = "boxes" | "instruments" | "packaging";

export function InventoryManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("boxes");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden">
      {/* Tab Controls & Search Bar */}
      <div className="bg-white rounded-3xl border border-[#d5e2ea] p-4 shadow-sm shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex bg-[#f4f8fb] p-1.5 rounded-2xl gap-1 border border-[#d5e2ea]/50">
          <TabBtn 
            active={activeTab === "boxes"} 
            label="Boîtes" 
            icon="📦" 
            onClick={() => setActiveTab("boxes")} 
          />
          <TabBtn 
            active={activeTab === "instruments"} 
            label="Instruments" 
            icon="🔧" 
            onClick={() => setActiveTab("instruments")} 
          />
          <TabBtn 
            active={activeTab === "packaging"} 
            label="Emballages" 
            icon="✉️" 
            onClick={() => setActiveTab("packaging")} 
          />
        </div>

        <div className="flex-1 flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input 
              type="text" 
              placeholder={`Rechercher...`}
              className="w-full pl-10 pr-4 py-2 bg-[#f4f8fb] border border-[#d5e2ea] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1378ac]/20 focus:border-[#1378ac] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1378ac] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-[#0f6a98] transition-all shrink-0">
            <span>+</span>
            Ajouter
          </button>
        </div>
      </div>

      {/* Tab Content - Scrollable Table Area */}
      <div className="flex-1 bg-white rounded-3xl border border-[#d5e2ea] shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === "boxes" && <BoxesTable query={searchQuery} />}
          {activeTab === "instruments" && <InstrumentsTable query={searchQuery} />}
          {activeTab === "packaging" && <PackagingTable query={searchQuery} />}
        </div>
        
        {/* List Footer / Stats */}
        <div className="shrink-0 px-6 py-3 bg-[#f8fbfd] border-t border-[#d5e2ea] flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Affichage de 1-15 sur 124</span>
          <div className="flex gap-2">
            <button className="h-7 w-7 rounded-lg border border-[#d5e2ea] bg-white flex items-center justify-center hover:text-[#1378ac] transition-all">←</button>
            <button className="h-7 w-7 rounded-lg border border-[#1378ac] bg-[#1378ac] text-white flex items-center justify-center text-[10px]">1</button>
            <button className="h-7 w-7 rounded-lg border border-[#d5e2ea] bg-white flex items-center justify-center hover:text-[#1378ac] transition-all">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, label, icon, onClick }: { active: boolean, label: string, icon: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${active ? 'bg-white text-[#0b4867] shadow-sm ring-1 ring-[#d5e2ea]' : 'text-slate-400 hover:text-[#1378ac] hover:bg-white/50'}`}
    >
      <span className="text-xs">{icon}</span>
      {label}
    </button>
  );
}

// --- Specific Management Tables ---

function BoxesTable({ query }: { query: string }) {
  const data = [
    { name: "CHIRURGIE GENERALE #01", id: "BOX-GEN-001", category: "Général", capacity: "32 L" },
    { name: "ORTHOPEDIE GENOU #04", id: "BOX-ORTHO-004", category: "Ortho", capacity: "45 L" },
    { name: "OPHTALMOLOGIE #12", id: "BOX-OPH-012", category: "Ophtalmo", capacity: "12 L" },
    { name: "CESARIENNE URGENCE #02", id: "BOX-URG-002", category: "Gynéco", capacity: "28 L" },
    { name: "APPENDICECTOMIE #08", id: "BOX-GEN-008", category: "Général", capacity: "24 L" },
    { name: "ORL MICRO-CHIRURGIE", id: "BOX-ORL-001", category: "ORL", capacity: "10 L" },
    { name: "CARDIOLOGIE VALVULE #01", id: "BOX-CARD-001", category: "Cardio", capacity: "40 L" },
    { name: "UROLOGIE SONDE #05", id: "BOX-URO-005", category: "Urologie", capacity: "18 L" },
    { name: "NEUROCHIRURGIE CRANE #03", id: "BOX-NEU-003", category: "Neuro", capacity: "50 L" },
    { name: "DENTAIRE EXTRACTION", id: "BOX-DEN-009", category: "Stomato", capacity: "08 L" },
  ];

  return (
    <table className="w-full text-left table-fixed border-collapse">
      <thead className="sticky top-0 z-10 bg-[#0b4867] text-white text-[8px] font-bold uppercase tracking-[0.2em]">
        <tr>
          <th className="px-6 py-3 w-1/3">Nom</th>
          <th className="px-6 py-3">ID (Barcode)</th>
          <th className="px-6 py-3">Catégorie</th>
          <th className="px-6 py-3">Capacité</th>
          <th className="px-6 py-3 text-center w-24">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#edf5f9] text-slate-600">
        {data.map((item, i) => (
          <tr key={i} className="hover:bg-[#f8fbfd] transition-colors text-[10px]">
            <td className="px-6 py-3 font-bold text-[#0b4867]">{item.name}</td>
            <td className="px-6 py-3 font-mono text-[#1378ac]">{item.id}</td>
            <td className="px-6 py-3"><span className="px-2 py-0.5 bg-[#edf5f9] rounded-lg text-[8px] font-bold border border-[#d5e2ea]">{item.category}</span></td>
            <td className="px-6 py-3 font-medium">{item.capacity}</td>
            <td className="px-6 py-3 text-center">
              <button className="text-slate-400 hover:text-[#1378ac] transition-all">✎</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InstrumentsTable({ query }: { query: string }) {
  const data = [
    { name: "Pince Kocher Droite", material: "Acier Inox", manufacturer: "Aesculap", ref: "KM-4210" },
    { name: "Ciseaux Mayo Courbes", material: "Acier Inox", manufacturer: "Codman", ref: "SM-1102" },
    { name: "Porte-aiguille Mayo-Hegar", material: "Tungstène", manufacturer: "Aesculap", ref: "PH-9920" },
    { name: "Ecarteur Farabeuf", material: "Acier Inox", manufacturer: "Medline", ref: "EF-3341" },
    { name: "Pince à dissection 1x2d", material: "Acier Inox", manufacturer: "Aesculap", ref: "PD-5560" },
    { name: "Bistouri Manche n°4", material: "Acier Inox", manufacturer: "Swann-Morton", ref: "BS-0004" },
    { name: "Pince de Péan 14cm", material: "Acier Inox", manufacturer: "KLS Martin", ref: "PP-1244" },
    { name: "Clamp Vasculaire", material: "Titane", manufacturer: "Medtronic", ref: "CV-8871" },
  ];

  return (
    <table className="w-full text-left table-fixed border-collapse">
      <thead className="sticky top-0 z-10 bg-[#0b4867] text-white text-[8px] font-bold uppercase tracking-[0.2em]">
        <tr>
          <th className="px-6 py-3 w-1/3">Désignation</th>
          <th className="px-6 py-3">Matériau</th>
          <th className="px-6 py-3">Fabricant</th>
          <th className="px-6 py-3">Réf</th>
          <th className="px-6 py-3 text-center w-24">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#edf5f9] text-slate-600">
        {data.map((item, i) => (
          <tr key={i} className="hover:bg-[#f8fbfd] transition-colors text-[10px]">
            <td className="px-6 py-3 font-bold text-[#0b4867]">{item.name}</td>
            <td className="px-6 py-3">{item.material}</td>
            <td className="px-6 py-3 font-semibold">{item.manufacturer}</td>
            <td className="px-6 py-3 font-mono text-[#1378ac]">{item.ref}</td>
            <td className="px-6 py-3 text-center">
              <button className="text-slate-400 hover:text-[#1378ac] transition-all">✎</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PackagingTable({ query }: { query: string }) {
  const data = [
    { type: "Sachet Tyvek", size: "M (150x300)", expiry: "12 Mois", validation: "ISO 11607" },
    { type: "Conteneur Rigide", size: "L (600x400)", expiry: "24 Mois", validation: "H600" },
    { type: "Feuille SMS", size: "L (120x120)", expiry: "06 Mois", validation: "Grade 1" },
    { type: "Gaine Papier", size: "S (100x200)", expiry: "12 Mois", validation: "ISO 11607" },
    { type: "Plateau Filtre", size: "M (300x200)", expiry: "Indéfini", validation: "Validé ST" },
  ];

  return (
    <table className="w-full text-left table-fixed border-collapse">
      <thead className="sticky top-0 z-10 bg-[#0b4867] text-white text-[8px] font-bold uppercase tracking-[0.2em]">
        <tr>
          <th className="px-6 py-3 w-1/3">Type</th>
          <th className="px-6 py-3">Taille</th>
          <th className="px-6 py-3">Péremption</th>
          <th className="px-6 py-3">Norme</th>
          <th className="px-6 py-3 text-center w-24">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#edf5f9] text-slate-600">
        {data.map((item, i) => (
          <tr key={i} className="hover:bg-[#f8fbfd] transition-colors text-[10px]">
            <td className="px-6 py-3 font-bold text-[#0b4867]">{item.type}</td>
            <td className="px-6 py-3 font-semibold">{item.size}</td>
            <td className="px-6 py-3"><span className="text-[#d6455d] font-bold text-[9px]">{item.expiry}</span></td>
            <td className="px-6 py-3 text-[#11b5a2] font-bold">{item.validation}</td>
            <td className="px-6 py-3 text-center">
              <button className="text-slate-400 hover:text-[#1378ac] transition-all">✎</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Package, 
  Wrench, 
  Printer, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  Info,
  CheckCircle2,
  Settings,
  ShieldAlert,
  ArrowRightLeft,
  ArrowRight,
  Eye,
  Edit2,
  FileText,
  Calendar,
  RotateCcw,
  Trash2,
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type TabType = "boxes" | "instruments" | "packaging";
type ModeType = "referentiel" | "inventaire";
type InstrumentStatus = "En Stock" | "Utilisé" | "Sale" | "En Maintenance";

export function InventoryManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("boxes");
  const [mode, setMode] = useState<ModeType>("referentiel");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBox, setSelectedBox] = useState<any>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<any>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Toutes");
  const [isConfigMode, setIsConfigMode] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState<{show: boolean, type: 'orange' | 'red', message: string, data?: any}>({show: false, type: 'orange', message: ''});
  const [showRegisterForm, setShowRegisterForm] = useState<{show: boolean, id: string}>({show: false, id: ''});
  const [isDatasheetModalOpen, setIsDatasheetModalOpen] = useState(false);
  const [datasheetBox, setDatasheetBox] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isTraceabilityModalOpen, setIsTraceabilityModalOpen] = useState(false);
  const [isBoxDetailsModalOpen, setIsBoxDetailsModalOpen] = useState(false);
  const [isInstrumentDetailsModalOpen, setIsInstrumentDetailsModalOpen] = useState(false);
  const [selectedCatalogueInstrument, setSelectedCatalogueInstrument] = useState<any>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // --- NEW STATES FOR CATALOGUE EDIT/DELETE ---
  const [catalogBoxes, setCatalogBoxes] = useState(referentielBoxes);
  const [catalogInstruments, setCatalogInstruments] = useState(referentielInstruments);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const handleGlobalReset = () => {
    setSearchQuery("");
    setSelectedBox(null);
    setSelectedInstrument(null);
    setSelectedSpecialty("Toutes");
    setSelectedRows([]);
    setIsConfigMode(false);
    setShowResetConfirm(false);
  };

  const handleEditItem = (item: any) => {
    setItemToEdit(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (activeTab === 'boxes') {
      setCatalogBoxes(prev => prev.filter(b => b.id !== itemToDelete.id));
    } else {
      setCatalogInstruments(prev => prev.filter(i => i.id !== itemToDelete.id));
    }
    setIsDeleteConfirmOpen(false);
    setItemToDelete(null);
    setIsEditModalOpen(false); // If opened from edit modal
  };

  const saveEdit = (updatedItem: any) => {
    if (activeTab === 'boxes') {
      setCatalogBoxes(prev => prev.map(b => b.id === updatedItem.id ? updatedItem : b));
    } else {
      setCatalogInstruments(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    }
    setIsEditModalOpen(false);
    setItemToEdit(null);
  };

  const filteredInventaireBoxes = useMemo(() => {
    return inventaireBoxes.filter(box => {
      const matchesSearch = box.barcode.toLowerCase().includes(searchQuery.toLowerCase()) || box.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = selectedSpecialty === "Toutes" || box.category === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialty]);

  const filteredCatalogBoxes = useMemo(() => {
    return catalogBoxes.filter(box => {
      const matchesSearch = box.ref.toLowerCase().includes(searchQuery.toLowerCase()) || box.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = selectedSpecialty === "Toutes" || box.category === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialty, catalogBoxes]);

  const filteredInventaireInstruments = useMemo(() => {
    return inventaireInstruments.filter(inst => {
      const matchesSearch = inst.id.toLowerCase().includes(searchQuery.toLowerCase()) || inst.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  const filteredCatalogInstruments = useMemo(() => {
    return catalogInstruments.filter(inst => {
      const matchesSearch = inst.ref.toLowerCase().includes(searchQuery.toLowerCase()) || inst.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, catalogInstruments]);

  const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const id = searchQuery.trim();
      if (!id) return;

      // Simulation logic for inventory scan
      const foundInInventory = [...inventaireBoxes, ...inventaireInstruments].find(item => item.id === id || (item as any).barcode === id);

      if (foundInInventory) {
        // Step 1: Found in physical inventory
        if ('composition' in foundInInventory) {
          setSelectedBox(foundInInventory);
          setActiveTab('boxes');
        } else {
          setSelectedInstrument(foundInInventory);
          setActiveTab('instruments');
        }
      } else {
        // Step 2: Not in physical stock, check if it's a valid model in Catalogue
        const foundInCatalogue = [...referentielBoxes, ...referentielInstruments].find(item => item.id === id || (item as any).ref === id);
        
        if (foundInCatalogue) {
          // It's a valid model, but this specific serial number isn't registered
          setShowRegisterForm({ show: true, id });
        } else {
          // Totally unknown ID
          alert("Code-barres inconnu. Cet article n'existe pas dans le catalogue de référence.");
        }
      }
      setSearchQuery("");
    }
  };

  const handlePrint = () => {
    alert(`Génération du PDF technique pour : ${selectedBox?.name || selectedInstrument?.name}...`);
  };

  const simulateScanToBox = () => {
    if (!selectedBox) return;
    
    // In a real app, we would search for the scanned instrument model in the box's theoretical composition
    // Here we simulate a scan of "Ecarteur Farabeuf" which might or might not be in the composition
    const instrumentName = "Ecarteur Farabeuf";
    const isInTheoreticalComposition = selectedBox.composition?.some((item: any) => item.name.includes(instrumentName));

    if (!isInTheoreticalComposition) {
      setShowConflictModal({
        show: true,
        type: 'red',
        message: `Attention : Cet instrument (${instrumentName}) ne fait pas partie de la composition théorique de cette boîte (${selectedBox.name}).`
      });
    } else {
      // Membership conflict simulation
      const alreadyInAnotherBox = Math.random() < 0.3;
      if (alreadyInAnotherBox) {
        setShowConflictModal({
          show: true,
          type: 'orange',
          message: `Cet instrument (${instrumentName} #102) appartient déjà à la [Boîte Appendicectomie #04]. Voulez-vous le transférer ?`
        });
      } else {
        alert("Instrument ajouté avec succès à la boîte.");
      }
    }
  };

  return (
    <div className={`h-full flex flex-col text-slate-900 overflow-hidden transition-colors duration-500 ${mode === 'referentiel' ? 'bg-[#f8f9fa]' : 'bg-transparent'}`}>
      {/* Refactored Header: Breadcrumbs & Mode Selector */}
      <div className="flex items-center justify-between px-8 py-4 shrink-0 bg-white/50 backdrop-blur-sm border-b border-[#d5e2ea]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1378ac] rounded-lg flex items-center justify-center text-white shadow-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div className="h-4 w-px bg-slate-200 mx-2" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Referentiel</span>
              <span className="text-xs font-black text-[#0b4867] uppercase tracking-wider">Inventaire & Config</span>
            </div>
          </div>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-[#d5e2ea] shadow-sm">
          <button 
            onClick={() => { setMode("referentiel"); setSelectedBox(null); setSelectedInstrument(null); setIsConfigMode(false); }}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${mode === "referentiel" ? 'bg-[#1378ac] text-white shadow-md' : 'text-slate-400 hover:text-[#1378ac]'}`}
          >
            <Info className="w-3.5 h-3.5" />
            Catalogue
          </button>
          <button 
            onClick={() => { setMode("inventaire"); setSelectedBox(null); setSelectedInstrument(null); setIsConfigMode(false); }}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${mode === "inventaire" ? 'bg-[#11b5a2] text-white shadow-md' : 'text-slate-400 hover:text-[#11b5a2]'}`}
          >
            <Package className="w-3.5 h-3.5" />
            Inventaires
          </button>
        </div>
      </div>

      {mode === 'inventaire' ? (
        /* INVENTAIRE VIEW (Modern Sleek Aesthetic) */
        <div className="flex-1 flex flex-col gap-4 min-h-0 px-6 pb-6 z-10 animate-in fade-in duration-500">
          <div className="bg-white rounded-3xl border border-[#d5e2ea] p-6 shadow-sm shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#11b5a2] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#11b5a2]/20">
                  <Package className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                    {activeTab === 'boxes' ? 'Gestion de l\'Inventaire' : 'Stock Instruments'}
                  </h1>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {activeTab === 'boxes' ? 'Suivi et traçabilité des boîtes' : 'Instruments en circulation'}
                  </p>
                </div>
              </div>
              
              <div className="flex bg-slate-50 border-2 border-[#d5e2ea] rounded-2xl items-center px-4 py-2 w-96 transition-all focus-within:border-[#11b5a2] focus-within:bg-white ml-4 group">
                <Search className="w-4 h-4 text-slate-400 mr-2 group-focus-within:text-[#11b5a2] transition-colors" />
                <input 
                  type="text" 
                  placeholder={activeTab === 'boxes' ? "Scanner code-barres ou rechercher..." : "Scanner instrument..."}
                  className="bg-transparent text-sm font-medium focus:outline-none w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleScan}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="ml-2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-[#f4f8fb] p-1 rounded-xl border border-[#d5e2ea]/50 mr-4">
                <button 
                  onClick={() => { setActiveTab("boxes"); setSelectedBox(null); setSelectedInstrument(null); }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "boxes" ? 'bg-white text-[#11b5a2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Package className="w-3.5 h-3.5" />
                  Boîtes
                </button>
                <button 
                  onClick={() => { setActiveTab("instruments"); setSelectedBox(null); setSelectedInstrument(null); }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "instruments" ? 'bg-white text-[#11b5a2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Instruments
                </button>
              </div>
              
              <button className="px-6 py-2.5 bg-[#11b5a2] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#0f9a8a] transition-all flex items-center gap-2 shadow-lg shadow-[#11b5a2]/20">
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
              <button className="px-4 py-2.5 bg-white border-2 border-[#d5e2ea] rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-all">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
            <div className="flex-1 bg-white rounded-3xl border border-[#d5e2ea] shadow-sm overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === "boxes" ? (
                  <table className="w-full text-left table-fixed border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-5 border-b border-[#d5e2ea]">Code-Barres</th>
                        <th className="px-8 py-5 border-b border-[#d5e2ea]">Modèle & Type</th>
                        <th className="px-8 py-5 border-b border-[#d5e2ea]">Statut Actuel</th>
                        <th className="px-8 py-5 border-b border-[#d5e2ea]">Localisation</th>
                        <th className="px-8 py-5 border-b border-[#d5e2ea] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInventaireBoxes.map((box) => (
                        <tr 
                          key={box.id} 
                          onClick={() => { setSelectedBox(box); setIsBoxDetailsModalOpen(true); }} 
                          className={`hover:bg-slate-50/80 cursor-pointer transition-all ${selectedBox?.id === box.id ? 'bg-[#f0f9ff]' : ''}`}
                        >
                          <td className="px-8 py-4 font-mono text-[11px] font-bold text-slate-400">{box.barcode}</td>
                          <td className="px-8 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800">{box.name}</span>
                              <span className="text-[10px] font-bold text-[#11b5a2] uppercase">{box.category}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                              box.status === 'Prêt' || box.status === 'Stérile' ? 'bg-[#eafaf7] text-[#11b5a2] border border-[#bdece4]' : 
                              box.status === 'Sale' ? 'bg-orange-50 text-orange-500 border border-orange-100' : 
                              'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                box.status === 'Prêt' || box.status === 'Stérile' ? 'bg-[#11b5a2]' : 
                                box.status === 'Sale' ? 'bg-orange-500' : 'bg-slate-400'
                              }`} />
                              {box.status === 'Prêt' ? 'Stérile' : box.status}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                              <span className="text-[#1378ac]">📍</span>
                              {box.location}
                            </div>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <button className="p-2 hover:bg-white rounded-lg transition-all text-slate-300 hover:text-[#11b5a2]">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left table-fixed border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-5 border-b border-[#d5e2ea]">ID Unique</th>
                        <th className="px-8 py-5 border-b border-[#d5e2ea]">Désignation</th>
                        <th className="px-8 py-5 border-b border-[#d5e2ea]">État</th>
                        <th className="px-8 py-5 border-b border-[#d5e2ea]">Boîte Assignée</th>
                        <th className="px-8 py-5 border-b border-[#d5e2ea] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredInventaireInstruments.map((inst) => (
                          <tr 
                            key={inst.id} 
                            onClick={() => { setSelectedInstrument(inst); setIsTraceabilityModalOpen(true); }} 
                            className={`hover:bg-slate-50/80 cursor-pointer transition-all ${selectedInstrument?.id === inst.id ? 'bg-[#f0f9ff]' : ''}`}
                          >
                          <td className="px-8 py-4 font-mono text-[11px] font-bold text-slate-400">{inst.id}</td>
                          <td className="px-8 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800">{inst.name}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Modèle: {inst.model}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                              inst.status === 'En Stock' || inst.status === 'Stérile' ? 'bg-[#eafaf7] text-[#11b5a2] border border-[#bdece4]' : 
                              inst.status === 'Sale' ? 'bg-orange-50 text-orange-500 border border-orange-100' : 
                              inst.status === 'En Maintenance' ? 'bg-red-50 text-red-500 border border-red-100' :
                              'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                inst.status === 'En Stock' || inst.status === 'Stérile' ? 'bg-[#11b5a2]' : 
                                inst.status === 'Sale' ? 'bg-orange-500' : 
                                inst.status === 'En Maintenance' ? 'bg-red-500' : 'bg-slate-400'
                              }`} />
                              {inst.status === 'En Stock' ? 'Stérile' : inst.status}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            {inst.parentBoxName ? (
                              <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                                <span className="p-1 bg-slate-100 rounded">📦</span>
                                {inst.parentBoxName}
                              </div>
                            ) : (
                              <span className="text-slate-300 italic text-xs">Non assigné</span>
                            )}
                          </td>
                          <td className="px-8 py-4 text-right">
                            <button className="p-2 hover:bg-white rounded-lg transition-all text-slate-300 hover:text-[#11b5a2]">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Inventory Side Panel removed, replaced by Modal below */}
          </div>
        </div>
      ) : (
        /* CATALOGUE VIEW (Based on image_a5fc43.png & image_a60022.png) */
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden z-10 animate-in fade-in duration-500">
          {/* Main Catalog Header */}
          <div className="bg-white rounded-3xl border border-[#d5e2ea] p-6 shadow-sm shrink-0 flex items-center justify-between mx-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#11b5a2] rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-[#11b5a2]/20">📷</div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-slate-800 tracking-tight leading-tight">Catalogue Chirurgical</h1>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Référentiel des boîtes d'instruments</p>
                </div>
              </div>
              <div className="flex bg-slate-50 border-2 border-[#d5e2ea] rounded-2xl items-center px-4 py-2 w-96 transition-all focus-within:border-[#11b5a2] focus-within:bg-white ml-4">
                <span className="text-slate-400 mr-2 text-lg">🔍</span>
                <input 
                  type="text" 
                  placeholder={activeTab === 'boxes' ? "Rechercher une boite..." : "Search instruments..."} 
                  className="bg-transparent text-sm font-medium focus:outline-none w-full" 
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <button className="px-6 py-2.5 bg-white border-2 border-[#d5e2ea] rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2">
                  {selectedSpecialty === "Toutes" ? "Toutes les spécialités" : selectedSpecialty} <span className="opacity-50 text-[8px]">▼</span>
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl border border-[#d5e2ea] shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 overflow-hidden">
                  {["Toutes", "ORTHO", "NEURO", "CARDIO", "DIGESTIF", "GENERAL"].map((spec) => (
                    <button 
                      key={spec}
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`w-full px-6 py-3 text-left text-[11px] font-bold transition-colors ${selectedSpecialty === spec ? 'bg-[#1378ac] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {spec === "Toutes" ? "Toutes les spécialités" : spec}
                    </button>
                  ))}
                </div>
              </div>
              <button className="px-6 py-2.5 bg-white border-2 border-[#d5e2ea] rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2">
                ▼ Filtres
              </button>
              <div className="flex items-center gap-3 ml-6 border-l border-slate-200 pl-6">
                 <div className="flex flex-col items-end">
                    <span className="text-[11px] font-black text-slate-800">Dr. Marti</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Bloc 4</span>
                 </div>
                 <div className="h-10 w-10 rounded-full bg-[#f4f8fb] border-2 border-white shadow-md overflow-hidden flex items-center justify-center font-black text-slate-400 text-xs">DM</div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex gap-6 min-h-0 overflow-hidden px-6 pb-6">
            {/* Sidebar for Instruments */}
            {activeTab === 'instruments' && (
              <div className="w-64 bg-white rounded-3xl border border-[#d5e2ea] p-6 shadow-sm flex flex-col gap-8 shrink-0 animate-in slide-in-from-left duration-500">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Family</h4>
                  <div className="flex flex-col gap-1">
                    {["Préhension (42)", "Écarteurs (28)", "Coupe (15)", "Suture (24)"].map((cat, i) => (
                      <label key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer group transition-all">
                        <input type="checkbox" className="w-4 h-4 rounded-md border-2 border-[#d5e2ea] text-[#11b5a2] focus:ring-[#11b5a2]" />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Specialty</h4>
                  <div className="flex flex-col gap-1">
                    {["Viscéral", "Orthopédie", "Gynécologie"].map((spec, i) => (
                      <label key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer group transition-all">
                        <input type="checkbox" className="w-4 h-4 rounded-md border-2 border-[#d5e2ea] text-[#11b5a2] focus:ring-[#11b5a2]" />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 overflow-hidden transition-all flex flex-col px-6 pb-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    {activeTab === 'boxes' ? 'Boites Disponibles' : 'Instrument Catalog'}
                    <span className="ml-3 text-xs font-bold text-slate-400">{activeTab === 'boxes' ? referentielBoxes.length : referentielInstruments.length} résultats trouvés</span>
                  </h2>
                  <div className="flex bg-[#f4f8fb] p-1 rounded-xl border border-[#d5e2ea]/50 scale-90 origin-left">
                    <TabBtn active={activeTab === "boxes"} label="Boîtes" icon="📦" onClick={() => { setActiveTab("boxes"); setSelectedBox(null); setSelectedInstrument(null); }} />
                    <TabBtn active={activeTab === "instruments"} label="Instruments" icon="🔧" onClick={() => { setActiveTab("instruments"); setSelectedBox(null); setSelectedInstrument(null); }} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Trier par:</span>
                    <select className="bg-transparent text-[10px] font-black text-slate-800 focus:outline-none uppercase">
                      <option>Plus récentes</option>
                      <option>Nom A-Z</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => setIsConfigMode(!isConfigMode)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isConfigMode ? 'bg-[#11b5a2] text-white shadow-lg' : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-[#11b5a2] hover:text-[#11b5a2]'}`}
                  >
                    {isConfigMode ? '✓ Terminer Config' : '⚙ Configurer'}
                  </button>
                </div>
              </div>

              {/* Responsive Data Table */}
              <div className="flex-1 bg-white rounded-3xl border border-[#d5e2ea] shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {activeTab === "boxes" ? (
                    <table className="w-full text-left table-fixed border-separate border-spacing-0">
                      <thead className="sticky top-0 z-10 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <tr>
                          <th className="w-16 px-6 py-5 border-b border-[#d5e2ea]">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-[#d5e2ea] text-[#11b5a2] focus:ring-[#11b5a2]"
                              checked={selectedRows.length === referentielBoxes.length}
                              onChange={() => {
                                if (selectedRows.length === referentielBoxes.length) setSelectedRows([]);
                                else setSelectedRows(referentielBoxes.map(b => b.id));
                              }}
                            />
                          </th>
                          <th className="w-32 px-6 py-5 border-b border-[#d5e2ea]">Type</th>
                          <th className="px-6 py-5 border-b border-[#d5e2ea]">Nom de la Boîte</th>
                          <th className="w-40 px-6 py-5 border-b border-[#d5e2ea]">Référence</th>
                          <th className="w-32 px-6 py-5 border-b border-[#d5e2ea]">Instruments</th>
                          <th className="w-40 px-6 py-5 border-b border-[#d5e2ea]">Dernière MÀJ</th>
                          <th className="w-44 px-6 py-5 border-b border-[#d5e2ea] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCatalogBoxes.map((box) => (
                          <tr 
                            key={box.id} 
                            onClick={() => { setDatasheetBox(box); setIsDatasheetModalOpen(true); }}
                            className={`hover:bg-slate-50 cursor-pointer transition-all ${selectedBox?.id === box.id ? 'bg-[#f0f9ff]' : 'odd:bg-white even:bg-[#fbfcfd]'}`}
                          >
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-[#d5e2ea] text-[#11b5a2] focus:ring-[#11b5a2]" 
                                checked={selectedRows.includes(box.id)}
                                onChange={() => {
                                  if (selectedRows.includes(box.id)) setSelectedRows(selectedRows.filter(id => id !== box.id));
                                  else setSelectedRows([...selectedRows, box.id]);
                                }}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-md text-[9px] font-black tracking-widest ${
                                box.category === 'ORTHO' ? 'bg-[#eafaf7] text-[#11b5a2] border border-[#bdece4]' :
                                box.category === 'NEURO' ? 'bg-[#edf5f9] text-[#1378ac] border border-[#d5e2ea]' :
                                box.category === 'CARDIO' ? 'bg-red-50 text-red-500 border border-red-100' :
                                'bg-slate-50 text-slate-500 border border-slate-200'
                              }`}>
                                {box.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-black text-slate-800 line-clamp-1">{box.name}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{box.ref}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-700">{box.instrumentsCount}</span>
                                <span className="text-[10px] font-bold text-slate-400">items</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                                <Calendar className="w-3 h-3" />
                                24/03/2026
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={() => handleEditItem(box)}
                                  className="p-2 hover:bg-[#edf5f9] rounded-lg transition-all text-slate-400 hover:text-[#1378ac] group" 
                                  title="Éditer"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-[#edf5f9] rounded-lg transition-all text-slate-400 hover:text-[#1378ac] group" title="Imprimer">
                                  <Printer className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => { setDatasheetBox(box); setIsDatasheetModalOpen(true); }}
                                  className="p-2 hover:bg-[#eafaf7] rounded-lg transition-all text-slate-400 hover:text-[#11b5a2] group" 
                                  title="Fiche Technique"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left table-fixed border-separate border-spacing-0">
                      {/* Similar Table for Instruments if needed, but the prompt emphasizes Boxes */}
                      <thead className="sticky top-0 z-10 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <tr>
                          <th className="w-16 px-6 py-5 border-b border-[#d5e2ea]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#d5e2ea] text-[#11b5a2] focus:ring-[#11b5a2]" />
                          </th>
                          <th className="w-32 px-6 py-5 border-b border-[#d5e2ea]">Type</th>
                          <th className="px-6 py-5 border-b border-[#d5e2ea]">Désignation</th>
                          <th className="w-40 px-6 py-5 border-b border-[#d5e2ea]">Référence</th>
                          <th className="w-40 px-6 py-5 border-b border-[#d5e2ea]">Matériau</th>
                          <th className="w-44 px-6 py-5 border-b border-[#d5e2ea] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCatalogInstruments.map((inst) => (
                          <tr 
                            key={inst.id} 
                            onClick={() => { setSelectedCatalogueInstrument(inst); setIsInstrumentDetailsModalOpen(true); }}
                            className="hover:bg-slate-50 transition-all odd:bg-white even:bg-[#fbfcfd] cursor-pointer"
                          >
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" className="w-4 h-4 rounded border-[#d5e2ea] text-[#11b5a2] focus:ring-[#11b5a2]" />
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black tracking-widest border border-slate-200 uppercase">
                                {inst.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-800">{inst.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 line-clamp-1">{inst.description}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{inst.ref}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-bold text-slate-600">{inst.material}</span>
                            </td>
                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={() => handleEditItem(inst)}
                                  className="p-2 hover:bg-[#edf5f9] rounded-lg transition-all text-slate-400 hover:text-[#1378ac] group"
                                  title="Éditer"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-[#edf5f9] rounded-lg transition-all text-slate-400 hover:text-[#1378ac]"><Printer className="w-4 h-4" /></button>
                                <button 
                                  onClick={() => { setSelectedCatalogueInstrument(inst); setIsInstrumentDetailsModalOpen(true); }}
                                  className="p-2 hover:bg-[#eafaf7] rounded-lg transition-all text-slate-400 hover:text-[#11b5a2]"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Datasheet Modal */}
      {isDatasheetModalOpen && datasheetBox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b4867]/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-[#fbfcfd]">
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${
                datasheetBox.category === 'ORTHO' ? 'bg-[#eafaf7] text-[#11b5a2] border border-[#bdece4]' :
                datasheetBox.category === 'NEURO' ? 'bg-[#edf5f9] text-[#1378ac] border border-[#d5e2ea]' :
                'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {datasheetBox.category}
              </span>
              <button 
                onClick={() => setIsDatasheetModalOpen(false)}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
              <div className="flex flex-col items-center text-center mb-12">
                <div className="h-32 w-32 bg-[#f8fbfd] rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner border border-slate-50 mb-6 relative group">
                  <span className="group-hover:scale-110 transition-transform duration-500">📦</span>
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">{datasheetBox.name}</h2>
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100 rounded-full text-[11px] font-black text-slate-500 tracking-[0.25em]">
                  REF: {datasheetBox.ref}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Composition Technique</h4>
                  <span className="text-[10px] font-black text-[#11b5a2] uppercase tracking-widest bg-[#eafaf7] px-3 py-1 rounded-lg border border-[#bdece4]">
                    {datasheetBox.instrumentsCount} instruments au total
                  </span>
                </div>

                <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
                  {datasheetBox.composition?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-5 hover:bg-white transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-[#11b5a2]/30 group-hover:bg-[#11b5a2] transition-colors" />
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700 group-hover:text-[#0b4867] transition-colors">{item.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Référence : {item.ref}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm text-xs font-black text-[#11b5a2] min-w-[60px] text-center">
                          x {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-[#fbfcfd] border-t border-slate-100">
              <button 
                onClick={() => {
                  alert(`Impression de la fiche technique: ${datasheetBox.name}`);
                  setIsDatasheetModalOpen(false);
                }}
                className="w-full py-5 bg-[#11b5a2] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-[#11b5a2]/20 hover:bg-[#0f9a8a] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Printer className="w-5 h-5" />
                IMPRIMER LA FICHE TECHNIQUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Modal */}
      {showConflictModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b4867]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className={`p-8 text-white flex items-center gap-4 ${showConflictModal.type === 'orange' ? 'bg-orange-500' : 'bg-[#d6455d]'}`}>
              <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                {showConflictModal.type === 'orange' ? <ShieldAlert className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight leading-none">Alerte de Conflit</h3>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Validation de composition</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-slate-600 font-bold leading-relaxed text-sm">{showConflictModal.message}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConflictModal({show: false, type: 'orange', message: ''})}
                  className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                >Annuler</button>
                <button 
                  onClick={() => setShowConflictModal({show: false, type: 'orange', message: ''})}
                  className={`flex-[2] px-8 py-4 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${showConflictModal.type === 'orange' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 'bg-[#d6455d] hover:bg-[#b53a4e] shadow-red-500/20'}`}
                >
                  {showConflictModal.type === 'orange' ? 'Transférer l\'instrument' : 'Ignorer l\'alerte'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instrument Details Modal (Catalogue/Referentiel) */}
      {isInstrumentDetailsModalOpen && selectedCatalogueInstrument && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b4867]/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="relative p-8 flex flex-col items-center border-b border-slate-50 bg-[#fbfcfd]">
              <div className="absolute top-6 left-6">
                <span className="px-4 py-1.5 bg-[#1378ac] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                  FICHE TECHNIQUE INSTRUMENT
                </span>
              </div>
              <button 
                onClick={() => { setIsInstrumentDetailsModalOpen(false); setSelectedCatalogueInstrument(null); }}
                className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="h-40 w-full bg-white rounded-[2rem] flex items-center justify-center mt-8 border border-slate-50 shadow-inner relative group overflow-hidden">
                <div className="text-7xl transition-all duration-700 group-hover:scale-110 drop-shadow-lg grayscale-[0.2] group-hover:grayscale-0">
                  🔧
                </div>
              </div>

              <div className="mt-8 text-center space-y-2">
                <h2 className="text-3xl font-black text-[#0b4867] tracking-tight uppercase">
                  {selectedCatalogueInstrument.name}
                </h2>
                <div className="inline-flex px-4 py-1.5 bg-slate-100 rounded-full">
                  <span className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    REF: {selectedCatalogueInstrument.ref}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:bg-white transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#1378ac]/10 rounded-lg text-[#1378ac]"><Info className="w-4 h-4" /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">
                    {selectedCatalogueInstrument.description || "Instrument chirurgical de haute précision, certifié pour usage hospitalier."}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Matériau</span>
                      <p className="text-sm font-black text-slate-700">{selectedCatalogueInstrument.material || "Acier Inoxydable (316L)"}</p>
                    </div>
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-50 text-slate-400">🏗️</div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stérilisation</span>
                      <p className="text-sm font-black text-slate-700">{selectedCatalogueInstrument.sterilization || "Autoclave 134°C"}</p>
                    </div>
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-50 text-[#11b5a2]">🛡️</div>
                  </div>
                </div>
              </div>

              {/* Usage in Compositions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisé dans les compositions :</h4>
                  <span className="px-3 py-1 bg-[#1378ac]/10 text-[#1378ac] rounded-lg text-[10px] font-black uppercase">
                    {selectedCatalogueInstrument.parentModels?.length || 0} Modèles de boîtes
                  </span>
                </div>
                
                <div className="grid gap-3">
                  {selectedCatalogueInstrument.parentModels?.length > 0 ? (
                    selectedCatalogueInstrument.parentModels.map((model: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-white transition-colors">📦</div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-700 group-hover:text-[#1378ac] transition-colors uppercase">{model.name}</span>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold text-slate-400">REF: {model.ref || '—'}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                              <span className="text-[9px] font-black text-[#11b5a2] uppercase">{model.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Quantité :</span>
                          <span className="h-10 w-10 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-xs font-black text-[#1378ac] shadow-sm">
                            {model.qty}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400 italic">Cet instrument n'est actuellement rattaché à aucun modèle de boîte.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-[#fbfcfd] border-t border-slate-100">
              <button 
                onClick={() => {
                  alert(`Impression fiche technique instrument: ${selectedCatalogueInstrument.name}`);
                  setIsInstrumentDetailsModalOpen(false);
                }}
                className="w-full py-5 bg-[#1378ac] text-white rounded-2xl font-black uppercase tracking-[0.25em] text-[11px] shadow-lg shadow-[#1378ac]/20 hover:bg-[#0b4867] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Printer className="w-5 h-5" />
                IMPRIMER LA FICHE TECHNIQUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Box Details Modal (Inventory) */}
      {isBoxDetailsModalOpen && selectedBox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b4867]/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="relative p-8 flex flex-col items-center border-b border-slate-50 bg-[#fbfcfd]">
              <div className="absolute top-6 left-6">
                <span className="px-4 py-1.5 bg-[#1378ac] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                  DÉTAILS BOÎTE INVENTAIRE
                </span>
              </div>
              <button 
                onClick={() => { setIsBoxDetailsModalOpen(false); setSelectedBox(null); }}
                className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="h-40 w-full bg-white rounded-[2rem] flex items-center justify-center mt-8 border border-slate-50 shadow-inner relative group overflow-hidden">
                <div className="text-7xl transition-all duration-700 group-hover:scale-110 drop-shadow-lg grayscale-[0.2] group-hover:grayscale-0">
                  📦
                </div>
              </div>

              <div className="mt-8 text-center space-y-2">
                <h2 className="text-3xl font-black text-[#0b4867] tracking-tight uppercase">
                  {selectedBox.name}
                </h2>
                <div className="inline-flex px-4 py-1.5 bg-slate-100 rounded-full">
                  <span className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    SN: {selectedBox.barcode}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">
              {/* Status & Location Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f4f8fb] p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Localisation</span>
                  <p className="text-sm font-black text-slate-700 flex items-center gap-2">
                    <span className="text-[#1378ac]">📍</span> {selectedBox.location}
                  </p>
                </div>
                <div className="bg-[#f4f8fb] p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Statut Actuel</span>
                  <p className="text-sm font-black text-slate-700 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedBox.status === 'Prêt' ? 'bg-[#11b5a2]' : 'bg-orange-500'}`}></span>
                    {selectedBox.status}
                  </p>
                </div>
              </div>

              {/* Progress & Alert */}
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                <div className="flex items-center justify-between text-[11px] font-black text-slate-800 uppercase tracking-widest">
                  <span>Conformité du Contenu</span>
                  <span className="text-[#11b5a2]">24 / 25 Instruments OK</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-[#11b5a2] w-[96%] shadow-[0_0_15px_rgba(17,181,162,0.4)]" />
                </div>
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-xs font-bold text-red-600">1 instrument manquant par rapport au modèle théorique.</p>
                </div>
              </div>

              {/* Composition List */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Composition Scannée</h4>
                <div className="grid gap-3">
                  {selectedBox.composition?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-[#f4f8fb] rounded-xl flex items-center justify-center text-lg shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">🔧</div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700">{item.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">SN: {item.barcode || 'N/A'}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-50 text-green-500 rounded-lg text-[9px] font-black uppercase border border-green-100">Vérifié</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-[#fbfcfd] border-t border-slate-100 flex gap-4">
              <button 
                onClick={simulateScanToBox}
                className="flex-1 py-5 bg-[#11b5a2] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-[#11b5a2]/20 hover:bg-[#0f9a8a] transition-all flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" />
                Scanner Instrument
              </button>
              <button 
                onClick={handlePrint}
                className="flex-1 py-5 bg-white border-2 border-[#1378ac] text-[#1378ac] rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[#edf5f9] transition-all flex items-center justify-center gap-3"
              >
                <Printer className="w-5 h-5" />
                Imprimer Fiche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Traceability Modal */}
      {isTraceabilityModalOpen && selectedInstrument && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b4867]/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20 flex flex-col">
            {/* Modal Header */}
            <div className="relative p-8 flex flex-col items-center">
              <div className="absolute top-6 left-6">
                <span className="px-4 py-1.5 bg-[#1378ac] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                  TRAÇABILITÉ INSTRUMENT
                </span>
              </div>
              <button 
                onClick={() => { setIsTraceabilityModalOpen(false); setSelectedInstrument(null); }}
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Main Illustration */}
              <div className="h-56 w-full bg-[#f8fbfd]/50 rounded-[2rem] flex items-center justify-center mt-8 border border-slate-50 shadow-inner overflow-hidden relative group">
                <div className="text-8xl transition-all duration-700 group-hover:scale-110 drop-shadow-xl grayscale-[0.2] group-hover:grayscale-0">
                  🔧
                </div>
              </div>

              {/* Title & SN */}
              <div className="mt-8 text-center space-y-3">
                <h2 className="text-3xl font-black text-[#0b4867] tracking-tight">
                  {selectedInstrument.name}
                </h2>
                <div className="inline-flex px-4 py-1 bg-slate-50 rounded-lg">
                  <span className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    SN: {selectedInstrument.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body: Cards */}
            <div className="px-8 pb-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f4f8fb] p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-[#1378ac] transition-colors">Localisation</span>
                  <p className="text-sm font-black text-slate-700">
                    {selectedInstrument.parentBoxName || "Non assigné"}
                  </p>
                </div>
                <div className="bg-[#f4f8fb] p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-[#1378ac] transition-colors">Dernière Sté.</span>
                  <p className="text-sm font-black text-slate-700">24/03 - 14:20</p>
                </div>
              </div>

              {/* Separator */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-slate-200"></div>
                </div>
              </div>

              {/* Footer Button */}
              <button 
                onClick={() => alert(`Impression fiche inventaire: ${selectedInstrument.id}`)}
                className="w-full py-5 bg-white border-2 border-[#1378ac] text-[#1378ac] rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[#1378ac] hover:text-white transition-all shadow-lg shadow-[#1378ac]/5 active:scale-95 flex items-center justify-center gap-3"
              >
                <Printer className="w-5 h-5" />
                IMPRIMER FICHE INVENTAIRE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form Modal */}
      {showRegisterForm.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b4867]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="bg-[#1378ac] p-8 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight leading-none text-white">Nouvel Instrument Détecté</h3>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-2 font-mono">CODE: {showRegisterForm.id}</p>
              </div>
              <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white/50" />
              </div>
            </div>
            <div className="p-8 space-y-6">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <Info className="w-3 h-3" /> Lier à un modèle du catalogue
                  </label>
                  <select className="w-full bg-[#f4f8fb] border-2 border-[#d5e2ea] rounded-2xl p-4 text-xs font-black text-[#0b4867] focus:border-[#1378ac] outline-none appearance-none">
                     <option>Pince Kocher Droite (Aesculap)</option>
                     <option>Ciseaux Mayo (Codman)</option>
                     <option>Ecarteur Farabeuf (Paire)</option>
                  </select>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Statut Initial
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["En Stock", "Utilisé", "Sale", "En Maintenance"].map(s => (
                      <button key={s} className="py-3 bg-[#f4f8fb] border border-[#d5e2ea] rounded-xl text-[9px] font-bold text-slate-600 hover:border-[#1378ac] hover:text-[#1378ac] transition-all">{s}</button>
                    ))}
                  </div>
               </div>
               <button 
                 onClick={() => setShowRegisterForm({show: false, id: ''})}
                 className="w-full py-4 bg-[#11b5a2] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-[#11b5a2]/20 flex items-center justify-center gap-2"
               >
                 <Plus className="w-4 h-4" /> Enregistrer dans l'inventaire
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation & Reset Footer */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-fit bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-[#d5e2ea] shadow-2xl z-50 flex items-center gap-4 animate-in slide-in-from-bottom-8 duration-500">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>
        
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser vue
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2" />

        <button 
          onClick={() => {
            if (mode === 'referentiel') setMode('inventaire');
            else navigate("/");
          }}
          className="flex items-center gap-3 bg-[#1378ac] text-white px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-[#1378ac]/20 hover:bg-[#0b4867] hover:-translate-y-0.5 active:scale-95 transition-all group"
        >
          {mode === 'referentiel' ? 'Vers Inventaires' : 'Menu Principal'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            <h3 className="text-xl font-black text-slate-900 text-center uppercase tracking-tight mb-2">Réinitialiser ?</h3>
            <p className="text-sm font-bold text-slate-500 text-center leading-relaxed mb-8">
              Effacer la recherche, les filtres et les sélections actuelles ?
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

      {/* CATALOGUE EDIT MODAL */}
      {isEditModalOpen && itemToEdit && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0b4867]/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="bg-[#1378ac] p-8 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight leading-none">Modifier {activeTab === 'boxes' ? 'la Boîte' : 'l\'Instrument'}</h3>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-2 font-mono">REF: {itemToEdit.ref}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Désignation complète</label>
                <input 
                  type="text" 
                  defaultValue={itemToEdit.name}
                  onChange={(e) => setItemToEdit({...itemToEdit, name: e.target.value})}
                  className="w-full bg-[#f4f8fb] border-2 border-[#d5e2ea] rounded-2xl p-4 text-xs font-black text-[#0b4867] focus:border-[#1378ac] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Catégorie</label>
                  <select 
                    defaultValue={itemToEdit.category}
                    onChange={(e) => setItemToEdit({...itemToEdit, category: e.target.value})}
                    className="w-full bg-[#f4f8fb] border-2 border-[#d5e2ea] rounded-2xl p-4 text-xs font-black text-[#0b4867] focus:border-[#1378ac] outline-none appearance-none"
                  >
                    {activeTab === 'boxes' 
                      ? ["ORTHO", "NEURO", "CARDIO", "DIGESTIF", "GENERAL"].map(c => <option key={c} value={c}>{c}</option>)
                      : ["Préhension", "Écarteurs", "Coupe", "Suture"].map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Référence</label>
                  <input 
                    type="text" 
                    defaultValue={itemToEdit.ref}
                    onChange={(e) => setItemToEdit({...itemToEdit, ref: e.target.value})}
                    className="w-full bg-[#f4f8fb] border-2 border-[#d5e2ea] rounded-2xl p-4 text-xs font-black text-[#0b4867] focus:border-[#1378ac] outline-none"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex flex-col gap-3">
                <button 
                  onClick={() => saveEdit(itemToEdit)}
                  className="w-full py-4 bg-[#11b5a2] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-[#11b5a2]/20 hover:bg-[#0f9a8a] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Enregistrer les modifications
                </button>
                <button 
                  onClick={() => handleDeleteClick(itemToEdit)}
                  className="w-full py-4 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer du catalogue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteConfirmOpen && itemToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0b4867]/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-[#0b4867] uppercase tracking-tight mb-2">Confirmation</h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8">
                Voulez-vous vraiment supprimer <span className="text-red-500">"{itemToDelete.name}"</span> du catalogue ? Cette action est irréversible.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                >Annuler</button>
                <button 
                  onClick={confirmDelete}
                  className="py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
                >Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}
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

function BoxesGrid({ mode, onSelect, selectedId, isConfig, specialty }: { mode: ModeType, onSelect: (box: any) => void, selectedId?: string, isConfig?: boolean, specialty?: string }) {
  const data = mode === "referentiel" 
    ? (specialty && specialty !== "Toutes" ? referentielBoxes.filter(b => b.category === specialty) : referentielBoxes)
    : inventaireBoxes;

  return (
    <>
      {data.map((box, i) => (
        <div 
          key={i} 
          onClick={() => onSelect(box)}
          className={`group bg-white rounded-3xl border-2 p-6 cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden flex flex-col items-center gap-6 ${selectedId === box.id ? 'border-[#11b5a2] shadow-xl bg-[#fbfcfd]' : 'border-slate-50 hover:border-[#11b5a2]/20'}`}
        >
           <span className="absolute top-4 left-4 px-3 py-1 bg-[#eafaf7] text-[#11b5a2] text-[8px] font-black uppercase rounded-lg border border-[#bdece4]">
              {box.category}
           </span>

           <div className="h-32 w-32 bg-[#f8fbfd] rounded-2xl flex items-center justify-center text-5xl grayscale group-hover:grayscale-0 transition-all group-hover:scale-110 duration-500 shadow-inner">
              📦
           </div>

           <div className="w-full text-center space-y-3">
              <h3 className="text-xs font-black text-slate-800 leading-tight min-h-[2em]">{box.name}</h3>
              <div className="flex flex-col gap-1.5">
                 <div className="px-3 py-1.5 bg-[#11b5a2] rounded-lg text-[9px] font-black text-white uppercase tracking-widest shadow-sm">
                    {mode === 'referentiel' ? `${(box as any).instrumentsCount} instruments` : `LOC: ${(box as any).location}`}
                 </div>
                 {mode === 'inventaire' && (
                    <div className="text-center font-mono text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                       ID: {(box as any).barcode}
                    </div>
                 )}
                 {mode === 'referentiel' && (
                    <div className="text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                       Ref: {box.ref || '—'}
                    </div>
                 )}
              </div>
           </div>
           
           {isConfig && (
             <div className="absolute inset-0 bg-[#11b5a2]/10 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-white text-[#11b5a2] px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg border border-[#11b5a2]/20">⚙ Configurer</span>
             </div>
           )}
        </div>
      ))}
    </>
  );
}

function InstrumentsGrid({ mode, onSelect, selectedId, isConfig }: { mode: ModeType, onSelect: (instrument: any) => void, selectedId?: string, isConfig?: boolean }) {
  const data = mode === "referentiel" ? referentielInstruments : inventaireInstruments;

  const getStatusColor = (status: InstrumentStatus) => {
    switch (status) {
      case "En Stock": return "bg-[#eafaf7] text-[#11b5a2] border-[#bdece4]";
      case "Utilisé": return "bg-[#edf5f9] text-[#1378ac] border-[#d5e2ea]";
      case "Sale": return "bg-[#fdecef] text-[#d6455d] border-[#f8d7da]";
      case "En Maintenance": return "bg-[#fff6e9] text-[#f59e0b] border-[#ffe4bc]";
      default: return "bg-slate-100 text-slate-400";
    }
  };

  return (
    <>
      {data.map((inst, i) => (
        <div 
          key={i} 
          onClick={() => onSelect(inst)}
          className={`group bg-white rounded-3xl border-2 p-6 cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden flex flex-col items-center gap-6 ${selectedId === inst.id ? 'border-[#11b5a2] shadow-xl bg-[#fbfcfd]' : 'border-slate-50 hover:border-[#11b5a2]/20'}`}
        >
           <span className="absolute top-4 left-4 px-3 py-1 bg-[#eafaf7] text-[#11b5a2] text-[8px] font-black uppercase rounded-lg border border-[#bdece4]">
              {inst.category || "INSTR"}
           </span>

           <div className="h-32 w-32 bg-[#f8fbfd] rounded-full flex items-center justify-center text-5xl grayscale group-hover:grayscale-0 transition-all group-hover:scale-110 duration-500 shadow-inner">
              🔧
           </div>

           <div className="w-full text-center space-y-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-black text-slate-800 leading-tight">{inst.name}</h3>
                <p className="text-[9px] font-bold text-slate-400 line-clamp-1">{inst.description || "Instrument chirurgical haute précision"}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                 {mode === 'referentiel' ? (
                    <div className="px-3 py-1.5 bg-[#11b5a2] rounded-lg text-[9px] font-black text-white uppercase tracking-widest shadow-sm">
                       In {(inst as any).parentModels?.length || 0} boxes
                    </div>
                 ) : (
                    <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-center border ${getStatusColor((inst as any).status)}`}>
                       {(inst as any).status}
                    </div>
                 )}
                 <div className="text-center font-mono text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                    ID: {inst.id}
                 </div>
              </div>
           </div>

           {isConfig && (
             <div className="absolute inset-0 bg-[#11b5a2]/10 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-white text-[#11b5a2] px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg border border-[#11b5a2]/20">⚙ Éditer</span>
             </div>
           )}
        </div>
      ))}
    </>
  );
}

// --- Mock Data ---

const referentielBoxes = [
  { 
    id: "M-BOX-ORTHO-01", 
    name: "Boite Petite Chirurgie Orthopédique", 
    category: "ORTHO", 
    ref: "ORT-1024",
    instrumentsCount: 42, 
    composition: [
      { name: "Pince de kocher droite s\g 14 cm", quantity: 10, ref: "KM-4210", family: "Préhension" },
      { name: "Pince de kocher courbe s\g 14 cm", quantity: 5, ref: "KM-4212", family: "Préhension" },
      { name: "Pince à dissection a\g 14 cm", quantity: 8, ref: "PD-5560", family: "Préhension" },
      { name: "Pince à dissection s\g 14 cm", quantity: 4, ref: "PD-5562", family: "Préhension" },
      { name: "Ciseaux Mayo Courbes 16cm", quantity: 4, ref: "SM-1102", family: "Coupe" },
      { name: "Ciseaux Metzenbaum 18cm", quantity: 2, ref: "SM-1205", family: "Coupe" },
      { name: "Porte-aiguille Mayo-Hegar 16cm", quantity: 4, ref: "PH-9920", family: "Suture" },
      { name: "Porte-aiguille Mayo-Hegar 20cm", quantity: 2, ref: "PH-9922", family: "Suture" },
      { name: "Ecarteur Farabeuf (Paire)", quantity: 3, ref: "EF-3341", family: "Écarteurs" },
    ]
  },
  { 
    id: "M-BOX-NEURO-01", 
    name: "Boite Micro-Neurochirurgie", 
    category: "NEURO", 
    ref: "NEU-2055",
    instrumentsCount: 88, 
    composition: [
      { name: "Micro-pince de Jeweler", quantity: 12, ref: "MP-101", family: "Préhension" },
      { name: "Pince de bipolarité", quantity: 8, ref: "BP-502", family: "Hémostase" },
      { name: "Micro-ciseaux Vannas", quantity: 6, ref: "MC-202", family: "Coupe" },
      { name: "Ecarteur Brain Ribbon", quantity: 4, ref: "BR-901", family: "Écarteurs" },
      { name: "Canule d'aspiration micro", quantity: 10, ref: "AS-303", family: "Aspiration" },
    ]
  },
  { 
    id: "M-BOX-CARDIO-01", 
    name: "Boite Chirurgie Coronaire", 
    category: "CARDIO", 
    ref: "CAR-1112",
    instrumentsCount: 112, 
    composition: [
      { name: "Pince Bulldog", quantity: 15, ref: "BD-001", family: "Vasculaire" },
      { name: "Clamp Aortique", quantity: 5, ref: "CL-550", family: "Vasculaire" },
      { name: "Ciseaux de Potts", quantity: 4, ref: "PT-202", family: "Coupe" },
      { name: "Pince DeBakey", quantity: 12, ref: "DB-140", family: "Préhension" },
    ]
  },
  { 
    id: "M-BOX-DIGEST-01", 
    name: "Boite Coelioscopie Standard", 
    category: "DIGESTIF", 
    ref: "DIG-4089",
    instrumentsCount: 24, 
    composition: [
      { name: "Trocart 10mm", quantity: 2, ref: "TR-10", family: "Accès" },
      { name: "Trocart 5mm", quantity: 4, ref: "TR-05", family: "Accès" },
      { name: "Pince Maryland", quantity: 4, ref: "MY-50", family: "Préhension" },
      { name: "Ciseaux Laparo", quantity: 2, ref: "CL-80", family: "Coupe" },
      { name: "Grasper", quantity: 6, ref: "GR-12", family: "Préhension" },
    ]
  },
  { 
    id: "M-BOX-ORTHO-02", 
    name: "Boite Traumatologie Membre Inférieur", 
    category: "ORTHO", 
    ref: "ORT-1056",
    instrumentsCount: 55, 
    composition: [
      { name: "Rugine de Farabeuf", quantity: 2, ref: "RG-15", family: "Rugines" },
      { name: "Davier porte-os", quantity: 6, ref: "DV-22", family: "Réduction" },
      { name: "Marteau de chirurgie", quantity: 1, ref: "MT-40", family: "Accessoires" },
      { name: "Gouge de Stille", quantity: 4, ref: "GG-10", family: "Coupe" },
    ]
  },
  { 
    id: "M-BOX-GENERAL-01", 
    name: "Boite Base Chirurgie Générale", 
    category: "GENERAL", 
    ref: "GEN-001",
    instrumentsCount: 64, 
    composition: [
      { name: "Pince de Kocher", quantity: 12, ref: "KC-14", family: "Préhension" },
      { name: "Pince de Pean", quantity: 12, ref: "PN-14", family: "Hémostase" },
      { name: "Pince à dissection", quantity: 8, ref: "PD-14", family: "Préhension" },
      { name: "Ciseaux Mayo", quantity: 4, ref: "CY-16", family: "Coupe" },
    ]
  },
];

const inventaireBoxes = [
  { id: "BOX-VISC-001", name: "Boite Petite Chirurgie Orthopédique #01", category: "ORTHO", barcode: "BC-ORT-001", location: "Bloc 1", status: "Prêt", composition: [
    ...Array.from({ length: 42 }, (_, i) => ({
      name: `Instrument ORTHO #${i + 1}`,
      barcode: `INST-O-${String(i + 1).padStart(3, '0')}`
    }))
  ]},
  { id: "BOX-CELIO-002", name: "Boite CELIO #02", category: "VISC", barcode: "BC-CELIO-002", location: "Stérilisation", status: "Sale", composition: [
    ...Array.from({ length: 30 }, (_, i) => ({
      name: `Instrument CELIO #${i + 1}`,
      barcode: `INST-C-${String(i + 1).padStart(3, '0')}`
    }))
  ]},
];

const referentielInstruments = [
  { 
    id: "M-INST-KELLY", 
    name: "Pince de Kelly", 
    category: "Préhension",
    description: "Courbe, sans griffes, 14cm",
    ref: "KL-140-C", 
    material: "Stainless Steel (316L)",
    sterilization: "Autoclave 134°C",
    parentModels: [
      { name: "Boite Laparatomie Standard", category: "Viscéral", qty: 4, ref: "M-BOX-LAPA" }, 
      { name: "Boite Appendicectomie", category: "Viscéral", qty: 2, ref: "M-BOX-APP" },
      { name: "Boite Césarienne", category: "Gynécologie", qty: 6, ref: "M-BOX-CESA" }
    ] 
  },
  { 
    id: "M-INST-ECARTEUR", 
    name: "Écarteur de Farabeuf", 
    category: "Écarteurs",
    description: "Double, 15cm",
    ref: "FB-150-D",
    material: "Stainless Steel (316L)",
    sterilization: "Autoclave 134°C",
    parentModels: [
      { name: "Boite Base Chirurgie Générale", category: "Général", qty: 2, ref: "GEN-001" }
    ] 
  },
  { 
    id: "M-INST-HAGER", 
    name: "Porte-aiguille Mayo-Hegar", 
    category: "Suture",
    description: "Droit, 16cm",
    ref: "MH-160-S",
    material: "Stainless Steel (316L)",
    sterilization: "Autoclave 134°C",
    parentModels: [] 
  },
  { 
    id: "M-INST-DISSEC", 
    name: "Pince à dissection", 
    category: "Préhension",
    description: "Droite, avec griffes, 14cm",
    ref: "PD-140-G",
    material: "Stainless Steel (316L)",
    sterilization: "Autoclave 134°C",
    parentModels: [] 
  },
];

const inventaireInstruments = [
  { id: "INST-001", name: "Pince de kelly", model: "KM-4210", parentBox: "BOX-VISC-001", parentBoxName: "Boîte partie moll #01", status: "En Stock" as InstrumentStatus },
  { id: "INST-002", name: "Pince de kelly", model: "KM-4210", parentBox: null, status: "Sale" as InstrumentStatus },
  { id: "INST-003", name: "écarteur", model: "EF-3341", parentBox: "BOX-ORTHO-004", parentBoxName: "Boîte Orthopédie #04", status: "En Stock" as InstrumentStatus },
  { id: "INST-004", name: "Pince de kelly", model: "KM-4210", parentBox: null, status: "En Maintenance" as InstrumentStatus },
];

"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  ChevronDown,
  ShieldAlert,
  ArrowRightLeft,
  RotateCcw,
  ChevronLeft,
  AlertCircle,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type TabType = "boxes" | "instruments" | "packaging";
type InstrumentStatus = "En Stock" | "Utilisé" | "Sale" | "En Maintenance";

export function InventoryManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("boxes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBox, setSelectedBox] = useState<any>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<any>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Toutes");
  const [showConflictModal, setShowConflictModal] = useState<{show: boolean, type: 'orange' | 'red', message: string, data?: any}>({show: false, type: 'orange', message: ''});
  const [showRegisterForm, setShowRegisterForm] = useState<{show: boolean, id: string}>({show: false, id: ''});
  const [isTraceabilityModalOpen, setIsTraceabilityModalOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [instrumentsPopupBox, setInstrumentsPopupBox] = useState<any | null>(null);

  const [inventaireBoxesData, setInventaireBoxesData] = useState<any[]>([]);
  const [inventaireInstrumentsData, setInventaireInstrumentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [instrumentToReassign, setInstrumentToReassign] = useState<any>(null);
  const [reassignTraySearch, setReassignTraySearch] = useState("");
  const [allTrays, setAllTrays] = useState<any[]>([]);
  const [selectedReassignTray, setSelectedReassignTray] = useState<any>(null);
  const [isReassigning, setIsReassigning] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch("/api/trays/inventory").then((r) => r.json()),
      fetch("/api/instruments").then((r) => r.json()),
    ]).then(([trayData, instData]) => {
      setInventaireBoxesData(trayData.trays ?? []);
      setInventaireInstrumentsData(instData.instruments ?? []);
    }).finally(() => setIsLoading(false));
  }, []);

  const handleGlobalReset = () => {
    setSearchQuery("");
    setSelectedBox(null);
    setSelectedInstrument(null);
    setSelectedSpecialty("Toutes");
    setShowResetConfirm(false);
  };

  const openReassignModal = (inst: any) => {
    setInstrumentToReassign(inst);
    setSelectedReassignTray(null);
    setReassignTraySearch("");
    setIsReassignModalOpen(true);
    fetch("/api/trays").then(r => r.json()).then(d => setAllTrays(d.trays ?? []));
  };

  const confirmReassign = async () => {
    if (!instrumentToReassign || !selectedReassignTray) return;
    setIsReassigning(true);
    try {
      const res = await fetch(`/api/instruments/${encodeURIComponent(instrumentToReassign.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trayId: selectedReassignTray.id }),
      });
      if (res.ok) {
        setIsReassignModalOpen(false);
        setInstrumentToReassign(null);
        setSelectedReassignTray(null);
        // Refresh inventaire instruments
        fetch("/api/instruments").then(r => r.json()).then(d => setInventaireInstrumentsData(d.instruments ?? []));
      }
    } finally {
      setIsReassigning(false);
    }
  };

  const filteredInventaireBoxes = useMemo(() => {
    return inventaireBoxesData.filter(box => {
      const matchesSearch = box.barcode.toLowerCase().includes(searchQuery.toLowerCase()) || box.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = selectedSpecialty === "Toutes" || box.category === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialty, inventaireBoxesData]);

  const filteredInventaireInstruments = useMemo(() => {
    return inventaireInstrumentsData.filter(inst => {
      const matchesSearch = inst.id.toLowerCase().includes(searchQuery.toLowerCase()) || inst.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, inventaireInstrumentsData]);

  const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const id = searchQuery.trim();
      if (!id) return;

      const foundInInventory = [...inventaireBoxesData, ...inventaireInstrumentsData].find(item => item.id === id || (item as any).barcode === id);

      if (foundInInventory) {
        if ('composition' in foundInInventory) {
          setSelectedBox(foundInInventory);
          setActiveTab('boxes');
        } else {
          setSelectedInstrument(foundInInventory);
          setActiveTab('instruments');
        }
      } else {
        alert("Code-barres inconnu. Cet article n'existe pas dans l'inventaire.");
      }
      setSearchQuery("");
    }
  };

  return (
    <div className="h-full flex flex-col text-foreground overflow-hidden">
      {/* INVENTAIRE VIEW */}
      <div className="flex-1 flex flex-col gap-4 min-h-0 p-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm shrink-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="size-9 bg-secondary rounded-lg flex items-center justify-center text-secondary-foreground">
                <Package className="size-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-semibold text-foreground">Gestion de l&apos;Inventaire</h1>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Suivi et traçabilité des boîtes</p>
              </div>
            </div>

            <div className="relative ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder={activeTab === 'boxes' ? "Scanner code-barres ou rechercher…" : "Scanner instrument…"}
                className="w-80 rounded-lg border border-border bg-muted pl-9 pr-9 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleScan}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-border bg-muted p-1 gap-1">
              <button
                onClick={() => { setActiveTab("boxes"); setSelectedBox(null); setSelectedInstrument(null); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === "boxes" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Package className="size-3.5" />
                Boîtes
              </button>
              <button
                onClick={() => { setActiveTab("instruments"); setSelectedBox(null); setSelectedInstrument(null); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === "instruments" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Wrench className="size-3.5" />
                Instruments
              </button>
            </div>

            <button className="interactive-secondary flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium uppercase tracking-wide">
              <Plus className="size-4" />
              Ajouter
            </button>
            <button className="interactive-muted flex items-center justify-center size-9 rounded-lg">
              <Filter className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {activeTab === "boxes" ? (
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-card border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Code-Barres</th>
                      <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Modèle &amp; Type</th>
                      <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Statut Actuel</th>
                      <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Localisation</th>
                      <th className="px-6 py-3 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Instruments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventaireBoxes.map((box) => {
                      const instruments: any[] = box.composition ?? [];
                      return (
                        <tr key={box.id} className="transition-colors hover:bg-muted border-b border-border">
                          <td className="px-6 py-4 font-mono text-xs font-medium text-muted-foreground">{box.barcode}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-foreground">{box.name}</p>
                            <p className="text-[10px] font-medium text-secondary uppercase">{box.category}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium uppercase ${
                              box.status === 'Prêt' || box.status === 'Stérile'
                                ? 'border border-secondary/20 bg-secondary-muted text-secondary'
                                : box.status === 'Sale'
                                  ? 'border border-warning/20 bg-warning-muted text-warning'
                                  : 'border border-border bg-muted text-muted-foreground'
                            }`}>
                              <span className={`size-1.5 rounded-full ${
                                box.status === 'Prêt' || box.status === 'Stérile' ? 'bg-secondary' :
                                box.status === 'Sale' ? 'bg-warning' : 'bg-muted-foreground'
                              }`} />
                              {box.status === 'Prêt' ? 'Stérile' : box.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                              <MapPin className="size-3 text-primary" />
                              {box.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setInstrumentsPopupBox(box)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                            >
                              <span className="text-[10px] font-medium text-muted-foreground">{instruments.length} items</span>
                              <ChevronDown className="size-4 text-muted-foreground" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-card border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">ID Unique</th>
                      <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Désignation</th>
                      <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">État</th>
                      <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Boîte Assignée</th>
                      <th className="px-6 py-3 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredInventaireInstruments.map((inst) => (
                      <tr
                        key={inst.id}
                        onClick={() => { setSelectedInstrument(inst); setIsTraceabilityModalOpen(true); }}
                        className={`cursor-pointer transition-colors hover:bg-muted ${selectedInstrument?.id === inst.id ? 'bg-primary-muted' : ''}`}
                      >
                        <td className="px-6 py-4 font-mono text-xs font-medium text-muted-foreground">{inst.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-foreground">{inst.name}</p>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase">Modèle: {inst.model}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium uppercase ${
                            inst.status === 'En Stock'
                              ? 'border border-secondary/20 bg-secondary-muted text-secondary'
                              : inst.status === 'Sale'
                                ? 'border border-warning/20 bg-warning-muted text-warning'
                                : inst.status === 'En Maintenance'
                                  ? 'border border-destructive/20 bg-destructive/5 text-destructive'
                                  : 'border border-border bg-muted text-muted-foreground'
                          }`}>
                            <span className={`size-1.5 rounded-full ${
                              inst.status === 'En Stock' ? 'bg-secondary' :
                              inst.status === 'Sale' ? 'bg-warning' :
                              inst.status === 'En Maintenance' ? 'bg-destructive' : 'bg-muted-foreground'
                            }`} />
                            {inst.status === 'En Stock' ? 'Stérile' : inst.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {inst.parentBoxName ? (
                            <div className="flex items-center gap-2">
                              <Package className="size-3 text-muted-foreground shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-foreground">{inst.parentBoxName}</p>
                                <p className="font-mono text-[10px] font-medium text-muted-foreground">{inst.parentBox ?? "—"}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">Non assigné</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); openReassignModal(inst); }}
                              className="interactive-muted p-1.5 rounded-lg"
                              title="Réassigner à une autre boîte"
                            >
                              <ArrowRightLeft className="size-3.5" />
                            </button>
                            <button className="interactive-muted p-1.5 rounded-lg">
                              <ChevronRight className="size-4" />
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

      {/* Instruments Popup Modal */}
      {instrumentsPopupBox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" onClick={() => setInstrumentsPopupBox(null)} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[101] bg-card w-full max-w-md rounded-xl border border-border shadow-sm overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted shrink-0">
              <div>
                <p className="text-sm font-semibold text-foreground">{instrumentsPopupBox.name}</p>
                <p className="font-mono text-[10px] font-medium text-muted-foreground mt-0.5">{instrumentsPopupBox.barcode}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-medium text-muted-foreground">{(instrumentsPopupBox.composition ?? []).length} instruments</span>
                <button onClick={() => setInstrumentsPopupBox(null)} className="interactive-muted size-8 flex items-center justify-center rounded-lg">
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {(instrumentsPopupBox.composition ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Wrench className="size-8 opacity-30" />
                  <p className="text-[10px] font-medium uppercase tracking-wide">Aucun instrument enregistré</p>
                </div>
              ) : (
                (instrumentsPopupBox.composition ?? []).map((inst: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
                      <Wrench className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{inst.name}</p>
                      <p className="font-mono text-[10px] font-medium text-muted-foreground mt-0.5">{inst.barcode ?? inst.id ?? inst.serialNumber ?? "—"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conflict Modal */}
      {showConflictModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" onClick={() => setShowConflictModal({show: false, type: 'orange', message: ''})} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[101] bg-card w-full max-w-md rounded-xl border border-border shadow-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-5 text-primary-foreground flex items-center gap-4 ${showConflictModal.type === 'orange' ? 'bg-warning' : 'bg-destructive'}`}>
              <div className="size-12 bg-white/20 rounded-lg flex items-center justify-center">
                {showConflictModal.type === 'orange' ? <ShieldAlert className="size-6" /> : <AlertTriangle className="size-6" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide">Alerte de Conflit</h3>
                <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide mt-1">Validation de composition</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-muted p-4 rounded-xl border border-border">
                <p className="text-foreground font-medium text-sm leading-relaxed">{showConflictModal.message}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConflictModal({show: false, type: 'orange', message: ''})}
                  className="interactive-muted flex-1 rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide"
                >Annuler</button>
                <button
                  onClick={() => setShowConflictModal({show: false, type: 'orange', message: ''})}
                  className={`flex-[2] rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide text-primary-foreground ${showConflictModal.type === 'orange' ? 'interactive-warning' : 'interactive-danger'}`}
                >
                  {showConflictModal.type === 'orange' ? "Transférer l'instrument" : "Ignorer l'alerte"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Traceability Modal */}
      {isTraceabilityModalOpen && selectedInstrument && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" onClick={() => { setIsTraceabilityModalOpen(false); setSelectedInstrument(null); }} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[101] bg-card w-full max-w-lg rounded-xl border border-border shadow-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="relative p-5 flex flex-col items-center border-b border-border bg-muted">
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary-muted px-3 py-1 text-[10px] font-medium text-primary uppercase tracking-wide">
                  Traçabilité instrument
                </span>
              </div>
              <button
                onClick={() => { setIsTraceabilityModalOpen(false); setSelectedInstrument(null); }}
                className="interactive-muted absolute top-4 right-4 size-8 flex items-center justify-center rounded-lg"
              >
                <X className="size-4" />
              </button>

              <div className="size-24 bg-card rounded-xl flex items-center justify-center mt-10 border border-border">
                <Wrench className="size-12 text-muted-foreground" />
              </div>

              <div className="mt-5 text-center space-y-2">
                <h2 className="text-xl font-semibold text-foreground">{selectedInstrument.name}</h2>
                <div className="inline-flex px-3 py-1 bg-muted rounded-lg">
                  <span className="font-mono text-xs font-medium text-muted-foreground uppercase">SN: {selectedInstrument.id}</span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted p-4 rounded-xl border border-border">
                  <span className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Localisation</span>
                  <p className="text-sm font-semibold text-foreground">{selectedInstrument.parentBoxName || "Non assigné"}</p>
                </div>
                <div className="bg-muted p-4 rounded-xl border border-border">
                  <span className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Dernière Sté.</span>
                  <p className="text-sm font-semibold text-foreground">24/03 - 14:20</p>
                </div>
              </div>

              <button
                onClick={() => alert(`Impression fiche inventaire: ${selectedInstrument.id}`)}
                className="interactive-muted w-full rounded-lg py-3 text-xs font-medium uppercase tracking-wide flex items-center justify-center gap-2"
              >
                <Printer className="size-4" />
                Imprimer fiche inventaire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form Modal */}
      {showRegisterForm.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" onClick={() => setShowRegisterForm({show: false, id: ''})} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[101] bg-card w-full max-w-lg rounded-xl border border-border shadow-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-primary p-5 text-primary-foreground flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide">Nouvel Instrument Détecté</h3>
                <p className="text-primary-foreground/70 text-[10px] font-medium uppercase tracking-wide mt-1 font-mono">CODE: {showRegisterForm.id}</p>
              </div>
              <div className="size-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Package className="size-5 text-primary-foreground/50" />
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="space-y-3">
                <label className="text-[10px] font-medium uppercase text-muted-foreground tracking-wide flex items-center gap-2">
                  Lier à un modèle du catalogue
                </label>
                <select className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground focus:border-primary outline-none">
                  <option>Pince Kocher Droite (Aesculap)</option>
                  <option>Ciseaux Mayo (Codman)</option>
                  <option>Ecarteur Farabeuf (Paire)</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-medium uppercase text-muted-foreground tracking-wide flex items-center gap-2">
                  Statut Initial
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["En Stock", "Utilisé", "Sale", "En Maintenance"].map(s => (
                    <button key={s} className="interactive-muted rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide">{s}</button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowRegisterForm({show: false, id: ''})}
                className="interactive-secondary w-full rounded-lg py-3 text-xs font-medium uppercase tracking-wide flex items-center justify-center gap-2"
              >
                <Plus className="size-4" /> Enregistrer dans l&apos;inventaire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation footer */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-fit bg-card/90 backdrop-blur-sm p-2.5 rounded-xl border border-border shadow-sm z-50 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="interactive-muted flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wide"
        >
          <ChevronLeft className="size-4" />
          Retour
        </button>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="interactive-muted flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wide"
        >
          <RotateCcw className="size-4" />
          Réinitialiser
        </button>

        <div className="h-6 w-px bg-border" />

        <button
          onClick={() => navigate("/dashboard")}
          className="interactive-primary flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-medium uppercase tracking-wide"
        >
          Menu Principal
          <ChevronRight className="size-4" />
        </button>
      </footer>

      {/* Global Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" onClick={() => setShowResetConfirm(false)} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[101] bg-card rounded-xl p-6 max-w-sm w-full shadow-sm border border-border animate-in zoom-in-95 duration-200">
            <div className="size-14 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-5 mx-auto">
              <AlertCircle className="size-7" />
            </div>
            <h3 className="text-base font-semibold text-foreground text-center mb-2">Réinitialiser ?</h3>
            <p className="text-sm font-medium text-muted-foreground text-center leading-relaxed mb-6">
              Effacer la recherche, les filtres et les sélections actuelles ?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="interactive-muted py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide">
                Annuler
              </button>
              <button onClick={handleGlobalReset} className="interactive-danger py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Instrument Modal */}
      {isReassignModalOpen && instrumentToReassign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" onClick={() => setIsReassignModalOpen(false)} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
          <div className="relative z-[101] bg-card w-full max-w-md rounded-xl border border-border shadow-sm overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Réassigner l&apos;instrument</h3>
                <p className="font-mono text-[10px] font-medium text-muted-foreground mt-0.5">{instrumentToReassign.id}</p>
              </div>
              <button onClick={() => setIsReassignModalOpen(false)} className="interactive-muted size-8 flex items-center justify-center rounded-lg">
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 border-b border-border bg-muted space-y-2">
              <div className="flex items-center gap-3">
                <div className="size-9 bg-card rounded-lg flex items-center justify-center border border-border">
                  <Wrench className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{instrumentToReassign.name}</p>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    Boîte actuelle : <span className="text-foreground font-semibold">{instrumentToReassign.parentBoxName || "—"}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                <AlertTriangle className="size-3.5 text-warning shrink-0" />
                <p className="text-[10px] font-medium text-warning">Cette action modifie la composition des deux boîtes concernées.</p>
              </div>
            </div>

            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher une boîte…"
                  value={reassignTraySearch}
                  onChange={(e) => setReassignTraySearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted pl-9 pr-3 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-card"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {allTrays.length === 0 ? (
                <div className="p-6 text-center text-xs font-medium text-muted-foreground">Chargement des boîtes…</div>
              ) : (
                allTrays
                  .filter((t) => {
                    if (t.serialNumber === instrumentToReassign.parentBox) return false;
                    const q = reassignTraySearch.toLowerCase();
                    return !q || t.serialNumber.toLowerCase().includes(q) || t.label?.toLowerCase().includes(q);
                  })
                  .map((tray) => (
                    <button
                      key={tray.id}
                      onClick={() => setSelectedReassignTray(selectedReassignTray?.id === tray.id ? null : tray)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1 ${
                        selectedReassignTray?.id === tray.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <Package className={`size-4 shrink-0 ${selectedReassignTray?.id === tray.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${selectedReassignTray?.id === tray.id ? "text-primary-foreground" : "text-foreground"}`}>
                          {tray.label}
                        </p>
                        <p className={`font-mono text-[10px] font-medium ${selectedReassignTray?.id === tray.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {tray.serialNumber}
                        </p>
                      </div>
                      {selectedReassignTray?.id === tray.id && (
                        <CheckCircle2 className="size-4 text-primary-foreground shrink-0" />
                      )}
                    </button>
                  ))
              )}
            </div>

            <div className="p-4 border-t border-border flex gap-3">
              <button
                onClick={() => setIsReassignModalOpen(false)}
                className="interactive-muted flex-1 rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide"
              >
                Annuler
              </button>
              <button
                onClick={confirmReassign}
                disabled={!selectedReassignTray || isReassigning}
                className="interactive-primary flex-[2] rounded-lg py-2.5 text-xs font-medium uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRightLeft className="size-3.5" />
                {isReassigning ? "Réassignation…" : "Confirmer réassignation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {icon}
      {label}
    </button>
  );
}

// Mock data removed — data now loaded from API endpoints

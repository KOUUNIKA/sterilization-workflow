"use client";

import { type ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Pencil, 
  RotateCcw, 
  Trash2, 
  UserMinus, 
  AlertCircle, 
  ChevronLeft,
  CheckCircle2,
  X
} from "lucide-react";

type DashboardSectionProps = {
  index: string;
  title: string;
  scanned: boolean;
  icon: string;
  waitingText: string;
  children: ReactNode;
  forceShow?: boolean;
};

type DataCardProps = {
  label: string;
  value: string;
  color: "emerald" | "blue";
};

type StatusButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  color: "emerald" | "orange";
};

type CheckItemProps = {
  label: string;
  checked: boolean;
  onClick: () => void;
};

type WashingMode = "AUTOMATIQUE" | "MANUEL" | "ULTRASONS";

type UltrasonicParameters = {
  temperature: string;
  duration: string;
};

const WASHING_TRACE_STORAGE_KEY = "washing_cycle_trace";
const AUTO_CYCLE_DEFAULT = "Cycle standard instruments";
const WASHING_MODE_OPTIONS: Array<{
  value: WashingMode;
  label: string;
  description: string;
}> = [
  {
    value: "AUTOMATIQUE",
    label: "AUTOMATIQUE",
    description: "Laveur-desinfecteur standard",
  },
  {
    value: "MANUEL",
    label: "MANUEL",
    description: "Brossage manuel",
  },
  {
    value: "ULTRASONS",
    label: "ULTRASONS",
    description: "Bain a ultrasons par cavitation",
  },
];

function formatWashingMode(mode: WashingMode) {
  if (mode === "AUTOMATIQUE") return "Automatique";
  if (mode === "MANUEL") return "Manuel";
  return "Ultrasons";
}

interface LavageWizardProps {
  initialPhase?: 1 | 2;
  onPhaseChange?: (phase: 1 | 2) => void;
  onValidated?: (isValid: boolean) => void;
}

export function LavageWizard({ initialPhase = 1, onPhaseChange, onValidated }: LavageWizardProps) {
  const [phase, setPhase] = useState<1 | 2>(initialPhase); // 1: Chargement (Entrée), 2: Déchargement (Sortie)
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setPhase(initialPhase);
  }, [initialPhase]);

  const handlePhaseChange = (newPhase: 1 | 2) => {
    setPhase(newPhase);
    onPhaseChange?.(newPhase);
    if (newPhase === 1) navigate("/lavage-chargement");
    else navigate("/lavage-sortie");
  };
  
  const [panierScanned, setPanierScanned] = useState(false);
  const [laveurScanned, setLaveurScanned] = useState(false);
  const [washingModes, setWashingModes] = useState<WashingMode[]>(["AUTOMATIQUE"]);
  const [selectedAutoCycle, setSelectedAutoCycle] = useState(AUTO_CYCLE_DEFAULT);
  const [manualChecks, setManualChecks] = useState({
    dosage: false,
    brushing: false,
    rinsing: false
  });
  const [ultrasonicParameters, setUltrasonicParameters] = useState<UltrasonicParameters>({
    temperature: "",
    duration: "",
  });
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  const [laveurStatus, setLaveurStatus] = useState<"ready" | "maintenance">("ready");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isAutomaticOnly = washingModes.length === 1 && washingModes[0] === "AUTOMATIQUE";
  const includesManual = washingModes.includes("MANUEL");
  const includesUltrasons = washingModes.includes("ULTRASONS");
  const isManualProtocolComplete = !includesManual || (manualChecks.dosage && manualChecks.brushing && manualChecks.rinsing);
  const isUltrasonicProtocolComplete =
    !includesUltrasons ||
    (ultrasonicParameters.temperature.trim().length > 0 &&
      ultrasonicParameters.duration.trim().length > 0);
  const areCombinedProtocolsComplete = isManualProtocolComplete && isUltrasonicProtocolComplete;
  const activeWashingModeLabels = washingModes.map(formatWashingMode);

  const toggleWashingMode = (mode: WashingMode) => {
    setWashingModes((previousModes) => {
      if (previousModes.includes(mode)) {
        if (previousModes.length === 1) return previousModes;
        return previousModes.filter((currentMode) => currentMode !== mode);
      }

      if (mode === "AUTOMATIQUE") {
        return ["AUTOMATIQUE"];
      }

      return [...previousModes.filter((currentMode) => currentMode !== "AUTOMATIQUE"), mode];
    });
  };

  useEffect(() => {
    localStorage.setItem(
      WASHING_TRACE_STORAGE_KEY,
      JSON.stringify({
        washing_mode: activeWashingModeLabels,
        selected_cycle: isAutomaticOnly ? selectedAutoCycle : null,
        ultrasonic_parameters: includesUltrasons
          ? {
              temperature_c: ultrasonicParameters.temperature,
              duration_min: ultrasonicParameters.duration,
            }
          : null,
        manual_protocol: includesManual ? manualChecks : null,
        laveur_status: isAutomaticOnly ? laveurStatus : null,
        updated_at: new Date().toISOString(),
      }),
    );
  }, [
    activeWashingModeLabels,
    includesManual,
    includesUltrasons,
    isAutomaticOnly,
    laveurStatus,
    manualChecks,
    selectedAutoCycle,
    ultrasonicParameters,
  ]);

  const handleGlobalReset = () => {
    if (phase === 1) {
      setPanierScanned(false);
      setLaveurScanned(false);
      setWashingModes(["AUTOMATIQUE"]);
      setSelectedAutoCycle(AUTO_CYCLE_DEFAULT);
      setManualChecks({ dosage: false, brushing: false, rinsing: false });
      setUltrasonicParameters({ temperature: "", duration: "" });
      setOperatorConfirmed(false);
      setLaveurStatus("ready");
    } else {
      setSortieCycleValidated(false);
      setSortiePanierScanned(false);
      setSortieOperatorConfirmed(false);
      setConformity({
        programme: false,
        parameters: false,
        dosage: false,
        stability: false,
        cleanliness: false
      });
    }
    setShowResetConfirm(false);
  };

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
      else if (!isAutomaticOnly) {
        if (!areCombinedProtocolsComplete) {
          setManualChecks({ dosage: true, brushing: true, rinsing: true });
          if (includesUltrasons) {
            setUltrasonicParameters({
              temperature: "45",
              duration: "10",
            });
          }
        } else if (!operatorConfirmed) setOperatorConfirmed(true);
      }
      else if (!laveurScanned) setLaveurScanned(true);
      else if (laveurStatus !== "ready") setLaveurStatus("ready");
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

  const isPhase1Complete = isAutomaticOnly
    ? panierScanned && laveurScanned && operatorConfirmed && laveurStatus === "ready"
    : panierScanned && areCombinedProtocolsComplete && operatorConfirmed;
  const isPhase2Complete = sortieCycleValidated && sortiePanierScanned && sortieOperatorConfirmed;

  useEffect(() => {
    onValidated?.(phase === 1 ? isPhase1Complete : isPhase2Complete);
  }, [phase, isPhase1Complete, isPhase2Complete, onValidated]);
  const quickActionLabel =
    phase === 1
      ? !panierScanned
        ? "Scanner le panier"
        : !isAutomaticOnly
          ? !areCombinedProtocolsComplete
            ? "Completer le protocole"
            : !operatorConfirmed
              ? "Scanner le badge"
              : null
          : !laveurScanned
            ? "Scanner le laveur"
            : laveurStatus !== "ready"
              ? "Remettre le laveur pret"
            : !operatorConfirmed
              ? "Scanner le badge"
              : null
      : !sortieCycleValidated
        ? "Valider conformité"
        : !sortiePanierScanned
          ? "Scanner sortie"
          : !sortieOperatorConfirmed
            ? "Scanner badge"
            : null;
  const operatorState =
    phase === 1
      ? {
          title: "Opérateur",
          subtitle: "Entrée",
          confirmed: operatorConfirmed,
          name: "Dr. Karim ALAOUI",
          role: "Responsable Lavage",
        }
      : {
          title: "Responsable",
          subtitle: "Sortie",
          confirmed: sortieOperatorConfirmed,
          name: "Salma BENANI",
          role: "Responsable Déchargement",
        };

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden">
      <header className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] shrink-0">
        <section className="rounded-3xl border border-[#d5e2ea] bg-white/95 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center rounded-full border border-[#b8cad6] bg-[#edf5f9] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#1378ac]">
                Phase 03 • Nettoyage
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[#0b4867]">
                {phase === 1 ? "Entrée Laveur" : "Sortie Laveur"}
              </h1>
            </div>

            <div className="flex rounded-xl border border-[#d5e2ea] bg-white/95 p-1 shadow-sm shrink-0">
              <button
                onClick={() => handlePhaseChange(1)}
                className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-[0.2em] transition-all ${location.pathname === "/lavage-chargement" ? 'bg-[#1378ac] text-white shadow-md' : 'text-slate-400 hover:text-[#0b4867]'}`}
              >
                Chargement
              </button>
              <button
                onClick={() => handlePhaseChange(2)}
                className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-[0.2em] transition-all ${location.pathname === "/lavage-sortie" ? 'bg-[#11b5a2] text-white shadow-md' : 'text-slate-400 hover:text-[#0b4867]'}`}
              >
                Déchargement
              </button>
            </div>
          </div>
          
          {phase === 1 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mode de Lavage :</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {WASHING_MODE_OPTIONS.map((option) => {
                  const selected = washingModes.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleWashingMode(option.value)}
                      className={`rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                        selected
                          ? "border-[#1378ac] bg-[#1378ac] text-white shadow-lg shadow-[#1378ac]/20"
                          : "border-[#d5e2ea] bg-white text-slate-500 hover:border-[#1378ac]/30 hover:text-[#1378ac]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                            selected
                              ? "border-white bg-white text-[#1378ac]"
                              : "border-[#cfdbe3] bg-[#f8fbfd] text-transparent"
                          }`}
                        >
                          ✓
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">{option.label}</p>
                          <p className={`mt-1 text-[11px] font-semibold ${selected ? "text-white/85" : "text-slate-400"}`}>
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] font-semibold text-slate-400">
                Au moins un mode doit rester actif. `AUTOMATIQUE` reste exclusif, tandis que `MANUEL` et `ULTRASONS` peuvent etre combines.
              </p>
            </div>
          )}
        </section>

        <TopOperatorPanel
          title={operatorState.title}
          subtitle={operatorState.subtitle}
          confirmed={operatorState.confirmed}
          waitingText="Scanner le badge"
          name={operatorState.name}
          role={operatorState.role}
          onChangeUser={() => phase === 1 ? setOperatorConfirmed(false) : setSortieOperatorConfirmed(false)}
        />
      </header>

      <div className="flex-1 grid gap-4 lg:grid-cols-2 min-h-0 overflow-hidden">
        {phase === 1 && (
          <>
            <DashboardSection 
              index="01" 
              title={isAutomaticOnly ? "Panier" : "Scan Instruments"} 
              scanned={panierScanned} 
              icon={isAutomaticOnly ? "🛒" : "🔍"} 
              waitingText={isAutomaticOnly ? "Scanner le panier" : "Scanner Instrument/Panier"}
              onEdit={() => setPanierScanned(false)}
            >
              <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <DataCard label={isAutomaticOnly ? "ID Panier" : "ID Instrument / Lot"} value="PAN-2026-X8" color="blue" />
                {!isAutomaticOnly && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <p className="text-[9px] font-black text-orange-700 uppercase tracking-tight">
                      {includesManual && includesUltrasons ? "Protocole combine thermo-sensible active" : "Protocole thermo-sensible requis"}
                    </p>
                  </div>
                )}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                      <div key={i} className="rounded-lg border border-[#d5e2ea] bg-[#f8fbfd] p-3 text-center">
                        <p className="text-[7px] font-bold text-slate-400 uppercase">Inst. {i}</p>
                        <p className="text-[11px] font-bold text-[#1378ac]">x{i + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DashboardSection>

            <DashboardSection 
              index="02" 
              title={
                isAutomaticOnly
                  ? "Laveur"
                  : includesManual && includesUltrasons
                    ? "Protocoles combines"
                    : includesUltrasons
                      ? "Bain a ultrasons"
                      : "Protocole manuel"
              } 
              scanned={isAutomaticOnly ? laveurScanned : areCombinedProtocolsComplete} 
              icon={isAutomaticOnly ? "⚙️" : "🧼"} 
              waitingText={isAutomaticOnly ? "Scanner le laveur" : "Validation protocole"}
              onEdit={() => isAutomaticOnly ? setLaveurScanned(false) : (setManualChecks({ dosage: false, brushing: false, rinsing: false }), setUltrasonicParameters({ temperature: "", duration: "" }))}
              forceShow={!isAutomaticOnly}
            >
              {!isAutomaticOnly ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {includesManual && (
                    <>
                      <CheckItem 
                        label="Dosage detergent & Temp. eau" 
                        checked={manualChecks.dosage} 
                        onClick={() => setManualChecks({...manualChecks, dosage: !manualChecks.dosage})} 
                      />
                      <CheckItem 
                        label="Brossage mecanique minutieux" 
                        checked={manualChecks.brushing} 
                        onClick={() => setManualChecks({...manualChecks, brushing: !manualChecks.brushing})} 
                      />
                      <CheckItem 
                        label="Rincage abondant & sechage" 
                        checked={manualChecks.rinsing} 
                        onClick={() => setManualChecks({...manualChecks, rinsing: !manualChecks.rinsing})} 
                      />
                    </>
                  )}
                  {includesUltrasons && (
                    <div className="rounded-2xl border border-[#d5e2ea] bg-[#edf5f9] p-4 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1378ac]">Parametres Ultrasons</p>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">
                            Renseigner les conditions du bain pour assurer la tracabilite du protocole combine.
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${
                          isUltrasonicProtocolComplete ? "bg-[#1378ac] text-white" : "bg-white text-slate-400 border border-[#d5e2ea]"
                        }`}>
                          {isUltrasonicProtocolComplete ? "Complete" : "En attente"}
                        </span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block">
                          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Temperature (°C)</span>
                          <input
                            type="number"
                            min="0"
                            value={ultrasonicParameters.temperature}
                            onChange={(event) => setUltrasonicParameters({ ...ultrasonicParameters, temperature: event.target.value })}
                            className="mt-2 w-full rounded-xl border border-[#d5e2ea] bg-white px-4 py-3 text-sm font-semibold text-[#0b4867] outline-none transition focus:border-[#1378ac]"
                            placeholder="Ex: 45"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Duree (min)</span>
                          <input
                            type="number"
                            min="0"
                            value={ultrasonicParameters.duration}
                            onChange={(event) => setUltrasonicParameters({ ...ultrasonicParameters, duration: event.target.value })}
                            className="mt-2 w-full rounded-xl border border-[#d5e2ea] bg-white px-4 py-3 text-sm font-semibold text-[#0b4867] outline-none transition focus:border-[#1378ac]"
                            placeholder="Ex: 10"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest text-center">
                      {includesManual && includesUltrasons ? "Respecter les temps de contact et la sequence du bain a ultrasons" : "Respecter les temps de contact"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DataCard label="Machine" value="LD-UNIT-02" color="emerald" />
                  <label className="block">
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Cycle standard</span>
                    <select
                      value={selectedAutoCycle}
                      onChange={(event) => setSelectedAutoCycle(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-[#d5e2ea] bg-white px-4 py-3 text-sm font-semibold text-[#0b4867] outline-none transition focus:border-[#1378ac]"
                    >
                      <option value="Cycle standard instruments">Cycle standard instruments</option>
                      <option value="Cycle microchirurgie">Cycle microchirurgie</option>
                      <option value="Cycle rincage renforce">Cycle rincage renforce</option>
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <StatusButton active={laveurStatus === 'ready'} onClick={() => setLaveurStatus(laveurStatus === 'ready' ? 'maintenance' : 'ready')} color="emerald" icon="✅" label="Prêt" />
                    <StatusButton active={laveurStatus === 'maintenance'} onClick={() => setLaveurStatus("maintenance")} color="orange" icon="🛠️" label="Maint." />
                  </div>
                </div>
              )}
            </DashboardSection>
          </>
        )}

        {phase === 2 && (
          <>
            <DashboardSection 
              index="01" 
              title="Conformité" 
              scanned={sortieCycleValidated} 
              icon="📋" 
              waitingText="Vérification" 
              forceShow
              onEdit={() => setSortieCycleValidated(false)}
            >
              <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                  <CheckItem label="Conformite du programme : Utilisation du programme de nettoyage valide." checked={conformity.programme} onClick={() => setConformity({...conformity, programme: !conformity.programme})} />
                  <CheckItem label="Parametres critiques : Temperature, A0, pression et dosages conformes." checked={conformity.parameters} onClick={() => setConformity({...conformity, parameters: !conformity.parameters})} />
                  <CheckItem label="Positionnement de la charge : Materiel en position correcte." checked={conformity.dosage} onClick={() => setConformity({...conformity, dosage: !conformity.dosage})} />
                  <CheckItem label="Siccite de la charge : Absence totale d'humidite residuelle." checked={conformity.stability} onClick={() => setConformity({...conformity, stability: !conformity.stability})} />
                  <CheckItem label="Proprete visuelle : Absence de residus ou de souillures visibles." checked={conformity.cleanliness} onClick={() => setConformity({...conformity, cleanliness: !conformity.cleanliness})} />
                </div>
                <button 
                  onClick={() => setSortieCycleValidated(true)}
                  className={`shrink-0 w-full rounded-xl py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${Object.values(conformity).every(v => v) ? 'bg-[#11b5a2] text-white shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  Valider Conformité
                </button>
              </div>
            </DashboardSection>

            <DashboardSection 
              index="02" 
              title="Traçabilité" 
              scanned={sortiePanierScanned} 
              icon="🛒" 
              waitingText="Scanner sortie"
              onEdit={() => setSortiePanierScanned(false)}
            >
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DataCard label="Panier" value="PAN-2026-X8" color="blue" />
                <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[#b8cad6] bg-[#edf5f9] p-6 text-center">
                  <span className="text-3xl text-[#1378ac]">✓</span>
                  <div>
                    <p className="text-[#1378ac] text-xs font-bold uppercase">Charge validée</p>
                    <p className="mt-0.5 text-[8px] font-semibold text-slate-400 uppercase tracking-widest">Cycle LD-12333</p>
                  </div>
                </div>
              </div>
            </DashboardSection>
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#d5e2ea] shadow-lg mt-auto gap-4">
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
          onClick={() => {
            if (phase === 1) handlePhaseChange(2);
            else navigate("/recomposition");
          }}
          disabled={phase === 1 ? !isPhase1Complete : !isPhase2Complete}
          className={`group relative flex items-center gap-3 rounded-xl px-12 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] transition-all duration-300 shadow-xl ${
            (phase === 1 ? isPhase1Complete : isPhase2Complete)
              ? "bg-[#1378ac] text-white hover:bg-[#0f6a98] hover:-translate-y-0.5 active:scale-95"
              : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200 shadow-none"
          }`}
        >
          {(phase === 1 ? isPhase1Complete : isPhase2Complete) && <CheckCircle2 className="w-4 h-4" />}
          Étape suivante
        </button>
      </div>

      {/* Simulation Floating Button */}
      {quickActionLabel && (
        <button
          onClick={triggerSimulation}
          className="fixed bottom-32 right-10 flex items-center gap-3 rounded-full bg-[#0b4867] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-[#0a3952] hover:scale-105 active:scale-95 group z-[40]"
        >
          <span className="text-xl text-[#8de7da] animate-pulse">⌁</span>
          <span>{quickActionLabel}</span>
        </button>
      )}

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
              Êtes-vous sûr de vouloir effacer toutes les données d&apos;entrée pour ce cycle de lavage ?
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
    </div>
  );
}

function DashboardSection({ index, title, scanned, icon, waitingText, children, forceShow, onEdit }: DashboardSectionProps & { onEdit?: () => void }) {
  return (
    <section className={`bg-white/95 p-5 rounded-3xl border shadow-sm transition-all duration-500 flex flex-col overflow-hidden ${scanned ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white shadow-md">{index}</span>
          <h2 className="text-sm font-semibold tracking-tight text-[#0b4867]">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {scanned && (
            <button 
              onClick={onEdit}
              className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-slate-400 hover:text-[#1378ac] hover:border-[#1378ac] transition-colors"
            >
              <Pencil className="w-2.5 h-2.5" />
              Modifier
            </button>
          )}
          {scanned && <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2 py-0.5 text-[8px] font-semibold uppercase text-[#0b786e]">Validé</span>}
        </div>
      </div>
      
      {!scanned && !forceShow ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400 p-4">
          <div className="text-3xl opacity-50">{icon}</div>
          <p className="font-bold text-[9px] uppercase tracking-[0.2em] text-center">{waitingText}</p>
        </div>
      ) : children}
    </section>
  );
}

function DataCard({ label, value, color }: DataCardProps) {
  const styles = color === 'emerald' 
    ? { bg: 'bg-[#eafaf7]', text: 'text-[#0b786e]', border: 'border-[#bdece4]' }
    : { bg: 'bg-[#edf5f9]', text: 'text-[#1378ac]', border: 'border-[#b8cad6]' };
  
  return (
    <div className={`rounded-2xl border p-4 shrink-0 ${styles.bg} ${styles.border}`}>
      <p className={`mb-1 text-[8px] font-semibold uppercase tracking-[0.24em] ${styles.text}`}>{label}</p>
      <p className="text-lg font-semibold tracking-tight text-[#0b4867]">{value}</p>
    </div>
  );
}

function StatusButton({ active, onClick, icon, label, color }: StatusButtonProps) {
  const activeClass = color === 'emerald' ? 'border-[#11b5a2] bg-[#11b5a2] text-white shadow-md' : 'border-[#0b4867] bg-[#0b4867] text-white shadow-md';
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${active ? activeClass : 'border-[#d5e2ea] bg-white text-slate-400'}`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-center text-[8px] font-bold uppercase tracking-[0.1em]">{label}</span>
    </button>
  );
}

function TopOperatorPanel({ title, subtitle, confirmed, waitingText, name, role, onChangeUser }: any) {
  return (
    <section className={`rounded-3xl border bg-white/95 p-4 shadow-sm transition-all duration-500 ${confirmed ? "border-[#11b5a2] ring-4 ring-[#eafaf7]" : "border-[#d5e2ea]"}`}>
      <div className="flex items-center justify-between shrink-0 mb-2">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white shadow-md">03</span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-[#0b4867] truncate">{title}</h2>
          </div>
        </div>
        {confirmed && (
          <div className="flex items-center gap-2">
            <button 
              onClick={onChangeUser}
              className="flex items-center gap-1 text-[7px] font-black uppercase tracking-wider text-slate-400 hover:text-[#1378ac] transition-colors"
            >
              <UserMinus className="w-2.5 h-2.5" />
              Changer
            </button>
            <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2.5 py-1 text-[8px] font-semibold uppercase text-[#0b786e]">Validé</span>
          </div>
        )}
      </div>
      {!confirmed ? (
        <div className="h-[55px] flex items-center justify-center rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em]">{waitingText}</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0b4867] p-2.5 text-white animate-in zoom-in duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#0a3952] bg-[#1378ac] text-lg shadow-inner">👩‍🔬</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-tight truncate">{name}</p>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#8de7da] truncate">{role}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CheckItem({ label, checked, onClick }: CheckItemProps) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all shrink-0 ${checked ? 'border-[#11b5a2] bg-[#eafaf7] text-[#0b786e] shadow-sm' : 'border-[#d5e2ea] bg-white text-slate-400'}`}>
      <div className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-all ${checked ? 'border-[#11b5a2] bg-[#11b5a2] text-white' : 'border-[#cfdbe3]'}`}>
        {checked && "✓"}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{label}</span>
    </button>
  );
}

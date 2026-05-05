"use client";

import { type ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Pencil, 
  RotateCcw, 
  UserMinus, 
  AlertCircle, 
  ChevronLeft,
  CheckCircle2,
  X
} from "lucide-react";

interface ConformityChecks {
  passage: boolean;
  physico: boolean;
  siccite: boolean;
  integrite: boolean;
}

type DashboardSectionProps = {
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
  color: "purple" | "emerald";
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

interface SterilizationWizardProps {
  initialPhase?: 1 | 2;
  onPhaseChange?: (phase: 1 | 2) => void;
  onValidated?: (isValid: boolean) => void;
}

type BtCycleType = "Standard" | "Duo" | "Flex" | "Express";
type SteamCycleType = "instruments" | "caoutchouc";

type SteamCycleOption = {
  id: SteamCycleType;
  title: string;
  temp: string;
  duration: string;
  description: string;
};

type SteamCycleLogEntry = {
  cycleType: SteamCycleType;
  label: string;
  targetTemp: string;
  targetTime: string;
  agentId: string;
  timestamp: string;
};

interface TopOperatorPanelProps {
  title: string;
  subtitle: string;
  confirmed: boolean;
  waitingText: string;
  name: string;
  role: string;
  onChangeUser: () => void;
}

export function SterilizationWizard({ initialPhase = 1, onPhaseChange, onValidated }: SterilizationWizardProps) {
  const steamCycleOptions: SteamCycleOption[] = [
    {
      id: "instruments",
      title: "CYCLE INSTRUMENTS",
      temp: "134°C",
      duration: "18 min",
      description: "Standard instrumentation, stainless steel, and textiles.",
    },
    {
      id: "caoutchouc",
      title: "CYCLE CAOUTCHOUC",
      temp: "121°C",
      duration: "20 min",
      description: "Rubber, silicone, and heat-sensitive plastics.",
    },
  ];
  const [phase, setPhase] = useState<1 | 2>(initialPhase); // 1: Chargement, 2: Déchargement
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setPhase(initialPhase);
  }, [initialPhase]);

  const handlePhaseChange = (newPhase: 1 | 2) => {
    setPhase(newPhase);
    onPhaseChange?.(newPhase);
    if (newPhase === 1) navigate("/sterilization-chargement");
    else navigate("/sterilization-sortie");
  };

  const [autoclaveStatus, setAutoclaveStatus] = useState<"ready" | "maintenance" | null>(null);
  const [sterilizationType, setSterilizationType] = useState<"vapeur" | "basse_temp">("vapeur");
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [btCycleType, setBtCycleType] = useState<BtCycleType>("Standard");
  const [cassetteData, setCassetteData] = useState({
    id: "",
    lotNumber: "",
    serialNumber: "",
    expiryDate: "2026-12-31",
    insertionDate: "2026-03-20",
    dosesRemaining: 4,
    dosesRequired: 1
  });
  const [showDoseHistory, setShowDoseHistory] = useState(false);
  const [doseConsumptionAnimating, setDoseConsumptionAnimating] = useState(false);
  const [doseHistory, setDoseHistory] = useState<
    { cycleId: string; usedAt: string; cassetteId: string; lotNumber: string; serialNumber: string; doseUsed: number }[]
  >([
    {
      cycleId: "CY-BT-2026-028",
      usedAt: "2026-04-10T09:20:00",
      cassetteId: "H2O2-CASS-X99",
      lotNumber: "LOT-H2O2-2403",
      serialNumber: "SN-8842-91",
      doseUsed: 1,
    },
    {
      cycleId: "CY-BT-2026-031",
      usedAt: "2026-04-11T13:05:00",
      cassetteId: "H2O2-CASS-X99",
      lotNumber: "LOT-H2O2-2403",
      serialNumber: "SN-8842-91",
      doseUsed: 1,
    },
  ]);
  const [btIncompatibilityError, setBtIncompatibilityError] = useState<string | null>(null);
  const [selectedSteamCycle, setSelectedSteamCycle] = useState<SteamCycleType | null>(null);
  const [steamCycleConfirmed, setSteamCycleConfirmed] = useState(false);
  const [steamCycleLogs, setSteamCycleLogs] = useState<SteamCycleLogEntry[]>([]);
  const [sortingLoadMetadata, setSortingLoadMetadata] = useState<{
    highPrionRisk?: boolean;
    thermosensitive?: boolean;
  } | null>(null);
  const [agentBadge, setAgentBadge] = useState({ id: "", name: "", role: "" });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const formatDateFr = (dateValue: string) => {
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-FR");
  };

  const getDiscardDate = (openDate: string) => {
    const base = new Date(openDate);
    if (Number.isNaN(base.getTime())) return null;
    base.setDate(base.getDate() + 14);
    return base;
  };

  const discardDate = getDiscardDate(cassetteData.insertionDate);
  const isCassetteExpired = discardDate ? new Date() > discardDate : false;
  const isCassetteEmpty = cassetteData.id !== "" && cassetteData.dosesRemaining < cassetteData.dosesRequired;
  const normalizedScannedItems = scannedItems.map((item) => item.toUpperCase());
  const hasHighPrionRisk =
    Boolean(sortingLoadMetadata?.highPrionRisk) ||
    normalizedScannedItems.some((item) => item.includes("PRION"));
  const hasThermosensitiveLoad =
    Boolean(sortingLoadMetadata?.thermosensitive) ||
    normalizedScannedItems.some(
      (item) =>
        item.includes("THERMO") ||
        item.includes("CAOUTCHOUC") ||
        item.includes("RUBBER") ||
        item.includes("PLASTIC") ||
        item.includes("SILICONE"),
    );
  const recommendedSteamCycle: SteamCycleType = hasHighPrionRisk
    ? "instruments"
    : hasThermosensitiveLoad
      ? "caoutchouc"
      : "instruments";
  const selectedSteamCycleOption =
    steamCycleOptions.find((option) => option.id === selectedSteamCycle) ?? null;
  const currentAgentId = agentBadge.id || "AGENT-INCONNU";

  const handleGlobalReset = () => {
    if (phase === 1) {
      setScannedItems([]);
      setAutoclaveStatus(null);
      setAgentBadge({ id: "", name: "", role: "" });
      setSelectedSteamCycle(null);
      setSteamCycleConfirmed(false);
      setCassetteData(prev => ({
        ...prev,
        id: "",
        lotNumber: "",
        serialNumber: "",
      }));
      setShowDoseHistory(false);
      setDoseConsumptionAnimating(false);
    } else {
      setSortieScannedItems([]);
      setSortieAgentBadge({ id: "", name: "", role: "" });
      setChecks({
        passage: false,
        physico: false,
        siccite: false,
        integrite: false,
      });
    }
    setShowResetConfirm(false);
  };

  const [sortieScannedItems, setSortieScannedItems] = useState<string[]>([]);
  const [sortieAgentBadge, setSortieAgentBadge] = useState({ id: "", name: "", role: "" });
  const [isCriticalError, setIsCriticalError] = useState(false);

  useEffect(() => {
    // Check for critical error state from Qualification module
    const criticalError = localStorage.getItem('machine_critical_error');
    setIsCriticalError(criticalError === 'true');
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sorting_load_metadata");
      setSortingLoadMetadata(raw ? JSON.parse(raw) : null);
    } catch {
      setSortingLoadMetadata(null);
    }
  }, []);

  const [checks, setChecks] = useState<ConformityChecks>({
    passage: false,
    physico: false,
    siccite: false,
    integrite: false,
  });

  const triggerSimulation = () => {
    if (phase === 1) {
      if (scannedItems.length < 3) {
        const ids = sterilizationType === "basse_temp" 
          ? ["BT-KIT-9920", "BT-OPTIC-4412", "BT-CAM-3301"] 
          : ["EMB-9920", "EMB-4412", "EMB-3301"];
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        setScannedItems((prev) => [...prev, `${randomId}-${prev.length + 1}`]);
        setBtIncompatibilityError(null);
      } else if (!autoclaveStatus) {
        setAutoclaveStatus("ready");
        if (sterilizationType === "vapeur") {
          setSelectedSteamCycle(recommendedSteamCycle);
          setSteamCycleConfirmed(false);
        }
      } else if (sterilizationType === "basse_temp" && !cassetteData.id) {
        setCassetteData(prev => ({
          ...prev,
          id: "H2O2-CASS-X99",
          lotNumber: "LOT-H2O2-2403",
          serialNumber: "SN-8842-91",
          insertionDate: new Date().toISOString().slice(0, 10),
        }));
      } else if (sterilizationType === "vapeur" && !selectedSteamCycle) {
        setSelectedSteamCycle(recommendedSteamCycle);
        setSteamCycleConfirmed(false);
      } else if (sterilizationType === "vapeur" && !steamCycleConfirmed) {
        const simulatedChoice =
          steamCycleOptions.find((option) => option.id === (selectedSteamCycle ?? recommendedSteamCycle)) ??
          steamCycleOptions[0];
        const logEntry: SteamCycleLogEntry = {
          cycleType: simulatedChoice.id,
          label: simulatedChoice.title,
          targetTemp: simulatedChoice.temp,
          targetTime: simulatedChoice.duration,
          agentId: currentAgentId,
          timestamp: new Date().toISOString(),
        };
        setSteamCycleLogs((prev) => [logEntry, ...prev]);
        localStorage.setItem("steam_cycle_tracking_history", JSON.stringify([logEntry, ...steamCycleLogs].slice(0, 10)));
        setSteamCycleConfirmed(true);
      } else if (!agentBadge.name) {
        setAgentBadge({ id: "AGENT-STER-01", name: "MME. AMINA ALAMI", role: "AGENT STÉRILISATION" });
      }
    } else {
      const allChecksValid = Object.values(checks).every(v => v);
      if (!allChecksValid) {
        setChecks({ passage: true, physico: true, siccite: true, integrite: true });
      } else if (sortieScannedItems.length < 3) {
        const id = `EMB-SORTIE-${Math.floor(1000 + Math.random() * 9000)}`;
        setSortieScannedItems((prev) => [...prev, id]);
      } else if (!sortieAgentBadge.name) {
        setSortieAgentBadge({ id: "AGENT-STER-01", name: "MME. AMINA ALAMI", role: "AGENT STÉRILISATION" });
      }
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("steam_cycle_tracking_history");
      if (stored) {
        setSteamCycleLogs(JSON.parse(stored) as SteamCycleLogEntry[]);
      }
    } catch {
      setSteamCycleLogs([]);
    }
  }, []);

  useEffect(() => {
    if (sterilizationType !== "vapeur") return;
    if (hasHighPrionRisk) {
      setSelectedSteamCycle("instruments");
      setSteamCycleConfirmed(false);
    } else if (!selectedSteamCycle) {
      setSelectedSteamCycle(recommendedSteamCycle);
    }
  }, [sterilizationType, hasHighPrionRisk, recommendedSteamCycle, selectedSteamCycle]);

  const isCassetteValid = cassetteData.id !== "" &&
    !isCassetteExpired &&
    !isCassetteEmpty;

  const confirmSteamCycleSelection = () => {
    const cycleToLog =
      steamCycleOptions.find((option) => option.id === (selectedSteamCycle ?? recommendedSteamCycle)) ?? steamCycleOptions[0];

    const logEntry: SteamCycleLogEntry = {
      cycleType: cycleToLog.id,
      label: cycleToLog.title,
      targetTemp: cycleToLog.temp,
      targetTime: cycleToLog.duration,
      agentId: currentAgentId,
      timestamp: new Date().toISOString(),
    };

    const nextLogs = [logEntry, ...steamCycleLogs].slice(0, 10);
    setSteamCycleLogs(nextLogs);
    setSteamCycleConfirmed(true);
    localStorage.setItem("steam_cycle_tracking_history", JSON.stringify(nextLogs));
  };

  const handleCassetteScan = (rawValue: string) => {
    const scannedId = rawValue.trim();
    if (!scannedId) return;

    const now = new Date();
    const normalized = scannedId.toUpperCase();
    const lotSuffix = normalized.slice(-4) || "0000";
    const serialSuffix = normalized.slice(-6) || "000000";

    setCassetteData((prev) => ({
      ...prev,
      id: normalized,
      lotNumber: `LOT-${lotSuffix}`,
      serialNumber: `SN-${serialSuffix}`,
      insertionDate: now.toISOString().slice(0, 10),
    }));
    setAutoclaveStatus("ready");
  };

  const consumeCassetteDose = () => {
    if (sterilizationType !== "basse_temp" || !cassetteData.id || !isCassetteValid) return;

    setDoseConsumptionAnimating(true);
    setCassetteData((prev) => ({
      ...prev,
      dosesRemaining: Math.max(0, prev.dosesRemaining - prev.dosesRequired),
    }));
    setDoseHistory((prev) => [
      {
        cycleId: `CY-BT-${new Date().getFullYear()}-${String(prev.length + 1).padStart(3, "0")}`,
        usedAt: new Date().toISOString(),
        cassetteId: cassetteData.id,
        lotNumber: cassetteData.lotNumber,
        serialNumber: cassetteData.serialNumber,
        doseUsed: cassetteData.dosesRequired,
      },
      ...prev,
    ]);
    setTimeout(() => setDoseConsumptionAnimating(false), 900);
  };

  const isSteamSelectionReady =
    sterilizationType !== "vapeur" ||
    (autoclaveStatus === "ready" && selectedSteamCycle !== null && steamCycleConfirmed);

  const isPhase1Complete = scannedItems.length > 0 && 
    autoclaveStatus === "ready" && 
    agentBadge.name !== "" &&
    (sterilizationType === "basse_temp" ? isCassetteValid && !btIncompatibilityError : isSteamSelectionReady);
  const isPhase2Complete = Object.values(checks).every(v => v) && sortieScannedItems.length > 0 && sortieAgentBadge.name !== "";

  useEffect(() => {
    onValidated?.(phase === 1 ? isPhase1Complete : isPhase2Complete);
  }, [phase, isPhase1Complete, isPhase2Complete, onValidated]);

  const handlePrimaryAction = () => {
    if (phase === 1) {
      handlePhaseChange(2);
      return;
    }

    if (sterilizationType === "basse_temp" && isCassetteValid) {
      consumeCassetteDose();
      setTimeout(() => navigate("/sterilization-sortie"), 500);
      return;
    }

    navigate("/sterilization-sortie");
  };
  const quickActionLabel =
    phase === 1
      ? scannedItems.length < 3
        ? "Scanner emballage"
        : !autoclaveStatus
          ? "Scanner autoclave"
          : sterilizationType === "vapeur" && !selectedSteamCycle
            ? "Choisir cycle"
            : sterilizationType === "vapeur" && !steamCycleConfirmed
              ? "Confirmer cycle"
          : !agentBadge.name
            ? "Scanner badge"
            : null
      : !Object.values(checks).every(v => v)
        ? "Valider contrôles"
        : sortieScannedItems.length < 3
          ? "Scanner sortie"
          : !sortieAgentBadge.name
            ? "Scanner badge"
            : null;
  const operatorState =
    phase === 1
      ? {
          title: "Opérateur",
          subtitle: "Chargement",
          confirmed: agentBadge.name !== "",
          name: agentBadge.name,
          role: agentBadge.role,
        }
      : {
          title: "Validation",
          subtitle: "Responsable",
          confirmed: sortieAgentBadge.name !== "",
          name: sortieAgentBadge.name,
          role: sortieAgentBadge.role,
        };

  return (
    <div className="h-full flex flex-col gap-4 text-slate-900 overflow-hidden">
      <header className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] shrink-0">
        <section className="rounded-3xl border border-[#d5e2ea] bg-white/95 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center rounded-full border border-[#b8cad6] bg-[#edf5f9] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#1378ac]">
                Phase 04 • Stérilisation
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[#0b4867]">
                {phase === 1 ? "Entrée Autoclave" : "Sortie Autoclave"}
              </h1>
            </div>

            <div className="flex rounded-xl border border-[#d5e2ea] bg-white/95 p-1 shadow-sm shrink-0">
              <button 
                onClick={() => handlePhaseChange(1)}
                className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-[0.2em] transition-all ${location.pathname === "/sterilization-chargement" ? 'bg-[#1378ac] text-white shadow-md' : 'text-slate-400 hover:text-[#0b4867]'}`}
              >
                Chargement
              </button>
              <button 
                onClick={() => handlePhaseChange(2)}
                className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-[0.2em] transition-all ${location.pathname === "/sterilization-sortie" ? 'bg-[#11b5a2] text-white shadow-md' : 'text-slate-400 hover:text-[#0b4867]'}`}
              >
                Validation
              </button>
            </div>
          </div>

          {phase === 1 && (
            <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type de Stérilisation :</p>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setSterilizationType("vapeur")}
                  className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sterilizationType === "vapeur" ? 'bg-white text-[#1378ac] shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Vapeur d&apos;eau
                </button>
                <button 
                  onClick={() => setSterilizationType("basse_temp")}
                  className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sterilizationType === "basse_temp" ? 'bg-[#1378ac] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Basse Température
                </button>
              </div>
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
          onChangeUser={() => phase === 1 ? setAgentBadge({ id: "", name: "", role: "" }) : setSortieAgentBadge({ id: "", name: "", role: "" })}
        />
      </header>

      <div className="flex-1 grid gap-4 lg:grid-cols-2 min-h-0 overflow-hidden">
        {phase === 1 ? (
          <>
            <DashboardSection 
              title={sterilizationType === "basse_temp" ? "Charge BT" : "Chariot"} 
              scanned={scannedItems.length > 0} 
              icon={sterilizationType === "basse_temp" ? "📦" : "🧺"} 
              waitingText={sterilizationType === "basse_temp" ? "SCAN_CODE_BARRES_PANIER" : "Scanner les emballages"}
              onEdit={() => {
                setScannedItems([]);
                setBtIncompatibilityError(null);
              }}
            >
              <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                {sterilizationType === "basse_temp" && (
                  <div className="flex flex-col gap-2">
                    <input 
                      type="text"
                      placeholder="SCAN_CODE_BARRES_PANIER"
                      className="w-full bg-white border-2 border-[#d5e2ea] rounded-xl py-3 px-4 text-[10px] font-black tracking-widest focus:border-[#1378ac] outline-none transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          if (val.toUpperCase().includes("INOX") || val.toUpperCase().includes("PLATEAU")) {
                            setBtIncompatibilityError("Incompatible Load: This item requires High-Temperature Steam Sterilization.");
                          } else {
                            setScannedItems(prev => [...prev, val]);
                            setBtIncompatibilityError(null);
                          }
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    {btIncompatibilityError && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in shake duration-300">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-[8px] font-black text-red-600 uppercase leading-tight">{btIncompatibilityError}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="flex flex-wrap gap-2">
                    {scannedItems.map((item, i) => (
                      <div key={i} className="group relative rounded-xl border border-[#b8cad6] bg-[#edf5f9] px-3 py-2 text-[10px] font-semibold text-[#1378ac] shadow-sm">
                        {item}
                        <button 
                          onClick={() => setScannedItems(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 p-3 bg-[#f8fbfd] rounded-xl border border-[#d5e2ea] text-center">
                   <p className="text-[10px] font-bold text-[#1378ac] uppercase tracking-widest">{scannedItems.length} objet(s) scanné(s)</p>
                </div>
              </div>
            </DashboardSection>

            <DashboardSection 
              title={sterilizationType === "basse_temp" ? "Unité & Cassette" : "Autoclave"} 
              scanned={autoclaveStatus !== null && (sterilizationType === "basse_temp" ? isCassetteValid : steamCycleConfirmed)} 
              icon={sterilizationType === "vapeur" ? "♨️" : "❄️"} 
              waitingText={sterilizationType === "vapeur" ? "Scanner l'autoclave" : "SCAN_CASSETTE"}
              onEdit={() => {
                setAutoclaveStatus(null);
                setSelectedSteamCycle(null);
                setSteamCycleConfirmed(false);
                setCassetteData(prev => ({ ...prev, id: "", lotNumber: "", serialNumber: "" }));
                setShowDoseHistory(false);
              }}
              forceShow={sterilizationType === "basse_temp"}
            >
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <DataCard 
                  label="Machine" 
                  value={sterilizationType === "vapeur" ? "AUTOCLAVE N° 02" : "STÉRILISATEUR BT-01"} 
                  color="purple" 
                />
                
                {sterilizationType === "basse_temp" ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cycle BT</label>
                      <select 
                        value={btCycleType}
                        onChange={(e) => setBtCycleType(e.target.value as BtCycleType)}
                        className="w-full bg-white border-2 border-[#d5e2ea] rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest focus:border-[#1378ac] outline-none"
                      >
                        <option value="Standard">Standard (56°C)</option>
                        <option value="Duo">Duo (50°C)</option>
                        <option value="Flex">Flex (47°C)</option>
                        <option value="Express">Express (56°C)</option>
                      </select>
                    </div>

                    <div className="p-3 bg-[#f8fbfd] rounded-xl border border-[#d5e2ea]">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Paramètres Réf.</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-[#0b4867]">TEMP CIBLE</span>
                        <span className="text-xs font-black text-[#1378ac]">
                          {btCycleType === "Standard" || btCycleType === "Express" ? "56°C" : btCycleType === "Duo" ? "50°C" : "47°C"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <input 
                        type="text"
                        placeholder="SCAN_CASSETTE (H2O2)"
                        className={`w-full bg-white border-2 rounded-xl py-3 px-4 text-[10px] font-black tracking-widest outline-none transition-all ${
                          cassetteData.id
                            ? (isCassetteValid ? 'border-[#11b5a2]' : 'border-red-500 text-red-600')
                            : 'border-[#d5e2ea] focus:border-[#1378ac]'
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCassetteScan((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                      {cassetteData.id && (
                        <div className="space-y-2 animate-in fade-in duration-500">
                          <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-2">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cassette Active</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-lg bg-[#f8fbfd] border border-[#d5e2ea] p-2">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Lot Number</p>
                                <p className="text-[10px] font-black text-[#0b4867] mt-1">{cassetteData.lotNumber || "—"}</p>
                              </div>
                              <div className="rounded-lg bg-[#f8fbfd] border border-[#d5e2ea] p-2">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Serial Number</p>
                                <p className="text-[10px] font-black text-[#0b4867] mt-1">{cassetteData.serialNumber || "—"}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Doses H2O2 restantes</span>
                              <span className={`text-[10px] font-black ${isCassetteEmpty ? 'text-red-500' : 'text-[#11b5a2]'}`}>
                                {cassetteData.dosesRemaining}/5
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-700 ${isCassetteEmpty ? "bg-red-500" : "bg-[#11b5a2]"} ${doseConsumptionAnimating ? "animate-pulse" : ""}`}
                                style={{ width: `${Math.max(0, Math.min(100, (cassetteData.dosesRemaining / 5) * 100))}%` }}
                              />
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-slate-100 flex items-center justify-between gap-3">
                            <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${
                              isCassetteExpired ? "border-red-200 bg-red-50 text-red-600" : "border-[#bdece4] bg-[#eafaf7] text-[#0b786e]"
                            }`}>
                              Ouverte: {formatDateFr(cassetteData.insertionDate)} • Rebut: {discardDate ? discardDate.toLocaleDateString("fr-FR") : "—"}
                            </div>
                            <button
                              onClick={() => setShowDoseHistory((prev) => !prev)}
                              className="shrink-0 text-[8px] font-black uppercase tracking-widest text-[#1378ac] hover:text-[#0f6a98] transition-colors"
                            >
                              Voir historique des doses
                            </button>
                          </div>

                          {showDoseHistory && (
                            <div className="rounded-xl border border-[#d5e2ea] bg-[#f8fbfd] p-3 space-y-2">
                              {doseHistory
                                .filter((entry) => entry.cassetteId === cassetteData.id)
                                .slice(0, 4)
                                .map((entry) => (
                                  <div key={`${entry.cycleId}-${entry.usedAt}`} className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-slate-500">
                                    <span>{entry.cycleId}</span>
                                    <span>{new Date(entry.usedAt).toLocaleDateString("fr-FR")} -{entry.doseUsed} dose</span>
                                  </div>
                                ))}
                              {doseHistory.filter((entry) => entry.cassetteId === cassetteData.id).length === 0 && (
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Aucun historique pour cette cassette.</p>
                              )}
                            </div>
                          )}

                          {!isCassetteValid && (
                            <div className="p-2 bg-red-50 border border-red-100 rounded-lg text-center">
                              <p className="text-[7px] font-black text-red-600 uppercase tracking-widest">Cassette expirée ou vide. Démarrage cycle bloqué.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <StatusButton active={autoclaveStatus === 'ready'} onClick={() => setAutoclaveStatus(autoclaveStatus === 'ready' ? null : 'ready')} color="emerald" icon="✅" label="Prêt" />
                      <StatusButton active={autoclaveStatus === 'maintenance'} onClick={() => setAutoclaveStatus("maintenance")} color="orange" icon="🛠️" label="Maint." />
                    </div>

                    {autoclaveStatus === "ready" && (
                      <div className="rounded-2xl border border-[#d5e2ea] bg-[#f8fbfd] p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cycle Selection</p>
                            <h3 className="text-sm font-black text-[#0b4867] uppercase tracking-tight">Choix du cycle vapeur</h3>
                          </div>
                          {hasHighPrionRisk && (
                            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-red-600">
                              Prion Risk
                            </span>
                          )}
                        </div>

                        {hasHighPrionRisk && (
                          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
                            Prion risk detected: 134°C cycle mandatory.
                          </div>
                        )}

                        <div className="grid gap-3">
                          {steamCycleOptions.map((option) => {
                            const isSelected = selectedSteamCycle === option.id;
                            const isRecommended = recommendedSteamCycle === option.id;
                            const isDisabled = hasHighPrionRisk && option.id === "caoutchouc";
                            const showMaterialWarning = hasThermosensitiveLoad && option.id === "instruments" && !hasHighPrionRisk;

                            return (
                              <button
                                key={option.id}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => {
                                  setSelectedSteamCycle(option.id);
                                  setSteamCycleConfirmed(false);
                                }}
                                className={`w-full rounded-2xl border-2 p-5 text-left transition-all ${
                                  isDisabled
                                    ? "cursor-not-allowed border-red-200 bg-red-50 opacity-70"
                                    : isSelected
                                      ? "border-[#1378ac] bg-white shadow-lg shadow-[#1378ac]/10"
                                      : isRecommended
                                        ? "border-[#11b5a2] bg-white shadow-[0_0_0_4px_rgba(17,181,162,0.12)]"
                                        : "border-[#d5e2ea] bg-white hover:border-[#1378ac]/40"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-black uppercase tracking-tight text-[#0b4867]">{option.title}</span>
                                      {isRecommended && (
                                        <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-[#0b786e]">
                                          Recommended
                                        </span>
                                      )}
                                      {showMaterialWarning && (
                                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-amber-700">
                                          ! Matériaux sensibles
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{option.description}</p>
                                  </div>

                                  <div className="shrink-0 rounded-2xl bg-[#edf5f9] px-4 py-3 text-center border border-[#d5e2ea] min-w-[110px]">
                                    <p className="text-lg font-black text-[#1378ac] leading-none">{option.temp}</p>
                                    <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">{option.duration}</p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {hasThermosensitiveLoad && !hasHighPrionRisk && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-amber-700">
                            Thermosensitive or rubber/plastic load detected: prefer the 121°C cycle.
                          </div>
                        )}

                        <div className="rounded-xl border border-[#d5e2ea] bg-white p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Sélection active</span>
                            {steamCycleConfirmed && (
                              <span className="rounded-full border border-[#bdece4] bg-[#eafaf7] px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-[#0b786e]">
                                Confirmed
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-black text-[#0b4867]">
                            {selectedSteamCycleOption ? `${selectedSteamCycleOption.title} • ${selectedSteamCycleOption.temp} / ${selectedSteamCycleOption.duration}` : "Aucun cycle sélectionné"}
                          </p>
                          <button
                            type="button"
                            onClick={confirmSteamCycleSelection}
                            disabled={!selectedSteamCycle || autoclaveStatus !== "ready" || !agentBadge.id}
                            className={`w-full rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                              selectedSteamCycle && autoclaveStatus === "ready" && agentBadge.id
                                ? "bg-[#1378ac] text-white hover:bg-[#0f6a98]"
                                : "bg-slate-100 text-slate-300 cursor-not-allowed"
                            }`}
                          >
                            Confirmer le cycle avant chargement
                          </button>
                          {!agentBadge.id && (
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                              Scanner le badge opérateur pour journaliser la sélection du cycle.
                            </p>
                          )}
                        </div>

                        <div className="rounded-xl border border-[#d5e2ea] bg-white p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Tracking</p>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#1378ac]">Historique cycle</span>
                          </div>
                          <div className="space-y-2">
                            {steamCycleLogs.slice(0, 4).map((entry) => (
                              <div key={`${entry.timestamp}-${entry.cycleType}`} className="rounded-lg bg-[#f8fbfd] border border-slate-100 px-3 py-2 flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-[#0b4867]">{entry.label}</p>
                                  <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{entry.targetTemp} • {entry.targetTime}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-500">{entry.agentId}</p>
                                  <p className="text-[8px] font-bold text-slate-400">{new Date(entry.timestamp).toLocaleString("fr-FR")}</p>
                                </div>
                              </div>
                            ))}
                            {steamCycleLogs.length === 0 && (
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Aucune sélection de cycle enregistrée.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DashboardSection>
          </>
        ) : (
          <>
            <DashboardSection 
              title="Conformité" 
              scanned={Object.values(checks).every(v => v)} 
              icon="📋" 
              waitingText="Vérification" 
              forceShow
              onEdit={() => setChecks({ passage: false, physico: false, siccite: false, integrite: false })}
            >
              <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                  <CheckItem label="Indicateurs passage" checked={checks.passage} onClick={() => setChecks({...checks, passage: !checks.passage})} />
                  <CheckItem label="Physico-chimiques" checked={checks.physico} onClick={() => setChecks({...checks, physico: !checks.physico})} />
                  <CheckItem label="Siccité emballage" checked={checks.siccite} onClick={() => setChecks({...checks, siccite: !checks.siccite})} />
                  <CheckItem label="Intégrité condit." checked={checks.integrite} onClick={() => setChecks({...checks, integrite: !checks.integrite})} />
                </div>
              </div>
            </DashboardSection>

            <DashboardSection 
              title="Libération" 
              scanned={sortieScannedItems.length > 0} 
              icon="📦" 
              waitingText="Scan sortie"
              onEdit={() => setSortieScannedItems([])}
            >
              <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="flex flex-wrap gap-2">
                    {sortieScannedItems.map((item, i) => (
                      <div key={i} className="group relative rounded-xl border border-[#bdece4] bg-[#eafaf7] px-3 py-2 text-[10px] font-semibold text-[#0b786e] shadow-sm">
                        {item}
                        <button 
                          onClick={() => setSortieScannedItems(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {sortieScannedItems.length > 0 && (
                  <div className="shrink-0 rounded-xl bg-[#11b5a2] p-3 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-md">
                    Charge liée au Cycle N°2026-001
                  </div>
                )}
              </div>
            </DashboardSection>
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="relative shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#d5e2ea] shadow-lg mt-auto gap-4">
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
          onClick={handlePrimaryAction}
          disabled={isCriticalError || (phase === 1 ? !isPhase1Complete : !isPhase2Complete)}
          className={`group relative flex items-center gap-3 rounded-xl px-12 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] transition-all duration-300 shadow-xl ${
            isCriticalError
              ? "bg-red-500 text-white cursor-not-allowed opacity-80"
              : (phase === 1 ? isPhase1Complete : isPhase2Complete)
                ? "bg-[#1378ac] text-white hover:bg-[#0f6a98] hover:-translate-y-0.5 active:scale-95"
                : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200 shadow-none"
          }`}
        >
          {isCriticalError ? (
            <AlertCircle className="w-4 h-4 animate-pulse" />
          ) : (phase === 1 ? isPhase1Complete : isPhase2Complete) && (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {isCriticalError 
            ? "Machine Erreur Critique" 
            : (phase === 1
              ? (sterilizationType === "basse_temp" ? "Start Cycle" : "Load Machine")
              : "Valider le cycle")}
        </button>
        {doseConsumptionAnimating && (
          <div className="absolute right-8 -top-6 rounded-full bg-[#0b4867] px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#8de7da] animate-in fade-in zoom-in duration-500">
            Dose consommée -1
          </div>
        )}
      </div>

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
              Êtes-vous sûr de vouloir effacer toutes les données pour ce cycle de stérilisation ?
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
    </div>
  );
}

function DashboardSection({ title, scanned, icon, waitingText, children, forceShow, onEdit }: DashboardSectionProps & { onEdit?: () => void }) {
  return (
    <section className={`flex flex-col rounded-3xl border bg-white/95 p-5 shadow-sm transition-all duration-500 overflow-hidden ${scanned ? 'border-[#11b5a2] ring-4 ring-[#eafaf7]' : 'border-[#d5e2ea]'}`}>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-sm font-semibold tracking-tight text-[#0b4867]">{title}</h2>
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
          {scanned && <span className="rounded-lg bg-[#eafaf7] px-2 py-0.5 text-[9px] font-semibold uppercase text-[#0b786e]">✓</span>}
        </div>
      </div>
      
      {!scanned && !forceShow ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400 p-4">
          <div className="text-3xl opacity-50">{icon}</div>
          <p className="font-bold text-[9px] uppercase tracking-widest text-center">{waitingText}</p>
        </div>
      ) : children}
    </section>
  );
}

function DataCard({ label, value, color }: DataCardProps) {
  const styles = color === 'purple' 
    ? { bg: 'bg-[#edf5f9]', text: 'text-[#1378ac]', border: 'border-[#b8cad6]' }
    : { bg: 'bg-[#eafaf7]', text: 'text-[#0b786e]', border: 'border-[#bdece4]' };
  
  return (
    <div className={`rounded-2xl border p-4 shrink-0 ${styles.bg} ${styles.border}`}>
      <p className={`mb-1 text-[8px] font-semibold uppercase tracking-[0.24em] ${styles.text}`}>{label}</p>
      <p className="text-lg font-semibold tracking-tight text-[#0b4867]">{value}</p>
    </div>
  );
}

function StatusButton({ active, onClick, icon, label, color }: StatusButtonProps) {
  const activeClass = color === 'emerald' ? 'border-[#11b5a2] bg-[#11b5a2] text-white shadow-md scale-105' : 'border-[#0b4867] bg-[#0b4867] text-white shadow-md scale-105';
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition-all ${active ? activeClass : 'border-[#d5e2ea] bg-white text-slate-400'}`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-center text-[8px] font-bold uppercase tracking-[0.18em]">{label}</span>
    </button>
  );
}

function TopOperatorPanel({ title, subtitle, confirmed, waitingText, name, role, onChangeUser }: TopOperatorPanelProps) {
  return (
    <section className={`rounded-3xl border bg-white/95 p-4 shadow-sm transition-all duration-500 ${confirmed ? "border-[#11b5a2] ring-4 ring-[#eafaf7]" : "border-[#d5e2ea]"}`}>
      <div className="flex items-center justify-between shrink-0 mb-2">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1378ac] text-[10px] font-semibold text-white shadow-md">03</span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-[#0b4867] truncate">{title}</h2>
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">{subtitle}</p>
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
        <div className="h-[55px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d5e2ea] bg-[#f8fbfd] text-slate-400 p-2 gap-1">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] mb-1">{waitingText.replaceAll(" ", "_").toUpperCase()}</p>
          <input 
            type="password"
            placeholder="BADGE ID"
            className="w-full bg-white border border-[#d5e2ea] rounded-lg py-1.5 px-3 text-[10px] text-center font-black tracking-widest focus:border-[#1378ac] outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Simulation of scan
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
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

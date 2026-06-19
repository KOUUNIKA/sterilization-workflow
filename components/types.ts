export type WorkflowZone = 
  | "zone-sale"
  | "zone-propre"
  | "zone-sterile"
  | "liaison"
  | "inventory"
  | "maintenance"
  | "edition"
  | "dashboard";

export type ModuleType = 
  | "qualification" 
  | "predesinfection" 
  | "sterilization-reception"
  | "lavage-chargement" 
  | "lavage-sortie" 
  | "recomposition" 
  | "sterilization-chargement" 
  | "sterilization-sortie" 
  | "storage-distribution" 
  | "inventory"
  | "maintenance" 
  | "edition" 
  | null;

export const WORKFLOW_SEQUENCE: ModuleType[] = [
  "qualification",
  "predesinfection",
  "sterilization-reception",
  "lavage-chargement",
  "lavage-sortie",
  "recomposition",
  "sterilization-chargement",
  "sterilization-sortie",
  "storage-distribution",
];

export const MODULE_LABELS: Record<string, string> = {
  "qualification": "Tests de contrôle",
  "predesinfection": "Prédésinfection",
  "sterilization-reception": "Réception",
  "lavage-chargement": "Nettoyage (Entrée)",
  "lavage-sortie": "Nettoyage (Sortie)",
  "recomposition": "Conditionnement",
  "sterilization-chargement": "Stérilisation (Entrée)",
  "sterilization-sortie": "Stérilisation (Sortie)",
  "storage-distribution": "Stockage & Distribution",
};

export const MODULE_ZONES: Record<string, WorkflowZone> = {
  "qualification": "dashboard",
  "predesinfection": "zone-sale",
  "sterilization-reception": "zone-sale",
  "lavage-chargement": "zone-sale",
  "lavage-sortie": "zone-propre",
  "recomposition": "zone-propre",
  "sterilization-chargement": "zone-propre",
  "sterilization-sortie": "zone-sterile",
  "storage-distribution": "zone-sterile",
};

export const ZONE_INFO: Record<WorkflowZone, { label: string, icon: string, color: string }> = {
  "zone-sale": { label: "Zone Sale", icon: "🧼", color: "text-orange-500 bg-orange-50 border-orange-100" },
  "zone-propre": { label: "Zone Propre", icon: "✨", color: "text-[#1378ac] bg-[#edf5f9] border-[#d5e2ea]" },
  "zone-sterile": { label: "Zone Stérile", icon: "🛡️", color: "text-[#11b5a2] bg-[#eafaf7] border-[#bdece4]" },
  "liaison": { label: "Liaison Patient", icon: "🔗", color: "text-purple-500 bg-purple-50 border-purple-100" },
  "inventory": { label: "Inventaire", icon: "📦", color: "text-slate-500 bg-slate-50 border-slate-200" },
  "maintenance": { label: "Maintenance", icon: "🛠️", color: "text-slate-500 bg-slate-50 border-slate-200" },
  "edition": { label: "Édition", icon: "📄", color: "text-slate-500 bg-slate-50 border-slate-200" },
  "dashboard": { label: "Dashboard", icon: "📊", color: "text-slate-500 bg-slate-50 border-slate-200" },
};

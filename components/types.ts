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
  | "lavage" 
  | "recomposition" 
  | "sterilization" 
  | "storage-distribution" 
  | "patient-liaison" 
  | "inventory" 
  | "maintenance" 
  | "edition" 
  | null;

export const WORKFLOW_SEQUENCE: ModuleType[] = [
  "qualification",
  "predesinfection",
  "lavage",
  "recomposition",
  "sterilization",
  "storage-distribution",
  "patient-liaison"
];

export const MODULE_LABELS: Record<string, string> = {
  "qualification": "Qualification",
  "predesinfection": "Prédésinfection",
  "lavage": "Lavage",
  "recomposition": "Recomposition",
  "sterilization": "Stérilisation",
  "storage-distribution": "Stockage & Distribution",
  "patient-liaison": "Liaison Patient",
};

export const MODULE_ZONES: Record<string, WorkflowZone> = {
  "qualification": "dashboard",
  "predesinfection": "zone-sale",
  "lavage": "zone-sale",
  "recomposition": "zone-propre",
  "sterilization": "zone-propre",
  "storage-distribution": "zone-sterile",
  "patient-liaison": "liaison",
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

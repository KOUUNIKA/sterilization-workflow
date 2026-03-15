"use client";

import React from "react";

export type WorkflowZone = 
  | "zone-sale"
  | "zone-propre"
  | "zone-sterile"
  | "liaison"
  | "maintenance"
  | "edition"
  | "dashboard";

interface SidebarProps {
  currentZone: WorkflowZone;
  onZoneChange?: (zone: WorkflowZone) => void;
}

const sidebarItems = [
  { id: "dashboard", label: "Tableau de bord", icon: "📊" },
  { id: "zone-sale", label: "Zone sale", icon: "🧼" },
  { id: "zone-propre", label: "Zone propre", icon: "✨" },
  { id: "zone-sterile", label: "Zone stérile", icon: "🛡️" },
  { id: "liaison", label: "Liaison Patient", icon: "🔗" },
  { id: "maintenance", label: "Gestion de maintenance", icon: "🛠️" },
  { id: "edition", label: "Edition", icon: "📄" },
];

export function Sidebar({ currentZone, onZoneChange }: SidebarProps) {
  return (
    <aside className="w-[280px] h-full bg-[#f4f8fb] border-r border-[#d5e2ea] flex flex-col overflow-y-auto shrink-0 font-app">
      <div className="flex flex-col py-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onZoneChange?.(item.id as WorkflowZone)}
            className={`flex items-center gap-4 px-6 py-4 text-[13px] font-semibold transition-all group relative border-b border-[#d5e2ea]/40 ${
              currentZone === item.id
                ? "bg-white text-[#1378ac] shadow-[inset_4px_0_0_#1378ac]"
                : "text-slate-600 hover:bg-white hover:text-[#1378ac] hover:shadow-[inset_4px_0_0_#1378ac/30]"
            }`}
          >
            <span className={`text-xl transition-transform group-hover:scale-110 flex items-center justify-center w-6 ${currentZone === item.id ? "opacity-100" : "opacity-50"}`}>
              {item.icon}
            </span>
            <span className="truncate tracking-wide">{item.label}</span>
            {currentZone === item.id && (
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#1378ac] mr-4" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-auto p-6 space-y-4">
        <div className="p-4 rounded-2xl bg-[#edf5f9] border border-[#d5e2ea]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Agent connecté</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#11b5a2]" />
            <span className="text-xs font-bold text-[#0b4867]">Amina Benali</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

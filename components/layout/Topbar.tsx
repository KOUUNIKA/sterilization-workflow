"use client";

import React from "react";
import { Settings, LayoutDashboard, Package, History, LogOut, ChevronDown } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { MODULE_ZONES, ZONE_INFO } from "../types";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/inventory": "Inventaire & Catalogue",
  "/history": "Historique",
  "/qualification": "Tests de contrôle",
  "/predesinfection": "Prédésinfection",
  "/sterilization-reception": "Réception",
  "/lavage-chargement": "Nettoyage (Entrée)",
  "/lavage-sortie": "Nettoyage (Sortie)",
  "/recomposition": "Conditionnement",
  "/sterilization-chargement": "Stérilisation (Entrée)",
  "/sterilization-sortie": "Stérilisation (Sortie)",
  "/storage-distribution": "Stockage & Distribution",
  "/patient-liaison": "Liaison Patient",
  "/maintenance": "Maintenance",
};

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { path: "/inventory", label: "Catalogue", icon: <Package className="w-4 h-4" /> },
  { path: "/history", label: "Historique", icon: <History className="w-4 h-4" /> },
];

export function Topbar() {
  const location = useLocation();
  const currentTitle = ROUTE_LABELS[location.pathname] || "Poste Opérationnel";
  
  const currentPath = location.pathname.substring(1);
  const currentZone = MODULE_ZONES[currentPath] || "dashboard";
  const zone = ZONE_INFO[currentZone];

  return (
    <header className="h-[80px] bg-[#0b4867] flex items-center justify-between px-8 text-white shrink-0 shadow-lg z-20 relative">
      {/* Brand & Context */}
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-white/10 p-2.5 rounded-xl border border-white/20 group-hover:bg-[#1378ac] transition-all">
            <span className="text-xl">🛡️</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8de7da]">Modoock Health</p>
            <p className="text-[11px] font-bold text-white/60">Sterilization Suite</p>
          </div>
        </Link>
        
        <div className="h-10 w-px bg-white/10 mx-2" />
        
        <div className="bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm shadow-inner transition-colors ${zone.color.split(' ')[1]} ${zone.color.split(' ')[0]}`}>
            {zone.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#8de7da] leading-tight mb-0.5">{zone.label}</span>
            <span className="text-xs font-black uppercase tracking-wider">{currentTitle}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation (Horizontal) */}
      <nav className="hidden xl:flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/10 gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isActive 
                  ? 'bg-[#1378ac] text-white shadow-lg shadow-[#1378ac]/20' 
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-white uppercase tracking-wider">Amina Benali</p>
            <p className="text-[9px] text-[#8de7da] font-black uppercase tracking-[0.1em]">Agent Qualité</p>
          </div>
          <div className="relative group cursor-pointer">
            <div className="h-11 w-11 rounded-2xl bg-[#1378ac] flex items-center justify-center text-sm font-black border-2 border-white/20 shadow-xl group-hover:scale-105 transition-transform">
              AB
            </div>
            {/* Simple dropdown indicator */}
            <div className="absolute -bottom-1 -right-1 bg-[#11b5a2] h-4 w-4 rounded-lg flex items-center justify-center border-2 border-[#0b4867]">
              <ChevronDown className="w-2.5 h-2.5 text-white" />
            </div>
            
            {/* Mini Dropdown on hover */}
            <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-[#d5e2ea] opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-50 overflow-hidden">
              <Link to="/maintenance" className="flex items-center gap-3 px-5 py-4 text-[10px] font-black text-slate-400 hover:text-[#1378ac] hover:bg-slate-50 transition-colors uppercase tracking-widest border-b border-slate-50">
                <Settings className="w-4 h-4" /> Paramètres
              </Link>
              <Link to="/login" className="flex items-center gap-3 px-5 py-4 text-[10px] font-black text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest">
                <LogOut className="w-4 h-4" /> Déconnexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

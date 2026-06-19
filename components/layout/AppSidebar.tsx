"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, useLogout } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  History,
  ShieldCheck,
  FlaskConical,
  ArrowDownToLine,
  Waves,
  Layers,
  Flame,
  Archive,
  Settings,
  LogOut,
  Cross,
} from "lucide-react";

const GENERAL_NAV = [
  { path: "/dashboard", label: "Tableau de bord", Icon: LayoutDashboard },
  { path: "/inventory", label: "Inventaire & Catalogue", Icon: Package },
  { path: "/history", label: "Historique", Icon: History },
];

const WORKFLOW_NAV = [
  { path: "/qualification",            label: "Tests de contrôle",  Icon: ShieldCheck,    extra: [] },
  { path: "/predesinfection",          label: "Prédésinfection",    Icon: FlaskConical,   extra: [] },
  { path: "/sterilization-reception",  label: "Réception",          Icon: ArrowDownToLine,extra: [] },
  { path: "/lavage-chargement",        label: "Nettoyage",          Icon: Waves,          extra: ["/lavage-sortie"] },
  { path: "/recomposition",            label: "Conditionnement",    Icon: Layers,         extra: [] },
  { path: "/sterilization-chargement", label: "Stérilisation",      Icon: Flame,          extra: ["/sterilization-sortie"] },
  { path: "/storage-distribution",     label: "Stockage",           Icon: Archive,        extra: [] },
];

function NavItem({
  path,
  label,
  Icon,
  activePaths,
}: {
  path: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  activePaths?: string[];
}) {
  const location = useLocation();
  const isActive =
    location.pathname === path ||
    (activePaths ?? []).includes(location.pathname);

  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-white/10 text-white"
          : "text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export function AppSidebar() {
  const { user } = useAuth();
  const logout = useLogout();
  const displayName = user?.name ?? "—";
  const displayRole = user?.role ?? "";
  const initials = user?.initials ?? "—";

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-primary h-screen overflow-y-auto border-r border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Cross className="size-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-none truncate">
              Modoock Health
            </p>
            <p className="text-[10px] text-white/50 leading-none mt-0.5">
              Stérilisation Suite
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-5">
        <div>
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-3 mb-1.5">
            Vue générale
          </p>
          <div className="space-y-0.5">
            {GENERAL_NAV.map(({ path, label, Icon }) => (
              <NavItem key={path} path={path} label={label} Icon={Icon} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-3 mb-1.5">
            Workflow
          </p>
          <div className="space-y-0.5">
            {WORKFLOW_NAV.map(({ path, label, Icon, extra }) => (
              <NavItem key={path} path={path} label={label} Icon={Icon} activePaths={extra} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="size-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-xs font-semibold text-white shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white leading-none truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-white/50 leading-none mt-0.5">
              {displayRole}
            </p>
          </div>
        </div>
        <Link
          to="/maintenance"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Settings className="size-4" />
          <span>Paramètres</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="size-4" />
          <span>Déconnecter</span>
        </button>
      </div>
    </aside>
  );
}

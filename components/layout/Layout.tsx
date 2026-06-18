"use client";

import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Topbar } from "./Topbar";
import { WorkflowFooter } from "./WorkflowFooter";
import { WORKFLOW_SEQUENCE } from "../types";
import { WorkflowNotesPanel } from "./WorkflowNotesPanel";

export function Layout() {
  const location = useLocation();
  const currentPath = location.pathname.substring(1);
  const isWorkflow = WORKFLOW_SEQUENCE.includes(currentPath as any);

  return (
    <div className="h-screen w-screen flex bg-[#f4f8fb] font-app overflow-hidden selection:bg-[#1378ac]/10 flex-col">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className={`flex-1 overflow-hidden relative flex flex-col p-6 transition-all duration-500 ${isWorkflow ? 'pb-[120px]' : ''}`}>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {isWorkflow ? <WorkflowNotesPanel moduleKey={currentPath} /> : null}
            <Outlet />
          </div>
          
          {!isWorkflow && (
            <footer className="shrink-0 flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-md border-t border-[#d5e2ea] rounded-[2rem] mt-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
              <div>
                Centre de stérilisation • Suite Opérationnelle
              </div>
              <div className="text-[#1378ac] font-black">
                v2.5.0 • Mise à jour Mars 2026
              </div>
            </footer>
          )}
        </main>
      </div>
      <WorkflowFooter />
    </div>
  );
}

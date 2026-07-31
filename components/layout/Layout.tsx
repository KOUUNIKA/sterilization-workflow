"use client";

import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { WorkflowFooter } from "./WorkflowFooter";
import { WORKFLOW_SEQUENCE } from "../types";
import { WorkflowNotesPanel } from "./WorkflowNotesPanel";
import { FooterActionsProvider } from "@/contexts/FooterActionsContext";

export function Layout() {
  const location = useLocation();
  const currentPath = location.pathname.substring(1);
  const isWorkflow = WORKFLOW_SEQUENCE.includes(currentPath as any);

  return (
    <FooterActionsProvider>
    <div className="h-screen flex overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-muted custom-scrollbar">
          {isWorkflow ? <WorkflowNotesPanel moduleKey={currentPath} /> : null}
          <div className="p-6">
            <Outlet />
          </div>
        </main>

        <WorkflowFooter />
      </div>
    </div>
    </FooterActionsProvider>
  );
}

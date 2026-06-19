"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type FooterOverride = {
  submitLabel: string;
  submittingLabel: string;
  doneLabel: string;
  onSubmit: () => Promise<void>;
  isReady: boolean;
  isSubmitting: boolean;
  isDone: boolean;
  onReset?: () => void;
  saveError?: string | null;
};

type FooterActionsCtxValue = {
  override: FooterOverride | null;
  setOverride: (o: FooterOverride | null) => void;
};

const FooterActionsContext = createContext<FooterActionsCtxValue>({
  override: null,
  setOverride: () => {},
});

export function FooterActionsProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<FooterOverride | null>(null);
  return (
    <FooterActionsContext.Provider value={{ override, setOverride }}>
      {children}
    </FooterActionsContext.Provider>
  );
}

export const useFooterActions = () => useContext(FooterActionsContext);

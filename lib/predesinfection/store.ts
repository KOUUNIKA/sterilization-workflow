"use client";

import { create } from "zustand";
import type {
  Operator,
  PredesinfectionState,
  ScannedItem,
  WashParams,
} from "./types";

type ZoneSale = { code: string; ts: string };
type BatchDecision = { decision: "validated" | "rejected"; reason?: string; ts: string };

const nowIso = () => new Date().toISOString();

function classifyScannedCode(code: string): ScannedItem["kind"] {
  const normalized = code.trim().toUpperCase();
  if (normalized.startsWith("C-") || normalized.startsWith("CONT-")) return "container";
  if (normalized.startsWith("I-") || normalized.startsWith("INST-")) return "instrument";
  return "unknown";
}

function resolveOperator(badgeCode: string): Operator {
  const normalized = badgeCode.trim().toUpperCase();
  const directory: Record<string, Pick<Operator, "name" | "role">> = {
    "BADGE-001": { name: "A. Operator", role: "Pré-désinfection" },
    "BADGE-002": { name: "B. Operator", role: "Lavage" },
    "BADGE-003": { name: "C. Operator", role: "Superviseur" },
  };
  const match = directory[normalized];
  if (match) return { badgeCode: normalized, ...match };
  return { badgeCode: normalized, name: "Opérateur inconnu", role: "—" };
}

export type PredesinfectionStore = {
  state: PredesinfectionState;
  bloc?: string;
  zoneSale?: ZoneSale;
  items: ScannedItem[];
  washParams: WashParams;
  batchDecision?: BatchDecision;
  operator?: Operator;

  setState: (next: PredesinfectionState) => void;
  selectBloc: (bloc: string) => void;
  scanZoneSale: (code: string) => void;
  scanItem: (code: string) => void;
  setWashParam: (key: keyof WashParams, value: string) => void;
  decideBatch: (decision: BatchDecision["decision"], reason?: string) => void;
  scanOperatorBadge: (badgeCode: string) => void;
  reset: () => void;
};

export const usePredesinfectionStore = create<PredesinfectionStore>((set) => ({
  state: "selectBloc",
  bloc: undefined,
  zoneSale: undefined,
  items: [],
  washParams: {},
  batchDecision: undefined,
  operator: undefined,

  setState: (next) => set({ state: next }),

  selectBloc: (bloc) =>
    set({
      bloc,
      state: "scanZoneSale",
    }),

  scanZoneSale: (code) =>
    set({
      zoneSale: { code: code.trim(), ts: nowIso() },
      state: "scanContainerOrInstrument",
    }),

  scanItem: (code) =>
    set((s) => ({
      items: [
        { code: code.trim(), ts: nowIso(), kind: classifyScannedCode(code) },
        ...s.items,
      ],
    })),

  setWashParam: (key, value) =>
    set((s) => ({
      washParams: { ...s.washParams, [key]: value },
    })),

  decideBatch: (decision, reason) =>
    set({
      batchDecision: { decision, reason: reason?.trim() || undefined, ts: nowIso() },
      state: decision === "validated" ? "scanOperatorBadge" : "validateOrRejectBatch",
    }),

  scanOperatorBadge: (badgeCode) =>
    set({
      operator: resolveOperator(badgeCode),
      state: "completePredesinfection",
    }),

  reset: () =>
    set({
      state: "selectBloc",
      bloc: undefined,
      zoneSale: undefined,
      items: [],
      washParams: {},
      batchDecision: undefined,
      operator: undefined,
    }),
}));


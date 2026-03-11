export type PredesinfectionState =
  | "selectBloc"
  | "scanZoneSale"
  | "scanContainerOrInstrument"
  | "configureWashParams"
  | "validateOrRejectBatch"
  | "scanOperatorBadge"
  | "completePredesinfection";

export type EventType =
  | "bloc_selected"
  | "zone_scanned"
  | "item_scanned"
  | "wash_param_set"
  | "batch_decision"
  | "operator_scanned"
  | "state_changed";

export type EventRecord = {
  id: string;
  ts: string; // ISO
  type: EventType;
  payload: Record<string, unknown>;
};

export type WashParams = {
  detergent?: string;
  dilution?: string;
  dosage?: string;
  waterVolume?: string;
};

export type ScannedItem = {
  code: string;
  ts: string; // ISO
  kind: "container" | "instrument" | "unknown";
};

export type Operator = {
  badgeCode: string;
  name: string;
  role: string;
};


export type ReceptionSource =
  | "service-bloc"
  | "stock-sterile"
  | "externe";

export type ReceptionRecord = {
  source: ReceptionSource;
  trayId: string;
  transportId: string;
  agentId: string;
  preDisinfectionStatus: boolean;
  cycleId?: string;
  timestamp: string;
};

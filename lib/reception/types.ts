export type ReceptionSource =
  | "service-bloc"
  | "stock-sterile"
  | "externe";

export type ReceptionRecord = {
  source: ReceptionSource;
  tray_id: string;
  transport_id: string;
  agent_id: string;
  pre_disinfection_status: boolean;
  timestamp: string;
};

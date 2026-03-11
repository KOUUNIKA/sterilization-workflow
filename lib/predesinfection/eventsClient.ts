"use client";

import type { EventRecord } from "./types";

const uuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function makeEvent(
  type: EventRecord["type"],
  payload: EventRecord["payload"],
): EventRecord {
  return { id: uuid(), ts: new Date().toISOString(), type, payload };
}

export async function appendEvent(cycleId: string, event: EventRecord) {
  await fetch(`/api/cycles/${encodeURIComponent(cycleId)}/events`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
  });
}


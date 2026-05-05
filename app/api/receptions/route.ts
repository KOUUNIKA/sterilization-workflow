import { NextResponse } from "next/server";
import type { ReceptionRecord, ReceptionSource } from "@/lib/reception/types";
import { promises as fs } from "fs";
import path from "path";

const VALID_SOURCES: ReceptionSource[] = [
  "service-bloc",
  "stock-sterile",
  "externe",
];

function receptionsDir() {
  return path.join(process.cwd(), "data", "receptions");
}

function receptionsFile() {
  return path.join(receptionsDir(), "sterilization-reception.jsonl");
}

async function ensureDir() {
  await fs.mkdir(receptionsDir(), { recursive: true });
}

function isValidReceptionRecord(body: unknown): body is ReceptionRecord {
  if (!body || typeof body !== "object") return false;

  const record = body as Partial<ReceptionRecord>;

  return (
    typeof record.source === "string" &&
    VALID_SOURCES.includes(record.source as ReceptionSource) &&
    typeof record.tray_id === "string" &&
    record.tray_id.trim().length > 0 &&
    typeof record.transport_id === "string" &&
    record.transport_id.trim().length > 0 &&
    typeof record.agent_id === "string" &&
    record.agent_id.trim().length > 0 &&
    typeof record.pre_disinfection_status === "boolean" &&
    typeof record.timestamp === "string" &&
    !Number.isNaN(Date.parse(record.timestamp))
  );
}

export async function GET() {
  await ensureDir();

  try {
    const raw = await fs.readFile(receptionsFile(), "utf8");
    const rows = raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as ReceptionRecord;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({ receptions: rows });
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "ENOENT") {
      return NextResponse.json({ receptions: [] });
    }

    return NextResponse.json({ error: "Failed to read receptions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as unknown;

  if (!isValidReceptionRecord(body)) {
    return NextResponse.json({ error: "Invalid reception payload" }, { status: 400 });
  }

  await ensureDir();
  await fs.appendFile(receptionsFile(), `${JSON.stringify(body)}\n`, "utf8");

  return NextResponse.json({ ok: true });
}

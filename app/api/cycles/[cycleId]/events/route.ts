import { NextResponse } from "next/server";
import type { EventRecord } from "@/lib/predesinfection/types";
import { promises as fs } from "fs";
import path from "path";

function eventsDir() {
  return path.join(process.cwd(), "data", "events");
}

function eventsFile(cycleId: string) {
  const safe = cycleId.replaceAll(/[^a-zA-Z0-9._-]/g, "_");
  return path.join(eventsDir(), `${safe}.jsonl`);
}

async function ensureDir() {
  await fs.mkdir(eventsDir(), { recursive: true });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cycleId: string }> },
) {
  const { cycleId } = await params;
  await ensureDir();
  const file = eventsFile(cycleId);

  try {
    const txt = await fs.readFile(file, "utf8");
    const lines = txt.split(/\r?\n/).filter(Boolean);
    const events = lines
      .map((l) => {
        try {
          return JSON.parse(l) as EventRecord;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    return NextResponse.json({ cycleId, events });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as any).code === "ENOENT") {
      return NextResponse.json({ cycleId, events: [] });
    }
    return NextResponse.json({ error: "Failed to read events" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ cycleId: string }> },
) {
  const { cycleId } = await params;
  const body = (await req.json()) as EventRecord;

  if (!body || typeof body !== "object" || typeof body.id !== "string") {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  await ensureDir();
  const file = eventsFile(cycleId);
  await fs.appendFile(file, `${JSON.stringify(body)}\n`, "utf8");
  return NextResponse.json({ ok: true });
}


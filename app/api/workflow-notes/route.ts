import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type WorkflowNoteRecord = {
  moduleKey: string;
  note: string;
  updatedAt: string;
};

function notesDir() {
  return path.join(process.cwd(), "data", "workflow-notes");
}

function notesFile() {
  return path.join(notesDir(), "notes.json");
}

async function ensureDir() {
  await fs.mkdir(notesDir(), { recursive: true });
}

async function readNotes(): Promise<Record<string, WorkflowNoteRecord>> {
  await ensureDir();

  try {
    const raw = await fs.readFile(notesFile(), "utf8");
    return JSON.parse(raw) as Record<string, WorkflowNoteRecord>;
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

function isValidBody(body: unknown): body is { moduleKey: string; note: string } {
  if (!body || typeof body !== "object") return false;

  const candidate = body as Partial<{ moduleKey: string; note: string }>;
  return typeof candidate.moduleKey === "string" && candidate.moduleKey.trim().length > 0 && typeof candidate.note === "string";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const moduleKey = url.searchParams.get("moduleKey");

  if (!moduleKey) {
    return NextResponse.json({ error: "Missing moduleKey" }, { status: 400 });
  }

  try {
    const notes = await readNotes();
    return NextResponse.json({ note: notes[moduleKey] ?? null });
  } catch {
    return NextResponse.json({ error: "Failed to read workflow notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as unknown;

  if (!isValidBody(body)) {
    return NextResponse.json({ error: "Invalid note payload" }, { status: 400 });
  }

  try {
    const notes = await readNotes();
    const nextRecord: WorkflowNoteRecord = {
      moduleKey: body.moduleKey,
      note: body.note.trim(),
      updatedAt: new Date().toISOString(),
    };

    const nextNotes = {
      ...notes,
      [body.moduleKey]: nextRecord,
    };

    await fs.writeFile(notesFile(), JSON.stringify(nextNotes, null, 2), "utf8");

    return NextResponse.json({ note: nextRecord });
  } catch {
    return NextResponse.json({ error: "Failed to save workflow note" }, { status: 500 });
  }
}

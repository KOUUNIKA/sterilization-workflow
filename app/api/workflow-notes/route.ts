import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { resolveOperator } from "@/lib/resolveOperator"

function isValidBody(body: unknown): body is { moduleKey: string; note: string; badgeCode?: string } {
  if (!body || typeof body !== "object") return false
  const b = body as Partial<{ moduleKey: string; note: string; badgeCode?: string }>
  return typeof b.moduleKey === "string" && b.moduleKey.trim().length > 0 && typeof b.note === "string"
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const moduleKey = params.get("moduleKey")
  if (!moduleKey) return NextResponse.json({ error: "Missing moduleKey" }, { status: 400 })

  if (params.get("history") === "true") {
    const records = await prisma.workflowNote.findMany({
      where: { moduleKey },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true, badgeCode: true } } },
    })
    return NextResponse.json({
      history: records.map((r) => ({
        id: r.id,
        moduleKey: r.moduleKey,
        note: r.content,
        author: r.author.name,
        badgeCode: r.author.badgeCode,
        createdAt: r.createdAt,
      })),
    })
  }

  const record = await prisma.workflowNote.findFirst({
    where: { moduleKey },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  })

  return NextResponse.json({
    note: record
      ? { moduleKey: record.moduleKey, note: record.content, author: record.author.name, updatedAt: record.createdAt }
      : null,
  })
}

export async function POST(req: Request) {
  const body = (await req.json()) as unknown
  if (!isValidBody(body)) return NextResponse.json({ error: "Invalid note payload" }, { status: 400 })

  const authorId = await resolveOperator(body.badgeCode)
  const record = await prisma.workflowNote.create({
    data: { moduleKey: body.moduleKey, content: body.note.trim(), authorId },
    include: { author: { select: { name: true } } },
  })

  return NextResponse.json({
    note: { moduleKey: record.moduleKey, note: record.content, author: record.author.name, updatedAt: record.createdAt },
  })
}

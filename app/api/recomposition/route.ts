import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { resolveOperator } from "@/lib/resolveOperator"

type ItemPayload = {
  id: string
  name: string
  category: string
  rackLocation: string
  status: string
  justification?: string | null
}

type RecompositionPayload = {
  trayId: string
  packagingProtocol: string
  operatorBadge?: string
  instruments: ItemPayload[]
}

function isValid(body: unknown): body is RecompositionPayload {
  if (!body || typeof body !== "object") return false
  const b = body as Partial<RecompositionPayload>
  return (
    typeof b.trayId === "string" && b.trayId.trim().length > 0 &&
    typeof b.packagingProtocol === "string" && b.packagingProtocol.trim().length > 0 &&
    Array.isArray(b.instruments) && b.instruments.length > 0
  )
}

export async function POST(req: Request) {
  const body = (await req.json()) as unknown
  if (!isValid(body)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const [operatorId, tray] = await Promise.all([
    resolveOperator(body.operatorBadge),
    prisma.tray.findUnique({ where: { id: body.trayId }, include: { type: true } }),
  ])

  if (!tray) return NextResponse.json({ error: `Tray not found: ${body.trayId}` }, { status: 404 })

  const result = await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: { type: "RECOMPOSITION", operatorId },
    })
    const record = await tx.recompositionRecord.create({
      data: {
        eventId: event.id,
        trayId: body.trayId,
        targetDevice: tray.type.label,
        packagingProtocol: body.packagingProtocol,
      },
    })
    await tx.recompositionItem.createMany({
      data: body.instruments.map((item) => ({
        recordId: record.eventId,
        instrumentId: item.id,
        name: item.name,
        category: item.category,
        rackLocation: item.rackLocation,
        status: item.status,
        justification: item.justification ?? null,
      })),
    })
    return event.id
  })

  return NextResponse.json({ ok: true, eventId: result })
}

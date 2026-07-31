import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { resolveOperator } from "@/lib/resolveOperator"
import type { ReceptionSource } from "@/lib/reception/types"

const VALID_SOURCES: ReceptionSource[] = ["service-bloc", "stock-sterile", "externe"]

type ReceptionPayload = {
  source: ReceptionSource
  trayId: string
  transportId: string
  agentId: string
  preDisinfectionStatus: boolean
  cycleId?: string
  timestamp: string
}

function isValid(body: unknown): body is ReceptionPayload {
  if (!body || typeof body !== "object") return false
  const b = body as Partial<ReceptionPayload>
  return (
    typeof b.source === "string" &&
    VALID_SOURCES.includes(b.source as ReceptionSource) &&
    typeof b.trayId === "string" && b.trayId.trim().length > 0 &&
    typeof b.transportId === "string" && b.transportId.trim().length > 0 &&
    typeof b.agentId === "string" && b.agentId.trim().length > 0 &&
    typeof b.preDisinfectionStatus === "boolean"
  )
}

export async function GET() {
  const records = await prisma.receptionRecord.findMany({
    include: { event: true },
    orderBy: { event: { timestamp: "desc" } },
  })

  const receptions = records.map((r) => ({
    source: r.source,
    trayId: r.trayRef,
    transportId: r.transportId,
    agentId: r.event.operatorId,
    timestamp: r.event.timestamp,
  }))

  return NextResponse.json({ receptions })
}

export async function POST(req: Request) {
  const body = (await req.json()) as unknown
  if (!isValid(body)) return NextResponse.json({ error: "Invalid reception payload" }, { status: 400 })

  const [operatorId, tray] = await Promise.all([
    resolveOperator(body.agentId),
    prisma.tray.findUnique({ where: { serialNumber: body.trayId } }),
  ])

  if (!tray) return NextResponse.json({ error: `Tray not found: ${body.trayId}` }, { status: 404 })

  let preDisinfectionBatchId: string | null = null
  if (body.preDisinfectionStatus && body.cycleId) {
    const batch = await prisma.preDesinfectionBatch.findFirst({
      where: { cycleId: body.cycleId },
      orderBy: { event: { timestamp: "desc" } },
    })
    preDisinfectionBatchId = batch?.eventId ?? null
  }

  const event = await prisma.$transaction(async (tx) => {
    const ev = await tx.event.create({
      data: { type: "RECEPTION", operatorId, boiteRef: body.trayId, timestamp: new Date(body.timestamp) },
    })
    await tx.receptionRecord.create({
      data: {
        eventId: ev.id,
        source: body.source,
        transportId: body.transportId,
        trayRef: body.trayId,
        trayId: tray.id,
        preDisinfectionBatchId,
      },
    })
    return ev
  })

  return NextResponse.json({ ok: true, eventId: event.id })
}

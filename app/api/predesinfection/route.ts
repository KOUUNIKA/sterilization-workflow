import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { resolveOperator } from "@/lib/resolveOperator"

type InstrumentPayload = {
  name: string
  designation: string
  quantity: number
  code?: string
  status?: string
}

type PredesinfectionPayload = {
  cycleId: string
  priority: string
  boxName: string
  provenance: string
  detergent: string
  dilution: string
  dosage: string
  waterVolume: string
  duration: string
  operatorBadge?: string
  instruments: InstrumentPayload[]
}

function isValid(body: unknown): body is PredesinfectionPayload {
  if (!body || typeof body !== "object") return false
  const b = body as Partial<PredesinfectionPayload>
  return (
    typeof b.cycleId === "string" && b.cycleId.trim().length > 0 &&
    typeof b.boxName === "string" && b.boxName.trim().length > 0 &&
    typeof b.provenance === "string" &&
    typeof b.detergent === "string" &&
    Array.isArray(b.instruments)
  )
}

export async function POST(req: Request) {
  const body = (await req.json()) as unknown
  if (!isValid(body)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const operatorId = await resolveOperator(body.operatorBadge)

  const result = await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        type: "PRE_DISINFECTION",
        operatorId,
        boiteRef: body.boxName,
        place: body.provenance,
      },
    })

    const batch = await tx.preDesinfectionBatch.create({
      data: {
        eventId: event.id,
        cycleId: body.cycleId,
        priority: body.priority ?? "standard",
        detergent: body.detergent,
        dilution: body.dilution,
        dosage: body.dosage,
        waterVolume: body.waterVolume,
        duration: body.duration,
      },
    })

    if (body.instruments.length > 0) {
      await tx.instrumentLine.createMany({
        data: body.instruments.map((i) => ({
          batchId: batch.eventId,
          name: i.name,
          designation: i.designation,
          quantity: i.quantity,
          code: i.code ?? null,
          status: i.status ?? "expected",
        })),
      })
    }

    return { eventId: event.id, batchId: batch.eventId }
  })

  return NextResponse.json({ ok: true, ...result })
}

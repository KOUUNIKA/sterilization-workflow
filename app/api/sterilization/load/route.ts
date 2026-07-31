import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { resolveOperator } from "@/lib/resolveOperator"

type LoadPayload = {
  sterilizationType: "vapeur" | "basse_temp"
  cycleType: string
  targetTemp?: string
  targetDuration?: string
  operatorBadge?: string
  cassetteId?: string
  trays: string[]
}

function isValid(body: unknown): body is LoadPayload {
  if (!body || typeof body !== "object") return false
  const b = body as Partial<LoadPayload>
  return (
    (b.sterilizationType === "vapeur" || b.sterilizationType === "basse_temp") &&
    typeof b.cycleType === "string" && b.cycleType.trim().length > 0 &&
    Array.isArray(b.trays) && b.trays.length > 0
  )
}

export async function POST(req: Request) {
  const body = (await req.json()) as unknown
  if (!isValid(body)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const machineType = body.sterilizationType === "vapeur" ? "VAPEUR" : "H2O2_PLASMA"

  const [operatorId, machine, resolvedTrays] = await Promise.all([
    resolveOperator(body.operatorBadge),
    prisma.machine.findFirst({ where: { type: machineType } }),
    prisma.tray.findMany({ where: { serialNumber: { in: body.trays } } }),
  ])

  if (!machine) {
    return NextResponse.json({ error: `No ${machineType} machine found in database` }, { status: 500 })
  }

  const unknownTrays = body.trays.filter((ref) => !resolvedTrays.some((t) => t.serialNumber === ref))
  if (unknownTrays.length > 0) {
    return NextResponse.json({ error: `Unknown trays: ${unknownTrays.join(", ")}` }, { status: 404 })
  }

  let cassette = null
  if (body.sterilizationType === "basse_temp" && body.cassetteId) {
    cassette = await prisma.cassette.findUnique({ where: { id: body.cassetteId } })
    if (!cassette) {
      return NextResponse.json({ error: `Cassette not found: ${body.cassetteId}` }, { status: 404 })
    }
    if (cassette.dosesRemaining < cassette.dosesRequired) {
      return NextResponse.json({ error: "Cassette has no doses remaining" }, { status: 400 })
    }
  }

  const eventId = await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: { type: "STERILIZATION_LOAD", operatorId },
    })
    await tx.sterilizationLoad.create({
      data: {
        eventId: event.id,
        machineId: machine.id,
        sterilizationType: body.sterilizationType,
        cycleType: body.cycleType,
        targetTemp: body.targetTemp ?? null,
        targetDuration: body.targetDuration ?? null,
        cassetteId: cassette?.id ?? null,
      },
    })
    await tx.sterilizationLoadItem.createMany({
      data: resolvedTrays.map((t) => ({
        trayRef: t.serialNumber,
        trayId: t.id,
        loadEventId: event.id,
      })),
    })
    if (cassette) {
      await tx.doseConsumption.create({
        data: { cassetteId: cassette.id, loadEventId: event.id, doseUsed: cassette.dosesRequired },
      })
      await tx.cassette.update({
        where: { id: cassette.id },
        data: { dosesRemaining: { decrement: cassette.dosesRequired } },
      })
    }
    return event.id
  })

  return NextResponse.json({ ok: true, eventId })
}

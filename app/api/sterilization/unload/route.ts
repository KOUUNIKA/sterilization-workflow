import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { resolveOperator } from "@/lib/resolveOperator"

type UnloadPayload = {
  loadEventId: string
  operatorBadge?: string
  checks: {
    passage: boolean
    physico: boolean
    siccite: boolean
    integrite: boolean
  }
  trays: string[]
}

function isValid(body: unknown): body is UnloadPayload {
  if (!body || typeof body !== "object") return false
  const b = body as Partial<UnloadPayload>
  return (
    typeof b.loadEventId === "string" && b.loadEventId.trim().length > 0 &&
    Array.isArray(b.trays) && b.trays.length > 0 &&
    !!b.checks &&
    typeof b.checks.passage === "boolean" &&
    typeof b.checks.physico === "boolean" &&
    typeof b.checks.siccite === "boolean" &&
    typeof b.checks.integrite === "boolean"
  )
}

export async function POST(req: Request) {
  const body = (await req.json()) as unknown
  if (!isValid(body)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const [operatorId, loadEvent, resolvedTrays] = await Promise.all([
    resolveOperator(body.operatorBadge),
    prisma.sterilizationLoad.findUnique({ where: { eventId: body.loadEventId } }),
    prisma.tray.findMany({ where: { serialNumber: { in: body.trays } } }),
  ])

  if (!loadEvent) {
    return NextResponse.json({ error: `Load event not found: ${body.loadEventId}` }, { status: 404 })
  }

  const unknownTrays = body.trays.filter((ref) => !resolvedTrays.some((t) => t.serialNumber === ref))
  if (unknownTrays.length > 0) {
    return NextResponse.json({ error: `Unknown trays: ${unknownTrays.join(", ")}` }, { status: 404 })
  }

  const eventId = await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: { type: "STERILIZATION_UNLOAD", operatorId },
    })
    await tx.sterilizationUnload.create({
      data: { eventId: event.id, loadEventId: body.loadEventId },
    })
    await tx.sterilizationUnloadItem.createMany({
      data: resolvedTrays.map((t) => ({
        trayRef: t.serialNumber,
        trayId: t.id,
        unloadEventId: event.id,
        passageOk: body.checks.passage,
        physicoOk: body.checks.physico,
        sicciteOk: body.checks.siccite,
        integriteOk: body.checks.integrite,
      })),
    })
    return event.id
  })

  return NextResponse.json({ ok: true, eventId })
}

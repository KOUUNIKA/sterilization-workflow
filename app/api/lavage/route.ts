import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { resolveOperator } from "@/lib/resolveOperator"

type LavagePayload = {
  mode: string
  machineCode: string
  cycleName?: string
  temperature?: string
  duration?: string
  operatorBadge?: string
  conformiteProgramme: boolean
  conformiteParametres: boolean
  conformitePosition: boolean
  conformiteSiccite: boolean
  conformiteVisuelle: boolean
  validatedByBadge?: string
  trays: string[]
}

function isValid(body: unknown): body is LavagePayload {
  if (!body || typeof body !== "object") return false
  const b = body as Partial<LavagePayload>
  return (
    typeof b.mode === "string" && b.mode.trim().length > 0 &&
    typeof b.conformiteProgramme === "boolean" &&
    typeof b.conformiteParametres === "boolean" &&
    typeof b.conformitePosition === "boolean" &&
    typeof b.conformiteSiccite === "boolean" &&
    typeof b.conformiteVisuelle === "boolean" &&
    Array.isArray(b.trays) && b.trays.length > 0
  )
}

export async function POST(req: Request) {
  const body = (await req.json()) as unknown
  if (!isValid(body)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const [operatorId, machine, resolvedTrays] = await Promise.all([
    resolveOperator(body.operatorBadge),
    prisma.machine.findFirst({
      where: { OR: [{ code: body.machineCode ?? "" }, { type: "WASHER" }] },
    }),
    prisma.tray.findMany({
      where: { serialNumber: { in: body.trays } },
    }),
  ])

  const validatedById = body.validatedByBadge
    ? await resolveOperator(body.validatedByBadge)
    : null

  if (!machine) return NextResponse.json({ error: "No washer machine found in database" }, { status: 500 })

  const unknownTrays = body.trays.filter((ref) => !resolvedTrays.some((t) => t.serialNumber === ref))
  if (unknownTrays.length > 0) {
    return NextResponse.json({ error: `Unknown trays: ${unknownTrays.join(", ")}` }, { status: 404 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: { type: "WASH", operatorId },
    })
    await tx.washCycle.create({
      data: {
        eventId: event.id,
        machineId: machine.id,
        mode: body.mode,
        cycleName: body.cycleName ?? null,
        temperature: body.temperature ?? null,
        duration: body.duration ?? null,
        conformiteProgramme: body.conformiteProgramme,
        conformiteParametres: body.conformiteParametres,
        conformitePosition: body.conformitePosition,
        conformiteSiccite: body.conformiteSiccite,
        conformiteVisuelle: body.conformiteVisuelle,
        validated: !!body.validatedByBadge,
        validatedById,
      },
    })
    await tx.washLoadItem.createMany({
      data: resolvedTrays.map((t) => ({ trayRef: t.serialNumber, trayId: t.id, washEventId: event.id })),
    })
    return event.id
  })

  return NextResponse.json({ ok: true, eventId: result })
}

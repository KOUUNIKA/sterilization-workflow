import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { resolveOperator } from "@/lib/resolveOperator"

type LoadPayload = {
  mode: string
  machineCode: string
  cycleName?: string | null
  temperature?: string | null
  duration?: string | null
  operatorBadge?: string
  trays: string[]
}

function isValid(body: unknown): body is LoadPayload {
  if (!body || typeof body !== "object") return false
  const b = body as Partial<LoadPayload>
  return (
    typeof b.mode === "string" && b.mode.trim().length > 0 &&
    Array.isArray(b.trays) && b.trays.length > 0
  )
}

export async function POST(req: Request) {
  const body = (await req.json()) as unknown
  if (!isValid(body)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const machineCode = body.machineCode ?? "LAVEUSE-01"

  const [operatorId, machine, resolvedTrays] = await Promise.all([
    resolveOperator(body.operatorBadge),
    prisma.machine.findFirst({
      where: { OR: [{ code: machineCode }, { type: "WASHER" }] },
    }),
    prisma.tray.findMany({ where: { serialNumber: { in: body.trays } } }),
  ])

  if (!machine) return NextResponse.json({ error: "No washer machine found in database" }, { status: 500 })

  const unknownTrays = body.trays.filter((ref) => !resolvedTrays.some((t) => t.serialNumber === ref))
  if (unknownTrays.length > 0) {
    return NextResponse.json({ error: `Unknown trays: ${unknownTrays.join(", ")}` }, { status: 404 })
  }

  const eventId = await prisma.$transaction(async (tx) => {
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
        // conformity fields default to false — filled in phase 2
      },
    })
    await tx.washLoadItem.createMany({
      data: resolvedTrays.map((t) => ({ trayRef: t.serialNumber, trayId: t.id, washEventId: event.id })),
    })
    return event.id
  })

  return NextResponse.json({ ok: true, eventId })
}

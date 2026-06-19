import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { resolveOperator } from "@/lib/resolveOperator"

type StorePayload = {
  traySerial: string
  room: string
  shelf: string
  operatorBadge?: string
}

function isValid(body: unknown): body is StorePayload {
  if (!body || typeof body !== "object") return false
  const b = body as Partial<StorePayload>
  return (
    typeof b.traySerial === "string" && b.traySerial.trim().length > 0 &&
    typeof b.room === "string" && b.room.trim().length > 0 &&
    typeof b.shelf === "string" && b.shelf.trim().length > 0
  )
}

export async function POST(req: Request) {
  const body = (await req.json()) as unknown
  if (!isValid(body)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const [operatorId, tray] = await Promise.all([
    resolveOperator(body.operatorBadge),
    prisma.tray.findUnique({ where: { serialNumber: body.traySerial } }),
  ])

  if (!tray) {
    return NextResponse.json({ error: `Tray not found: ${body.traySerial}` }, { status: 404 })
  }

  const eventId = await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: { type: "STORED", operatorId, boiteRef: body.traySerial },
    })
    await tx.sterileMovement.create({
      data: { eventId: event.id, room: body.room, shelf: body.shelf },
    })
    return event.id
  })

  return NextResponse.json({ ok: true, eventId })
}

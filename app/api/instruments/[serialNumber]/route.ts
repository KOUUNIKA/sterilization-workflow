import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ serialNumber: string }> }
) {
  const { serialNumber } = await params

  const instrument = await prisma.instrument.findUnique({
    where: { serialNumber },
    include: {
      type: true,
      tray: { include: { type: true } },
      recompositionItems: {
        include: {
          record: {
            include: {
              event: { include: { operator: true } },
              tray: { include: { type: true } },
            },
          },
        },
      },
    },
  })

  if (!instrument) {
    return NextResponse.json({ error: "Instrument not found" }, { status: 404 })
  }

  const appearances = instrument.recompositionItems
    .map((item) => ({
      eventId: item.record.eventId,
      timestamp: item.record.event.timestamp.toISOString(),
      traySerial: item.record.tray.serialNumber,
      trayLabel: item.record.tray.type.label,
      operator: item.record.event.operator.name,
      status: item.status,
      justification: item.justification,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return NextResponse.json({
    instrument: {
      serialNumber: instrument.serialNumber,
      type: {
        name: instrument.type.name,
        category: instrument.type.category,
      },
      currentTray: {
        serialNumber: instrument.tray.serialNumber,
        label: instrument.tray.type.label,
      },
    },
    appearances,
  })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ serialNumber: string }> }
) {
  const { serialNumber } = await params
  const { trayId } = await req.json()

  if (!trayId) return NextResponse.json({ error: "trayId is required" }, { status: 400 })

  const instrument = await prisma.instrument.findUnique({ where: { serialNumber } })
  if (!instrument) return NextResponse.json({ error: "Instrument not found" }, { status: 404 })

  const tray = await prisma.tray.findUnique({ where: { id: trayId }, include: { type: true } })
  if (!tray) return NextResponse.json({ error: "Tray not found" }, { status: 404 })

  const updated = await prisma.instrument.update({
    where: { serialNumber },
    data: { trayId },
    include: { type: true, tray: { include: { type: true } } },
  })

  return NextResponse.json({
    instrument: {
      serialNumber: updated.serialNumber,
      type: { name: updated.type.name, category: updated.type.category },
      tray: { serialNumber: updated.tray.serialNumber, label: updated.tray.type.label },
    },
  })
}

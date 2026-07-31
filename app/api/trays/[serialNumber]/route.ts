import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(_req: Request, { params }: { params: Promise<{ serialNumber: string }> }) {
  const { serialNumber } = await params

  const tray = await prisma.tray.findUnique({
    where: { serialNumber },
    include: {
      type: {
        include: {
          composition: { include: { instrumentType: true } },
        },
      },
      instruments: {
        include: { type: true },
      },
    },
  })

  if (!tray) return NextResponse.json({ error: `Tray not found: ${serialNumber}` }, { status: 404 })

  return NextResponse.json({
    tray: {
      id: tray.id,
      serialNumber: tray.serialNumber,
      type: { label: tray.type.label },
      instruments: tray.instruments.map((i) => ({
        id: i.id,
        serialNumber: i.serialNumber,
        type: { name: i.type.name, category: i.type.category },
      })),
      composition: tray.type.composition.map((c) => ({
        instrumentTypeCode: c.instrumentType.code,
        name: c.instrumentType.name,
        category: c.instrumentType.category,
        expectedQuantity: c.expectedQuantity,
      })),
    },
  })
}

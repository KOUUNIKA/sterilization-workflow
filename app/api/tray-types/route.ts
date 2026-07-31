import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const trayTypes = await prisma.trayType.findMany({
    include: {
      composition: { include: { instrumentType: true } },
    },
    orderBy: { label: "asc" },
  })

  return NextResponse.json({
    trayTypes: trayTypes.map((t) => ({
      id: t.id,
      name: t.label,
      category: t.department,
      ref: t.code,
      instrumentsCount: t.composition.reduce((sum, c) => sum + c.expectedQuantity, 0),
      composition: t.composition.map((c) => ({
        name: c.instrumentType.name,
        quantity: c.expectedQuantity,
        ref: c.instrumentType.code,
        family: c.instrumentType.category,
      })),
    })),
  })
}

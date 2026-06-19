import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const instrumentTypes = await prisma.instrumentType.findMany({
    include: {
      composition: { include: { trayType: true } },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({
    instrumentTypes: instrumentTypes.map((it) => ({
      id: it.id,
      name: it.name,
      category: it.category,
      ref: it.code,
      material: it.manufacturer ?? null,
      sterilization: it.reference ?? "Autoclave 134°C",
      parentModels: it.composition.map((c) => ({
        name: c.trayType.label,
        category: c.trayType.department,
        ref: c.trayType.code,
        qty: c.expectedQuantity,
      })),
    })),
  })
}

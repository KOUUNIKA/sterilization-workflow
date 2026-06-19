import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const RECOMPOSITION_STATUS_MAP: Record<string, string> = {
  validated: "En Stock",
  pending: "En Stock",
  missing: "Sale",
  defective: "En Maintenance",
}

export async function GET() {
  const instruments = await prisma.instrument.findMany({
    include: {
      type: true,
      tray: { include: { type: true } },
      recompositionItems: {
        include: { record: { include: { event: true } } },
        orderBy: { record: { event: { timestamp: "desc" } } },
        take: 1,
      },
    },
    orderBy: { serialNumber: "asc" },
  })

  return NextResponse.json({
    instruments: instruments.map((inst) => {
      const lastItem = inst.recompositionItems[0]
      const status = lastItem
        ? (RECOMPOSITION_STATUS_MAP[lastItem.status] ?? "En Stock")
        : "En Stock"

      return {
        id: inst.serialNumber,
        name: inst.type.name,
        model: inst.type.code,
        parentBox: inst.tray.serialNumber,
        parentBoxName: inst.tray.type.label,
        status,
      }
    }),
  })
}

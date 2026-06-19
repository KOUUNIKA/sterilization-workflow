import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const trays = await prisma.tray.findMany({
    include: { type: true },
    orderBy: { serialNumber: "asc" },
  })

  return NextResponse.json({
    trays: trays.map((t) => ({
      id: t.id,
      serialNumber: t.serialNumber,
      label: t.type.label,
    })),
  })
}

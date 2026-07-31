import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ serialNumber: string }> }
) {
  const { serialNumber } = await params

  const event = await prisma.event.findFirst({
    where: { type: "PRE_DISINFECTION", boiteRef: serialNumber },
    orderBy: { timestamp: "desc" },
    include: {
      preDesinfectionBatch: {
        include: {
          instruments: {
            where: { status: { not: "expected" } },
          },
        },
      },
    },
  })

  if (!event?.preDesinfectionBatch) {
    return NextResponse.json({ flags: [] })
  }

  const flags = event.preDesinfectionBatch.instruments.map((i) => ({
    name: i.name,
    designation: i.designation,
    quantity: i.quantity,
    status: i.status,
  }))

  return NextResponse.json({ flags })
}

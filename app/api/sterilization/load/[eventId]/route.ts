import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params

  const load = await prisma.sterilizationLoad.findUnique({
    where: { eventId },
    include: {
      loadItems: { include: { tray: { include: { type: true } } } },
      machine: true,
    },
  })

  if (!load) {
    return NextResponse.json({ error: `Load event not found: ${eventId}` }, { status: 404 })
  }

  return NextResponse.json({
    load: {
      eventId: load.eventId,
      sterilizationType: load.sterilizationType,
      cycleType: load.cycleType,
      targetTemp: load.targetTemp,
      targetDuration: load.targetDuration,
      machine: { label: load.machine.label },
      trays: load.loadItems.map((item) => item.tray.serialNumber),
      trayDetails: load.loadItems.map((item) => ({
        serial: item.tray.serialNumber,
        label: item.tray.type.label,
      })),
    },
  })
}

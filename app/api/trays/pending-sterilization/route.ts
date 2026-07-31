import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const trays = await prisma.tray.findMany({
    include: {
      type: true,
      recompositionRecords: {
        include: { event: { select: { timestamp: true } } },
      },
      sterilizationLoadItems: {
        include: {
          loadEvent: { include: { event: { select: { timestamp: true } } } },
        },
      },
    },
  })

  const pending = trays
    .map((tray) => {
      const lastRecomp = tray.recompositionRecords
        .map((r) => r.event.timestamp)
        .sort((a, b) => b.getTime() - a.getTime())[0]
      const lastLoad = tray.sterilizationLoadItems
        .map((i) => i.loadEvent.event.timestamp)
        .sort((a, b) => b.getTime() - a.getTime())[0]
      return { tray, lastRecomp, lastLoad }
    })
    .filter(({ lastRecomp, lastLoad }) => {
      if (!lastRecomp) return false
      if (!lastLoad) return true
      return lastRecomp > lastLoad
    })
    .map(({ tray }) => ({
      id: tray.id,
      serialNumber: tray.serialNumber,
      label: tray.type.label,
    }))

  return NextResponse.json({ trays: pending })
}

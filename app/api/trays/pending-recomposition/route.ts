import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const trays = await prisma.tray.findMany({
    include: {
      type: true,
      washLoadItems: {
        include: {
          washCycle: { include: { event: { select: { timestamp: true } } } },
        },
      },
      receptionRecords: {
        include: { event: { select: { timestamp: true } } },
      },
      recompositionRecords: {
        include: { event: { select: { timestamp: true } } },
      },
    },
  })

  const pending = trays
    .map((tray) => {
      const lastWash = tray.washLoadItems
        .map((w) => w.washCycle.event.timestamp)
        .sort((a, b) => b.getTime() - a.getTime())[0]
      const lastReception = tray.receptionRecords
        .map((r) => r.event.timestamp)
        .sort((a, b) => b.getTime() - a.getTime())[0]
      const lastRecomp = tray.recompositionRecords
        .map((r) => r.event.timestamp)
        .sort((a, b) => b.getTime() - a.getTime())[0]
      return { tray, lastWash, lastReception, lastRecomp }
    })
    .filter(({ lastWash, lastReception, lastRecomp }) => {
      if (!lastRecomp) return true
      const lastActivity = lastWash ?? lastReception
      if (!lastActivity) return false
      return lastActivity > lastRecomp
    })
    .map(({ tray, lastWash, lastReception }) => ({
      id: tray.id,
      serialNumber: tray.serialNumber,
      type: { label: tray.type.label },
      lastWashedAt: lastWash ?? lastReception ?? null,
    }))

  return NextResponse.json({ trays: pending })
}

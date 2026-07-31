import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const traysWithUnloads = await prisma.tray.findMany({
    where: { sterilizationUnloadItems: { some: {} } },
    include: {
      type: true,
      sterilizationUnloadItems: { select: { unloadEventId: true } },
    },
  })

  if (traysWithUnloads.length === 0) return NextResponse.json({ trays: [] })

  const allUnloadEventIds = traysWithUnloads.flatMap((t) =>
    t.sterilizationUnloadItems.map((i) => i.unloadEventId)
  )

  const [unloadEvents, storedEvents] = await Promise.all([
    prisma.event.findMany({
      where: { id: { in: allUnloadEventIds } },
      select: { id: true, timestamp: true },
    }),
    prisma.event.findMany({
      where: {
        type: "STORED",
        boiteRef: { in: traysWithUnloads.map((t) => t.serialNumber) },
      },
      select: { boiteRef: true, timestamp: true },
    }),
  ])

  const eventTimestampById = new Map(unloadEvents.map((e) => [e.id, e.timestamp]))

  const lastStoredBySerial = new Map<string, Date>()
  for (const e of storedEvents) {
    if (!e.boiteRef) continue
    const existing = lastStoredBySerial.get(e.boiteRef)
    if (!existing || e.timestamp > existing) lastStoredBySerial.set(e.boiteRef, e.timestamp)
  }

  const pending = traysWithUnloads.filter((tray) => {
    const latestUnload = tray.sterilizationUnloadItems
      .map((i) => eventTimestampById.get(i.unloadEventId))
      .filter((ts): ts is Date => !!ts)
      .reduce<Date | null>((max, ts) => (!max || ts > max ? ts : max), null)

    const lastStored = lastStoredBySerial.get(tray.serialNumber)
    return latestUnload && (!lastStored || latestUnload > lastStored)
  })

  return NextResponse.json({
    trays: pending.map((t) => ({ id: t.id, serialNumber: t.serialNumber, label: t.type.label })),
  })
}

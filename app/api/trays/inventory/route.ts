import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const EVENT_STATUS: Record<string, string> = {
  STORED: "Stérile",
  RECEPTION: "Sale",
  PRE_DISINFECTION: "Sale",
  WASH: "Sale",
  RECOMPOSITION: "En cours",
  STERILIZATION_LOAD: "En cours",
  STERILIZATION_UNLOAD: "En cours",
}

export async function GET() {
  const [trays, storedEvents] = await Promise.all([
    prisma.tray.findMany({
      include: {
        type: {
          include: { composition: { include: { instrumentType: true } } },
        },
        instruments: { include: { type: true } },
        receptionRecords: {
          include: { event: true },
          orderBy: { event: { timestamp: "desc" } },
          take: 1,
        },
        washLoadItems: {
          include: { washCycle: { include: { event: true } } },
          orderBy: { washCycle: { event: { timestamp: "desc" } } },
          take: 1,
        },
        recompositionRecords: {
          include: { event: true },
          orderBy: { event: { timestamp: "desc" } },
          take: 1,
        },
        sterilizationLoadItems: {
          include: { loadEvent: { include: { event: true } } },
          orderBy: { loadEvent: { event: { timestamp: "desc" } } },
          take: 1,
        },
        sterilizationUnloadItems: {
          include: { unloadEvent: { include: { event: true } } },
          orderBy: { unloadEvent: { event: { timestamp: "desc" } } },
          take: 1,
        },
      },
      orderBy: { serialNumber: "asc" },
    }),
    prisma.event.findMany({
      where: { type: "STORED" },
      include: { sterileMovement: true },
      orderBy: { timestamp: "desc" },
    }),
  ])

  // Build map: tray serialNumber → most recent STORED event
  const lastStoredByTray = new Map<string, { room: string; shelf: string }>()
  for (const ev of storedEvents) {
    if (ev.boiteRef && !lastStoredByTray.has(ev.boiteRef) && ev.sterileMovement) {
      lastStoredByTray.set(ev.boiteRef, {
        room: ev.sterileMovement.room,
        shelf: ev.sterileMovement.shelf,
      })
    }
  }

  const result = trays.map((tray) => {
    // Collect all event candidates with their timestamps
    const candidates: { type: string; timestamp: Date }[] = []

    if (tray.receptionRecords[0])
      candidates.push({ type: "RECEPTION", timestamp: tray.receptionRecords[0].event.timestamp })
    if (tray.washLoadItems[0])
      candidates.push({ type: "WASH", timestamp: tray.washLoadItems[0].washCycle.event.timestamp })
    if (tray.recompositionRecords[0])
      candidates.push({ type: "RECOMPOSITION", timestamp: tray.recompositionRecords[0].event.timestamp })
    if (tray.sterilizationLoadItems[0])
      candidates.push({ type: "STERILIZATION_LOAD", timestamp: tray.sterilizationLoadItems[0].loadEvent.event.timestamp })
    if (tray.sterilizationUnloadItems[0])
      candidates.push({ type: "STERILIZATION_UNLOAD", timestamp: tray.sterilizationUnloadItems[0].unloadEvent.event.timestamp })

    // Check for STORED via the separate query (matched by serialNumber as boiteRef)
    const storedInfo = lastStoredByTray.get(tray.serialNumber)
    const storedEvent = storedEvents.find((e) => e.boiteRef === tray.serialNumber)
    if (storedEvent) candidates.push({ type: "STORED", timestamp: storedEvent.timestamp })

    candidates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    const latestType = candidates[0]?.type ?? null
    const status = latestType ? (EVENT_STATUS[latestType] ?? "Nouveau") : "Nouveau"

    const location = storedInfo ? `${storedInfo.room} — ${storedInfo.shelf}` : "—"

    return {
      id: tray.id,
      barcode: tray.serialNumber,
      name: tray.type.label,
      category: tray.type.department,
      location,
      status,
      composition: tray.instruments.map((i) => ({
        name: i.type.name,
        barcode: i.serialNumber,
      })),
      theoreticalComposition: tray.type.composition.map((c) => ({
        name: c.instrumentType.name,
        expectedQuantity: c.expectedQuantity,
      })),
    }
  })

  return NextResponse.json({ trays: result })
}

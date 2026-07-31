import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

type Zone = "zone-sale" | "zone-propre" | "zone-sterile"
type Criticality = "normal" | "urgent" | "risque"

type InstrumentItem = {
  id: string
  instrumentSerial: string
  name: string
  category: string
  status: string
  justification: string | null
}

type HistoryEvent = {
  id: string
  type: string
  phase: string
  timestamp: string
  operator: string
  zone: Zone
  criticality: Criticality
  details: string[]
  instruments?: InstrumentItem[]
}

const PHASE_LABELS: Record<string, string> = {
  PRE_DISINFECTION: "Pré-désinfection",
  RECEPTION: "Réception",
  WASH: "Lavage",
  RECOMPOSITION: "Conditionnement",
  STERILIZATION_LOAD: "Stérilisation (entrée)",
  STERILIZATION_UNLOAD: "Stérilisation (sortie)",
  STORED: "Stockage",
}

const ZONE_MAP: Record<string, Zone> = {
  PRE_DISINFECTION: "zone-sale",
  RECEPTION: "zone-sale",
  WASH: "zone-sale",
  RECOMPOSITION: "zone-propre",
  STERILIZATION_LOAD: "zone-sterile",
  STERILIZATION_UNLOAD: "zone-sterile",
  STORED: "zone-sterile",
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ serialNumber: string }> }
) {
  const { serialNumber } = await params

  const tray = await prisma.tray.findUnique({
    where: { serialNumber },
    include: {
      receptionRecords: {
        include: {
          event: { include: { operator: true } },
          preDisinfectionBatch: { include: { event: { include: { operator: true } } } },
        },
      },
      washLoadItems: {
        include: {
          washCycle: {
            include: {
              event: { include: { operator: true } },
              machine: true,
            },
          },
        },
      },
      recompositionRecords: {
        include: {
          event: { include: { operator: true } },
          items: { include: { instrument: true } },
        },
      },
      sterilizationLoadItems: {
        include: {
          loadEvent: {
            include: {
              event: { include: { operator: true } },
              machine: true,
            },
          },
        },
      },
      sterilizationUnloadItems: {
        include: {
          unloadEvent: {
            include: {
              event: { include: { operator: true } },
            },
          },
        },
      },
    },
  })

  if (!tray) {
    return NextResponse.json({ error: "Tray not found" }, { status: 404 })
  }

  const storedEvents = await prisma.event.findMany({
    where: { type: "STORED", boiteRef: serialNumber },
    include: { operator: true, sterileMovement: true },
  })

  const collected: HistoryEvent[] = []
  const seen = new Set<string>()

  function add(e: HistoryEvent) {
    if (!seen.has(e.id)) {
      seen.add(e.id)
      collected.push(e)
    }
  }

  // RECEPTION events + linked PRE_DISINFECTION
  for (const rec of tray.receptionRecords) {
    add({
      id: rec.eventId,
      type: "RECEPTION",
      phase: PHASE_LABELS.RECEPTION,
      timestamp: rec.event.timestamp.toISOString(),
      operator: rec.event.operator.name,
      zone: ZONE_MAP.RECEPTION,
      criticality: "normal",
      details: [
        `Source: ${rec.source}`,
        `Transport: ${rec.transportId}`,
      ],
    })

    if (rec.preDisinfectionBatch) {
      const b = rec.preDisinfectionBatch
      add({
        id: b.eventId,
        type: "PRE_DISINFECTION",
        phase: PHASE_LABELS.PRE_DISINFECTION,
        timestamp: b.event.timestamp.toISOString(),
        operator: b.event.operator.name,
        zone: ZONE_MAP.PRE_DISINFECTION,
        criticality: b.priority === "urgent" ? "urgent" : "normal",
        details: [
          `Priorité: ${b.priority}`,
          `Détergent: ${b.detergent}`,
          `Durée: ${b.duration}`,
        ],
      })
    }
  }

  // WASH events
  for (const item of tray.washLoadItems) {
    const w = item.washCycle
    add({
      id: w.eventId,
      type: "WASH",
      phase: PHASE_LABELS.WASH,
      timestamp: w.event.timestamp.toISOString(),
      operator: w.event.operator.name,
      zone: ZONE_MAP.WASH,
      criticality: "normal",
      details: [
        `Mode: ${w.mode}`,
        `Machine: ${w.machine.label}`,
        `Temp: ${w.temperature ?? "—"}`,
      ],
    })
  }

  // RECOMPOSITION events
  for (const rec of tray.recompositionRecords) {
    const validated = rec.items.filter((i) => i.status === "validated").length
    add({
      id: rec.eventId,
      type: "RECOMPOSITION",
      phase: PHASE_LABELS.RECOMPOSITION,
      timestamp: rec.event.timestamp.toISOString(),
      operator: rec.event.operator.name,
      zone: ZONE_MAP.RECOMPOSITION,
      criticality: "normal",
      details: [
        `Protocole: ${rec.packagingProtocol}`,
        `${validated}/${rec.items.length} instruments OK`,
      ],
      instruments: rec.items.map((item) => ({
        id: item.id,
        instrumentSerial: item.instrument.serialNumber,
        name: item.name,
        category: item.category,
        status: item.status,
        justification: item.justification,
      })),
    })
  }

  // STERILIZATION_LOAD events
  for (const item of tray.sterilizationLoadItems) {
    const l = item.loadEvent
    add({
      id: l.eventId,
      type: "STERILIZATION_LOAD",
      phase: PHASE_LABELS.STERILIZATION_LOAD,
      timestamp: l.event.timestamp.toISOString(),
      operator: l.event.operator.name,
      zone: ZONE_MAP.STERILIZATION_LOAD,
      criticality: "normal",
      details: [
        `Type: ${l.sterilizationType}`,
        `Cycle: ${l.cycleType}`,
        `Temp: ${l.targetTemp ?? "—"}`,
      ],
    })
  }

  // STERILIZATION_UNLOAD events
  for (const item of tray.sterilizationUnloadItems) {
    const u = item.unloadEvent
    const anyFail =
      !item.passageOk || !item.physicoOk || !item.sicciteOk || !item.integriteOk
    add({
      id: u.eventId,
      type: "STERILIZATION_UNLOAD",
      phase: PHASE_LABELS.STERILIZATION_UNLOAD,
      timestamp: u.event.timestamp.toISOString(),
      operator: u.event.operator.name,
      zone: ZONE_MAP.STERILIZATION_UNLOAD,
      criticality: anyFail ? "risque" : "normal",
      details: [
        `Passage ${item.passageOk ? "✓" : "✗"}`,
        `Physico ${item.physicoOk ? "✓" : "✗"}`,
        `Siccité ${item.sicciteOk ? "✓" : "✗"}`,
        `Intégrité ${item.integriteOk ? "✓" : "✗"}`,
      ],
    })
  }

  // STORED events
  for (const ev of storedEvents) {
    add({
      id: ev.id,
      type: "STORED",
      phase: PHASE_LABELS.STORED,
      timestamp: ev.timestamp.toISOString(),
      operator: ev.operator.name,
      zone: ZONE_MAP.STORED,
      criticality: "normal",
      details: [
        `Salle: ${ev.sterileMovement?.room ?? "—"}`,
        `Rayon: ${ev.sterileMovement?.shelf ?? "—"}`,
      ],
    })
  }

  collected.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return NextResponse.json({ events: collected })
}

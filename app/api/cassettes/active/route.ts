import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const now = new Date()
  const cassette = await prisma.cassette.findFirst({
    where: {
      expiryDate: { gt: now },
      dosesRemaining: { gt: 0 },
    },
    orderBy: { insertionDate: "desc" },
    include: {
      doseConsumptions: {
        orderBy: { usedAt: "desc" },
        take: 10,
        include: {
          loadEvent: {
            include: { event: { select: { timestamp: true } } },
          },
        },
      },
    },
  })

  if (!cassette) return NextResponse.json({ cassette: null })

  return NextResponse.json({
    cassette: {
      id: cassette.id,
      uuid: cassette.uuid,
      lotNumber: cassette.lotNumber,
      serialNumber: cassette.serialNumber,
      insertionDate: cassette.insertionDate,
      expiryDate: cassette.expiryDate,
      dosesRemaining: cassette.dosesRemaining,
      dosesRequired: cassette.dosesRequired,
      doseHistory: cassette.doseConsumptions.map((d) => ({
        usedAt: d.usedAt,
        doseUsed: d.doseUsed,
        loadEventId: d.loadEventId,
        loadTimestamp: d.loadEvent.event.timestamp,
      })),
    },
  })
}

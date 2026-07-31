import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { resolveOperator } from "@/lib/resolveOperator"

type ValidatePayload = {
  machineId: string
  badgeCode: string
  bowieDick: { captured: boolean; confirmed: boolean }
  leakTest: { fileName: string }
  biological: { result: string }
}

function isValid(body: unknown): body is ValidatePayload {
  if (!body || typeof body !== "object") return false
  const b = body as Partial<ValidatePayload>
  return (
    typeof b.machineId === "string" && b.machineId.trim().length > 0 &&
    !!b.bowieDick && typeof b.bowieDick.captured === "boolean" &&
    !!b.leakTest &&
    !!b.biological && typeof b.biological.result === "string"
  )
}

export async function POST(req: Request) {
  const body = (await req.json()) as unknown
  if (!isValid(body)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const machine = await prisma.machine.findUnique({ where: { code: body.machineId } })
  if (!machine) return NextResponse.json({ error: `Machine not found: ${body.machineId}` }, { status: 404 })

  const [operatorId] = await Promise.all([resolveOperator(body.badgeCode)])
  const date = new Date().toISOString().slice(0, 10)

  try {
    const eventId = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: { type: "QUALIFICATION", operatorId },
      })
      await tx.dailyQualification.create({
        data: {
          eventId: event.id,
          machineId: machine.id,
          date,
          bowieDickCaptured: body.bowieDick.captured,
          bowieDickConfirmed: body.bowieDick.confirmed,
          bowieDickSignedById: operatorId,
          leakTicketName: body.leakTest.fileName || null,
          leakTestStatus: body.leakTest.fileName ? "valid" : "pending",
          leakSignedById: body.leakTest.fileName ? operatorId : null,
          biologicalResult: body.biological.result || null,
          biologicalStatus: body.biological.result === "NEGATIF" ? "valid" : body.biological.result === "POSITIF" ? "critical" : "pending",
          biologicalSignedById: body.biological.result ? operatorId : null,
          globalStatus: "validated",
        },
      })
      return event.id
    })

    return NextResponse.json({ ok: true, eventId })
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Qualification déjà effectuée aujourd'hui pour cette machine." }, { status: 409 })
    }
    throw err
  }
}

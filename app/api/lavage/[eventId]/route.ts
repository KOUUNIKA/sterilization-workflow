import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { resolveOperator } from "@/lib/resolveOperator"

type CompletePayload = {
  conformiteProgramme: boolean
  conformiteParametres: boolean
  conformitePosition: boolean
  conformiteSiccite: boolean
  conformiteVisuelle: boolean
  validatedByBadge?: string
}

function isValid(body: unknown): body is CompletePayload {
  if (!body || typeof body !== "object") return false
  const b = body as Partial<CompletePayload>
  return (
    typeof b.conformiteProgramme === "boolean" &&
    typeof b.conformiteParametres === "boolean" &&
    typeof b.conformitePosition === "boolean" &&
    typeof b.conformiteSiccite === "boolean" &&
    typeof b.conformiteVisuelle === "boolean"
  )
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  const body = (await req.json()) as unknown
  if (!isValid(body)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const cycle = await prisma.washCycle.findUnique({ where: { eventId } })
  if (!cycle) return NextResponse.json({ error: "Wash cycle not found" }, { status: 404 })

  const validatedById = body.validatedByBadge
    ? await resolveOperator(body.validatedByBadge)
    : null

  await prisma.washCycle.update({
    where: { eventId },
    data: {
      conformiteProgramme: body.conformiteProgramme,
      conformiteParametres: body.conformiteParametres,
      conformitePosition: body.conformitePosition,
      conformiteSiccite: body.conformiteSiccite,
      conformiteVisuelle: body.conformiteVisuelle,
      validated: true,
      validatedById,
    },
  })

  return NextResponse.json({ ok: true })
}

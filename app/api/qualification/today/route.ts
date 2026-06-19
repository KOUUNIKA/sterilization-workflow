import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const machineId = searchParams.get("machineId") ?? "AUTOCLAVE-02"
  const date = new Date().toISOString().slice(0, 10)

  const machine = await prisma.machine.findUnique({ where: { code: machineId } })
  if (!machine) return NextResponse.json({ qualified: false, qualification: null })

  const qualification = await prisma.dailyQualification.findUnique({
    where: { machineId_date: { machineId: machine.id, date } },
  })

  const qualified = qualification?.globalStatus === "validated"
  return NextResponse.json({ qualified, qualification: qualified ? qualification : null })
}

import { prisma } from "@/lib/db"

const FALLBACK_BADGE = "BADGE-001"

export async function resolveOperator(badgeCode?: string | null): Promise<string> {
  const code = badgeCode?.trim() || FALLBACK_BADGE
  const op = await prisma.operator.findFirst({ where: { badgeCode: code } })
  if (op) return op.id
  const fallback = await prisma.operator.findFirst({ where: { badgeCode: FALLBACK_BADGE } })
  if (fallback) return fallback.id
  throw new Error("No operators seeded in database. Run: npx prisma db seed")
}

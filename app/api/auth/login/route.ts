import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

function deriveInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

export async function POST(req: Request) {
  const { name } = (await req.json()) as { name: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  const normalized = name.trim().toLowerCase();

  const operators = await prisma.operator.findMany({
    include: { roles: { include: { role: true }, take: 1 } },
  });

  const op = operators.find((o) => o.name.toLowerCase() === normalized);

  if (!op) {
    return NextResponse.json({ error: "Opérateur introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    badgeCode: op.badgeCode,
    name: op.name,
    initials: deriveInitials(op.name),
    role: op.roles[0]?.role.name ?? "",
  });
}

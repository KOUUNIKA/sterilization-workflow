import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Roles ────────────────────────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "Agent Qualite" },
      update: {},
      create: { name: "Agent Qualite" },
    }),
    prisma.role.upsert({
      where: { name: "Agent Sterilisation" },
      update: {},
      create: { name: "Agent Sterilisation" },
    }),
    prisma.role.upsert({
      where: { name: "Superviseur de Quart" },
      update: {},
      create: { name: "Superviseur de Quart" },
    }),
  ])

  const [roleQualite, roleSterilisation, roleSuperviseur] = roles

  // ── Operators (from AGENT_DIRECTORY in SterilizationReception.tsx) ───────
  const operators = await Promise.all([
    prisma.operator.upsert({
      where: { badgeCode: "BADGE-001" },
      update: {},
      create: { badgeCode: "BADGE-001", name: "Amina Benali" },
    }),
    prisma.operator.upsert({
      where: { badgeCode: "BADGE-002" },
      update: {},
      create: { badgeCode: "BADGE-002", name: "Youssef El Mansouri" },
    }),
    prisma.operator.upsert({
      where: { badgeCode: "BADGE-003" },
      update: {},
      create: { badgeCode: "BADGE-003", name: "Salma Idrissi" },
    }),
  ])

  const [opAmina, opYoussef, opSalma] = operators

  // ── OperatorRoles ─────────────────────────────────────────────────────────
  // assignedById self-reference: the first operator assigns everyone (bootstrap)
  await Promise.all([
    prisma.operatorRole.upsert({
      where: { operatorId_roleId: { operatorId: opAmina.id, roleId: roleQualite.id } },
      update: {},
      create: { operatorId: opAmina.id, roleId: roleQualite.id, assignedById: opAmina.id },
    }),
    prisma.operatorRole.upsert({
      where: { operatorId_roleId: { operatorId: opYoussef.id, roleId: roleSterilisation.id } },
      update: {},
      create: { operatorId: opYoussef.id, roleId: roleSterilisation.id, assignedById: opAmina.id },
    }),
    prisma.operatorRole.upsert({
      where: { operatorId_roleId: { operatorId: opSalma.id, roleId: roleSuperviseur.id } },
      update: {},
      create: { operatorId: opSalma.id, roleId: roleSuperviseur.id, assignedById: opAmina.id },
    }),
  ])

  // ── Machines (from hardcoded strings in Sterilization.tsx) ───────────────
  await Promise.all([
    prisma.machine.upsert({
      where: { code: "AUTOCLAVE-02" },
      update: {},
      create: {
        code: "AUTOCLAVE-02",
        label: "AUTOCLAVE N° 02",
        type: "VAPEUR",
        location: "Zone Propre",
      },
    }),
    prisma.machine.upsert({
      where: { code: "STERILISATEUR-BT-01" },
      update: {},
      create: {
        code: "STERILISATEUR-BT-01",
        label: "STÉRILISATEUR BT-01",
        type: "H2O2_PLASMA",
        location: "Zone Propre",
      },
    }),
    prisma.machine.upsert({
      where: { code: "LAVEUSE-01" },
      update: {},
      create: {
        code: "LAVEUSE-01",
        label: "Laveuse 01",
        type: "WASHER",
        location: "Zone Sale",
      },
    }),
  ])

  // ── TrayTypes ─────────────────────────────────────────────────────────────
  const [ttChir, ttOph, ttObs] = await Promise.all([
    prisma.trayType.upsert({
      where: { code: "CHI-GEN" },
      update: {},
      create: { code: "CHI-GEN", label: "Chirurgie Générale", department: "Bloc Opératoire", maxInstruments: 15 },
    }),
    prisma.trayType.upsert({
      where: { code: "OPH-STD" },
      update: {},
      create: { code: "OPH-STD", label: "Ophtalmologie Standard", department: "Bloc Ophtalmo", maxInstruments: 10 },
    }),
    prisma.trayType.upsert({
      where: { code: "OBS-ACC" },
      update: {},
      create: { code: "OBS-ACC", label: "Obstétrique Accouchement", department: "Maternité", maxInstruments: 10 },
    }),
  ])

  // ── InstrumentTypes ───────────────────────────────────────────────────────
  const [itScalpel, itKocher, itMayo, itFarabeuf, itPorteAiguille, itIris, itStevens, itClamp, itAnatomique] =
    await Promise.all([
      prisma.instrumentType.upsert({
        where: { code: "SCALPEL-10" },
        update: {},
        create: { code: "SCALPEL-10", name: "Scalpel lame n°10", category: "Incision" },
      }),
      prisma.instrumentType.upsert({
        where: { code: "PINCE-KOCHER" },
        update: {},
        create: { code: "PINCE-KOCHER", name: "Pince de Kocher", category: "Hémostase" },
      }),
      prisma.instrumentType.upsert({
        where: { code: "CISEAUX-MAYO" },
        update: {},
        create: { code: "CISEAUX-MAYO", name: "Ciseaux de Mayo droits", category: "Dissection" },
      }),
      prisma.instrumentType.upsert({
        where: { code: "ECARTEUR-FARABEUF" },
        update: {},
        create: { code: "ECARTEUR-FARABEUF", name: "Écarteur de Farabeuf", category: "Exposition" },
      }),
      prisma.instrumentType.upsert({
        where: { code: "PORTE-AIGUILLE" },
        update: {},
        create: { code: "PORTE-AIGUILLE", name: "Porte-aiguille de Mayo-Hegar", category: "Suture" },
      }),
      prisma.instrumentType.upsert({
        where: { code: "PINCE-IRIS" },
        update: {},
        create: { code: "PINCE-IRIS", name: "Pince à iris", category: "Ophtalmologie" },
      }),
      prisma.instrumentType.upsert({
        where: { code: "CISEAU-STEVENS" },
        update: {},
        create: { code: "CISEAU-STEVENS", name: "Ciseaux de Stevens", category: "Ophtalmologie" },
      }),
      prisma.instrumentType.upsert({
        where: { code: "CLAMP-CORDON" },
        update: {},
        create: { code: "CLAMP-CORDON", name: "Clamp de cordon ombilical", category: "Obstétrique" },
      }),
      prisma.instrumentType.upsert({
        where: { code: "PINCE-ANATOMIQUE" },
        update: {},
        create: { code: "PINCE-ANATOMIQUE", name: "Pince anatomique", category: "Obstétrique" },
      }),
    ])

  // ── TrayTypeCompositions ──────────────────────────────────────────────────
  // CHI-GEN: scalpel x2, kocher x4, mayo x2, farabeuf x2, porte-aiguille x1
  await Promise.all([
    prisma.trayTypeComposition.upsert({
      where: { trayTypeId_instrumentTypeId: { trayTypeId: ttChir.id, instrumentTypeId: itScalpel.id } },
      update: {}, create: { trayTypeId: ttChir.id, instrumentTypeId: itScalpel.id, expectedQuantity: 2 },
    }),
    prisma.trayTypeComposition.upsert({
      where: { trayTypeId_instrumentTypeId: { trayTypeId: ttChir.id, instrumentTypeId: itKocher.id } },
      update: {}, create: { trayTypeId: ttChir.id, instrumentTypeId: itKocher.id, expectedQuantity: 4 },
    }),
    prisma.trayTypeComposition.upsert({
      where: { trayTypeId_instrumentTypeId: { trayTypeId: ttChir.id, instrumentTypeId: itMayo.id } },
      update: {}, create: { trayTypeId: ttChir.id, instrumentTypeId: itMayo.id, expectedQuantity: 2 },
    }),
    prisma.trayTypeComposition.upsert({
      where: { trayTypeId_instrumentTypeId: { trayTypeId: ttChir.id, instrumentTypeId: itFarabeuf.id } },
      update: {}, create: { trayTypeId: ttChir.id, instrumentTypeId: itFarabeuf.id, expectedQuantity: 2 },
    }),
    prisma.trayTypeComposition.upsert({
      where: { trayTypeId_instrumentTypeId: { trayTypeId: ttChir.id, instrumentTypeId: itPorteAiguille.id } },
      update: {}, create: { trayTypeId: ttChir.id, instrumentTypeId: itPorteAiguille.id, expectedQuantity: 1 },
    }),
    // OPH-STD: iris x2, stevens x2, porte-aiguille x1
    prisma.trayTypeComposition.upsert({
      where: { trayTypeId_instrumentTypeId: { trayTypeId: ttOph.id, instrumentTypeId: itIris.id } },
      update: {}, create: { trayTypeId: ttOph.id, instrumentTypeId: itIris.id, expectedQuantity: 2 },
    }),
    prisma.trayTypeComposition.upsert({
      where: { trayTypeId_instrumentTypeId: { trayTypeId: ttOph.id, instrumentTypeId: itStevens.id } },
      update: {}, create: { trayTypeId: ttOph.id, instrumentTypeId: itStevens.id, expectedQuantity: 2 },
    }),
    prisma.trayTypeComposition.upsert({
      where: { trayTypeId_instrumentTypeId: { trayTypeId: ttOph.id, instrumentTypeId: itPorteAiguille.id } },
      update: {}, create: { trayTypeId: ttOph.id, instrumentTypeId: itPorteAiguille.id, expectedQuantity: 1 },
    }),
    // OBS-ACC: clamp x2, anatomique x2, mayo x1
    prisma.trayTypeComposition.upsert({
      where: { trayTypeId_instrumentTypeId: { trayTypeId: ttObs.id, instrumentTypeId: itClamp.id } },
      update: {}, create: { trayTypeId: ttObs.id, instrumentTypeId: itClamp.id, expectedQuantity: 2 },
    }),
    prisma.trayTypeComposition.upsert({
      where: { trayTypeId_instrumentTypeId: { trayTypeId: ttObs.id, instrumentTypeId: itAnatomique.id } },
      update: {}, create: { trayTypeId: ttObs.id, instrumentTypeId: itAnatomique.id, expectedQuantity: 2 },
    }),
    prisma.trayTypeComposition.upsert({
      where: { trayTypeId_instrumentTypeId: { trayTypeId: ttObs.id, instrumentTypeId: itMayo.id } },
      update: {}, create: { trayTypeId: ttObs.id, instrumentTypeId: itMayo.id, expectedQuantity: 1 },
    }),
  ])

  // ── Physical Trays ─────────────────────────────────────────────────────────
  const [trayChir, trayOph, trayObs] = await Promise.all([
    prisma.tray.upsert({
      where: { serialNumber: "TRAY-CHI-001" },
      update: {},
      create: { serialNumber: "TRAY-CHI-001", typeId: ttChir.id },
    }),
    prisma.tray.upsert({
      where: { serialNumber: "TRAY-OPH-001" },
      update: {},
      create: { serialNumber: "TRAY-OPH-001", typeId: ttOph.id },
    }),
    prisma.tray.upsert({
      where: { serialNumber: "TRAY-OBS-001" },
      update: {},
      create: { serialNumber: "TRAY-OBS-001", typeId: ttObs.id },
    }),
  ])

  // ── Physical Instruments ───────────────────────────────────────────────────
  // TRAY-CHI-001: 11 instruments matching CHI-GEN composition
  const chirInstruments = [
    { serialNumber: "INST-SCA-001", typeId: itScalpel.id },
    { serialNumber: "INST-SCA-002", typeId: itScalpel.id },
    { serialNumber: "INST-KOC-001", typeId: itKocher.id },
    { serialNumber: "INST-KOC-002", typeId: itKocher.id },
    { serialNumber: "INST-KOC-003", typeId: itKocher.id },
    { serialNumber: "INST-KOC-004", typeId: itKocher.id },
    { serialNumber: "INST-MAY-001", typeId: itMayo.id },
    { serialNumber: "INST-MAY-002", typeId: itMayo.id },
    { serialNumber: "INST-FAR-001", typeId: itFarabeuf.id },
    { serialNumber: "INST-FAR-002", typeId: itFarabeuf.id },
    { serialNumber: "INST-PAN-001", typeId: itPorteAiguille.id },
  ]
  // TRAY-OPH-001: 5 instruments
  const ophInstruments = [
    { serialNumber: "INST-IRI-001", typeId: itIris.id },
    { serialNumber: "INST-IRI-002", typeId: itIris.id },
    { serialNumber: "INST-STE-001", typeId: itStevens.id },
    { serialNumber: "INST-STE-002", typeId: itStevens.id },
    { serialNumber: "INST-PAN-002", typeId: itPorteAiguille.id },
  ]
  // TRAY-OBS-001: 5 instruments
  const obsInstruments = [
    { serialNumber: "INST-CLA-001", typeId: itClamp.id },
    { serialNumber: "INST-CLA-002", typeId: itClamp.id },
    { serialNumber: "INST-ANA-001", typeId: itAnatomique.id },
    { serialNumber: "INST-ANA-002", typeId: itAnatomique.id },
    { serialNumber: "INST-MAY-003", typeId: itMayo.id },
  ]

  await Promise.all([
    ...chirInstruments.map((i) =>
      prisma.instrument.upsert({
        where: { serialNumber: i.serialNumber },
        update: {},
        create: { serialNumber: i.serialNumber, typeId: i.typeId, trayId: trayChir.id },
      })
    ),
    ...ophInstruments.map((i) =>
      prisma.instrument.upsert({
        where: { serialNumber: i.serialNumber },
        update: {},
        create: { serialNumber: i.serialNumber, typeId: i.typeId, trayId: trayOph.id },
      })
    ),
    ...obsInstruments.map((i) =>
      prisma.instrument.upsert({
        where: { serialNumber: i.serialNumber },
        update: {},
        create: { serialNumber: i.serialNumber, typeId: i.typeId, trayId: trayObs.id },
      })
    ),
  ])

  // ── Cassettes (H2O2 plasma) ───────────────────────────────────────────────
  const cassette = await prisma.cassette.upsert({
    where: { uuid: "seed-cassette-h2o2-001" },
    update: {},
    create: {
      uuid: "seed-cassette-h2o2-001",
      lotNumber: "LOT-H2O2-2403",
      serialNumber: "SN-8842-91",
      insertionDate: new Date("2026-03-20"),
      expiryDate: new Date("2026-12-31"),
      dosesRemaining: 4,
      dosesRequired: 1,
    },
  })

  console.log("Seed complete:")
  console.log(`  ${roles.length} roles`)
  console.log(`  ${operators.length} operators`)
  console.log(`  3 machines`)
  console.log(`  3 tray types, 9 instrument types, 11 compositions`)
  console.log(`  3 trays, 21 instruments`)
  console.log(`  1 cassette (${cassette.lotNumber})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

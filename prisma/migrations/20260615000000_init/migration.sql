-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uuid" TEXT NOT NULL,
    "badgeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Privilege" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "RolePrivilege" (
    "roleId" TEXT NOT NULL,
    "privilegeId" TEXT NOT NULL,

    PRIMARY KEY ("roleId", "privilegeId"),
    CONSTRAINT "RolePrivilege_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RolePrivilege_privilegeId_fkey" FOREIGN KEY ("privilegeId") REFERENCES "Privilege" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OperatorRole" (
    "operatorId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT NOT NULL,

    PRIMARY KEY ("operatorId", "roleId"),
    CONSTRAINT "OperatorRole_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OperatorRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OperatorRole_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BadgeScan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operatorId" TEXT NOT NULL,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminalId" TEXT NOT NULL,
    "consumedAt" DATETIME,
    "eventType" TEXT,
    CONSTRAINT "BadgeScan_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkflowNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleKey" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrayType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "maxInstruments" INTEGER
);

-- CreateTable
CREATE TABLE "InstrumentType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "manufacturer" TEXT,
    "reference" TEXT
);

-- CreateTable
CREATE TABLE "TrayTypeComposition" (
    "trayTypeId" TEXT NOT NULL,
    "instrumentTypeId" TEXT NOT NULL,
    "expectedQuantity" INTEGER NOT NULL,

    PRIMARY KEY ("trayTypeId", "instrumentTypeId"),
    CONSTRAINT "TrayTypeComposition_trayTypeId_fkey" FOREIGN KEY ("trayTypeId") REFERENCES "TrayType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrayTypeComposition_instrumentTypeId_fkey" FOREIGN KEY ("instrumentTypeId") REFERENCES "InstrumentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Tray" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uuid" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    CONSTRAINT "Tray_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "TrayType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Instrument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uuid" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "trayId" TEXT NOT NULL,
    CONSTRAINT "Instrument_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "InstrumentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Instrument_trayId_fkey" FOREIGN KEY ("trayId") REFERENCES "Tray" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cassette" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uuid" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "insertionDate" DATETIME NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "dosesRemaining" INTEGER NOT NULL DEFAULT 5,
    "dosesRequired" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "DoseConsumption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doseUsed" INTEGER NOT NULL,
    "usedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cassetteId" TEXT NOT NULL,
    "loadEventId" TEXT NOT NULL,
    CONSTRAINT "DoseConsumption_cassetteId_fkey" FOREIGN KEY ("cassetteId") REFERENCES "Cassette" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DoseConsumption_loadEventId_fkey" FOREIGN KEY ("loadEventId") REFERENCES "SterilizationLoad" ("eventId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "boiteRef" TEXT,
    "place" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PreDesinfectionBatch" (
    "eventId" TEXT NOT NULL PRIMARY KEY,
    "cycleId" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'standard',
    "detergent" TEXT NOT NULL,
    "dilution" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "waterVolume" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    CONSTRAINT "PreDesinfectionBatch_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstrumentLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'expected',
    "batchId" TEXT NOT NULL,
    CONSTRAINT "InstrumentLine_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "PreDesinfectionBatch" ("eventId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReceptionRecord" (
    "eventId" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "transportId" TEXT NOT NULL,
    "trayRef" TEXT NOT NULL,
    "trayId" TEXT NOT NULL,
    "preDisinfectionBatchId" TEXT,
    CONSTRAINT "ReceptionRecord_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReceptionRecord_trayId_fkey" FOREIGN KEY ("trayId") REFERENCES "Tray" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReceptionRecord_preDisinfectionBatchId_fkey" FOREIGN KEY ("preDisinfectionBatchId") REFERENCES "PreDesinfectionBatch" ("eventId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WashCycle" (
    "eventId" TEXT NOT NULL PRIMARY KEY,
    "machineId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "cycleName" TEXT,
    "temperature" TEXT,
    "duration" TEXT,
    "conformiteProgramme" BOOLEAN NOT NULL DEFAULT false,
    "conformiteParametres" BOOLEAN NOT NULL DEFAULT false,
    "conformitePosition" BOOLEAN NOT NULL DEFAULT false,
    "conformiteSiccite" BOOLEAN NOT NULL DEFAULT false,
    "conformiteVisuelle" BOOLEAN NOT NULL DEFAULT false,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "validatedById" TEXT,
    "validatedBadgeScanId" TEXT,
    CONSTRAINT "WashCycle_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WashCycle_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WashCycle_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "Operator" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WashCycle_validatedBadgeScanId_fkey" FOREIGN KEY ("validatedBadgeScanId") REFERENCES "BadgeScan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WashLoadItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trayRef" TEXT NOT NULL,
    "trayId" TEXT NOT NULL,
    "washEventId" TEXT NOT NULL,
    CONSTRAINT "WashLoadItem_trayId_fkey" FOREIGN KEY ("trayId") REFERENCES "Tray" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WashLoadItem_washEventId_fkey" FOREIGN KEY ("washEventId") REFERENCES "WashCycle" ("eventId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecompositionRecord" (
    "eventId" TEXT NOT NULL PRIMARY KEY,
    "trayId" TEXT NOT NULL,
    "targetDevice" TEXT NOT NULL,
    "packagingProtocol" TEXT NOT NULL,
    CONSTRAINT "RecompositionRecord_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecompositionRecord_trayId_fkey" FOREIGN KEY ("trayId") REFERENCES "Tray" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecompositionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instrumentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rackLocation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "justification" TEXT,
    "recordId" TEXT NOT NULL,
    CONSTRAINT "RecompositionItem_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecompositionItem_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "RecompositionRecord" ("eventId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SterilizationLoad" (
    "eventId" TEXT NOT NULL PRIMARY KEY,
    "machineId" TEXT NOT NULL,
    "sterilizationType" TEXT NOT NULL,
    "cycleType" TEXT NOT NULL,
    "targetTemp" TEXT,
    "targetDuration" TEXT,
    "cassetteId" TEXT,
    CONSTRAINT "SterilizationLoad_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SterilizationLoad_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SterilizationLoad_cassetteId_fkey" FOREIGN KEY ("cassetteId") REFERENCES "Cassette" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SterilizationLoadItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trayRef" TEXT NOT NULL,
    "trayId" TEXT NOT NULL,
    "loadEventId" TEXT NOT NULL,
    CONSTRAINT "SterilizationLoadItem_trayId_fkey" FOREIGN KEY ("trayId") REFERENCES "Tray" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SterilizationLoadItem_loadEventId_fkey" FOREIGN KEY ("loadEventId") REFERENCES "SterilizationLoad" ("eventId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SterilizationUnload" (
    "eventId" TEXT NOT NULL PRIMARY KEY,
    "loadEventId" TEXT NOT NULL,
    CONSTRAINT "SterilizationUnload_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SterilizationUnload_loadEventId_fkey" FOREIGN KEY ("loadEventId") REFERENCES "SterilizationLoad" ("eventId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SterilizationUnloadItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trayRef" TEXT NOT NULL,
    "trayId" TEXT NOT NULL,
    "passageOk" BOOLEAN NOT NULL DEFAULT false,
    "physicoOk" BOOLEAN NOT NULL DEFAULT false,
    "sicciteOk" BOOLEAN NOT NULL DEFAULT false,
    "integriteOk" BOOLEAN NOT NULL DEFAULT false,
    "unloadEventId" TEXT NOT NULL,
    CONSTRAINT "SterilizationUnloadItem_trayId_fkey" FOREIGN KEY ("trayId") REFERENCES "Tray" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SterilizationUnloadItem_unloadEventId_fkey" FOREIGN KEY ("unloadEventId") REFERENCES "SterilizationUnload" ("eventId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SterileMovement" (
    "eventId" TEXT NOT NULL PRIMARY KEY,
    "room" TEXT NOT NULL,
    "shelf" TEXT NOT NULL,
    CONSTRAINT "SterileMovement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Operator_uuid_key" ON "Operator"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_badgeCode_key" ON "Operator"("badgeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Role_uuid_key" ON "Role"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Privilege_key_key" ON "Privilege"("key");

-- CreateIndex
CREATE INDEX "WorkflowNote_moduleKey_createdAt_idx" ON "WorkflowNote"("moduleKey", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrayType_uuid_key" ON "TrayType"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "TrayType_code_key" ON "TrayType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentType_uuid_key" ON "InstrumentType"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentType_code_key" ON "InstrumentType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Machine_uuid_key" ON "Machine"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Machine_code_key" ON "Machine"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Tray_uuid_key" ON "Tray"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Tray_serialNumber_key" ON "Tray"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_uuid_key" ON "Instrument"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_serialNumber_key" ON "Instrument"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Cassette_uuid_key" ON "Cassette"("uuid");

-- CreateIndex
CREATE INDEX "PreDesinfectionBatch_cycleId_idx" ON "PreDesinfectionBatch"("cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "WashCycle_validatedBadgeScanId_key" ON "WashCycle"("validatedBadgeScanId");

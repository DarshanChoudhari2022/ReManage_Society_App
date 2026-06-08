import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  personId?: string;
  unitId?: string;
};

type DemoPerson = {
  id: string;
  name: string;
  phone?: string;
  emergencyContact?: string;
};

type DemoUnit = {
  id: string;
  wing?: string;
  flatNumber: string;
  floor?: number;
  unitType?: string;
  usageType?: string;
  carpetArea?: number;
  superBuiltupArea?: number;
  occupancyStatus?: string;
  ownershipStatus?: string;
  billingStatus?: string;
  parkingSlots?: number;
  intercomNumber?: string;
};

type DemoOccupancy = {
  id: string;
  unitId: string;
  personId: string;
  relationshipType: string;
  billingResponsibility: string;
  moveInDate?: string;
  agreementEndDate?: string;
  vehicleCount?: number;
  isPrimaryOccupant?: boolean;
};

type DemoSociety = {
  id: string;
  name: string;
  joinCode: string;
  address: string;
  city: string;
  pincode: string;
  maintenanceAmt: number;
  lateFee: number;
  upiId?: string;
  legalAdviserName?: string;
  legalAdviserPhone?: string;
  users: DemoUser[];
  persons: DemoPerson[];
  units: DemoUnit[];
  occupancies: DemoOccupancy[];
};

type DemoData = {
  societies: DemoSociety[];
};

const CONFIRM_TEXT = "I_UNDERSTAND_THIS_IS_DEMO_ONLY";

function assertDemoSafety() {
  const demoUrl = process.env.DEMO_DATABASE_URL?.trim();
  if (!demoUrl) {
    throw new Error("DEMO_DATABASE_URL is required. Use a separate demo database or Neon branch.");
  }

  if (process.env.DEMO_SEED_CONFIRM !== CONFIRM_TEXT) {
    throw new Error(`DEMO_SEED_CONFIRM must be exactly "${CONFIRM_TEXT}".`);
  }

  const realUrls = [process.env.DATABASE_URL, process.env.DIRECT_URL].filter(Boolean);
  if (realUrls.some((url) => url === demoUrl)) {
    throw new Error("Refusing to seed: DEMO_DATABASE_URL matches DATABASE_URL or DIRECT_URL.");
  }

  const parsed = new URL(demoUrl);
  const searchable = `${parsed.hostname}${parsed.pathname}`.toLowerCase();
  if (!/(demo|staging|preview|branch|test|sandbox)/.test(searchable)) {
    throw new Error(
      "Refusing to seed: DEMO_DATABASE_URL hostname or database name must include demo/staging/preview/branch/test/sandbox."
    );
  }

  return demoUrl;
}

function readDemoData(): DemoData {
  const file = path.join(process.cwd(), "demo-data", "demo-societies.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as DemoData;
}

function legacyFlatId(unitId: string) {
  return unitId.replace("demo-unit", "demo-flat");
}

function occupantKind(status?: string) {
  if (status === "TENANT_OCCUPIED") return "tenant";
  if (status === "VACANT") return "vacant";
  return "owner";
}

function dateOrNull(value?: string) {
  return value ? new Date(value) : null;
}

async function main() {
  const demoUrl = assertDemoSafety();
  const pool = new Pool({
    connectionString: demoUrl,
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: true,
  });
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
    log: ["warn", "error"],
  });

  const data = readDemoData();
  const passwordCache = new Map<string, string>();

  try {
    for (const society of data.societies) {
      await prisma.society.upsert({
        where: { id: society.id },
        update: {
          name: society.name,
          joinCode: society.joinCode,
          address: society.address,
          city: society.city,
          pincode: society.pincode,
          totalFlats: society.units.length,
          maintenanceAmt: society.maintenanceAmt,
          lateFee: society.lateFee,
          upiId: society.upiId || null,
          legalAdviserName: society.legalAdviserName || null,
          legalAdviserPhone: society.legalAdviserPhone || null,
        },
        create: {
          id: society.id,
          name: society.name,
          joinCode: society.joinCode,
          address: society.address,
          city: society.city,
          pincode: society.pincode,
          totalFlats: society.units.length,
          maintenanceAmt: society.maintenanceAmt,
          lateFee: society.lateFee,
          upiId: society.upiId || null,
          legalAdviserName: society.legalAdviserName || null,
          legalAdviserPhone: society.legalAdviserPhone || null,
        },
      });

      const personById = new Map(society.persons.map((person) => [person.id, person]));
      const occupanciesByUnit = new Map<string, DemoOccupancy[]>();
      for (const occupancy of society.occupancies) {
        const existing = occupanciesByUnit.get(occupancy.unitId) || [];
        existing.push(occupancy);
        occupanciesByUnit.set(occupancy.unitId, existing);
      }

      for (const unit of society.units) {
        const occupancies = occupanciesByUnit.get(unit.id) || [];
        const owner = occupancies.find((item) => item.relationshipType === "OWNER");
        const tenant = occupancies.find((item) => item.relationshipType === "TENANT");
        const ownerPerson = owner ? personById.get(owner.personId) : undefined;
        const tenantPerson = tenant ? personById.get(tenant.personId) : undefined;
        const flatId = legacyFlatId(unit.id);

        await prisma.flat.upsert({
          where: { id: flatId },
          update: {
            societyId: society.id,
            flatNumber: unit.flatNumber,
            wing: unit.wing || null,
            floor: unit.floor || null,
            ownerName: ownerPerson?.name || null,
            tenantName: tenantPerson?.name || null,
            contact: tenantPerson?.phone || ownerPerson?.phone || null,
            flatType: unit.unitType?.toLowerCase() || "2bhk",
            carpetArea: unit.carpetArea || null,
            currentOccupant: occupantKind(unit.occupancyStatus),
            isActive: true,
          },
          create: {
            id: flatId,
            societyId: society.id,
            flatNumber: unit.flatNumber,
            wing: unit.wing || null,
            floor: unit.floor || null,
            ownerName: ownerPerson?.name || null,
            tenantName: tenantPerson?.name || null,
            contact: tenantPerson?.phone || ownerPerson?.phone || null,
            flatType: unit.unitType?.toLowerCase() || "2bhk",
            carpetArea: unit.carpetArea || null,
            currentOccupant: occupantKind(unit.occupancyStatus),
            isActive: true,
          },
        });

        await prisma.unit.upsert({
          where: { id: unit.id },
          update: {
            societyId: society.id,
            legacyFlatId: flatId,
            wing: unit.wing || null,
            flatNumber: unit.flatNumber,
            floor: unit.floor || null,
            unitType: unit.unitType || "2BHK",
            usageType: unit.usageType || "RESIDENTIAL",
            carpetArea: unit.carpetArea || null,
            superBuiltupArea: unit.superBuiltupArea || null,
            parkingSlots: unit.parkingSlots || 0,
            intercomNumber: unit.intercomNumber || null,
            occupancyStatus: unit.occupancyStatus || "VACANT",
            ownershipStatus: unit.ownershipStatus || "FREEHOLD",
            billingStatus: unit.billingStatus || "ACTIVE",
            isActive: true,
          },
          create: {
            id: unit.id,
            societyId: society.id,
            legacyFlatId: flatId,
            wing: unit.wing || null,
            flatNumber: unit.flatNumber,
            floor: unit.floor || null,
            unitType: unit.unitType || "2BHK",
            usageType: unit.usageType || "RESIDENTIAL",
            carpetArea: unit.carpetArea || null,
            superBuiltupArea: unit.superBuiltupArea || null,
            parkingSlots: unit.parkingSlots || 0,
            intercomNumber: unit.intercomNumber || null,
            occupancyStatus: unit.occupancyStatus || "VACANT",
            ownershipStatus: unit.ownershipStatus || "FREEHOLD",
            billingStatus: unit.billingStatus || "ACTIVE",
            isActive: true,
          },
        });
      }

      for (const person of society.persons) {
        await prisma.person.upsert({
          where: { id: person.id },
          update: {
            societyId: society.id,
            name: person.name,
            phone: person.phone || null,
            emergencyContact: person.emergencyContact || null,
          },
          create: {
            id: person.id,
            societyId: society.id,
            name: person.name,
            phone: person.phone || null,
            emergencyContact: person.emergencyContact || null,
          },
        });
      }

      for (const occupancy of society.occupancies) {
        await prisma.unitOccupancy.upsert({
          where: { id: occupancy.id },
          update: {
            societyId: society.id,
            unitId: occupancy.unitId,
            personId: occupancy.personId,
            relationshipType: occupancy.relationshipType,
            occupancyStatus: "ACTIVE",
            billingResponsibility: occupancy.billingResponsibility,
            moveInDate: dateOrNull(occupancy.moveInDate),
            agreementEndDate: dateOrNull(occupancy.agreementEndDate),
            vehicleCount: occupancy.vehicleCount || 0,
            isPrimaryOccupant: Boolean(occupancy.isPrimaryOccupant),
            isActive: true,
          },
          create: {
            id: occupancy.id,
            societyId: society.id,
            unitId: occupancy.unitId,
            personId: occupancy.personId,
            relationshipType: occupancy.relationshipType,
            occupancyStatus: "ACTIVE",
            billingResponsibility: occupancy.billingResponsibility,
            moveInDate: dateOrNull(occupancy.moveInDate),
            agreementEndDate: dateOrNull(occupancy.agreementEndDate),
            vehicleCount: occupancy.vehicleCount || 0,
            isPrimaryOccupant: Boolean(occupancy.isPrimaryOccupant),
            isActive: true,
          },
        });
      }

      for (const user of society.users) {
        const passwordHash = passwordCache.get(user.password) || await bcrypt.hash(user.password, 12);
        passwordCache.set(user.password, passwordHash);
        const flatId = user.unitId ? legacyFlatId(user.unitId) : null;

        await prisma.user.upsert({
          where: { email: user.email.toLowerCase() },
          update: {
            id: user.id,
            name: user.name,
            password: passwordHash,
            phone: user.phone,
            role: user.role,
            societyId: society.id,
            flatId,
            personId: user.personId || null,
          },
          create: {
            id: user.id,
            name: user.name,
            email: user.email.toLowerCase(),
            password: passwordHash,
            phone: user.phone,
            role: user.role,
            societyId: society.id,
            flatId,
            personId: user.personId || null,
          },
        });
      }

      console.log(`Seeded ${society.name}: ${society.units.length} units, ${society.users.length} users.`);
    }

    console.log("Demo seed completed safely.");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


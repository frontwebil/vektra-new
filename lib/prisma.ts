import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  prismaClass?: typeof PrismaClient;
};

export function getPrisma() {
  // У dev після `prisma generate` модуль клієнта перезавантажується з новим класом:
  // старий екземпляр не знає нових моделей, тож створюємо клієнт заново
  if (globalForPrisma.prisma && globalForPrisma.prismaClass === PrismaClient) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured. Add a PostgreSQL connection string to .env.local.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    void globalForPrisma.prisma?.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = prisma;
    globalForPrisma.prismaClass = PrismaClient;
  }
  return prisma;
}

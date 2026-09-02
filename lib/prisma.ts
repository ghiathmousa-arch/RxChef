import { createDatabaseAdapter, requireDatabaseUrl } from "./db-adapter";
import { PrismaClient } from "@/app/generated/prisma/client";

// نموذج Singleton قياسي بـNext.js: بمنع تعدد اتصالات Prisma بوقت الـhot
// reload بالتطوير (كل حفظ ملف بيعيد تحميل الموديول، وبدون هيك كان رح
// يفتح اتصال جديد بقاعدة البيانات كل مرة).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({ adapter: createDatabaseAdapter(requireDatabaseUrl()) });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaPostgresAdapter } from "@prisma/adapter-ppg";

/** يقرأ DATABASE_URL ويفشل برسالة واضحة بدل خطأ غامض جوّا المحرّك. */
export function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL غير معرّف — راجع ملف .env.example");
  return url;
}

/** هل الرابط عائد لـPrisma Postgres؟ (شكل `prisma+postgres://` أو مضيف prisma.io) */
function isPrismaPostgres(url: string): boolean {
  if (url.startsWith("prisma+postgres://")) return true;
  try {
    return new URL(url).hostname.endsWith(".prisma.io");
  } catch {
    return false;
  }
}

// اختيار محرّك الاتصال من شكل الرابط، عشان تبديل المزوّد أو الاستضافة يصير
// بتعديل DATABASE_URL بس بلا لمس الكود:
//   Prisma Postgres → محرّك ppg، بيتواصل فوق HTTPS (منفذ 443)
//   أي Postgres تاني (Neon، Supabase، سيرفر محلي…) → اتصال TCP عادي (5432)
// فايدة عملية: في شبكات بتحجب المنفذ 5432 (شبكة التطوير عنا منها)، ومسار
// الـHTTPS هو الوحيد يلي بيوصل منها.
export function createDatabaseAdapter(url: string) {
  return isPrismaPostgres(url)
    ? new PrismaPostgresAdapter({ connectionString: url })
    : new PrismaPg({ connectionString: url });
}

import type { NextConfig } from "next";

// مكتبة Prisma بتشحن محرّك WASM لكل مزوّد قاعدة بيانات تدعمه (حوالي 75MB
// بالمجموع)، وVercel بينسخ الملفات المتتبَّعة بكل وظيفة على حدا — فمجموع
// الحزم طلع 622MB والحد 500MB. منستخدم PostgreSQL بس، فمنستثني الباقي.
const UNUSED_PRISMA_ENGINES = [
  "node_modules/@prisma/client/runtime/*mysql*",
  "node_modules/@prisma/client/runtime/*sqlite*",
  "node_modules/@prisma/client/runtime/*sqlserver*",
  "node_modules/@prisma/client/runtime/*cockroachdb*",
];

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "/*": UNUSED_PRISMA_ENGINES,
  },
};

export default nextConfig;

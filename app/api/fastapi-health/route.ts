// فحص اتصال بين Next.js وFastAPI: يتأكد إن الخدمتين شايفين بعض.
import { FASTAPI_URL } from "@/lib/config";

// صفحة الأداة بتستدعي هالمسار عند فتحها لتوقيظ الخدمة النايمة، وإقلاعها
// بياخد عشرات الثواني — فالمهلة الافتراضية (10 ثواني) ما بتكفي.
export const maxDuration = 60;

export async function GET() {
  try {
    const response = await fetch(`${FASTAPI_URL}/health`);
    const fastapi = await response.json();
    return Response.json({ nextjs: "ok", fastapi });
  } catch {
    return Response.json(
      { nextjs: "ok", fastapi: null, error: "FastAPI service unreachable" },
      { status: 502 }
    );
  }
}

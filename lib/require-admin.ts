import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-session";

// Server Functions يمكن الوصول لهن مباشرة بطلب POST بغض النظر عن أي
// matcher بـproxy.ts (راجع تحذير Next.js بخصوص الأمان)، فكل server
// action بلوحة الإدارة لازم يستدعي هاد الفحص بنفسه قبل أي تعديل.
export async function requireAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    throw new Error("Unauthorized");
  }
}

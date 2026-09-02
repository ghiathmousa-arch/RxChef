import { prisma } from "@/lib/prisma";

// نظير /api/analyze بنفس البنية: يكتب رسائل نموذج /contact مباشرة
// بجدول ContactMessage عشان تظهر بلوحة الإدارة.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, message, role } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    typeof email !== "string" ||
    !/.+@.+\..+/.test(email.trim()) ||
    typeof message !== "string" ||
    message.trim().length < 10
  ) {
    return Response.json({ error: "الحقول غير مكتملة أو غير صالحة" }, { status: 400 });
  }

  const roleLabel = typeof role === "string" && role.trim() ? role.trim() : null;
  const storedMessage = roleLabel ? `[${roleLabel}] ${message.trim()}` : message.trim();

  const created = await prisma.contactMessage.create({
    data: { name: name.trim(), email: email.trim(), message: storedMessage },
  });

  return Response.json({ id: created.id });
}

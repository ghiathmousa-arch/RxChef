import { prisma } from "@/lib/prisma";

// نظير /api/contact بنفس البنية: أي تجربة مُرسلة تُخزَّن isApproved:false
// افتراضيًا، وما بتظهر بالموقع العام إلا بعد موافقة يدوية من لوحة الإدارة —
// هيك ما بينشر رأي مصطنع أو غير موثّق.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, role, quote } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    typeof role !== "string" ||
    role.trim().length < 2 ||
    typeof quote !== "string" ||
    quote.trim().length < 15
  ) {
    return Response.json({ error: "الحقول غير مكتملة أو غير صالحة" }, { status: 400 });
  }

  const created = await prisma.testimonial.create({
    data: { name: name.trim(), role: role.trim(), quote: quote.trim() },
  });

  return Response.json({ id: created.id });
}

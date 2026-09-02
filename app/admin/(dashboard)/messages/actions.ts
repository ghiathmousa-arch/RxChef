"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidatePath } from "next/cache";

export async function toggleMessageRead(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const nextIsRead = formData.get("nextIsRead") === "true";
  if (!Number.isFinite(id)) return;

  await prisma.contactMessage.update({ where: { id }, data: { isRead: nextIsRead } });
  revalidatePath("/admin/messages");
}

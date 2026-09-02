"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidatePath } from "next/cache";

export async function toggleTestimonialApproval(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const nextIsApproved = formData.get("nextIsApproved") === "true";
  if (!Number.isFinite(id)) return;

  await prisma.testimonial.update({ where: { id }, data: { isApproved: nextIsApproved } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function deleteTestimonial(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;

  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

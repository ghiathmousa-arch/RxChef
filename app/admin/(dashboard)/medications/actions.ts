"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidatePath } from "next/cache";

export type MedicationInput = {
  name: string;
  genericName: string;
  dosage: string;
  therapeuticClass: string;
};

function validate(data: MedicationInput): string | null {
  if (!data.name.trim()) return "الاسم والجرعة مطلوبة";
  if (!data.genericName.trim()) return "المادة الفعّالة مطلوبة";
  if (!data.dosage.trim()) return "الجرعة مطلوبة";
  if (!data.therapeuticClass.trim()) return "التصنيف العلاجي مطلوب";
  return null;
}

export async function createMedication(data: MedicationInput): Promise<{ error?: string }> {
  await requireAdmin();
  const error = validate(data);
  if (error) return { error };

  await prisma.medication.create({
    data: {
      name: data.name.trim(),
      genericName: data.genericName.trim(),
      dosage: data.dosage.trim(),
      therapeuticClass: data.therapeuticClass.trim(),
    },
  });
  revalidatePath("/admin/medications");
  return {};
}

export async function updateMedication(id: number, data: MedicationInput): Promise<{ error?: string }> {
  await requireAdmin();
  const error = validate(data);
  if (error) return { error };

  await prisma.medication.update({
    where: { id },
    data: {
      name: data.name.trim(),
      genericName: data.genericName.trim(),
      dosage: data.dosage.trim(),
      therapeuticClass: data.therapeuticClass.trim(),
    },
  });
  revalidatePath("/admin/medications");
  return {};
}

export async function deleteMedication(id: number): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await prisma.medication.delete({ where: { id } });
  } catch {
    return { error: "تعذّر الحذف — هذا الدواء مرتبط بتفاعلات مسجّلة." };
  }
  revalidatePath("/admin/medications");
  return {};
}

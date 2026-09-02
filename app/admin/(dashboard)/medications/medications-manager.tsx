"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createMedication, deleteMedication, updateMedication, type MedicationInput } from "./actions";

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="11" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export type MedicationRow = {
  id: number;
  name: string;
  genericName: string;
  dosage: string;
  therapeuticClass: string;
};

const EMPTY_FORM: MedicationInput = { name: "", genericName: "", dosage: "", therapeuticClass: "" };

export function MedicationsManager({
  medications,
  total,
  query,
  classes,
  activeClass,
}: {
  medications: MedicationRow[];
  total: number;
  query: string;
  classes: string[];
  activeClass: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(query);
  const [classValue, setClassValue] = useState(activeClass);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue.trim()) params.set("q", searchValue.trim());
      else params.delete("q");
      if (classValue) params.set("class", classValue);
      else params.delete("class");
      startTransition(() => router.replace(`${pathname}?${params.toString()}`));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, classValue]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [classSearch, setClassSearch] = useState("");
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [filterOpen]);

  const visibleClasses = classes.filter((c) => c.toLowerCase().includes(classSearch.trim().toLowerCase()));

  const [editing, setEditing] = useState<{ id: number | null; form: MedicationInput } | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  function openCreate() {
    setEditing({ id: null, form: EMPTY_FORM });
    setFormError(null);
  }

  function openEdit(row: MedicationRow) {
    setEditing({
      id: row.id,
      form: { name: row.name, genericName: row.genericName, dosage: row.dosage, therapeuticClass: row.therapeuticClass },
    });
    setFormError(null);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setFormError(null);
    const result = editing.id === null ? await createMedication(editing.form) : await updateMedication(editing.id, editing.form);
    setSaving(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function remove(id: number) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setDeletingId(id);
    setRowError(null);
    const result = await deleteMedication(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (result.error) {
      setRowError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4.5">
        <div>
          <p className="text-xl font-semibold text-forest">قاعدة الأدوية</p>
          <p className="mt-1.75 text-[13.5px] text-sand">
            {medications.length} من {total} دواء
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="ابحث بالاسم أو التصنيف…"
            className="w-62.5 rounded-[10px] border border-sand/55 bg-paper px-3.25 py-2.75 text-[14.5px] text-ink outline-none focus:border-teal/55"
          />

          <div ref={filterRef} className="relative">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              title="فلترة بالتصنيف العلاجي"
              className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[10px] border transition-colors"
              style={
                classValue
                  ? { borderColor: "rgba(52,143,128,.4)", background: "rgba(52,143,128,.1)", color: "#09483D" }
                  : { borderColor: "rgba(175,184,181,.55)", background: "var(--color-paper)", color: "#16221F" }
              }
            >
              <FilterIcon />
            </button>

            {filterOpen && (
              <div className="absolute z-10 mt-2 w-72 rounded-2xl border border-sand/50 bg-paper p-3 shadow-[0_20px_46px_-24px_rgba(9,72,61,0.4)] end-0">
                <input
                  autoFocus
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  placeholder="ابحث بالتصنيف العلاجي…"
                  className="mb-2.5 w-full rounded-[9px] border border-sand/50 bg-cream px-3 py-2.25 text-[13.5px] text-ink outline-none focus:border-teal/55"
                />
                <div className="grid max-h-64 gap-0.5 overflow-y-auto">
                  <button
                    onClick={() => {
                      setClassValue("");
                      setFilterOpen(false);
                    }}
                    className="cursor-pointer rounded-lg px-2.75 py-2 text-right text-[13.5px] hover:bg-cream"
                    style={{ color: classValue ? "#16221F" : "#348F80", fontWeight: classValue ? 400 : 600 }}
                  >
                    كل التصنيفات
                  </button>
                  {visibleClasses.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setClassValue(c);
                        setFilterOpen(false);
                        setClassSearch("");
                      }}
                      className="cursor-pointer truncate rounded-lg px-2.75 py-2 text-right text-[13.5px] hover:bg-cream"
                      style={{ color: c === classValue ? "#348F80" : "#16221F", fontWeight: c === classValue ? 600 : 400 }}
                    >
                      {c}
                    </button>
                  ))}
                  {visibleClasses.length === 0 && <p className="px-2.75 py-2 text-[13px] text-sand">لا تصنيف مطابق</p>}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={openCreate}
            className="cursor-pointer rounded-[10px] bg-teal px-5 py-2.75 text-[14.5px] font-medium whitespace-nowrap text-cream transition-colors hover:bg-teal-dark"
          >
            إضافة دواء
          </button>
        </div>
      </div>

      {classValue && (
        <div className="mb-3.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/24 bg-teal/9 px-3.25 py-1.75 text-[13px] text-forest">
            {classValue}
            <span
              role="button"
              onClick={() => setClassValue("")}
              className="cursor-pointer font-latin text-sand hover:text-rust"
            >
              ×
            </span>
          </span>
        </div>
      )}

      {rowError && <p className="mb-3 text-[13.5px] text-rust">{rowError}</p>}

      {editing && (
        <div className="mb-3.5 rounded-2xl border border-teal/35 bg-paper p-5">
          <p className="mb-4 text-[15px] font-semibold text-forest">{editing.id === null ? "دواء جديد" : "تعديل دواء"}</p>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.75 block text-[13px] text-forest">الاسم</span>
              <input
                value={editing.form.name}
                onChange={(e) => setEditing({ ...editing, form: { ...editing.form, name: e.target.value } })}
                dir="ltr"
                placeholder="Metformin"
                className="w-full rounded-[10px] border border-sand/55 bg-cream px-3.25 py-2.75 text-right font-latin text-[14.5px] text-ink outline-none focus:border-teal/55"
              />
            </label>
            <label className="block">
              <span className="mb-1.75 block text-[13px] text-forest">المادة الفعّالة</span>
              <input
                value={editing.form.genericName}
                onChange={(e) => setEditing({ ...editing, form: { ...editing.form, genericName: e.target.value } })}
                dir="ltr"
                placeholder="Metformin"
                className="w-full rounded-[10px] border border-sand/55 bg-cream px-3.25 py-2.75 text-right font-latin text-[14.5px] text-ink outline-none focus:border-teal/55"
              />
            </label>
            <label className="block">
              <span className="mb-1.75 block text-[13px] text-forest">الجرعة</span>
              <input
                value={editing.form.dosage}
                onChange={(e) => setEditing({ ...editing, form: { ...editing.form, dosage: e.target.value } })}
                dir="ltr"
                placeholder="500mg tablet"
                className="w-full rounded-[10px] border border-sand/55 bg-cream px-3.25 py-2.75 text-right font-latin text-[14.5px] text-ink outline-none focus:border-teal/55"
              />
            </label>
            <label className="block">
              <span className="mb-1.75 block text-[13px] text-forest">التصنيف العلاجي</span>
              <input
                value={editing.form.therapeuticClass}
                onChange={(e) => setEditing({ ...editing, form: { ...editing.form, therapeuticClass: e.target.value } })}
                placeholder="Antibiotic (Penicillin)"
                className="w-full rounded-[10px] border border-sand/55 bg-cream px-3.25 py-2.75 text-[14.5px] text-ink outline-none focus:border-teal/55"
              />
            </label>
          </div>
          {formError && <p className="mt-3 text-[13px] text-rust">{formError}</p>}
          <div className="mt-4.5 flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="cursor-pointer rounded-[10px] bg-teal px-5.5 py-2.75 text-[14.5px] font-medium text-cream transition-colors hover:bg-teal-dark disabled:opacity-60"
            >
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setEditing(null)} className="cursor-pointer text-sm text-sand">
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-sand/50 bg-paper">
        <div className="hidden grid-cols-[1.3fr_1.3fr_1fr_1.2fr_140px] gap-3 border-b border-sand/45 bg-cream px-4.5 py-3.25 text-[12.5px] text-sand sm:grid">
          <span>الاسم</span>
          <span>المادة الفعّالة</span>
          <span>الجرعة</span>
          <span>التصنيف</span>
          <span></span>
        </div>
        {medications.map((m) => (
          <div
            key={m.id}
            className="grid grid-cols-1 gap-1.5 border-b border-sand/30 px-4.5 py-3.5 sm:grid-cols-[1.3fr_1.3fr_1fr_1.2fr_140px] sm:items-center sm:gap-3"
          >
            <span dir="ltr" className="truncate text-right font-latin text-[14.5px] text-forest">
              {m.name}
            </span>
            <span dir="ltr" className="truncate text-right font-latin text-[13.5px] text-ink/70">
              {m.genericName}
            </span>
            <span dir="ltr" className="truncate text-right font-latin text-[13.5px] text-ink/70">
              {m.dosage}
            </span>
            <span className="truncate text-[13.5px] text-ink/70">{m.therapeuticClass}</span>
            <span className="flex items-center gap-3.5 sm:justify-end">
              <button onClick={() => openEdit(m)} className="cursor-pointer text-[13.5px] text-teal">
                تعديل
              </button>
              <button
                onClick={() => remove(m.id)}
                disabled={deletingId === m.id}
                className="cursor-pointer text-[13.5px] disabled:opacity-60"
                style={{ color: confirmDeleteId === m.id ? "#B5473A" : "#AFB8B5" }}
              >
                {deletingId === m.id ? "..." : confirmDeleteId === m.id ? "تأكيد الحذف" : "حذف"}
              </button>
            </span>
          </div>
        ))}
        {medications.length === 0 && <p className="px-4.5 py-6.5 text-[14px] text-sand">لا نتيجة مطابقة لهذا البحث.</p>}
      </div>
    </div>
  );
}

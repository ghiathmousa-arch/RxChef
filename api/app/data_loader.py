"""يحمّل الكتالوج المرجعي (أدوية + تفاعلات معروفة) من ملفات JSON المدمجة
بمشروع FastAPI. هاد الكتالوج بيستخدم كافتراضي لـ/analyze، وبنفس الوقت
رح يصير مصدر سكربت استيراد Next.js/SQLite بالمرحلة 2. الطلب لسا فيه إمكانية
تمرير كتالوج مختلف (من Next.js لاحقاً) عشان FastAPI تضل بلا حالة فعلياً —
هاد الملف مجرّد بيانات مرجعية للاختبار والتشغيل التجريبي، مو قاعدة بيانات.

مصدر البيانات (2182 تفاعل، حقول severity_source بـinteractions.json):
- "manual" (379): مكتوبة يدوياً من معرفة صيدلانية عامة موثوقة، بلا مصدر
  خارجي قابل للاستشهاد فرداً فرداً — قرار واعي، راجع قسم "حدود النظام".
- "onc_high" (201): من ONC High-Priority Drug-Drug Interactions
  (Phansalkar et al. 2012, JAMIA)، عبر dbmi-pitt/public-PDDI-analysis
  (GitHub) — شدّة "major" حقيقية موثوقة (كلها QT-prolongation/TdP عالية
  الأولوية بالمصدر الأصلي).
- "drugbank_unverified" (1602): أزواج حقيقية من DrugBank v4 (نسخة غير
  تجارية، غير معدّلة)، عبر نفس المستودع — **المصدر ما بيوفّر تصنيف شدّة**،
  فانحطت "moderate" كقيمة افتراضية صراحةً. هاد سبب ليش
  load_verified_severity_interactions() تحت بتستثنيها من تدريب الـML
  (تصنيف موحّد لـ1602 عيّنة بيخلق إشارة مصطنعة تضخّم الدقّة كذباً — جرّبناها
  فعلياً وطلعت 95.9٪ وهمية قبل ما نكتشف المشكلة ونصلّحها).
"""

import json
from functools import lru_cache
from pathlib import Path

from app.algorithms.fuzzy_matching import Medication
from app.algorithms.interaction_graph import Interaction

DATA_DIR = Path(__file__).parent / "data"

UNVERIFIED_SEVERITY_SOURCES = {"drugbank_unverified"}


@lru_cache(maxsize=1)
def load_reference_medications() -> tuple[Medication, ...]:
    raw = json.loads((DATA_DIR / "medications.json").read_text(encoding="utf-8"))
    return tuple(
        Medication(
            id=row["id"],
            name=row["name"],
            generic_name=row["generic_name"],
            therapeutic_class=row["therapeutic_class"],
        )
        for row in raw
    )


def _build_interaction(row: dict, id_by_generic_name: dict[str, int]) -> Interaction:
    return Interaction(
        drug_a_id=id_by_generic_name[row["drug_a"]],
        drug_b_id=id_by_generic_name[row["drug_b"]],
        severity=row["severity"],
        description=row["description"],
    )


@lru_cache(maxsize=1)
def load_reference_interactions() -> tuple[Interaction, ...]:
    """الكتالوج الكامل (2182 تفاعل) — لـFuzzy Matching وGraph Check
    وAlternative Suggestion. كل تفاعل حقيقي هون بغض النظر عن موثوقية
    تصنيف الشدّة (شوف load_verified_severity_interactions للتدريب)."""
    medications = load_reference_medications()
    id_by_generic_name = {med.generic_name: med.id for med in medications}

    raw = json.loads((DATA_DIR / "interactions.json").read_text(encoding="utf-8"))
    return tuple(_build_interaction(row, id_by_generic_name) for row in raw)


@lru_cache(maxsize=1)
def load_verified_severity_interactions() -> tuple[Interaction, ...]:
    """بس التفاعلات يلي عندها تصنيف شدّة موثوق حقيقي (manual + onc_high،
    580 من 2182) — هاي يلي بتستخدم كـlabels لتدريب Model Comparison.
    استثناء drugbank_unverified مقصود: تصنيفها "moderate" افتراضي موحّد،
    مو حقيقي، وتدريب النموذج عليها بيخلق دقّة مضخّمة كذباً (جرّبنا هيك
    فعلياً — 95.9٪ وهمية، النموذج كان عم يتعلّم مصدر البيانات مو الشدّة
    الحقيقية)."""
    medications = load_reference_medications()
    id_by_generic_name = {med.generic_name: med.id for med in medications}

    raw = json.loads((DATA_DIR / "interactions.json").read_text(encoding="utf-8"))
    verified_rows = [
        row for row in raw if row.get("severity_source") not in UNVERIFIED_SEVERITY_SOURCES
    ]
    return tuple(_build_interaction(row, id_by_generic_name) for row in verified_rows)

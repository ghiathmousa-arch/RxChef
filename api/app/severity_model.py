"""يدرّب نموذج تصنيف الشدّة مرّة وحدة (Model Comparison على بيانات حقيقية)
ويخبّئه بالذاكرة — إعادة التدريب مع كل طلب /analyze غير منطقية وغير عملية.
هاد هو خط الربط بين الخوارزمية 3 (اختيار الأفضل) والخوارزمية 4 (التصنيف)."""

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import numpy as np

from app.algorithms.model_comparison import compare_models
from app.algorithms.severity_classifier import SeverityClassifier
from app.algorithms.severity_features import FEATURE_NAMES, build_training_matrix
from app.data_loader import load_reference_medications, load_verified_severity_interactions


@dataclass(frozen=True)
class TrainedSeverityModel:
    classifier: SeverityClassifier
    chosen_model_name: str
    chosen_model_accuracy: float
    candidate_accuracies: dict[str, float]
    feature_importances: dict[str, float] | None


def _extract_feature_importances(model: Any) -> dict[str, float] | None:
    """يطلّع أهمية كل فيتشر من النموذج الأفضل، لتوثيق Feature Importance
    المطلوب بالمرحلة 7. النماذج الشجرية (Random Forest, XGBoost) عندها
    feature_importances_ مباشرة؛ Logistic Regression عندها coef_ (معامل
    لكل فئة)، فبناخد متوسط القيمة المطلقة عبر الفئات كمؤشر أهمية مكافئ."""
    importances = getattr(model, "feature_importances_", None)
    if importances is not None:
        return dict(zip(FEATURE_NAMES, (float(v) for v in importances)))

    coefficients = getattr(model, "coef_", None)
    if coefficients is not None:
        mean_abs_coef = np.abs(coefficients).mean(axis=0)
        return dict(zip(FEATURE_NAMES, (float(v) for v in mean_abs_coef)))

    return None


# مسار النموذج المُدرَّب مسبقاً. بالنشر منولّده وقت البناء (سكربت
# train_model.py) بدل ما ندرّب عند كل إقلاع: نواة الاستضافة المجانية
# (0.1 CPU / 512MB) التدريب عليها بياخد دقائق أو بتخلص الذاكرة، فأول طلب
# تحليل كان بيضل معلّق. التحميل من الملف بياخد أقل من ثانية.
MODEL_PATH = Path(__file__).parent / "data" / "severity_model.joblib"


def train_severity_model() -> TrainedSeverityModel:
    """بتدرّب بس على التفاعلات يلي عندها شدّة موثوقة (manual + onc_high)،
    وبتستخدم نفس المجموعة كسياق لحساب الفيتشرز (drugbank_unverified
    مستثناة من الاثنين). مهم يضل هيك متوافق مع pipeline.py وقت الاستدلال
    الفعلي — لو دربنا بسياق مختلف عن سياق وقت التشغيل، بصير train/serve
    skew وبتنكسر دقّة النموذج الحقيقية بالإنتاج. جرّبنا استخدام الكتالوج
    الكامل كسياق تدريب وطلعت دقّة أوطى (0.848 مقابل 0.867) — إشارة إضافية
    إنه الاتساق أهم من حجم السياق هون."""
    medications = list(load_reference_medications())
    labeled_interactions = list(load_verified_severity_interactions())
    X, y = build_training_matrix(labeled_interactions, medications)

    result = compare_models(X, y)
    return TrainedSeverityModel(
        classifier=SeverityClassifier(result.best.model),
        chosen_model_name=result.best.name,
        chosen_model_accuracy=result.best.accuracy,
        candidate_accuracies={score.name: score.accuracy for score in result.scores},
        feature_importances=_extract_feature_importances(result.best.model),
    )


@lru_cache(maxsize=1)
def get_trained_severity_model() -> TrainedSeverityModel:
    """بترجّع النموذج المُدرَّب: من الملف إذا موجود (حالة النشر)، وإلا
    بتدرّب بالذاكرة (حالة التطوير والاختبارات). فشل التحميل — مثلاً ملف
    من نسخة مكتبة مختلفة — ما بيكسر الخدمة، بيرجع للتدريب."""
    if MODEL_PATH.exists():
        try:
            return joblib.load(MODEL_PATH)
        except Exception:  # noqa: BLE001 — أي فشل تحميل، منرجع ندرّب
            pass
    return train_severity_model()

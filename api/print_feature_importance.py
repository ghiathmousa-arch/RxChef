"""سكربت مستقل لطباعة جدول Feature Importance بشكل واضح للقطة شاشة —
مطلوب بملحق اختبارات الصندوق الأبيض بالأطروحة. يستخدم نفس النموذج
المُدرَّب والمخبّأ يلي بيستخدمه /analyze فعليًا (get_trained_severity_model)،
مش تدريب منفصل.
"""

import sys

sys.stdout.reconfigure(encoding="utf-8")

from app.severity_model import get_trained_severity_model  # noqa: E402

trained = get_trained_severity_model()

print(f"النموذج المختار: {trained.chosen_model_name}")
print(f"دقّته (cross-validation): {trained.chosen_model_accuracy:.1%}")
print()
print("دقّة كل النماذج المرشّحة:")
for name, accuracy in sorted(trained.candidate_accuracies.items(), key=lambda kv: -kv[1]):
    marker = " <- الأفضل" if name == trained.chosen_model_name else ""
    print(f"  {name:<22} {accuracy:.1%}{marker}")
print()
print("Feature Importance (مرتّبة تنازليًا):")
ranked = sorted(trained.feature_importances.items(), key=lambda kv: -kv[1])
for rank, (feature, importance) in enumerate(ranked, start=1):
    bar = "#" * max(1, round(importance * 60))
    print(f"  {rank:2}. {feature:<22} {importance:.4f}  {bar}")

"""بيدرّب نموذج الشدّة وبيحفظه لملف، عشان الخدمة تحمّله جاهز وقت الإقلاع.

بينشغّل مرة وحدة وقت البناء (Build Command على الاستضافة). السبب: على
النواة المجانية (0.1 CPU / 512MB) التدريب وقت التشغيل بياخد دقائق أو
بتخلص الذاكرة، فأول طلب تحليل بيضل معلّق. آلة البناء أقوى، فمنعمل
التدريب هناك مرة وحدة.

    python train_model.py
"""

import joblib

from app.severity_model import MODEL_PATH, train_severity_model


def main() -> None:
    model = train_severity_model()
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    size_kb = MODEL_PATH.stat().st_size / 1024
    print(f"النموذج المختار: {model.chosen_model_name} (دقّة {model.chosen_model_accuracy:.3f})")
    print(f"انحفظ بـ{MODEL_PATH} — {size_kb:.0f} كيلوبايت")


if __name__ == "__main__":
    main()

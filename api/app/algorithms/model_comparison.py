"""Model Comparison — يدرّب ثلاث نماذج تصنيف (Logistic Regression, Random
Forest, XGBoost) على بيانات فيتشرز التفاعلات الدوائية، يقارن دقّتها، ويختار
الأفضل. يعمل بمعزل تام عن FastAPI وقاعدة البيانات.
"""

from dataclasses import dataclass, field
from typing import Any

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

SEVERITY_CLASSES = ("minor", "moderate", "major")


@dataclass(frozen=True)
class ModelScore:
    name: str
    accuracy: float
    model: Any = field(repr=False)


@dataclass(frozen=True)
class ComparisonResult:
    scores: list[ModelScore]
    best: ModelScore


class _LabelDecodingModel:
    """XGBoost (بعكس LogisticRegression وRandomForest) ما بيقبل تسميات
    نصية، لازم أعداد صحيحة مشفّرة. هاد الغلاف بيخفي هالفرق عشان كل
    النماذج الثلاثة ترجع تسميات الشدّة النصية الأصلية بنفس الشكل."""

    def __init__(self, fitted_model: Any, label_encoder: LabelEncoder):
        self._model = fitted_model
        self._encoder = label_encoder
        self.classes_ = label_encoder.classes_

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self._encoder.inverse_transform(self._model.predict(X))

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return self._model.predict_proba(X)

    @property
    def feature_importances_(self) -> np.ndarray | None:
        return getattr(self._model, "feature_importances_", None)


def _candidate_models(random_state: int) -> dict[str, Any]:
    return {
        "logistic_regression": LogisticRegression(max_iter=1000, random_state=random_state),
        "random_forest": RandomForestClassifier(n_estimators=200, random_state=random_state),
        "xgboost": XGBClassifier(
            eval_metric="mlogloss",
            random_state=random_state,
        ),
    }


def compare_models(
    X: np.ndarray,
    y: np.ndarray,
    cv_folds: int = 5,
    random_state: int = 42,
) -> ComparisonResult:
    """يدرّب النماذج الثلاثة ويقارنها بـk-fold cross-validation (بدل
    تقسيمة train/test وحيدة) — تقدير دقّة أثبت وأقل حساسية لتقسيمة عشوائية
    واحدة، خصوصاً على بيانات صغيرة نسبياً متل عندنا. النموذج النهائي لكل
    مرشّح بيتدرّب على كامل البيانات بعدين (أفضل استغلال للعيّنات المتوفّرة).

    X: مصفوفة فيتشرز (n_samples, n_features). y: تسميات الفئات (تصنيف).
    """
    cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=random_state)

    scores: list[ModelScore] = []
    for name, model in _candidate_models(random_state).items():
        if name == "xgboost":
            encoder = LabelEncoder()
            y_encoded = encoder.fit_transform(y)
            cv_scores = cross_val_score(model, X, y_encoded, cv=cv)
            model.fit(X, y_encoded)
            model = _LabelDecodingModel(model, encoder)
        else:
            cv_scores = cross_val_score(model, X, y, cv=cv)
            model.fit(X, y)
        scores.append(ModelScore(name=name, accuracy=float(cv_scores.mean()), model=model))

    best = max(scores, key=lambda score: score.accuracy)
    return ComparisonResult(scores=scores, best=best)

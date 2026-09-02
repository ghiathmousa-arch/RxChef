"""اختبار مستقل لـ POST /analyze عبر FastAPI TestClient — تكامل كامل
من طلب HTTP لحد تقرير JSON، بالكتالوج المرجعي الحقيقي.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_analyze_returns_known_interaction():
    response = client.post("/analyze", json={"drug_names": ["Coumadin", "Aspirin"]})
    assert response.status_code == 200

    body = response.json()
    assert body["summary"]["matched_count"] == 2
    assert body["summary"]["interactions_found"] == 1
    assert body["interactions"][0]["catalog_severity"] == "major"


def test_analyze_includes_alternatives_for_major_interaction():
    response = client.post("/analyze", json={"drug_names": ["Coumadin", "Aspirin"]})
    assert response.status_code == 200

    body = response.json()
    interaction = body["interactions"][0]
    assert interaction["catalog_severity"] == "major"
    assert len(interaction["alternatives"]) > 0
    assert body["summary"]["alternatives_found"] == len(interaction["alternatives"])
    for alt in interaction["alternatives"]:
        assert "medication_id" in alt
        assert "reason" in alt


def test_analyze_reports_unmatched_drug():
    response = client.post("/analyze", json={"drug_names": ["Coumadin", "NotARealDrug"]})
    assert response.status_code == 200

    body = response.json()
    assert body["summary"]["matched_count"] == 1
    assert body["summary"]["unmatched_count"] == 1
    assert body["unmatched"][0]["query"] == "NotARealDrug"


def test_analyze_with_empty_prescription():
    response = client.post("/analyze", json={"drug_names": []})
    assert response.status_code == 200

    body = response.json()
    assert body["summary"] == {
        "total_input": 0,
        "matched_count": 0,
        "unmatched_count": 0,
        "interactions_found": 0,
        "alternatives_found": 0,
    }


def test_analyze_accepts_custom_catalog_override():
    custom_meds = [
        {"id": 1, "name": "DrugA", "generic_name": "DrugA", "therapeutic_class": "TestClass"},
        {"id": 2, "name": "DrugB", "generic_name": "DrugB", "therapeutic_class": "TestClass"},
    ]
    custom_interactions = [
        {"drug_a_id": 1, "drug_b_id": 2, "severity": "moderate", "description": "Test-only interaction"}
    ]
    response = client.post(
        "/analyze",
        json={
            "drug_names": ["DrugA", "DrugB"],
            "medications": custom_meds,
            "known_interactions": custom_interactions,
        },
    )
    assert response.status_code == 200

    body = response.json()
    assert body["summary"]["matched_count"] == 2
    assert body["summary"]["interactions_found"] == 1
    assert body["interactions"][0]["catalog_severity"] == "moderate"


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))

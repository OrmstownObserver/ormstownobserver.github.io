"""Regression tests for scripts/export-bylaws.py.

Run:  python3 -m unittest scripts/tests/test_export_bylaws.py
Uses only the synthetic fixture and temp directories: never reads Notion,
never touches dist/.
"""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
spec = importlib.util.spec_from_file_location("export_bylaws", ROOT / "scripts" / "export-bylaws.py")
X = importlib.util.module_from_spec(spec)
spec.loader.exec_module(X)

FIXTURE = HERE / "fixtures" / "bylaw-registry-rows.json"
REAL_SNAPSHOT = ROOT / "dist" / "bylaws.json"


def rows():
    return X.load_rows_file(FIXTURE)


def by_number(records):
    return {r["bylaw_number"]: r for r in records}


class Contract(unittest.TestCase):
    def test_output_uses_records_array_and_public_fields_only(self):
        with tempfile.TemporaryDirectory() as d:
            out = Path(d) / "b.json"
            code = X.main(["--from-rows", str(FIXTURE), "--preview", "--out", str(out), "--overlay", str(Path(d) / "none.json")])
            self.assertEqual(code, 0)
            doc = json.loads(out.read_text(encoding="utf-8"))
        self.assertIn("records", doc)
        self.assertNotIn("bylaws", doc, "renderer reads `records`; the old exporter wrote `bylaws`")
        self.assertEqual(doc["version"], X.SCHEMA_VERSION)
        for r in doc["records"]:
            self.assertEqual(list(r), X.PUBLIC_FIELDS)

    def test_internal_fields_never_leak(self):
        records, _, _ = X.build_records(rows(), "status", [])
        blob = json.dumps(records, ensure_ascii=False)
        for secret in ("INTERNAL-NOTE-SENTINEL", "Drive Only", "Held Back", "__YES__"):
            self.assertNotIn(secret, blob)

    def test_real_schema_property_names_are_read(self):
        r = by_number(X.build_records(rows(), "web_ready", [])[0])["Règlement 900-2026"]
        self.assertEqual(r["title_en"], "Test Animals Bylaw")
        self.assertEqual(r["title_fr"], "Règlement test sur les animaux")
        self.assertEqual(r["adopted_date"], "2026-04-13")
        self.assertEqual(r["in_force_date"], "2026-04-17")
        self.assertEqual(r["enforced_by"], "Municipality")
        self.assertEqual(r["fines"], "$300–$2,000")
        self.assertEqual(r["key_facts_en"], ["Licence required (art. 14)", "Max 4 cats (art. 29)"])
        self.assertEqual(r["key_facts_fr"], ["Licence obligatoire (art. 14)"])
        self.assertEqual(r["summary_fr"], "Un résumé de test.")
        self.assertEqual(r["topics"], ["Animals"])


class Gate(unittest.TestCase):
    def test_production_gate_is_web_ready_only(self):
        nums = set(by_number(X.build_records(rows(), "web_ready", [])[0]))
        self.assertEqual(nums, {"Règlement 900-2026", "Projet de règlement 901.1-2026", "Règlement 902-2018", "Règlement 903-2015"})

    def test_preview_gate_is_status_set(self):
        nums = set(by_number(X.build_records(rows(), "status", [])[0]))
        self.assertNotIn("Règlement 902-2018", nums, "blank status is not preview-ready")
        self.assertIn("Règlement 900-2020", nums)
        self.assertIn("Règlement 904-2024", nums)

    def test_unknown_and_blank_statuses_are_preserved_not_guessed(self):
        recs = by_number(X.build_records(rows(), "web_ready", [])[0])
        self.assertEqual(recs["Règlement 903-2015"]["status"], "Superseded?")
        self.assertEqual(recs["Règlement 902-2018"]["status"], "")

    def test_counts_report_the_gate_discrepancy(self):
        _, _, counts = X.build_records(rows(), "web_ready", [])
        self.assertEqual(counts["rows"], 6)
        self.assertEqual(counts["web_ready"], 4)
        self.assertEqual(counts["status_blank"], 1)


class Semantics(unittest.TestCase):
    def test_jan1_placeholder_becomes_year_only_with_warning(self):
        recs, warns, _ = X.build_records(rows(), "web_ready", [])
        self.assertEqual(by_number(recs)["Règlement 902-2018"]["in_force_date"], "2018")
        self.assertTrue(any("Jan-1 placeholder" in w for w in warns))

    def test_relations_resolve_only_within_the_exported_set(self):
        prod = by_number(X.build_records(rows(), "web_ready", [])[0])
        self.assertEqual(prod["Règlement 900-2026"]["amends"], [], "900-2020 is not Web Ready, so it is not named")
        prev = by_number(X.build_records(rows(), "status", [])[0])
        self.assertEqual(prev["Règlement 900-2026"]["amends"], ["Règlement 900-2020"])
        self.assertEqual(prev["Règlement 900-2020"]["amended_by"], ["Règlement 900-2026"])

    def test_next_step_only_on_drafts(self):
        recs = by_number(X.build_records(rows(), "status", [])[0])
        self.assertEqual(recs["Projet de règlement 901.1-2026"]["next_step"], "Adoption of second draft")
        self.assertEqual(recs["Projet de règlement 901.1-2026"]["next_step_date"], "2026-11-02")
        self.assertIsNone(recs["Règlement 904-2024"]["next_step"])

    def test_curated_explainer_and_fines_survive_from_snapshot(self):
        overlay = [{"bylaw_number": "Règlement 900-2026", "explainer": {"en": "/en/bylaws-regulations/x/", "fr": "/fr/bylaws-regulations/x/"}},
                   {"bylaw_number": "Règlement 903-2015", "fines": "$10,000+", "key_facts_en": ["Curated fact"]}]
        recs = by_number(X.build_records(rows(), "web_ready", overlay)[0])
        self.assertEqual(recs["Règlement 900-2026"]["explainer"]["fr"], "/fr/bylaws-regulations/x/")
        self.assertEqual(recs["Règlement 903-2015"]["fines"], "$10,000+")
        self.assertEqual(recs["Règlement 903-2015"]["key_facts_en"], ["Curated fact"])


class Refusals(unittest.TestCase):
    def _doc(self, records):
        return {"version": 2, "records": records}

    def test_empty_output_is_refused(self):
        self.assertTrue(X.validate(self._doc([])))

    def test_bad_hosts_paths_and_dates_are_refused(self):
        rec = {f: ([] if f in ("topics", "key_facts_en", "key_facts_fr", "amends", "amended_by") else None) for f in X.PUBLIC_FIELDS}
        rec.update({"bylaw_number": "R 1-2026", "official_url": "http://evil.example/x.pdf",
                    "explainer": {"en": "javascript:alert(1)"}, "adopted_date": "13/04/2026"})
        errs = " ".join(X.validate(self._doc([rec])))
        self.assertIn("official_url", errs)
        self.assertIn("explainer.en", errs)
        self.assertIn("adopted_date", errs)

    def test_losing_an_explainer_or_most_records_is_refused(self):
        old = [{"bylaw_number": "Règlement 900-2026", "explainer": {"en": "/en/a/"}}] + [{"bylaw_number": f"R {i}-2000"} for i in range(20)]
        errs = X.guard_against_regression([{"bylaw_number": "Règlement 900-2026", "explainer": None}], old, False)
        self.assertTrue(any("explainer" in e for e in errs))
        self.assertTrue(any("record count" in e for e in errs))

    def test_refused_run_writes_nothing(self):
        with tempfile.TemporaryDirectory() as d:
            out = Path(d) / "b.json"
            overlay = Path(d) / "old.json"
            overlay.write_text(json.dumps({"records": [{"bylaw_number": f"R {i}-2000"} for i in range(50)]}), encoding="utf-8")
            code = X.main(["--from-rows", str(FIXTURE), "--out", str(out), "--overlay", str(overlay)])
            self.assertEqual(code, 1)
            self.assertFalse(out.exists())


class PublishedSnapshot(unittest.TestCase):
    """The committed snapshot must stay readable by the renderer contract."""

    def test_snapshot_has_records_and_numbers(self):
        doc = json.loads(REAL_SNAPSHOT.read_text(encoding="utf-8"))
        self.assertIsInstance(doc.get("records"), list)
        self.assertGreater(len(doc["records"]), 0)
        for r in doc["records"]:
            self.assertTrue(r.get("bylaw_number"))
            for f in r:
                self.assertIn(f, X.PUBLIC_FIELDS, f"snapshot carries a non-public field {f}")


if __name__ == "__main__":
    unittest.main()

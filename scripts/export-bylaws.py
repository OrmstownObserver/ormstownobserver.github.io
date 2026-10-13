#!/usr/bin/env python3
"""Export the Ormstown Bylaw Registry (Notion) to the static register JSON.

Source: the "📜 Ormstown Bylaw Registry" data source (ID in the Notion System
Registry). Output: the contract bylaws-register.js reads — a JSON object whose
`records` array holds ONLY the public fields listed in PUBLIC_FIELDS.

    python3 scripts/export-bylaws.py --preview            # status-set rows -> dist/bylaws-preview.json
    python3 scripts/export-bylaws.py                      # Web Ready rows  -> dist/bylaws.json
    python3 scripts/export-bylaws.py --from-rows rows.json --preview
                                     # no token: rows exported by the Notion
                                     # connector (SQL query of the data source)

Guarantees, each enforced before anything is written:
  * Publication gate. Production exports ONLY rows with Web Ready checked.
    Preview exports rows whose Bylaw Status is set. Nothing else is a gate.
  * Allowlist. Internal fields (Notes, URL Status, Article Status, Web Ready,
    page bodies) are never read into a record, so they cannot leak.
  * No invented values. A blank stays blank; an unknown status is passed
    through as written; the renderer labels gaps as "Not recorded".
  * Jan-1 placeholders. The registry used YYYY-01-01 where a document gave
    only a year. Those are emitted as the year alone ("2011"), never as a
    day the bylaw may not have taken effect, and are listed as warnings.
  * Curated fields survive. Explainer links, and fines / English key facts
    hand-curated into the current snapshot, are carried over from the
    existing output file (--overlay) when Notion has no value. A refresh
    can no longer silently wipe every explainer link from the register.
  * Refusals. No output when: zero records; any record fails validation;
    production would drop an explainer link that the snapshot has; or the
    production record count shrinks by more than 10% (override: --allow-shrink).
The file is written atomically, so a failed run never leaves a half file.
"""

import argparse
import json
import os
import re
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

NOTION_DB_ID = "823d8429-3a12-4bce-a675-d0e3947e7acb"
ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT / "dist" / "bylaws.json"
DEFAULT_PREVIEW = ROOT / "dist" / "bylaws-preview.json"

SCHEMA_VERSION = 2

# Notion property names, exactly as the data source defines them (2026-10-10).
P_NUMBER = "Bylaw Number"
P_TITLE_EN = "Bylaw Title (EN)"
P_TITLE_FR = "Titre du règlement (FR)"
P_STATUS = "Bylaw Status"
P_CATEGORY = "Category"
P_TOPICS = "Topics"
P_ADOPTED = "Date Adopted"
P_IN_FORCE = "Date In Force"
P_AMENDED = "Last Amended"
P_ENFORCED = "Enforced By"
P_FINES = "Fine Range"
P_OFFICIAL = "Official URL"
P_FACTS_EN = "Key Facts (EN)"
P_FACTS_FR = "Faits clés (FR)"
P_SUMMARY_EN = "Summary (EN)"
P_SUMMARY_FR = "Résumé (FR)"
P_NEXT = "Next Step"
P_NEXT_DATE = "Next Step Date"
P_AMENDS = "Amends / Replaces"
P_AMENDED_BY = "Amended / Replaced By"
P_ARTICLE = "Article URL"
P_WEB_READY = "Web Ready"

# The ONLY properties read from a row. Notes, URL Status and Article Status
# are deliberately absent: they are internal.
READ_PROPS = [
    P_NUMBER, P_TITLE_EN, P_TITLE_FR, P_STATUS, P_CATEGORY, P_TOPICS,
    P_ADOPTED, P_IN_FORCE, P_AMENDED, P_ENFORCED, P_FINES, P_OFFICIAL,
    P_FACTS_EN, P_FACTS_FR, P_SUMMARY_EN, P_SUMMARY_FR, P_NEXT, P_NEXT_DATE,
    P_AMENDS, P_AMENDED_BY, P_ARTICLE, P_WEB_READY,
]

PUBLIC_FIELDS = [
    "bylaw_number", "title_en", "title_fr", "status", "category", "topics",
    "adopted_date", "in_force_date", "amended_date", "enforced_by", "fines",
    "official_url", "key_facts_en", "key_facts_fr", "summary_en", "summary_fr",
    "next_step", "next_step_date", "amends", "amended_by", "explainer",
]
KNOWN_STATUSES = {"In force", "Amended", "Repealed", "Draft"}
OFFICIAL_HOSTS = {"www.ormstown.ca", "ormstown.ca", "drive.google.com", "docs.google.com", "www.mrchsl.com", "mrchsl.com"}
DATE_RE = re.compile(r"^\d{4}(-\d{2}-\d{2})?$")
SITE_PATH_RE = re.compile(r"^/(en|fr)/[a-z0-9\-/]*$", re.I)
SITE_HOST_RE = re.compile(r"^https?://(www\.)?ormstownobserver\.(ca|github\.io)(/(en|fr)/[a-z0-9\-/]*)$", re.I)


# ---------------------------------------------------------------- reading
def get_notion_token():
    token = os.environ.get("NOTION_TOKEN", "").strip()
    if not token:
        sys.exit("ERROR: set NOTION_TOKEN, or use --from-rows with a connector export.")
    if not token.isascii() or " " in token:
        sys.exit("ERROR: NOTION_TOKEN contains spaces or non-ASCII characters — re-copy it.")
    return token


def fetch_all_pages(db_id):
    """Every row, unfiltered — the gate is applied locally so relations can be
    resolved against the exported set and the counts can be reported."""
    import requests
    headers = {
        "Authorization": f"Bearer {get_notion_token()}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json; charset=utf-8",
    }
    url = f"https://api.notion.com/v1/databases/{db_id}/query"
    payload, pages = {"page_size": 100}, []
    while True:
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        if resp.status_code != 200:
            sys.exit(f"ERROR: Notion API returned {resp.status_code}: {resp.text[:300]}")
        data = resp.json()
        pages.extend(data.get("results", []))
        if not data.get("has_more"):
            return pages
        payload["start_cursor"] = data["next_cursor"]


def _api_value(prop):
    t = prop.get("type")
    if t in ("rich_text", "title"):
        return "".join(p.get("plain_text", "") for p in prop.get(t, []))
    if t == "select":
        return (prop.get("select") or {}).get("name")
    if t == "status":
        return (prop.get("status") or {}).get("name")
    if t == "multi_select":
        return [s["name"] for s in prop.get("multi_select", [])]
    if t == "date":
        return (prop.get("date") or {}).get("start")
    if t == "url":
        return prop.get("url")
    if t == "checkbox":
        return bool(prop.get("checkbox"))
    if t == "relation":
        return [r["id"] for r in prop.get("relation", [])]
    return None


def row_from_api_page(page):
    props = page.get("properties", {})
    row = {"_id": page["id"]}
    for name in READ_PROPS:
        if name in props:
            row[name] = _api_value(props[name])
    return row


def row_from_connector(raw):
    """A row from the Notion connector's SQL output. Its keys are property
    names, except dates (date:<Name>:start), and JSON-encoded lists."""
    row = {"_id": raw.get("url") or raw.get("id")}
    for name in READ_PROPS:
        if f"date:{name}:start" in raw:
            row[name] = raw.get(f"date:{name}:start")
        elif name in raw:
            v = raw[name]
            if name in (P_TOPICS, P_AMENDS, P_AMENDED_BY) and isinstance(v, str):
                try:
                    v = json.loads(v) if v.strip() else []
                except json.JSONDecodeError:
                    v = []
            if name == P_WEB_READY:
                v = v in (True, "__YES__", "true", 1)
            row[name] = v
    return row


def load_rows_file(path):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    rows = data.get("results", data) if isinstance(data, dict) else data
    if not isinstance(rows, list):
        sys.exit(f"ERROR: {path} holds no row list.")
    return [row_from_connector(r) for r in rows]


# ---------------------------------------------------------------- building
def _text(v):
    if v is None:
        return ""
    return str(v).strip()


def _lines(v):
    v = _text(v).replace("\\n", "\n")
    return [ln.strip() for ln in v.splitlines() if ln.strip()]


def _page_key(ref):
    """Relation values are page ids (API) or page URLs (connector); compare
    on the 32 hex digits either way."""
    m = re.search(r"([0-9a-f]{32})", _text(ref).replace("-", ""))
    return m.group(1) if m else _text(ref)


def _date(v, field, number, warnings):
    v = _text(v)[:10]
    if not v:
        return None
    if not DATE_RE.match(v):
        warnings.append(f"{number}: {field} '{v}' is not a date — left blank")
        return None
    if v.endswith("-01-01"):
        warnings.append(f"{number}: {field} {v} looks like a Jan-1 placeholder — emitted as the year {v[:4]}")
        return v[:4]
    return v


def _explainer(article_url):
    u = _text(article_url)
    if not u:
        return None
    m = SITE_HOST_RE.match(u)
    path = m.group(3) if m else (u if SITE_PATH_RE.match(u) else None)
    if not path or not path.startswith("/en/"):
        return None
    return {"en": path}


def build_records(rows, gate, overlay):
    """rows -> (records, warnings, counts). gate: 'web_ready' | 'status'."""
    warnings = []
    key_to_number = {_page_key(r.get("_id")): _text(r.get(P_NUMBER)) for r in rows}
    if gate == "web_ready":
        chosen = [r for r in rows if r.get(P_WEB_READY) is True]
    else:
        chosen = [r for r in rows if _text(r.get(P_STATUS))]
    exported_numbers = {_text(r.get(P_NUMBER)) for r in chosen}
    over = {r.get("bylaw_number"): r for r in (overlay or [])}

    records, seen = [], set()
    for r in chosen:
        number = _text(r.get(P_NUMBER))
        if not number:
            warnings.append(f"row {r.get('_id')}: no Bylaw Number — skipped")
            continue
        if number in seen:
            warnings.append(f"{number}: duplicate Bylaw Number — second row skipped")
            continue
        seen.add(number)
        status = _text(r.get(P_STATUS))
        if status and status not in KNOWN_STATUSES:
            warnings.append(f"{number}: unknown status '{status}' passed through unchanged")

        def related(prop):
            nums = [key_to_number.get(_page_key(x), "") for x in (r.get(prop) or [])]
            return sorted({n for n in nums if n and n in exported_numbers})

        rec = {
            "bylaw_number": number,
            "title_en": _text(r.get(P_TITLE_EN)),
            "title_fr": _text(r.get(P_TITLE_FR)),
            "status": status,
            "category": _text(r.get(P_CATEGORY)) or None,
            "topics": list(r.get(P_TOPICS) or []),
            "adopted_date": _date(r.get(P_ADOPTED), "Date Adopted", number, warnings),
            "in_force_date": _date(r.get(P_IN_FORCE), "Date In Force", number, warnings),
            "amended_date": _date(r.get(P_AMENDED), "Last Amended", number, warnings),
            "enforced_by": _text(r.get(P_ENFORCED)) or None,
            "fines": _text(r.get(P_FINES)) or None,
            "official_url": _text(r.get(P_OFFICIAL)) or None,
            "key_facts_en": _lines(r.get(P_FACTS_EN)),
            "key_facts_fr": _lines(r.get(P_FACTS_FR)),
            "summary_en": _text(r.get(P_SUMMARY_EN)) or None,
            "summary_fr": _text(r.get(P_SUMMARY_FR)) or None,
            "next_step": _text(r.get(P_NEXT)) or None,
            "next_step_date": _date(r.get(P_NEXT_DATE), "Next Step Date", number, warnings),
            "amends": related(P_AMENDS),
            "amended_by": related(P_AMENDED_BY),
            "explainer": _explainer(r.get(P_ARTICLE)),
        }
        if rec["next_step"] and status != "Draft":
            warnings.append(f"{number}: Next Step is set on a non-draft row — not published")
            rec["next_step"], rec["next_step_date"] = None, None

        # Curated overlay: values hand-curated into the published snapshot win
        # for explainer links, and fill fines / English facts Notion lacks.
        prev = over.get(number) or {}
        if prev.get("explainer"):
            rec["explainer"] = prev["explainer"]
        for field in ("fines", "key_facts_en"):
            if not rec[field] and prev.get(field):
                rec[field] = prev[field]
                warnings.append(f"{number}: {field} kept from the existing snapshot (not in Notion)")
        records.append({k: rec[k] for k in PUBLIC_FIELDS})

    def sort_key(rec):
        m = re.search(r"(\d+(?:\.\d+)*)-(\d{4})", rec["bylaw_number"])
        if not m:
            return (0, [], rec["bylaw_number"])
        return (-int(m.group(2)), [int(x) for x in m.group(1).split(".")], rec["bylaw_number"])

    records.sort(key=sort_key)
    counts = {
        "rows": len(rows),
        "web_ready": sum(1 for r in rows if r.get(P_WEB_READY) is True),
        "status_set": sum(1 for r in rows if _text(r.get(P_STATUS))),
        "status_blank": sum(1 for r in rows if not _text(r.get(P_STATUS))),
        "exported": len(records),
    }
    return records, warnings, counts


# ---------------------------------------------------------------- validating
def validate(doc):
    """Return a list of problems; empty means the document is publishable."""
    errs = []
    if not isinstance(doc, dict) or not isinstance(doc.get("records"), list):
        return ["output must be an object with a `records` array"]
    if not doc["records"]:
        errs.append("no records — refusing to publish an empty register")
    seen = set()
    for i, r in enumerate(doc["records"]):
        tag = r.get("bylaw_number") or f"record {i}"
        extra = set(r) - set(PUBLIC_FIELDS)
        if extra:
            errs.append(f"{tag}: non-public fields {sorted(extra)}")
        if not _text(r.get("bylaw_number")):
            errs.append(f"{tag}: missing bylaw_number")
        if tag in seen:
            errs.append(f"{tag}: duplicate bylaw_number")
        seen.add(tag)
        for f in ("adopted_date", "in_force_date", "amended_date", "next_step_date"):
            v = r.get(f)
            if v is not None and not DATE_RE.match(str(v)):
                errs.append(f"{tag}: {f} '{v}' is not YYYY or YYYY-MM-DD")
        u = r.get("official_url")
        if u:
            m = re.match(r"^https://([^/?#:]+)", u)
            if not m or m.group(1).lower() not in OFFICIAL_HOSTS:
                errs.append(f"{tag}: official_url is not https on an allowed host: {u}")
        ex = r.get("explainer")
        if ex is not None:
            if not isinstance(ex, dict) or not ex:
                errs.append(f"{tag}: explainer must be an {{en, fr}} object")
            else:
                for lg, p in ex.items():
                    if lg not in ("en", "fr") or not SITE_PATH_RE.match(str(p)) or not str(p).startswith(f"/{lg}/"):
                        errs.append(f"{tag}: explainer.{lg} is not a same-site /{lg}/ path: {p}")
        for f in ("topics", "key_facts_en", "key_facts_fr", "amends", "amended_by"):
            if not isinstance(r.get(f), list):
                errs.append(f"{tag}: {f} must be a list")
    return errs


def guard_against_regression(new_records, old_records, allow_shrink):
    errs = []
    new_by = {r["bylaw_number"]: r for r in new_records}
    for old in old_records:
        if old.get("explainer") and not (new_by.get(old["bylaw_number"]) or {}).get("explainer"):
            errs.append(f"{old['bylaw_number']}: would lose its explainer link")
    if old_records and len(new_records) < 0.9 * len(old_records) and not allow_shrink:
        errs.append(f"record count would drop from {len(old_records)} to {len(new_records)} (use --allow-shrink if intended)")
    return errs


def write_atomic(path, doc):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=".bylaws-", suffix=".json")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.replace(tmp, path)


def main(argv=None):
    ap = argparse.ArgumentParser(description="Export the Ormstown Bylaw Registry to the register JSON")
    ap.add_argument("--preview", action="store_true", help="gate on Bylaw Status set; write dist/bylaws-preview.json")
    ap.add_argument("--from-rows", type=Path, help="rows exported by the Notion connector (no token needed)")
    ap.add_argument("--out", type=Path, help="output path (default dist/bylaws.json, or dist/bylaws-preview.json with --preview)")
    ap.add_argument("--overlay", type=Path, default=DEFAULT_OUT, help="published snapshot whose curated fields are carried over")
    ap.add_argument("--allow-shrink", action="store_true", help="permit a production record count drop over 10%%")
    ap.add_argument("--dry-run", action="store_true", help="validate and report; write nothing")
    args = ap.parse_args(argv)

    rows = load_rows_file(args.from_rows) if args.from_rows else [row_from_api_page(p) for p in fetch_all_pages(NOTION_DB_ID)]
    old = []
    if args.overlay and args.overlay.exists():
        prev = json.loads(args.overlay.read_text(encoding="utf-8"))
        old = prev.get("records") or prev.get("bylaws") or []

    gate = "status" if args.preview else "web_ready"
    records, warnings, counts = build_records(rows, gate, old)
    doc = {
        "version": SCHEMA_VERSION,
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "source_note": "Local publication snapshot generated from public municipal bylaw records reviewed in the Observer Notion bylaw registry.",
        "legal_note_en": "Unofficial public-interest index. French official documents published by the municipality remain the authoritative source.",
        "legal_note_fr": "Index non officiel d’intérêt public. Les documents officiels français publiés par la municipalité demeurent la source faisant autorité.",
        "gate": "Bylaw Status set (preview)" if args.preview else "Web Ready",
        "records": records,
    }

    print(f"Registry rows: {counts['rows']} · Web Ready: {counts['web_ready']} · status set: {counts['status_set']} · status blank: {counts['status_blank']}")
    print(f"Gate: {doc['gate']} → {counts['exported']} records")
    for w in warnings:
        print(f"  warn  {w}")

    problems = validate(doc)
    if not args.preview:
        problems += guard_against_regression(records, old, args.allow_shrink)
    if problems:
        for p in problems:
            print(f"  REFUSED  {p}", file=sys.stderr)
        print("Nothing written.", file=sys.stderr)
        return 1
    if args.dry_run:
        print("Dry run: valid; nothing written.")
        return 0
    out = args.out or (DEFAULT_PREVIEW if args.preview else DEFAULT_OUT)
    write_atomic(out, doc)
    print(f"Wrote {len(records)} records to {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

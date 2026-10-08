#!/usr/bin/env python3
"""Export Ormstown Bylaw Registry from Notion to static JSON.

Reads rows from the "📜 Ormstown Bylaw Registry" database (collection://823d8429-3a12-4bce-a675-d0e3947e7acb),
filters to rows with Web Ready checked (or Bylaw Status set for preview), and writes:
  - dist/bylaws.json       — production export (Web Ready only)
  - dist/bylaws-preview.json — preview export (Bylaw Status set, for review before ticking Web Ready)

Usage:
    python scripts/export-bylaws.py              # production (Web Ready only)
    python scripts/export-bylaws.py --preview     # preview (Bylaw Status set)
"""

import json
import os
import sys
import csv
from datetime import datetime, timezone
from pathlib import Path

NOTION_DB_ID = "823d8429-3a12-4bce-a675-d0e3947e7acb"
OUTPUT_DIR = Path("dist")


def get_notion_token():
    """Read the Notion integration token from the NOTION_TOKEN env var."""
    token = os.environ.get("NOTION_TOKEN", "").strip()
    if not token:
        sys.exit("ERROR: Set NOTION_TOKEN (from the Notion Claude Credentials page).")
    # A real token is plain ASCII (ntn_… or secret_…). Anything else means a
    # bad paste — fail clearly instead of a UnicodeEncodeError deep in requests.
    if not token.isascii() or " " in token:
        sys.exit("ERROR: NOTION_TOKEN contains spaces or non-ASCII characters — re-copy it.")
    return token


def fetch_notion_pages(db_id, notion_filter):
    """Fetch all pages from a Notion database with pagination."""
    import requests

    token = get_notion_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json; charset=utf-8",
    }

    url = f"https://api.notion.com/v1/databases/{db_id}/query"
    pages = []

    payload = {"filter": notion_filter, "page_size": 100}

    while True:
        resp = requests.post(url, headers=headers, json=payload)
        if resp.status_code != 200:
            print(f"ERROR: Notion API returned {resp.status_code}: {resp.text}", file=sys.stderr)
            sys.exit(1)

        data = resp.json()
        pages.extend(data.get("results", []))

        if not data.get("has_more"):
            break
        payload["start_cursor"] = data["next_cursor"]

    return pages


def extract_property(page, prop_name):
    """Extract a text/rich-text property value from a Notion page."""
    props = page.get("properties", {})
    prop = props.get(prop_name, {})
    if not prop:
        return None
    rtype = prop.get("type")
    if rtype in ("rich_text", "title"):
        # Runs are fragments of one string (split at bold/links) — join with "", not " "
        parts = prop.get(rtype, [])
        return "".join(p.get("plain_text", "") for p in parts) if parts else None
    elif rtype == "checkbox":
        return prop.get("checkbox", False)
    elif rtype == "status":
        return prop.get("status", {}).get("name")
    elif rtype == "date":
        d = prop.get("date", {})
        if d:
            return d.get("start")
        return None
    elif rtype == "url":
        return prop.get("url")
    elif rtype == "multi_select":
        return [s["name"] for s in prop.get("multi_select", [])]
    elif rtype == "select":
        return prop.get("select", {}).get("name") if prop.get("select") else None
    return None


def build_bylaw_record(page):
    """Build a bylaw record from a Notion page."""
    props = page.get("properties", {})
    title_prop = next((name for name, p in props.items() if p.get("type") == "title"), None)

    bylaw_num = extract_property(page, "Bylaw Number") or (extract_property(page, title_prop) if title_prop else None) or ""
    title_fr = extract_property(page, "Titre FR") or extract_property(page, "Title FR")
    title_en = extract_property(page, "Titre EN") or extract_property(page, "Title EN")
    status = extract_property(page, "Bylaw Status")
    adopted_date = extract_property(page, "Date d'adoption") or extract_property(page, "Adopted Date")
    amended_date = extract_property(page, "Date de modification") or extract_property(page, "Amended Date")
    enforced_by = extract_property(page, "Enforced by") or extract_property(page, "Exécuté par")
    fines = extract_property(page, "Fines") or extract_property(page, "Amendes")
    pdf_url = extract_property(page, "PDF URL") or extract_property(page, "Lien PDF")
    old_version_warning = extract_property(page, "Old version warning") or extract_property(page, "Avertissement vieille version")
    key_rules = extract_property(page, "Key rules") or extract_property(page, "Règles clés")
    history_chain = extract_property(page, "History chain") or extract_property(page, "Chaîne historique")

    parsed_rules = None
    if key_rules:
        try:
            parsed_rules = json.loads(key_rules)
        except (json.JSONDecodeError, TypeError):
            parsed_rules = key_rules

    parsed_history = None
    if history_chain:
        try:
            parsed_history = json.loads(history_chain)
        except (json.JSONDecodeError, TypeError):
            parsed_history = history_chain

    return {
        "id": page["id"],
        "bylaw_number": bylaw_num,
        "title_fr": title_fr or "",
        "title_en": title_en or "",
        "status": status or "",
        "adopted_date": adopted_date or None,
        "amended_date": amended_date or None,
        "enforced_by": enforced_by or None,
        "fines": fines or None,
        "pdf_url": pdf_url or None,
        "old_version_warning": bool(old_version_warning) if old_version_warning else False,
        "key_rules": parsed_rules or [],
        "history_chain": parsed_history or [],
    }


def parse_jsonish_array(value):
    """Parse connector SQL array text, returning [] for empty or malformed values."""
    if not value:
        return []
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, list) else []
    except (json.JSONDecodeError, TypeError):
        return []


def parse_text_lines(value):
    """Parse connector text blocks with escaped newlines into preview-friendly lists."""
    if not value:
        return []
    value = value.replace("\\n", "\n").strip()
    if not value:
        return []
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return parsed
    except (json.JSONDecodeError, TypeError):
        pass
    return [line.strip() for line in value.splitlines() if line.strip()]


def build_bylaw_record_from_connector_row(row, index):
    """Build a bylaw record from the read-only Notion connector TSV snapshot."""
    return {
        "id": f"notion-connector-preview-{index:03d}",
        "bylaw_number": row.get("bylaw_number", ""),
        "title_fr": row.get("title_fr", ""),
        "title_en": row.get("title_en", ""),
        "status": row.get("status", ""),
        "adopted_date": row.get("adopted_date") or None,
        "amended_date": row.get("amended_date") or None,
        "enforced_by": row.get("enforced_by") or None,
        "fines": row.get("fines") or None,
        "pdf_url": row.get("pdf_url") or None,
        "old_version_warning": False,
        "key_rules": parse_text_lines(row.get("key_rules")),
        "history_chain": parse_jsonish_array(row.get("history_chain")),
        "category": row.get("category") or None,
        "topics": parse_jsonish_array(row.get("topics")),
        "web_ready": row.get("web_ready") or None,
    }


def load_connector_tsv(path):
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        return [
            build_bylaw_record_from_connector_row(row, index)
            for index, row in enumerate(reader, start=1)
            if row.get("bylaw_number")
        ]


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Export Ormstown Bylaw Registry to JSON")
    parser.add_argument("--preview", action="store_true", help="Include rows with Bylaw Status set (for review)")
    parser.add_argument(
        "--from-connector-tsv",
        type=Path,
        help="Build preview JSON from a read-only Notion connector TSV snapshot instead of using NOTION_TOKEN",
    )
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(exist_ok=True)

    if args.from_connector_tsv:
        records = load_connector_tsv(args.from_connector_tsv)
        source = f"Read-only Notion connector TSV snapshot {args.from_connector_tsv}"
    else:
        if args.preview:
            notion_filter = {"property": "Bylaw Status", "status": {"is_not_empty": True}}
        else:
            notion_filter = {"property": "Web Ready", "checkbox": {"equals": True}}

        print(f"Fetching pages (filter: {json.dumps(notion_filter, ensure_ascii=False)})...")
        pages = fetch_notion_pages(NOTION_DB_ID, notion_filter)
        print(f"Fetched {len(pages)} pages.")

        records = []
        for page in pages:
            try:
                rec = build_bylaw_record(page)
                if rec["bylaw_number"]:
                    records.append(rec)
            except Exception as e:
                print(f"WARNING: Skipping page {page.get('id', '?')}: {e}", file=sys.stderr)
        source = f"Notion DB {NOTION_DB_ID}"

    records.sort(key=lambda r: (r["bylaw_number"] or ""))

    output = {
        "version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "source": source,
        "bylaws": records,
    }

    filename = "bylaws-preview.json" if args.preview else "bylaws.json"
    output_path = OUTPUT_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(records)} records to {output_path}")

    if args.preview:
        print("\n── Preview bylaws (Bylaw Status set) ──")
        for r in records:
            status_tag = f"[{r['status']}]" if r["status"] else "[no status]"
            print(f"  {r['bylaw_number']:20s} {status_tag:15s} {r['title_fr'][:50]}")
        print(f"\nReview these in Notion and tick 'Web Ready' for rows to include in production.")
    else:
        print(f"\n── Production bylaws (Web Ready) ──")
        for r in records:
            print(f"  {r['bylaw_number']:20s} [{r['status'] or 'no status':15s}]")


if __name__ == "__main__":
    main()

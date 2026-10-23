"""Keep the French in step with the English (editor's standing rule, 2026-10-23).

Called by notion_sync.py before a story is published. It compares the story's
English in Notion (Headline EN, Deck EN, and each passage of the 🇬🇧 toggle)
with the English as last published (a snapshot in .notion-sync/<page>.json).
Wherever the English changed and the French did not, it asks Claude to update
the French to say what the new English says, changing as little of the
existing French as possible, writes that French back into Notion, and lets
the publish continue with both languages.

It refuses to publish (and says why in Last Action) when:
  * English passages were added or removed but the French wasn't touched;
  * the English and French toggles don't have the same passages;
  * French needs updating but no ANTHROPIC_API_KEY is set.
The first publish of a story only records the snapshot.
"""

import json
import os
import re
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

SNAP_DIR = Path(__file__).resolve().parent.parent / ".notion-sync"
MODEL = os.environ.get("FR_MODEL", "claude-sonnet-5-5")
TEXT_TYPES = ("paragraph", "heading_1", "heading_2", "heading_3", "heading_4",
              "bulleted_list_item", "numbered_list_item", "quote", "callout")


class Refuse(Exception):
    pass


# --------------------------------------------------------------- passages
def passages(blocks):
    """Flatten a language toggle into an ordered list of text passages."""
    out = []
    for b in blocks or []:
        t = b["type"]
        if t in TEXT_TYPES:
            rich = b[t].get("rich_text") or []
            if "".join(r.get("plain_text", "") for r in rich).strip():
                out.append({"block": b, "cell": None, "rich": rich})
        elif t == "table_row":
            for i, cell in enumerate(b["table_row"].get("cells", [])):
                if "".join(r.get("plain_text", "") for r in cell).strip():
                    out.append({"block": b, "cell": i, "rich": cell})
        if b.get("_children"):
            out += passages(b["_children"])
    return out


def plain(rich):
    return "".join(r.get("plain_text", "") for r in rich or []).strip()


def to_html(rich):
    """Rich text → minimal HTML (strong/em/a) so formatting survives translation."""
    s = []
    for r in rich or []:
        t = (r.get("plain_text", "")).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        a = r.get("annotations") or {}
        if a.get("italic"):
            t = f"<em>{t}</em>"
        if a.get("bold"):
            t = f"<strong>{t}</strong>"
        href = r.get("href") or ((r.get("text") or {}).get("link") or {}).get("url")
        if href:
            t = f'<a href="{href}">{t}</a>'
        s.append(t)
    return "".join(s)


class _RT(HTMLParser):
    def __init__(self, gray):
        super().__init__(convert_charrefs=True)
        self.out, self.b, self.i, self.href, self.gray = [], 0, 0, None, gray

    def handle_starttag(self, tag, attrs):
        if tag in ("strong", "b"):
            self.b += 1
        elif tag in ("em", "i"):
            self.i += 1
        elif tag == "a":
            self.href = dict(attrs).get("href")

    def handle_endtag(self, tag):
        if tag in ("strong", "b"):
            self.b -= 1
        elif tag in ("em", "i"):
            self.i -= 1
        elif tag == "a":
            self.href = None

    def handle_data(self, data):
        if not data:
            return
        for k in range(0, len(data), 1900):          # Notion caps a text run at 2000 chars
            item = {"type": "text", "text": {"content": data[k:k + 1900]},
                    "annotations": {"bold": self.b > 0, "italic": self.i > 0,
                                    "color": "gray" if self.gray else "default"}}
            if self.href:
                item["text"]["link"] = {"url": self.href}
            self.out.append(item)


def from_html(h, gray=False):
    p = _RT(gray)
    p.feed(h)
    return p.out


# --------------------------------------------------------------- snapshot
def snap_path(page_id):
    return SNAP_DIR / (page_id.replace("-", "") + ".json")


def load_snapshot(page_id):
    f = snap_path(page_id)
    return json.loads(f.read_text(encoding="utf-8")) if f.is_file() else None


def save_snapshot(page_id, state):
    SNAP_DIR.mkdir(exist_ok=True)
    snap_path(page_id).write_text(json.dumps(state, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def current_state(props, en_t, fr_t):
    return {"headline_en": props["Headline EN"], "headline_fr": props["Headline FR"],
            "deck_en": props["Deck EN"], "deck_fr": props["Deck FR"],
            "en": [plain(p["rich"]) for p in passages(en_t)],
            "fr": [plain(p["rich"]) for p in passages(fr_t)]}


# --------------------------------------------------------------- translate
SYSTEM = """You keep the French edition of The Ormstown Observer, an independent bilingual civic newspaper in Ormstown, Québec, in step with its English edition.
For each item you get the English as it was (en_old), the English as it is now (en_new), and the French that matched the old English (fr_old).
Return the French updated so it says exactly what en_new says. Change only what the English change requires and keep every other word of fr_old as it is.
Write Québec French as the paper does: plain and clear for general readers, « » quotation marks with non-breaking spaces, a space before : ; ? !, amounts as 25 000 $, official French names of laws and institutions.
Keep the HTML tags (<strong>, <em>, <a href="…">) in the same places relative to the meaning. Links to /en/ pages on ormstownobserver.ca become the matching /fr/ page only if fr_old already did so; otherwise keep the URL.
Answer with JSON only: a list of {"id": ..., "fr_new": "..."} in the same order."""


def translate(items):
    key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    body = {"model": MODEL, "max_tokens": 8000, "system": SYSTEM,
            "messages": [{"role": "user", "content": json.dumps(items, ensure_ascii=False)}]}
    req = urllib.request.Request("https://api.anthropic.com/v1/messages", data=json.dumps(body).encode(), method="POST",
                                 headers={"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            d = json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise Refuse(f"the French update service refused the request ({e.code}): {e.read().decode('utf-8', 'replace')[:200]}") from None
    text = "".join(c.get("text", "") for c in d.get("content", []) if c.get("type") == "text")
    m = re.search(r"\[.*\]", text, re.S)
    try:
        out = {str(x["id"]): x["fr_new"] for x in json.loads(m.group(0))}
    except Exception:
        raise Refuse("the French update came back in an unreadable form; nothing was changed") from None
    missing = [i["id"] for i in items if str(i["id"]) not in out]
    if missing:
        raise Refuse(f"the French update skipped {len(missing)} passage(s); nothing was changed")
    return out


# --------------------------------------------------------------- main step
def recalibrate(page_id, props, en_t, fr_t, call, dry):
    """Returns (changed_anything, notes). Raises Refuse to stop the publish."""
    snap = load_snapshot(page_id)
    if snap is None:
        return False, ["first publish through the sync: recorded as the starting point for French tracking"]
    cur = current_state(props, en_t, fr_t)
    en_p, fr_p = passages(en_t), passages(fr_t)
    items, targets = [], []

    for k in ("headline", "deck"):
        if cur[k + "_en"] != snap[k + "_en"] and cur[k + "_fr"] == snap[k + "_fr"] and cur[k + "_en"]:
            items.append({"id": k, "en_old": snap[k + "_en"], "en_new": cur[k + "_en"], "fr_old": cur[k + "_fr"]})
            targets.append(("prop", k))

    en_moved = cur["en"] != snap["en"]
    fr_moved = cur["fr"] != snap["fr"]
    if en_moved:
        if len(cur["en"]) != len(snap["en"]):
            if not fr_moved:
                raise Refuse("English passages were added or removed and the French wasn't changed to match. "
                             "Add or remove the same passages in the 🇫🇷 section, then tick 🚀 again")
            if len(cur["en"]) != len(cur["fr"]):
                raise Refuse(f"the English has {len(cur['en'])} passages and the French {len(cur['fr'])}; they need to line up")
        elif len(snap["fr"]) == len(cur["fr"]) == len(cur["en"]):
            for i, (now, then) in enumerate(zip(cur["en"], snap["en"])):
                if now != then and cur["fr"][i] == snap["fr"][i]:
                    items.append({"id": f"p{i}", "en_old": then, "en_new": to_html(en_p[i]["rich"]),
                                  "fr_old": to_html(fr_p[i]["rich"])})
                    targets.append(("block", i))
        else:
            raise Refuse("the English and French sections don't line up passage for passage; nothing was changed")

    if not items:
        return False, []
    if not os.environ.get("ANTHROPIC_API_KEY", "").strip():
        raise Refuse(f"the English changed in {len(items)} place(s) and the French wasn't updated. "
                     "Update the 🇫🇷 section in Notion, or add the ANTHROPIC_API_KEY secret so the sync can do it")
    fr_new = translate(items)
    notes = [f"French updated to match the English in {len(items)} place(s); check it in Notion"]
    if dry:
        for it in items:
            print(f"  FR {it['id']}: {re.sub('<[^>]+>', '', fr_new[str(it['id'])])[:200]}")
        return False, notes
    for (kind, ref), it in zip(targets, items):
        val = fr_new[str(it["id"])]
        if kind == "prop":
            name = "Headline FR" if ref == "headline" else "Deck FR"
            call("PATCH", f"/pages/{page_id}", {"properties": {name: {"rich_text": from_html(val)}}})
        else:
            p = fr_p[ref]
            b, t = p["block"], p["block"]["type"]
            gray = all(((r.get("annotations") or {}).get("color", "")).startswith("gray") for r in p["rich"])
            rich = from_html(val, gray)
            if p["cell"] is None:
                call("PATCH", f"/blocks/{b['id']}", {t: {"rich_text": rich}})
            else:
                cells = [c for c in b["table_row"]["cells"]]
                cells[p["cell"]] = rich
                call("PATCH", f"/blocks/{b['id']}", {"table_row": {"cells": cells}})
                b["table_row"]["cells"] = cells
    return True, notes

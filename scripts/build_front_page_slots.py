#!/usr/bin/env python3
"""Build front-page-slots.json from front-page-slots.yml.

front-page-slots.yml is the hand-edited list of which stories fill the
homepage hero and the three story cards. For each one this script reads the
published article page (EN, plus the FR page named in its hreflang link) and
takes the headline, deck and image from there, so nothing is typed twice.
Anything in the YAML entry overrides what the page says.

    python3 scripts/build_front_page_slots.py           # write front-page-slots.json
    python3 scripts/build_front_page_slots.py --check   # validate only, exit 1 on error

Rules (each failure stops the build with a plain message; nothing is written):
  * every path must be an existing /en/.../ page in this repo with an FR twin;
  * every story needs a headline and an image under /images/;
  * image order: YAML `image` > /images/<slug>.jpg (the front-page convention)
    > the article's first <figure> image.
front-page.js prefers this file's hero and cards over front-page.json, which
the n8n builder still writes (its Latest and Council Watch zones stay in use).
"""

import json
import os
import re
import subprocess
import sys
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "front-page-slots.yml"
OUT = ROOT / "front-page-slots.json"
LEGACY = ROOT / "front-page.json"

MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July",
             "August", "September", "October", "November", "December"]
MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
             "août", "septembre", "octobre", "novembre", "décembre"]

# Section defaults, by the first folder of the EN path.
SECTIONS = {
    "council-watch": ("Council Watch", "Conseil municipal", "council"),
    "bylaws-regulations": ("Bylaws", "Règlements", "bylaws"),
    "piia": ("Bylaws", "Règlements", "bylaws"),
    "investigations": ("Investigation", "Enquête", "investigation"),
    "editorials": ("Editorial", "Éditorial", "editorial"),
}
DEFAULT_SECTION = ("The Observer", "L’Observer", "default")
POS_RE = re.compile(r"^[a-z0-9% .-]+$", re.I)
IMG_RE = re.compile(r"^/images/[A-Za-z0-9._-]+$")
PATH_RE = re.compile(r"^/en/[a-z0-9\-/]+/$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
RECAP_RE = re.compile(r"/council-watch/[a-z]+-\d{1,2}-\d{4}/$")


class Page(HTMLParser):
    """Collects the few things a front-page card needs from an article."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.h1 = None
        self.deck = None
        self.desc = None
        self.fr = None
        self.fig_img = None
        self._cap = None
        self._buf = []
        self._in_fig = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = (a.get("class") or "").split()
        if tag == "meta" and a.get("name") == "description" and self.desc is None:
            self.desc = (a.get("content") or "").strip()
        if tag == "link" and a.get("hreflang") == "fr" and self.fr is None:
            self.fr = a.get("href")
        if tag == "figure":
            self._in_fig = True
        if tag == "img" and self._in_fig and self.fig_img is None:
            self.fig_img = {"src": a.get("src") or "", "alt": a.get("alt") or ""}
        if self._cap is None:
            if tag == "h1" and self.h1 is None:
                self._cap, self._buf = "h1", []
            elif self.deck is None and ("article-deck" in cls or "deck" in cls):
                self._cap, self._buf = "deck", []

    def handle_endtag(self, tag):
        if tag == "figure":
            self._in_fig = False
        if self._cap == "h1" and tag == "h1":
            self.h1 = clean("".join(self._buf)); self._cap = None
        elif self._cap == "deck" and tag in ("p", "div"):
            self.deck = clean("".join(self._buf)); self._cap = None

    def handle_data(self, data):
        if self._cap:
            self._buf.append(data)


def clean(s):
    return re.sub(r"\s+", " ", s or "").strip()


def read_page(rel):
    f = ROOT / rel.strip("/") / "index.html"
    if not f.is_file():
        return None, f
    p = Page()
    p.feed(f.read_text(encoding="utf-8"))
    return p, f


def fmt(d, lang):
    y, m, dd = (int(x) for x in d.split("-"))
    if lang == "fr":
        return f"{'1er' if dd == 1 else dd} {MONTHS_FR[m - 1]} {y}"
    return f"{MONTHS_EN[m - 1]} {dd}, {y}"


def first_commit_date(f):
    try:
        out = subprocess.run(["git", "log", "--diff-filter=A", "--format=%as", "--", str(f)],
                             cwd=ROOT, capture_output=True, text=True, check=True).stdout.split()
        return out[-1] if out else None
    except Exception:
        return None


def legacy_images():
    """Alt text and crop position the old builder already had, by slug."""
    try:
        d = json.loads(LEGACY.read_text(encoding="utf-8"))
    except Exception:
        return {}
    out = {}
    for s in [d.get("hero")] + list(d.get("cards") or []) + list(d.get("latest") or []):
        if isinstance(s, dict) and isinstance(s.get("image"), dict):
            out[s.get("slug")] = s["image"]
    return out


def build_story(entry, where, legacy, errors):
    if isinstance(entry, str):
        entry = {"path": entry}
    if not isinstance(entry, dict) or "path" not in entry:
        errors.append(f"{where}: needs a `path:` line, e.g. path: /en/council-watch/october-6-2026/")
        return None
    path = str(entry["path"]).strip()
    if not path.endswith("/"):
        path += "/"
    if not PATH_RE.match(path):
        errors.append(f"{where}: `{path}` should look like /en/section/story-name/")
        return None
    en, en_file = read_page(path)
    if en is None:
        errors.append(f"{where}: no page at {path} (looked for {en_file.relative_to(ROOT)})")
        return None
    fr_path = entry.get("path_fr")
    if not fr_path and en.fr:
        fr_path = re.sub(r"^https?://[^/]+", "", en.fr)
    fr, _ = read_page(fr_path) if fr_path else (None, None)
    if fr is None:
        errors.append(f"{where}: {path} has no French page (set path_fr: or fix its hreflang link)")
        return None

    slug = path.strip("/")[3:].replace("/", "-")
    section = path.strip("/").split("/")[1]
    lab_en, lab_fr, icon = SECTIONS.get(section, DEFAULT_SECTION)

    s = {
        "slug": slug, "path_en": path, "path_fr": fr_path,
        "label_en": entry.get("label_en", lab_en), "label_fr": entry.get("label_fr", lab_fr),
        "hed_en": clean(entry.get("headline_en") or en.h1),
        "hed_fr": clean(entry.get("headline_fr") or fr.h1),
        "deck_en": clean(entry.get("deck_en") or en.deck or en.desc),
        "deck_fr": clean(entry.get("deck_fr") or fr.deck or fr.desc),
        "icon": entry.get("icon", icon),
    }
    if not s["hed_en"]:
        errors.append(f"{where}: {path} has no <h1> headline; add headline_en:")
    if not s["hed_fr"]:
        errors.append(f"{where}: {fr_path} has no <h1> headline; add headline_fr:")

    # Date line: `sitting:` (Council Watch) or `date:`, else the day the page was added.
    sitting, d = entry.get("sitting"), entry.get("date")
    for k, v in (("sitting", sitting), ("date", d)):
        if v is not None and not DATE_RE.match(str(v)):
            errors.append(f"{where}: {k}: must be YYYY-MM-DD, got {v}")
            return None
    if sitting:
        s["meta_en"] = "Sitting of " + fmt(str(sitting), "en")
        s["meta_fr"] = "Séance du " + fmt(str(sitting), "fr")
    else:
        d = str(d) if d else first_commit_date(en_file) or date.today().isoformat()
        s["meta_en"], s["meta_fr"] = fmt(d, "en"), fmt(d, "fr")
        s["date_published"] = d

    if section == "council-watch":
        recap = bool(RECAP_RE.search(path))
        s["cta_en"] = entry.get("cta_en", "Read the recap →" if recap else "Read the story →")
        s["cta_fr"] = entry.get("cta_fr", "Lire le compte rendu →" if recap else "Lire l’article →")
    else:
        s["cta_en"] = entry.get("cta_en", "Read more →")
        s["cta_fr"] = entry.get("cta_fr", "Lire la suite →")

    old = legacy.get(slug, {})
    src = entry.get("image")
    fig = en.fig_img if en.fig_img and IMG_RE.match(en.fig_img["src"]) else None
    if not src:
        if (ROOT / "images" / f"{slug}.jpg").is_file():
            src = f"/images/{slug}.jpg"
        elif fig:
            src = fig["src"]
    if not src or not IMG_RE.match(str(src)) or not (ROOT / str(src).lstrip("/")).is_file():
        errors.append(f"{where}: no image for {path}. Add images/{slug}.jpg, a <figure> in the article, "
                      f"or an `image: /images/file.jpg` line")
        return None
    fr_fig = fr.fig_img if fr.fig_img and fr.fig_img["src"] == src else None
    pos = str(entry.get("position") or old.get("position") or "center")
    if not POS_RE.match(pos):
        errors.append(f"{where}: position `{pos}` should be like: center, top, center 30%")
        return None
    s["image"] = {
        "src": src, "position": pos, "credit": entry.get("credit", old.get("credit", "")),
        "alt_en": entry.get("alt_en") or old.get("alt_en") or (fig["alt"] if fig and fig["src"] == src else s["hed_en"]),
        "alt_fr": entry.get("alt_fr") or old.get("alt_fr") or (fr_fig["alt"] if fr_fig else s["hed_fr"]),
    }
    return s


def main():
    check = "--check" in sys.argv
    try:
        cfg = yaml.safe_load(SRC.read_text(encoding="utf-8")) or {}
    except yaml.YAMLError as e:
        sys.exit(f"front-page-slots.yml is not valid YAML (check indentation and dashes):\n{e}")
    errors, legacy = [], legacy_images()
    hero = build_story(cfg.get("hero"), "hero", legacy, errors) if cfg.get("hero") else None
    if not cfg.get("hero"):
        errors.append("hero: missing. Add `hero:` with a `path:` line")
    cards_cfg = cfg.get("cards") or []
    if not isinstance(cards_cfg, list) or len(cards_cfg) != 3:
        errors.append("cards: list exactly 3 stories, each starting with `- path:`")
        cards_cfg = cards_cfg if isinstance(cards_cfg, list) else []
    cards = [build_story(c, f"card {i + 1}", legacy, errors) for i, c in enumerate(cards_cfg)]
    paths = [x["path_en"] for x in [hero] + cards if x]
    if len(paths) != len(set(paths)):
        errors.append("the same story is listed twice")
    if errors:
        print("Front page NOT updated:\n  - " + "\n  - ".join(errors), file=sys.stderr)
        sys.exit(1)
    data = {"version": 1, "source": "front-page-slots.yml", "hero": hero, "cards": cards}
    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if check:
        print("ok: front-page-slots.yml is valid (" + ", ".join(paths) + ")")
        return
    if OUT.is_file() and OUT.read_text(encoding="utf-8") == text:
        print("ok: front-page-slots.json already up to date")
        return
    OUT.write_text(text, encoding="utf-8")
    print("wrote front-page-slots.json: " + ", ".join(paths))


if __name__ == "__main__":
    main()

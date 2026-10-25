#!/usr/bin/env python3
"""Publish Notion edits to the site: Articles rows ticked "🚀 Publish Requested".

For each ticked row with a GitHub Path and Path FR:
  * Headline EN/FR and Deck EN/FR (row properties) replace the page's <h1>
    and deck.
  * If the Notion page holds the article text (toggles "🇬🇧 English article"
    and "🇫🇷 Article en français", the explainer format), the body of each
    page is rebuilt from that text: fact box, sections, tables, lists,
    sources, notes. Figures already on the page are kept in place.
  * Pages whose text isn't in Notion get the headline and deck only.
  * The row's Image (Image Finder pick or Seneca upload) becomes the photo
    under the byline on both pages, with Image Credit and that language's
    alt text, saved as images/<slug>.jpg (the front-page convention).
Then the box is unticked and Last Action / Next Step say what happened.

Safety: a page is skipped (and the run fails, so GitHub emails) if Notion
returns a block type this script can't render, or if the rebuilt text is
under 40% of the old text, which would mean a truncated or broken fetch.
Nothing is written to Notion or the repo for a skipped story.

    NOTION_TOKEN=... python3 scripts/notion_sync.py            # publish
    NOTION_TOKEN=... python3 scripts/notion_sync.py --dry-run  # report only
    python3 scripts/notion_sync.py --fixture f.json PAGE_PATH   # offline test
Standard library only.
"""

import hashlib
import html
import io
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fr_recalibrate  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
ARTICLES_DB = "b18ad2a0f5c94af2bd620523ec2a36b0"   # 📰 Articles (see Notion System Registry)
API = "https://api.notion.com/v1"
VERSION = "2022-06-28"
PUBLISH = "🚀 Publish Requested"
LOG = []


# ------------------------------------------------------------------ Notion API
def call(method, path, body=None):
    token = os.environ.get("NOTION_TOKEN", "").strip()
    if not token:
        sys.exit("NOTION_TOKEN is not set. Add it under the repo's Settings → Secrets → Actions.")
    req = urllib.request.Request(API + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": "Bearer " + token, "Notion-Version": VERSION,
                                          "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", "replace")[:300]
        raise RuntimeError(f"Notion {method} {path} → {e.code}: {msg}") from None


def ticked_rows():
    rows, cursor = [], None
    while True:
        body = {"filter": {"property": PUBLISH, "checkbox": {"equals": True}}, "page_size": 50}
        if cursor:
            body["start_cursor"] = cursor
        d = call("POST", f"/databases/{ARTICLES_DB}/query", body)
        rows += d.get("results", [])
        if not d.get("has_more"):
            return rows
        cursor = d.get("next_cursor")


def children(block_id):
    out, cursor = [], None
    while True:
        q = f"/blocks/{block_id}/children?page_size=100" + (f"&start_cursor={cursor}" if cursor else "")
        d = call("GET", q)
        for b in d.get("results", []):
            if b.get("has_children") and b["type"] not in ("child_page", "child_database"):
                b["_children"] = children(b["id"])
            out.append(b)
        if not d.get("has_more"):
            return out
        cursor = d.get("next_cursor")


def prop_text(page, name):
    p = page.get("properties", {}).get(name) or {}
    parts = p.get("rich_text") or p.get("title") or []
    return "".join(x.get("plain_text", "") for x in parts).strip()


def set_props(page_id, last_action, next_step=None, untick=True):
    props = {"Last Action": {"rich_text": [{"text": {"content": last_action[:1900]}}]}}
    if next_step is not None:
        props["Next Step"] = {"rich_text": [{"text": {"content": next_step[:1900]}}]}
    if untick:
        props[PUBLISH] = {"checkbox": False}
    call("PATCH", f"/pages/{page_id}", {"properties": props})


# ------------------------------------------------------------ blocks → HTML
class Unsupported(Exception):
    pass


def rt_html(rich):
    out = []
    for r in rich or []:
        raw = r.get("plain_text", "")
        if not (r.get("annotations") or {}).get("code"):   # typographic quotes, as on the site
            raw = re.sub(r'(^|[\s(\[«—–-])"', "\\1“", raw)
            raw = raw.replace('"', "”").replace("'", "’")
        t = html.escape(raw, quote=False)
        a = r.get("annotations") or {}
        if a.get("code"):
            t = f"<code>{t}</code>"
        if a.get("italic"):
            t = f"<em>{t}</em>"
        if a.get("bold"):
            t = f"<strong>{t}</strong>"
        href = r.get("href") or ((r.get("text") or {}).get("link") or {}).get("url")
        if href and re.match(r"^(https?://|mailto:|/)", href):
            href = re.sub(r"^https://ormstownobserver\.ca(?=/)", "", href)
            t = f'<a href="{html.escape(href)}">{t}</a>'
        out.append(t)
    return "".join(out).replace("\n", "<br>")


def rt_plain(rich):
    return "".join(r.get("plain_text", "") for r in rich or []).strip()


def is_gray(b):
    d = b.get(b["type"], {})
    if (d.get("color") or "").startswith("gray"):
        return True
    rich = d.get("rich_text") or []
    return bool(rich) and all((r.get("annotations") or {}).get("color", "").startswith("gray") for r in rich)


def is_italic_only(b):
    rich = b.get(b["type"], {}).get("rich_text") or []
    return bool(rich) and all((r.get("annotations") or {}).get("italic") for r in rich if r.get("plain_text", "").strip())


def heading_level(b):
    m = re.match(r"heading_(\d)$", b["type"])
    return int(m.group(1)) if m else None


EFFECT_RE = re.compile(r"^(.*?)<em>(What it does:|L’effet :|L'effet :)</em>\s*(.*)$", re.S)


def render_list(items, tag):
    lis = []
    for b in items:
        inner = rt_html(b[b["type"]].get("rich_text"))
        kids = b.get("_children") or []
        if kids:
            inner += "\n" + "\n".join(render_blocks(kids))
        lis.append(f"      <li>{inner}</li>")
    return f"    <{tag}>\n" + "\n".join(lis) + f"\n    </{tag}>"


def render_table(b):
    rows = b.get("_children") or []
    head = b["table"].get("has_column_header")
    out = ['  <table class="fees">']
    for i, r in enumerate(rows):
        cells = r.get("table_row", {}).get("cells", [])
        tag = "th" if head and i == 0 else "td"
        line = "".join(f"<{tag}>{rt_html(c)}</{tag}>" for c in cells)
        if head and i == 0:
            out.append(f"    <thead><tr>{line}</tr></thead>\n    <tbody>")
        else:
            out.append(f"      <tr>{line}</tr>")
    out.append("    </tbody>" if head else "")
    out.append("  </table>")
    return "\n".join(x for x in out if x)


def render_callout(b):
    first = rt_plain(b["callout"].get("rich_text"))
    kids = list(b.get("_children") or [])
    title = first
    if not title and kids and kids[0]["type"] == "paragraph":
        title = rt_plain(kids.pop(0)["paragraph"].get("rich_text"))
    body = "\n".join(render_blocks(kids))
    return f'  <div class="fact-box">\n    <h3>{html.escape(title)}</h3>\n{body}\n  </div>'


def render_blocks(blocks):
    out, i = [], 0
    while i < len(blocks):
        b, t = blocks[i], blocks[i]["type"]
        if t in ("bulleted_list_item", "numbered_list_item"):
            j = i
            while j < len(blocks) and blocks[j]["type"] == t:
                j += 1
            out.append(render_list(blocks[i:j], "ul" if t == "bulleted_list_item" else "ol"))
            i = j
            continue
        lvl = heading_level(b)
        if lvl:
            text = rt_html(b[t].get("rich_text"))
            out.append(f"  <h2>{text}</h2>")
        elif t == "paragraph":
            inner = rt_html(b[t].get("rich_text"))
            if inner.strip():
                m = EFFECT_RE.match(inner)
                if re.match(r"^<strong>\d+\.", inner):
                    if m:
                        inner = f'{m.group(1).rstrip()} <span class="effect">{m.group(2)} {m.group(3)}</span>'
                    out.append(f'  <p class="change">{inner}</p>')
                else:
                    out.append(f"  <p>{inner}</p>")
        elif t == "callout":
            out.append(render_callout(b))
        elif t == "table":
            out.append(render_table(b))
        elif t == "quote":
            out.append(f"  <blockquote>{rt_html(b[t].get('rich_text'))}</blockquote>")
        elif t == "divider":
            pass
        elif t == "image":
            pass  # figures are kept from the existing page
        else:
            raise Unsupported(f"block type '{t}' isn't supported yet")
        i += 1
    return out


def article_parts(toggle_children):
    """Split one language toggle into header bits, body blocks and footer."""
    blocks = list(toggle_children)
    label = deck = None
    head_idx = next((k for k, b in enumerate(blocks) if heading_level(b) == 3), None)
    if head_idx is None:
        raise Unsupported("the language toggle has no ### headline")
    pre = blocks[:head_idx]
    grays = [b for b in pre if b["type"] == "paragraph" and is_gray(b)]
    if grays:
        label = rt_plain(grays[0]["paragraph"]["rich_text"])
    rest = blocks[head_idx + 1:]
    if rest and rest[0]["type"] == "paragraph" and is_italic_only(rest[0]):
        deck = rt_plain(rest[0]["paragraph"]["rich_text"]); rest = rest[1:]
    if rest and rest[0]["type"] == "paragraph" and is_gray(rest[0]):
        rest = rest[1:]   # byline: the site template writes its own
    src = next((k for k, b in enumerate(rest) if heading_level(b) and rt_plain(b[b["type"]]["rich_text"]).lower() == "sources"), None)
    body, foot = (rest, []) if src is None else (rest[:src], rest[src + 1:])
    return {"label": label, "deck": deck, "headline": rt_plain(blocks[head_idx][blocks[head_idx]["type"]]["rich_text"]),
            "body": body, "foot": foot}


def render_footer(foot):
    lists, notes = [], []
    for b in foot:
        if b["type"] in ("bulleted_list_item", "numbered_list_item"):
            lists.append(b)
        elif b["type"] == "paragraph" and rt_plain(b["paragraph"]["rich_text"]):
            txt = rt_html(b["paragraph"]["rich_text"])
            cls = ' class="disclaimer"' if "courtesy of The Ormstown Observer" in txt or "offerte gracieusement" in txt else ""
            notes.append(f"    <p{cls}>{txt}</p>")
    items = render_list(lists, "ul").replace("\n    ", "\n      ") if lists else ""
    return '  <div class="article-footer">\n    <h3>Sources</h3>\n' + (items + "\n" if items else "") + "\n".join(notes) + "\n  </div>"


def find_toggles(blocks):
    en = fr = None
    for b in blocks:
        t = b["type"]
        if t.startswith("heading_") and b[t].get("is_toggleable"):
            title = rt_plain(b[t]["rich_text"])
            if title.startswith("🇬🇧"):
                en = b.get("_children") or []
            elif title.startswith("🇫🇷"):
                fr = b.get("_children") or []
    return en, fr


# ------------------------------------------------------------ story photo
# The row's Image becomes one figure under the byline, marked data-photo="notion"
# so a later sync replaces it (or removes it when the Image is cleared) instead
# of stacking another. Figures placed by hand are never touched.
PHOTO_MAX_PX = 1600                 # the front page's size
PHOTO_MAX_DOWNLOAD = 15 * 1024 * 1024
PHOTO_RE = re.compile(r'\n*[ \t]*<figure class="article-figure" data-photo="notion">.*?</figure>', re.S)
FIGURE_CSS = """  figure.article-figure { margin: 28px 0; }
  figure.article-figure img { width: 100%; height: auto; display: block; border: 1px solid var(--border); }
  figure.article-figure figcaption { font-size: 0.85rem; color: var(--muted); padding-top: 8px; line-height: 1.5; }
  figure.article-figure figcaption .credit { font-style: italic; }
"""


def image_url(row):
    p = row.get("properties", {}).get("Image") or {}
    for f in p.get("files") or []:
        u = (f.get("external") or {}).get("url") or (f.get("file") or {}).get("url")
        if u:
            return u
    return None


def story_slug(row):
    """images/<slug>.jpg: GitHub Path minus en/, slashes → hyphens (see CLAUDE.md)."""
    return re.sub(r"^en/", "", prop_text(row, "GitHub Path").strip().strip("/")).replace("/", "-")


def fetch_photo(url):
    req = urllib.request.Request(url, headers={"User-Agent": "OrmstownObserver-notion-sync/1 (+https://ormstownobserver.ca)"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read(PHOTO_MAX_DOWNLOAD + 1)
    except urllib.error.URLError as e:
        raise Unsupported(f"the Image couldn't be downloaded ({e})") from None
    if len(data) > PHOTO_MAX_DOWNLOAD:
        raise Unsupported("the Image is over 15 MB")
    if not (data[:3] == b"\xff\xd8\xff" or data[:8] == b"\x89PNG\r\n\x1a\n" or (data[:4] == b"RIFF" and data[8:12] == b"WEBP")):
        raise Unsupported("the Image isn't a JPEG, PNG or WebP photo")
    return data


def to_jpeg(data):
    """At most 1600 px, JPEG quality 82, upright, transparency on white."""
    from PIL import Image, ImageOps   # pip install pillow (the workflow does)
    im = ImageOps.exif_transpose(Image.open(io.BytesIO(data)))
    if im.mode != "RGB":
        rgba = im.convert("RGBA")
        im = Image.new("RGB", rgba.size, "white")
        im.paste(rgba, mask=rgba.getchannel("A"))
    im.thumbnail((PHOTO_MAX_PX, PHOTO_MAX_PX))
    out = io.BytesIO()
    im.save(out, "JPEG", quality=82, optimize=True, progressive=True)
    return out.getvalue()


def photo_figure(src, alt, credit):
    cap = f'\n    <figcaption><span class="credit">{html.escape(credit, quote=False)}</span></figcaption>' if credit else ""
    return f'<figure class="article-figure" data-photo="notion">\n    <img src="{html.escape(src)}" alt="{html.escape(alt)}">{cap}\n  </figure>'


def place_photo(doc, fig):
    """Put the Notion photo under the byline, replace it, or (fig=None) remove it."""
    if PHOTO_RE.search(doc):
        return PHOTO_RE.sub(lambda m: ("\n\n  " + fig) if fig else "", doc, count=1)
    if not fig:
        return doc
    by = re.search(r'<div class="byline">.*?</div>', doc, re.S)
    if not by:
        raise Unsupported("the page has no byline to put the photo under")
    if "figure.article-figure" not in doc and "</style>" in doc:
        doc = doc.replace("</style>", FIGURE_CSS + "</style>", 1)
        by = re.search(r'<div class="byline">.*?</div>', doc, re.S)
    return doc[:by.end()] + "\n\n  " + fig + doc[by.end():]


def story_photo(row, dry, fetch=None):
    """The row's photo → (figures by language or None, image file written or None, notes)."""
    url = image_url(row)
    if not url:
        return None, None, []
    alt_en, alt_fr = prop_text(row, "Alt Text EN"), prop_text(row, "Alt Text FR")
    if not alt_en and not alt_fr:
        raise Unsupported("the photo has no alt text: fill Alt Text EN (and FR) in Notion")
    notes = []
    if not alt_fr:
        alt_fr = alt_en
        notes.append("the photo has no French alt text, so the French page uses the English")
    slug = story_slug(row)
    if not re.match(r"^[a-z0-9][a-z0-9-]*$", slug):
        raise Unsupported(f"can't name the photo file from GitHub Path ({slug!r})")
    data = to_jpeg((fetch or fetch_photo)(url))
    rel = f"images/{slug}.jpg"
    dest = ROOT / rel
    written = None
    if not dest.is_file() or dest.read_bytes() != data:
        written = rel
        if not dry:
            dest.write_bytes(data)
    src = f"/{rel}?v={hashlib.sha1(data).hexdigest()[:8]}"   # a new photo shows at once, not after the cache
    credit = prop_text(row, "Image Credit")
    return {"en": photo_figure(src, alt_en, credit), "fr": photo_figure(src, alt_fr, credit)}, written, notes


# ------------------------------------------------------------ page surgery
def text_len(s):
    return len(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s)))


def wrap_bounds(doc):
    start = doc.find('<div class="article-wrap">')
    if start < 0:
        return None
    depth, i = 0, start
    for m in re.finditer(r"<div\b|</div>", doc[start:]):
        depth += 1 if m.group(0) != "</div>" else -1
        if depth == 0:
            return start + len('<div class="article-wrap">'), start + m.start()
    return None


def set_header(doc, headline, deck, label):
    if headline:
        doc, n = re.subn(r'(<h1 class="(?:article-headline|headline)"[^>]*>)(.*?)(</h1>)',
                         lambda m: m.group(1) + html.escape(headline, quote=False) + m.group(3), doc, count=1, flags=re.S)
    if deck:
        doc = re.sub(r'(<p class="(?:article-deck|deck)"[^>]*>)(.*?)(</p>)',
                     lambda m: m.group(1) + html.escape(deck, quote=False) + m.group(3), doc, count=1, flags=re.S)
    if label:
        doc = re.sub(r'(<div class="section-label">)(.*?)(</div>)',
                     lambda m: m.group(1) + html.escape(label, quote=False).replace(" · ", " &middot; ") + m.group(3), doc, count=1, flags=re.S)
    return doc


def rebuild_body(doc, parts):
    b = wrap_bounds(doc)
    if not b:
        raise Unsupported("page has no article-wrap")
    inner = doc[b[0]:b[1]]
    by = re.search(r'<div class="byline">.*?</div>', inner, re.S)
    if not by:
        raise Unsupported("page has no byline")
    head, tail = inner[:by.end()], inner[by.end():]
    # Remember each figure and the heading that followed it.
    figs = []
    for m in re.finditer(r"\s*<figure\b.*?</figure>", tail, re.S):
        nxt = re.search(r"<h2[^>]*>(.*?)</h2>", tail[m.end():], re.S)
        figs.append((m.group(0).strip(), re.sub(r"<[^>]+>", "", nxt.group(1)).strip() if nxt else None,
                     not re.search(r"<(p|h2|div class=\"fact-box)", tail[:m.start()])))
    body = render_blocks(parts["body"])
    new_tail = "\n\n" + "\n\n".join(body) + "\n\n" + render_footer(parts["foot"]) + "\n"
    for fig, before_h2, at_top in figs:
        if at_top:
            new_tail = "\n\n  " + fig + new_tail
            continue
        pat = re.compile(r"(\n  <h2>" + re.escape(html.escape(before_h2, quote=False)) + r"</h2>)") if before_h2 else None
        if pat and pat.search(new_tail):
            new_tail = pat.sub(lambda m: "\n  " + fig + "\n" + m.group(1), new_tail, count=1)
        else:
            new_tail = "\n\n  " + fig + new_tail
    if text_len(new_tail) < float(os.environ.get("SYNC_MIN_RATIO", "0.4")) * text_len(tail):
        raise Unsupported(f"rebuilt text is much shorter than the live page ({text_len(new_tail)} vs {text_len(tail)} chars); not publishing")
    return doc[:b[0]] + head + new_tail + doc[b[1]:]


def page_file(path):
    p = (path or "").strip().strip("/")
    if not re.match(r"^(en|fr)/[a-z0-9\-/]+$", p):
        return None
    f = ROOT / p / "index.html"
    return f if f.is_file() else None


def fr_props(row):
    return {k: prop_text(row, k) for k in ("Headline EN", "Headline FR", "Deck EN", "Deck FR")}


def sync_row(row, blocks, dry, recal=True):
    title = prop_text(row, "Title") or row["id"]
    f_en, f_fr = page_file(prop_text(row, "GitHub Path")), page_file(prop_text(row, "Path FR"))
    if not f_en or not f_fr:
        raise Unsupported("GitHub Path or Path FR is missing or doesn't match a page on the site")
    en_t, fr_t = find_toggles(blocks)
    notes = []
    if recal:
        # Editor's standing rule: the French always follows the English.
        try:
            touched, notes = fr_recalibrate.recalibrate(row["id"], fr_props(row), en_t, fr_t, call, dry)
        except fr_recalibrate.Refuse as e:
            raise Unsupported(str(e)) from None
        if touched:                      # French was rewritten in Notion: read it back
            row = call("GET", f"/pages/{row['id']}")
            blocks = children(row["id"])
            en_t, fr_t = find_toggles(blocks)
    full = bool(en_t and fr_t)
    changed = []
    figs, photo_file, photo_notes = story_photo(row, dry)
    notes = notes + photo_notes
    if photo_file:
        changed.append(photo_file)
    for lang, f, tog in (("en", f_en, en_t), ("fr", f_fr, fr_t)):
        doc = f.read_text(encoding="utf-8")
        new = doc
        hed = prop_text(row, "Headline " + lang.upper())
        deck = prop_text(row, "Deck " + lang.upper())
        if full:
            parts = article_parts(tog)
            new = rebuild_body(new, parts)
            new = set_header(new, hed or parts["headline"], deck or parts["deck"], None)
        else:
            new = set_header(new, hed, deck, None)
        new = place_photo(new, figs[lang] if figs else None)
        if new != doc:
            changed.append(str(f.relative_to(ROOT)))
            if not dry:
                f.write_text(new, encoding="utf-8")
            else:
                import difflib
                d = list(difflib.unified_diff(doc.splitlines(), new.splitlines(), str(f.relative_to(ROOT)),
                                              "after sync", n=0, lineterm=""))
                print(f"--- {len(d)} diff lines for {f.relative_to(ROOT)} (first 200) ---")
                print("\n".join(x[:300] for x in d[:200]))
    if recal and not dry:
        fr_recalibrate.save_snapshot(row["id"], fr_recalibrate.current_state(fr_props(row), en_t, fr_t))
    return title, full, changed, notes


def main():
    dry = "--dry-run" in sys.argv
    if "--fixture" in sys.argv:
        i = sys.argv.index("--fixture")
        data = json.loads(Path(sys.argv[i + 1]).read_text())
        title, full, changed, _ = sync_row(data["row"], data["blocks"], dry, recal=False)
        print(f"{title}: {'full text' if full else 'headline/deck'}; changed: {changed or 'nothing'}")
        return
    rows = ticked_rows()
    if not rows:
        print("Nothing ticked for publishing.")
        return
    failures, done = [], []
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    for row in rows:
        name = prop_text(row, "Title") or row["id"]
        try:
            blocks = children(row["id"])
            title, full, changed, notes = sync_row(row, blocks, dry)
            what = "headline, summary and full text" if full else "headline and summary (text isn't in Notion)"
            msg = (f"Published from Notion {stamp} by the GitHub sync: {what}." if changed
                   else f"Checked {stamp}: the site already matched Notion.")
            if notes:
                msg += " " + " ".join(n[0].upper() + n[1:] + "." for n in notes)
            print(f"✓ {title}: {what}; files: {', '.join(changed) or 'none changed'}")
            done.append((row["id"], msg))
        except (Unsupported, RuntimeError) as e:
            print(f"✗ {name}: {e}", file=sys.stderr)
            failures.append((row["id"], name, str(e)))
    if dry:
        print("Dry run: nothing written to the site or Notion.")
    else:
        for pid, msg in done:
            set_props(pid, msg)
        for pid, name, err in failures:
            try:
                set_props(pid, f"Not published ({stamp}): {err}", next_step="Fix the problem above, then tick 🚀 again.", untick=True)
            except RuntimeError:
                pass
    if failures:
        sys.exit("Some stories were not published: " + "; ".join(f"{n}: {e}" for _, n, e in failures))


if __name__ == "__main__":
    main()

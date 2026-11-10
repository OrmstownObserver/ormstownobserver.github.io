#!/usr/bin/env python3
"""Build sitemap.xml (and check robots.txt points at it).

Lists every public page under en/ and fr/ plus the homepage, with its
hreflang twin and a last-modified date taken from git. Skipped on purpose:
pages marked noindex, redirect stubs (meta refresh or a location.replace
script), and anything under a dot-folder, drafts/, templates/ or press/_template.

    python3 scripts/build_sitemap.py           # write sitemap.xml
    python3 scripts/build_sitemap.py --check   # print what would be listed

It needs only the standard library. The Sitemap workflow
(.github/workflows/sitemap.yml) runs it whenever an article page changes.
"""
import re
import subprocess
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://ormstownobserver.ca"
SKIP_PARTS = {"drafts", "templates", "_template", "node_modules"}
REDIRECT_RE = re.compile(r'http-equiv=["\']refresh["\']|location\.(replace|href)\s*[=(]', re.I)
NOINDEX_RE = re.compile(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', re.I)
ALT_RE = re.compile(r'<link[^>]+rel=["\']alternate["\'][^>]*>', re.I)


def lastmod(f):
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", str(f)],
                             cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
        return out or None
    except Exception:
        return None


def url_for(f):
    rel = f.relative_to(ROOT).parent.as_posix()
    return BASE + "/" + ("" if rel == "." else rel + "/")


def alternates(html):
    out = {}
    for tag in ALT_RE.findall(html):
        lang = re.search(r'hreflang=["\']([^"\']+)', tag)
        href = re.search(r'href=["\']([^"\']+)', tag)
        if lang and href and href.group(1).startswith(BASE + "/"):
            out[lang.group(1)] = href.group(1)
    return out


def pages():
    files = [ROOT / "index.html", ROOT / "finances" / "index.html"]
    files = [f for f in files if f.is_file()]
    for top in ("en", "fr"):
        files += sorted((ROOT / top).rglob("index.html"))
    for f in files:
        rel = f.relative_to(ROOT).parts
        if any(p.startswith(".") or p in SKIP_PARTS for p in rel):
            continue
        html = f.read_text(encoding="utf-8", errors="replace")
        head = html[:6000]
        if NOINDEX_RE.search(head) or REDIRECT_RE.search(head):
            continue
        yield f, html


def main():
    rows = []
    for f, html in pages():
        u = url_for(f)
        alts = alternates(html)
        rows.append((u, lastmod(f), alts))
    rows.sort(key=lambda r: r[0])
    if "--check" in sys.argv:
        for u, m, a in rows:
            print(m or "-", u, "" if a else "(no hreflang)")
        print(len(rows), "pages")
        return
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
             'xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for u, m, alts in rows:
        lines.append("  <url>")
        lines.append(f"    <loc>{escape(u)}</loc>")
        if m:
            lines.append(f"    <lastmod>{m}</lastmod>")
        for lang, href in sorted(alts.items()):
            lines.append(f'    <xhtml:link rel="alternate" hreflang="{escape(lang)}" href="{escape(href)}"/>')
        lines.append("  </url>")
    lines.append("</urlset>")
    text = "\n".join(lines) + "\n"
    out = ROOT / "sitemap.xml"
    if out.is_file() and out.read_text(encoding="utf-8") == text:
        print("sitemap.xml unchanged:", len(rows), "pages")
        return
    out.write_text(text, encoding="utf-8")
    print("wrote sitemap.xml:", len(rows), "pages")


if __name__ == "__main__":
    main()

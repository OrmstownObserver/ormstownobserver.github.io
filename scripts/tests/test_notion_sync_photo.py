"""The story photo in scripts/notion_sync.py: Notion Image → images/<slug>.jpg
and a figure under the byline on the EN and FR pages.

    python3 -m unittest scripts/tests/test_notion_sync_photo.py
(the Pillow tests skip without `pip install pillow`)
"""
import io
import re
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import notion_sync as ns  # noqa: E402

REPO = Path(__file__).resolve().parent.parent.parent
REAL_FETCH = ns.fetch_photo
EN = "en/council-watch/council-asks-quebec-to-ban-trucks"
FR = "fr/conseil-municipal/demande-interdire-camions-trois-rues"
try:
    from PIL import Image
except ImportError:
    Image = None


def rt(s):
    return {"rich_text": [{"plain_text": s, "text": {"content": s}}]} if s else {"rich_text": []}


def row(image=None, alt_en="Trucks on Route 138 at rue Church", alt_fr="Des camions sur la route 138, rue Church",
        credit="Photo: The Ormstown Observer"):
    props = {
        "Title": {"title": [{"plain_text": "Trucks"}]},
        "GitHub Path": rt(EN + "/"), "Path FR": rt(FR + "/"),
        "Headline EN": rt(""), "Headline FR": rt(""), "Deck EN": rt(""), "Deck FR": rt(""),
        "Alt Text EN": rt(alt_en), "Alt Text FR": rt(alt_fr), "Image Credit": rt(credit),
        "Image": {"files": [{"type": "file", "file": {"url": image}}] if image else []},
    }
    return {"id": "36", "properties": props}


def png_bytes(w=3000, h=2000):
    im = Image.new("RGBA", (w, h), (200, 40, 40, 0))       # fully transparent → must land on white
    out = io.BytesIO()
    im.save(out, "PNG")
    return out.getvalue()


class PlacePhoto(unittest.TestCase):
    def setUp(self):
        self.doc = (REPO / EN / "index.html").read_text(encoding="utf-8")
        self.fig = ns.photo_figure("/images/x.jpg?v=1", 'Trucks "at" Church', "Photo: The Ormstown Observer")

    def test_goes_right_under_the_byline_and_nothing_else_changes(self):
        new = ns.place_photo(self.doc, self.fig)
        by = re.search(r'<div class="byline">.*?</div>', new, re.S)
        self.assertTrue(new[by.end():].lstrip().startswith('<figure class="article-figure" data-photo="notion">'))
        self.assertEqual(ns.place_photo(new, None), self.doc, "removing it gives back the page exactly")
        self.assertIn('alt="Trucks &quot;at&quot; Church"', new)

    def test_a_new_photo_replaces_the_old_one_never_stacks(self):
        once = ns.place_photo(self.doc, self.fig)
        twice = ns.place_photo(once, ns.photo_figure("/images/x.jpg?v=2", "b", ""))
        self.assertEqual(twice.count('data-photo="notion"'), 1)
        self.assertIn("?v=2", twice)
        self.assertNotIn("figcaption", twice.split('data-photo="notion"')[1].split("</figure>")[0], "no credit → no caption")

    def test_no_photo_and_none_on_the_page_changes_nothing(self):
        self.assertEqual(ns.place_photo(self.doc, None), self.doc)

    def test_hand_placed_same_photo_not_duplicated(self):
        hand = self.doc.replace("</main>", '<figure class="article-figure">\n    <img src="/images/x.jpg" alt="a">\n  </figure>\n</main>', 1)
        self.assertNotEqual(hand, self.doc)
        self.assertEqual(ns.place_photo(hand, self.fig), hand, "a hand-placed copy of the same photo blocks a second one")

    def test_adds_the_figure_css_when_a_page_lacks_it(self):
        bare = self.doc.replace("figure.article-figure", "figure.gone")
        new = ns.place_photo(bare, self.fig)
        self.assertEqual(new.count("figure.article-figure { margin: 28px 0; }"), 1)

    def test_rebuilt_text_keeps_the_photo_on_top(self):
        doc = ('<style></style><div class="article-wrap"><h1 class="article-headline">H</h1>'
               '<div class="byline">B</div>\n\n  ' + self.fig + '\n\n  <p>' + "old text " * 40 + '</p>\n</div>')
        para = {"type": "paragraph", "paragraph": rt("new text " * 40)}
        out = ns.rebuild_body(doc, {"body": [para], "foot": []})
        self.assertRegex(out, r'(?s)<div class="byline">B</div>\s*<figure class="article-figure" data-photo="notion">.*?</figure>\s*<p>new text')


@unittest.skipIf(Image is None, "needs Pillow")
class StoryPhoto(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        for p in (EN, FR):
            (self.tmp / p).mkdir(parents=True)
            shutil.copy(REPO / p / "index.html", self.tmp / p / "index.html")
        (self.tmp / "images").mkdir()
        self.root, ns.ROOT = ns.ROOT, self.tmp
        self.fetched = []

    def tearDown(self):
        ns.ROOT = self.root
        shutil.rmtree(self.tmp)

    def fetch(self, url):
        self.fetched.append(url)
        return png_bytes()

    def test_photo_is_saved_small_upright_jpeg_named_by_slug(self):
        figs, written, notes = ns.story_photo(row("https://prod-files.notion/x.png"), dry=False, fetch=self.fetch)
        self.assertEqual(written, "images/council-watch-council-asks-quebec-to-ban-trucks.jpg")
        im = Image.open(self.tmp / written)
        self.assertEqual((im.format, max(im.size)), ("JPEG", 1600))
        self.assertEqual(im.getpixel((10, 10)), (255, 255, 255), "transparency lands on white")
        self.assertIn('alt="Des camions sur la route 138, rue Church"', figs["fr"])
        self.assertIn('<span class="credit">Photo: The Ormstown Observer</span>', figs["en"])
        self.assertEqual(notes, [])
        _, again, _ = ns.story_photo(row("https://prod-files.notion/x.png"), dry=False, fetch=self.fetch)
        self.assertIsNone(again, "same photo → file not rewritten")

    def test_dry_run_writes_no_file(self):
        _, written, _ = ns.story_photo(row("https://x/y.png"), dry=True, fetch=self.fetch)
        self.assertTrue(written)
        self.assertEqual(list((self.tmp / "images").iterdir()), [])

    def test_no_credit_holds_the_story_back(self):
        with self.assertRaises(ns.Unsupported) as e:
            ns.story_photo(row("https://x/y.png", credit=""), dry=True, fetch=self.fetch)
        self.assertIn("no credit", str(e.exception))
        self.assertEqual(self.fetched, [], "nothing downloaded")

    def test_alt_text_rules(self):
        with self.assertRaises(ns.Unsupported):
            ns.story_photo(row("https://x/y.png", alt_en="", alt_fr=""), dry=True, fetch=self.fetch)
        figs, _, notes = ns.story_photo(row("https://x/y.png", alt_fr=""), dry=True, fetch=self.fetch)
        self.assertIn('alt="Trucks on Route 138 at rue Church"', figs["fr"])
        self.assertIn("no French alt text", notes[0])

    def test_no_image_does_nothing(self):
        self.assertEqual(ns.story_photo(row(None), dry=False, fetch=self.fetch), (None, None, []))
        self.assertEqual(self.fetched, [])

    def test_sync_row_puts_it_on_both_pages_and_reports_the_file(self):
        ns.fetch_photo = self.fetch            # sync_row looks the download up at call time
        try:
            _, full, changed, notes = ns.sync_row(row("https://x/y.png"), [], dry=False, recal=False)
        finally:
            ns.fetch_photo = REAL_FETCH
        self.assertFalse(full)
        self.assertEqual(changed, ["images/council-watch-council-asks-quebec-to-ban-trucks.jpg", EN + "/index.html", FR + "/index.html"])
        for p in (EN, FR):
            page = (self.tmp / p / "index.html").read_text(encoding="utf-8")
            self.assertEqual(page.count('data-photo="notion"'), 1)
            self.assertRegex(page, r'src="/images/council-watch-council-asks-quebec-to-ban-trucks\.jpg\?v=[0-9a-f]{8}"')


if __name__ == "__main__":
    unittest.main()

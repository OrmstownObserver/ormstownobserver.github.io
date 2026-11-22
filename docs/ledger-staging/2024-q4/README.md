# Ledger staging — sittings of Oct 7, Nov 11 and Dec 2, 2024

Not published. Nothing on the site reads these files.

- `payments_2024-10_to_2024-12.json` — 615 payment lines parsed from Annexe A of the three
  procès-verbaux on ormstown.ca. Each month sums to the adopted total to the cent
  (634 091,62 $ · 643 091,17 $ · 268 308,98 $). One manual fix in December
  (Shellex 333,43 $, printed without its "$"). Supplier names and descriptions were re-read cell by cell from the PDF on 2026-11-21: the first pass had shifted wrapped text between neighbouring lines (amounts were not affected). Each line is [payee, description, amount, category], with the category from `finances/tools/category-rules.js`.
- `notion_import_2024-q4.csv` — the same 615 lines plus the three monthly totals, under the ledger's property names, ready to load into the Notion ledger (the Fiscal Year option "2024" was added on 2026-11-21).
- `resolution_index_2024-09_to_2026-10.json` — 782 council resolutions (number, sitting
  date, source file, title, amounts found). The Dec 1 and Dec 17, 2025 and Jan 19, 2026
  entries come from OCR of scanned minutes and must be checked against the PDFs.

To publish: itemize the sittings in the Notion ledger first (it needs a 2024 fiscal
year), then follow `finances/tools/README.md` ("Regenerating the data").
The Aug 5 and Sep 9, 2024 lists are not here: the Town hosts those minutes on
Google Drive and they still have to be parsed.

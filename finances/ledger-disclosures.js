// ============================================================
// Ormstown Observer — the Ledger's Disclosures tab: what the law makes
// the Town publish, what it has published, and the Observer's substitute.
// HAND-AUTHORED. Nothing in tools/ writes it. Validated by
// tests/validate.js check 14. Rendered textContent-only by
// ledger-views.js disclosures(); links only to this site, ormstown.ca,
// SEAO and LegisQuébec.
//
// RULES
//  - `groups`: the tracker's four categories, in reading order, each with
//    the province's own stated reason (`why`) and its source. Every item
//    names its `group`.
//  - `sources`: the province's own guidance and the laws, shown under the
//    page heading. Official hosts only (same list as CTX_EXT).
//  - Each obligation's `short` is its finding in one line for the list view;
//    it restates only what its `town` text already says.
//  - Every row states the law by name and article and links the article.
//  - "Town" statements are dated: `checked` is the day ormstown.ca and
//    SEAO were last read. A missing item says "not on ormstown.ca as of
//    <checked>", never why. No characterization (Council Watch's
//    Communications-watch rules apply).
//  - A contract carries its own source: the SEAO report for its year
//    (kind "seao"), the minutes (kind "minutes") or an Observer page the
//    newsroom sourced to the room or to a document (kind "recap"). A
//    figure heard only on a recording is not restated.
//  - `payee` is a frozen slug from tests/payee-slugs.json, or null when the
//    contractor has not yet appeared on an itemized payment list.
//    `match` picks the contractor's lines that belong to the contract:
//    `all: true`, or `text: [regex sources]` tested against the line text.
//    "Paid to date" is the sum of those lines; it is the Observer's
//    arithmetic on the lists, not the legal "dépense effectivement faite".
//  - `funds` says who pays, one entry per source the resolutions name:
//    kind grant (granted, per the minutes) | pending (requested, not yet
//    granted) | shared (cost-sharing agreement) | borrowing (loan by-law,
//    bonds) | lease (crédit-bail) | reserves (Town surplus) | unstated
//    (the minutes name no source). Each non-unstated entry cites its
//    resolution `res` and links that sitting's PV (`href`, ormstown.ca).
//    `amount` only when the resolution prints it. Never infer a source:
//    "eligible" is not "granted", and an account number is not a source.
//  - Amounts are as printed on SEAO ("Prix du contrat") or in the minutes;
//    `tax` says which: "before" | "included" | "unstated".
// ============================================================
window.OO_LEDGER_DISCLOSURES = {
 "updated": "2026-11-16",
 "checked": "2026-11-15",
 "threshold": 25000,
 "groups": [
  {
   "id": "contracts",
   "en": "Contracts",
   "fr": "Contrats",
   "why": {
    "en": "Québec's law on municipal contracts says it aims to encourage competition and promote integrity and transparency in public procurement, so that public funds are soundly managed and businesses are treated fairly. Publishing who receives each contract, and for how much, is how residents and competing businesses can see that for themselves.",
    "fr": "La loi québécoise sur les contrats municipaux dit viser à favoriser la concurrence et à promouvoir l'intégrité et la transparence des marchés publics, pour assurer une saine gestion des fonds publics et un traitement équitable des entreprises. Publier qui obtient chaque contrat, et pour combien, permet aux citoyens et aux entreprises concurrentes de le constater eux-mêmes."
   },
   "src": {
    "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/C-65.01#se:1",
    "en": "Act respecting contracts of municipal bodies, s. 1",
    "fr": "Loi sur les contrats des organismes municipaux, art. 1"
   }
  },
  {
   "id": "ethics",
   "en": "Ethics",
   "fr": "Éthique",
   "why": {
    "en": "Québec's municipal ethics law exists to secure council members' explicit commitment to their municipality's ethical values, to require rules of conduct, and to provide ways to enforce them. Members must take recognized training early in each term, and the municipality keeps the list of those who have done so on its website.",
    "fr": "La loi québécoise sur l'éthique municipale vise à assurer l'adhésion explicite des membres du conseil aux valeurs de leur municipalité en matière d'éthique, à prévoir des règles déontologiques et des mécanismes pour les faire respecter. Les élus doivent suivre une formation reconnue en début de mandat, et la municipalité tient à jour sur son site la liste de ceux qui l'ont suivie."
   },
   "src": {
    "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/E-15.1.0.1#se:1",
    "en": "Municipal Ethics and Good Conduct Act, ss. 1 and 15",
    "fr": "Loi sur l'éthique et la déontologie en matière municipale, art. 1 et 15"
   }
  },
  {
   "id": "finance",
   "en": "Finances",
   "fr": "Finances",
   "why": {
    "en": "The Commission municipale du Québec, which audits municipalities, describes the financial report as an important exercise in transparency: it is how a town accounts for its financial management and the use of its resources. Residents can also expect clear information on how their taxes are set and how they change.",
    "fr": "La Commission municipale du Québec, qui audite les municipalités, qualifie le rapport financier d'important exercice de transparence : c'est par lui qu'une municipalité rend compte de sa gestion financière et de l'utilisation de ses ressources. Les citoyens peuvent aussi s'attendre à une information claire sur l'établissement et l'évolution de leurs taxes."
   },
   "src": {
    "href": "https://www.cmq.gouv.qc.ca/rapport-audit-transmission-rapport-financier-municipalite",
    "en": "Commission municipale: audit of financial-report filing",
    "fr": "Commission municipale : audit de la transmission du rapport financier"
   }
  },
  {
   "id": "council-pay",
   "en": "Council pay",
   "fr": "Rémunération des élus",
   "why": {
    "en": "Council sets its own members' pay by by-law. In return, Québec says, it owes residents an account of it: the pay and expense allowance members received appear in the municipality's financial report.",
    "fr": "Le conseil fixe lui-même la rémunération de ses membres par règlement. En contrepartie, précise Québec, il a une obligation de reddition de comptes envers les citoyens : la rémunération et l'allocation de dépenses versées aux élus figurent au rapport financier de la municipalité."
   },
   "src": {
    "href": "https://www.quebec.ca/gouvernement/gestion-municipale/organisation-municipale/democratie-municipale/conseil-municipal-elus-municipaux/remuneration-depenses-elus-municipaux",
    "en": "Québec: pay and expenses of municipal councillors (in French)",
    "fr": "Québec : rémunération et dépenses des élus municipaux"
   }
  }
 ],
 "sources": [
  {
   "href": "https://www.quebec.ca/gouvernement/gestion-municipale/gestion-contrats-municipaux/sollicitation-adjudication/transparence",
   "en": "Québec: transparency in municipal contracts (in French)",
   "fr": "Québec : transparence dans l'attribution des contrats municipaux"
  },
  {
   "href": "https://www.quebec.ca/gouvernement/gestion-municipale/organisation-municipale/democratie-municipale/conseil-municipal-elus-municipaux/remuneration-depenses-elus-municipaux",
   "en": "Québec: pay and expenses of municipal councillors (in French)",
   "fr": "Québec : rémunération et dépenses des élus municipaux"
  },
  {
   "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/C-65.01",
   "en": "Act respecting contracts of municipal bodies (C-65.01)",
   "fr": "Loi sur les contrats des organismes municipaux (C-65.01)"
  },
  {
   "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/C-27.1",
   "en": "Municipal Code of Québec (C-27.1)",
   "fr": "Code municipal du Québec (C-27.1)"
  },
  {
   "href": "https://www.cmq.gouv.qc.ca/rapport-audit-publication-contrats-dans-seao",
   "en": "Commission municipale: audit of contract publication in SEAO",
   "fr": "Commission municipale : audit de la publication des contrats dans le SEAO"
  }
 ],
 "seao": {
  "org": "Municipalité d'Ormstown",
  "href": "https://seao.gouv.qc.ca/contrats-par-organisation/rapport?ItemId=fb3c6364-600d-4257-8e1c-db937a232638&dteCcFrm=2026-01-01T05:00:00.000Z&dteCcTo=2026-12-31T05:00:00.000Z",
  "href_2025": "https://seao.gouv.qc.ca/contrats-par-organisation/rapport?ItemId=fb3c6364-600d-4257-8e1c-db937a232638&dteCcFrm=2025-01-01T05:00:00.000Z&dteCcTo=2025-12-31T05:00:00.000Z",
  "href_2024": "https://seao.gouv.qc.ca/contrats-par-organisation/rapport?ItemId=fb3c6364-600d-4257-8e1c-db937a232638&dteCcFrm=2024-01-01T05:00:00.000Z&dteCcTo=2024-12-31T05:00:00.000Z"
 },

 "items": [
  {
   "id": "contracts-25k",
   "group": "contracts",
   "short": {"en": "No final cost published on any of the 12 contracts listed; September and October 2026 awards not yet entered.", "fr": "Aucune dépense finale publiée pour les 12 contrats listés; les octrois de septembre et d'octobre 2026 n'y sont pas encore."},
   "en": "Every contract of $25,000 or more",
   "fr": "Chaque contrat de 25 000 $ ou plus",
   "law": { "en": "Loi sur les contrats des organismes municipaux, s. 99", "fr": "Loi sur les contrats des organismes municipaux, art. 99", "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/C-65.01#se:99", "note_en": "Before April 1, 2026: Code municipal, s. 961.3", "note_fr": "Avant le 1er avril 2026 : Code municipal, art. 961.3" },
   "requires": { "en": "A list on SEAO, the provincial contract register, of every contract involving $25,000 or more: object, amount, award procedure, contractor, date, the estimate, each bidder and its price, and the total actually paid once the contract is complete. Updated at least monthly, kept three years, linked from the Town's website.", "fr": "Une liste, sur le SEAO (le registre provincial des contrats), de chaque contrat de 25 000 $ ou plus : objet, montant, mode d'adjudication, cocontractant, date, estimation, chaque soumissionnaire et son prix, et la dépense totale effectivement faite une fois le contrat terminé. Mise à jour au moins chaque mois, conservée trois ans, liée depuis le site de la Municipalité." },
   "status": "partial",
   "town": { "en": "Ormstown's SEAO report lists 12 contracts for 2024–2026. On every one, the \"total actually paid\" field is blank. Contracts awarded on September 8 and October 6, 2026 do not appear. For the 3e Rang contract of August 3, 2026, SEAO names a different winning bidder than the minutes. The Town's site links SEAO's general page, not its own report.", "fr": "Le rapport SEAO d'Ormstown liste 12 contrats pour 2024-2026. Pour chacun, le champ « dépense effectivement faite » est vide. Les contrats octroyés les 8 septembre et 6 octobre 2026 n'y figurent pas. Pour le contrat du 3e Rang du 3 août 2026, le SEAO nomme un adjudicataire différent de celui du procès-verbal. Le site de la Municipalité renvoie à la page générale du SEAO, pas à son propre rapport.", "href": "https://www.ormstown.ca/ma-municipalite/administration/appels-doffres-et-gestion-contractuelle", "href_label_en": "Town's contracts page", "href_label_fr": "Page des contrats de la Municipalité" },
   "observer": { "en": "The contracts register on this page: each contract, its SEAO entry, and what the payment lists show paid so far.", "fr": "Le registre des contrats sur cette page : chaque contrat, son entrée SEAO et ce que les listes de paiements montrent de versé à ce jour.", "anchor": "contracts" }
  },
  {
   "id": "annual-list",
   "group": "contracts",
   "short": {"en": "The latest list posted is for 2022; the 2023, 2024 and 2025 lists are not on ormstown.ca.", "fr": "La dernière liste en ligne est celle de 2022; celles de 2023, 2024 et 2025 ne sont pas sur ormstown.ca."},
   "en": "The yearly list of contractors paid $25,000 or more",
   "fr": "La liste annuelle des cocontractants payés 25 000 $ ou plus",
   "law": { "en": "Loi sur les contrats des organismes municipaux, s. 100", "fr": "Loi sur les contrats des organismes municipaux, art. 100", "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/C-65.01#se:100", "note_en": "Before April 1, 2026: Code municipal, s. 961.4 (contracts over $2,000)", "note_fr": "Avant le 1er avril 2026 : Code municipal, art. 961.4 (contrats de plus de 2 000 $)" },
   "requires": { "en": "By March 31 each year, on the Town's own website: every contract of $5,000 or more concluded the previous year with one contractor, when that contractor's contracts total $25,000 or more. Object, amount and contractor's name.", "fr": "Au plus tard le 31 mars de chaque année, sur le site de la Municipalité : chaque contrat de 5 000 $ ou plus conclu l'année précédente avec un même cocontractant, lorsque l'ensemble atteint 25 000 $. Objet, montant et nom du cocontractant." },
   "due": "2026-03-31",
   "status": "stale",
   "town": { "en": "The latest list on ormstown.ca is for 2022 (posted June 2025). The 2023, 2024 and 2025 lists, due March 31 of 2024, 2025 and 2026, are not on ormstown.ca.", "fr": "La liste la plus récente sur ormstown.ca est celle de 2022 (mise en ligne en juin 2025). Les listes de 2023, 2024 et 2025, dues le 31 mars 2024, 2025 et 2026, ne sont pas sur ormstown.ca.", "href": "https://www.ormstown.ca/wp-content/uploads/Liste-des-contrats-2022-Finale.pdf", "href_label_en": "2022 list (PDF)", "href_label_fr": "Liste 2022 (PDF)" },
   "observer": { "en": "The suppliers table on this page: every supplier paid $25,000 or more in a year, built from the payment lines council approved.", "fr": "Le tableau des fournisseurs sur cette page : chaque fournisseur payé 25 000 $ ou plus dans l'année, bâti à partir des lignes de paiement approuvées par le conseil.", "anchor": "suppliers" }
  },
  {
   "id": "contract-bylaw",
   "group": "contracts",
   "short": {"en": "By-law 129-2026, in force since November 3, 2026, is posted; the contracts page still shows the by-laws it replaced.", "fr": "Le règlement 129-2026, en vigueur depuis le 3 novembre 2026, est en ligne; la page des contrats affiche encore les règlements qu'il remplace."},
   "en": "The contract-management by-law and complaints procedure",
   "fr": "Le règlement de gestion contractuelle et la procédure de plaintes",
   "law": { "en": "Loi sur les contrats des organismes municipaux, ss. 10 and 115", "fr": "Loi sur les contrats des organismes municipaux, art. 10 et 115", "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/C-65.01#se:10" },
   "requires": { "en": "The by-law that sets how the Town awards contracts below the tender threshold, and the procedure for complaints about an award, both on the website.", "fr": "Le règlement qui fixe comment la Municipalité octroie les contrats sous le seuil d'appel d'offres, et la procédure de plaintes sur un octroi, tous deux sur le site." },
   "status": "found",
   "town": {"en": "By-law 129-2026, adopted November 2, 2026 and in force November 3, is posted on the by-laws page. The contracts page still lists the by-laws it replaced, 129-2020 and 129-2021. A complaints policy dated September 19, 2023 is posted on the policies page.", "fr": "Le règlement 129-2026, adopté le 2 novembre 2026 et en vigueur le 3 novembre, est en ligne sur la page des règlements. La page des contrats affiche encore les règlements qu'il remplace, 129-2020 et 129-2021. Une politique de gestion des plaintes datée du 19 septembre 2023 est en ligne sur la page des politiques.", "href": "https://www.ormstown.ca/wp-content/uploads/129-2026_RGC.pdf", "href_label_en": "By-law 129-2026 (PDF)", "href_label_fr": "Règlement 129-2026 (PDF)"},
   "observer": { "en": "The Observer's explainer of by-law 129-2026 and what changes.", "fr": "L'explication par l'Observer du règlement 129-2026 et de ce qui change.", "href_en": "/en/bylaws-regulations/contract-management-129-2026/", "href_fr": "/fr/bylaws-regulations/gestion-contractuelle-129-2026/" }
  },
  {
   "id": "highlights",
   "group": "finance",
   "short": {"en": "The 2025 highlights, tabled June 1, 2026, are not on ormstown.ca.", "fr": "Les faits saillants 2025, déposés le 1er juin 2026, ne sont pas sur ormstown.ca."},
   "en": "The mayor's report on the year's finances",
   "fr": "Le rapport du maire sur les finances de l'année",
   "law": { "en": "Code municipal du Québec, s. 176.2.2", "fr": "Code municipal du Québec, art. 176.2.2", "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/C-27.1#se:176_2_2" },
   "requires": { "en": "At a regular sitting held by September, the mayor reports the highlights of the financial report and the auditor's report. Council chooses how it is circulated.", "fr": "À une séance ordinaire tenue au plus tard en septembre, le maire fait rapport des faits saillants du rapport financier et du rapport du vérificateur. Le conseil choisit le mode de diffusion." },
   "status": "stale",
   "town": { "en": "Highlights for 2022, 2023 and 2024 are posted. The 2025 highlights were tabled on June 1, 2026 (resolution 26-06-153, which says they would be made available on the Town's website). They are not on ormstown.ca.", "fr": "Les faits saillants de 2022, 2023 et 2024 sont en ligne. Ceux de 2025 ont été déposés le 1er juin 2026 (résolution 26-06-153, qui dit qu'ils seraient disponibles sur le site de la Municipalité). Ils ne sont pas sur ormstown.ca.", "href": "https://www.ormstown.ca/ma-municipalite/administration/budget-et-rapports-financiers", "href_label_en": "Town's budget and reports page", "href_label_fr": "Page budget et rapports de la Municipalité" },
   "observer": { "en": "The June 1, 2026 sitting, where the 2025 statements were tabled.", "fr": "La séance du 1er juin 2026, où les états financiers 2025 ont été déposés.", "href_en": "/en/council-watch/june-1-2026/", "href_fr": "/fr/conseil-municipal/1-juin-2026/" }
  },
  {
   "id": "council-pay",
   "group": "council-pay",
   "short": {"en": "One combined figure for all councillors, not one per member; 2025 figures missing.", "fr": "Un seul chiffre pour l'ensemble des conseillers, pas un par membre; les chiffres de 2025 manquent."},
   "en": "What each council member is paid",
   "fr": "Ce que chaque membre du conseil reçoit",
   "law": { "en": "Act respecting the remuneration of elected municipal officers, s. 11", "fr": "Loi sur le traitement des élus municipaux, art. 11", "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/T-11.001#se:11" },
   "requires": { "en": "The remuneration and expense allowance each member of council receives, stated in the financial report and published on the website.", "fr": "La rémunération et l'allocation de dépenses que chaque membre du conseil reçoit, mentionnées au rapport financier et publiées sur le site Internet." },
   "status": "partial",
   "town": { "en": "The 2024 highlights give one figure for all councillors together ($67,567), not one per member. The 2025 figures are missing with the 2025 highlights.", "fr": "Les faits saillants 2024 donnent un seul chiffre pour l'ensemble des conseillers (67 567 $), pas un par membre. Les chiffres de 2025 manquent avec les faits saillants 2025.", "href": "https://www.ormstown.ca/wp-content/uploads/Faits-saillants-2024.pdf", "href_label_en": "2024 highlights (PDF)", "href_label_fr": "Faits saillants 2024 (PDF)" },
   "observer": { "en": "Payroll appears in the minutes as one lump sum per sitting, so the Ledger cannot show pay per member. The Observer will publish the pay by-law's figures once it has them.", "fr": "La paie figure au procès-verbal comme un seul montant par séance : le grand livre ne peut donc pas montrer la rémunération par membre. L'Observer publiera les chiffres du règlement sur le traitement dès qu'il les aura." }
  },
  {
   "id": "budget-pti",
   "group": "finance",
   "short": {"en": "The 2026 budget and 2026–2028 capital program are posted.", "fr": "Le budget 2026 et le PTI 2026-2028 sont en ligne."},
   "en": "The budget and the three-year capital program",
   "fr": "Le budget et le programme triennal d'immobilisations",
   "law": { "en": "Code municipal du Québec, ss. 953.1, 954 and 957", "fr": "Code municipal du Québec, art. 953.1, 954 et 957", "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/C-27.1#se:954" },
   "requires": { "en": "The budget and capital program are adopted by December 31 and either distributed to every address or published in a newspaper circulating in the territory. The law does not require the website.", "fr": "Le budget et le programme triennal sont adoptés au plus tard le 31 décembre et soit distribués à chaque adresse, soit publiés dans un journal diffusé sur le territoire. La loi n'exige pas le site Internet." },
   "status": "found",
   "town": { "en": "The 2026 budget and 2026–2028 capital program leaflets are posted, with budgets back to 2023.", "fr": "Les dépliants du budget 2026 et du PTI 2026-2028 sont en ligne, avec les budgets depuis 2023.", "href": "https://www.ormstown.ca/wp-content/uploads/FEUILLET_Budget_2026_VF.pdf", "href_label_en": "Budget 2026 (PDF)", "href_label_fr": "Budget 2026 (PDF)" },
   "observer": { "en": "The Ledger's budget page: the 2026 budget by function, the capital program, and how the payment lists relate to it.", "fr": "La page budget du grand livre : le budget 2026 par fonction, le PTI, et le rapport entre les listes de paiements et le budget.", "href_en": "/finances/budget/#budget", "href_fr": "/finances/budget/#budget" }
  },
  {
   "id": "financial-report",
   "group": "finance",
   "short": {"en": "Only the highlights are posted, not the statements themselves.", "fr": "Seuls les faits saillants sont en ligne, pas les états financiers eux-mêmes."},
   "en": "The audited financial statements",
   "fr": "Les états financiers vérifiés",
   "law": { "en": "Code municipal du Québec, ss. 176 to 176.2", "fr": "Code municipal du Québec, art. 176 à 176.2", "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/C-27.1#se:176" },
   "requires": { "en": "The financial report and the auditor's report are tabled at a council sitting and sent to the minister. The law does not require the website.", "fr": "Le rapport financier et le rapport du vérificateur sont déposés à une séance du conseil et transmis au ministre. La loi n'exige pas le site Internet." },
   "status": "partial",
   "town": { "en": "Only the highlights are posted, not the statements themselves.", "fr": "Seuls les faits saillants sont en ligne, pas les états financiers eux-mêmes.", "href": "https://www.ormstown.ca/ma-municipalite/administration/budget-et-rapports-financiers", "href_label_en": "Town's budget and reports page", "href_label_fr": "Page budget et rapports de la Municipalité" },
   "observer": { "en": "The auditor's fees are on the payment lists: BCGO's profile.", "fr": "Les honoraires du vérificateur sont aux listes de paiements : le profil de BCGO.", "payee": "bcgo-s-e-n-c-r-l" }
  },
  {
   "id": "ethics",
   "group": "ethics",
   "short": {"en": "No training list found; the council page still links the 2021 code, replaced in May 2026.", "fr": "Aucune liste de formation trouvée; la page du conseil renvoie encore au code de 2021, remplacé en mai 2026."},
   "en": "Ethics training of council members, and the code of ethics",
   "fr": "La formation en éthique des élus, et le code d'éthique",
   "law": { "en": "Municipal Ethics and Good Conduct Act, ss. 13 and 15", "fr": "Loi sur l'éthique et la déontologie en matière municipale, art. 13 et 15", "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/E-15.1.0.1#se:15" },
   "requires": { "en": "A list, kept current on the website, of the council members who have completed the required ethics training; a revised code of ethics after each election.", "fr": "Une liste, tenue à jour sur le site, des membres du conseil ayant suivi la formation obligatoire en éthique; un code d'éthique révisé après chaque élection." },
   "status": "stale",
   "town": { "en": "No training list was found on ormstown.ca. The council page still links the 2021 code (74-2021); by-law 74-2026 was adopted on May 4, 2026 (resolution 26-05-140).", "fr": "Aucune liste de formation n'a été trouvée sur ormstown.ca. La page du conseil renvoie encore au code de 2021 (74-2021); le règlement 74-2026 a été adopté le 4 mai 2026 (résolution 26-05-140).", "href": "https://www.ormstown.ca/ma-municipalite/vie-democratique/conseil-municipal", "href_label_en": "Town's council page", "href_label_fr": "Page du conseil de la Municipalité" },
   "observer": { "en": "The May 4, 2026 sitting, where 74-2026 was adopted.", "fr": "La séance du 4 mai 2026, où le règlement 74-2026 a été adopté.", "href_en": "/en/council-watch/council-asks-quebec-to-ban-trucks/", "href_fr": "/fr/conseil-municipal/demande-interdire-camions-trois-rues/" }
  },
  {
   "id": "tax-bylaw",
   "group": "finance",
   "short": {"en": "By-law 1-2026, which sets the 2026 tax rates, is not posted.", "fr": "Le règlement 1-2026, qui fixe les taux de 2026, n'est pas en ligne."},
   "en": "The year's tax-rate by-law",
   "fr": "Le règlement de taxation de l'année",
   "law": { "en": "Code municipal du Québec, s. 433.1 (notices and by-laws online)", "fr": "Code municipal du Québec, art. 433.1 (avis et règlements en ligne)", "href": "https://www.legisquebec.gouv.qc.ca/fr/document/lc/C-27.1#se:433_1" },
   "requires": { "en": "Since by-law 167-2025, the Town publishes its public notices on its website; the by-laws themselves are posted on the Town's by-laws page.", "fr": "Depuis le règlement 167-2025, la Municipalité publie ses avis publics sur son site; les règlements eux-mêmes sont affichés à la page des règlements." },
   "status": "stale",
   "town": { "en": "The by-laws page lists 1-2025 and the draft amendment 1.1-2026. By-law 1-2026, which sets the 2026 rates, is not posted.", "fr": "La page des règlements liste 1-2025 et le projet de modification 1.1-2026. Le règlement 1-2026, qui fixe les taux de 2026, n'est pas en ligne.", "href": "https://www.ormstown.ca/services/reglementation/reglements-principaux", "href_label_en": "Town's by-laws page", "href_label_fr": "Page des règlements de la Municipalité" },
   "observer": { "en": "The 2026 rates as printed in the budget leaflet: residential $0.5794 per $100 of valuation, up from $0.5463.", "fr": "Les taux de 2026 tels qu'imprimés au dépliant du budget : résidentiel 0,5794 $ par 100 $ d'évaluation, contre 0,5463 $.", "href_en": "/en/council-watch/borrowing-172-173-2026/", "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/" }
  }
 ],

 "contracts": [
  {
   "id": "upper-concession-2024",
   "object": { "en": "Rebuilding chemin Upper Concession", "fr": "Travaux de réfection du chemin Upper Concession" },
   "contractor": "Ali Excavation Inc.",
   "payee": "ali-excavation-inc",
   "match": { "text": ["upper concession"] },
   "awarded": "2024",
   "amount": 1314976.82, "tax": "unstated",
   "estimate": 1532000,
   "mode": { "en": "Public tender, 6 bids", "fr": "Appel d'offres public, 6 soumissions" },
   "bidders": [["Eurovia Québec Construction Inc.", 1396885.25], ["Roxboro Excavation Inc.", 1397181.33], ["Les Pavages Céka Inc.", 1539674.24], ["Pavage Axion Inc.", 1559317.21], ["Les Pavages Ultra Inc.", 1683711.58]],
   "seao": { "notice": "1826806/ORM240319", "year": 2024, "final": "blank" },
   "funds": [{"kind": "unstated", "en": "Not stated in the 2025–2026 minutes (awarded in 2024)", "fr": "Non précisé aux procès-verbaux de 2025-2026 (octroyé en 2024)"}],
   "note": { "en": "Awarded in 2024; payments made that year predate the Ledger, which is itemized from January 2025.", "fr": "Octroyé en 2024; les paiements de cette année-là précèdent le grand livre, détaillé à partir de janvier 2025." }
  },
  {
   "id": "camion-2024",
   "object": { "en": "Replacement of a six-wheel truck", "fr": "Remplacement d'un camion 6 roues" },
   "contractor": "Camions Inter-Anjou Inc.",
   "payee": null,
   "awarded": "2024",
   "amount": 135277.29, "tax": "unstated",
   "estimate": 133800,
   "mode": { "en": "Public tender, 2 bids", "fr": "Appel d'offres public, 2 soumissions" },
   "bidders": [["International Rive Nord", 139667.40]],
   "seao": { "notice": "20018468/ORM240604.02", "year": 2024, "final": "blank" },
   "funds": [{"kind": "lease", "en": "Lease-to-own over 60 months through Rexcap (lessor: TD Bank), $117,568 before tax; first planned from the Town's surplus", "fr": "Crédit-bail de 60 mois par Rexcap (locateur : Banque TD), 117 568 $ avant taxes; d'abord prévu à même le surplus de la Municipalité", "amount": 117568, "res": "25-04-119", "href": "https://www.ormstown.ca/wp-content/uploads/2025-04-03_PV-SE-1.pdf"}],
   "note": { "en": "No payment to this contractor appears on the lists itemized since January 2025.", "fr": "Aucun paiement à ce fournisseur ne figure aux listes détaillées depuis janvier 2025." }
  },
  {
   "id": "splash-pad-design-2025",
   "object": { "en": "Design of a water-play area (2nd call)", "fr": "2e appel — Conception d'une aire de jeux d'eau" },
   "contractor": "Les Industries Simexco Inc.",
   "payee": "les-industries-simexco-inc",
   "match": { "text": ["jeux"] },
   "awarded": "2025",
   "amount": 600003.75, "tax": "unstated",
   "estimate": 600000,
   "mode": { "en": "Public tender, 3 bidders listed", "fr": "Appel d'offres public, 3 soumissionnaires inscrits" },
   "bidders": [["9386-3025 Québec inc", null], ["Tessier Récréo-Parc inc.", null]],
   "seao": { "notice": "20040006/ORM241225", "year": 2025, "final": "blank" },
   "funds": [{"kind": "reserves", "en": "Town's unrestricted surplus", "fr": "Surplus non affecté de la Municipalité", "amount": 175000, "res": "25-01-027", "href": "https://www.ormstown.ca/wp-content/uploads/2025-01-20_PV.pdf"}, {"kind": "unstated", "en": "Charged to project account 23-084-00-722; the source is not named", "fr": "Imputé au poste 23-084-00-722; la source n'est pas nommée", "amount": 125000, "res": "25-01-027", "href": "https://www.ormstown.ca/wp-content/uploads/2025-01-20_PV.pdf"}, {"kind": "unstated", "en": "No source is stated for the rest of the contract price", "fr": "Aucune source n'est indiquée pour le reste du prix du contrat"}],
   "note": { "en": "SEAO prints $600,003.75 as the contract price; the payment lists show $185,575 to Simexco for the splash pad's phase 1 equipment. The difference is not explained in either record.", "fr": "Le SEAO inscrit 600 003,75 $ comme prix du contrat; les listes de paiements montrent 185 575 $ à Simexco pour l'équipement de la phase 1 des jeux d'eau. Ni l'un ni l'autre n'explique l'écart." }
  },
  {
   "id": "hdv-2025",
   "object": { "en": "Town hall renovation works", "fr": "Travaux d'aménagement de l'Hôtel de Ville" },
   "contractor": "Construction Émery Paquette Inc.",
   "payee": "construction-emery-paquette-inc",
   "match": { "text": ["hdv", "h\\.-v\\.", "hôtel de ville"] },
   "awarded": "2025-02-03", "resolution": "25-02-064",
   "amount": 461090, "tax": "unstated",
   "estimate": 461090,
   "mode": { "en": "Public tender, 3 bids", "fr": "Appel d'offres public, 3 soumissions" },
   "bidders": [["Construction Jacques Théorêt Inc.", 501810], ["Les Constructions B. Martel Inc.", 599600]],
   "seao": { "notice": "20043520/ORM250120", "year": 2025, "final": "blank" },
   "funds": [{"kind": "reserves", "en": "Town's unrestricted surplus at December 31, 2023", "fr": "Surplus non affecté de la Municipalité au 31 décembre 2023", "res": "25-02-064", "href": "https://www.ormstown.ca/wp-content/uploads/2025-02-10_PV-SE.pdf"}],
   "note": { "en": "Paid in six progress payments from April 2025 to the final one in August 2026, each citing resolution 25-02-064. SEAO's estimate equals the winning bid to the dollar.", "fr": "Payé en six décomptes, d'avril 2025 au décompte final d'août 2026, chacun citant la résolution 25-02-064. L'estimation du SEAO est égale au dollar près à la soumission retenue." }
  },
  {
   "id": "artelia-2025",
   "object": { "en": "Professional services for street rebuilds", "fr": "Services professionnels pour réfection de rues" },
   "contractor": "Artelia Canada Inc.",
   "payee": "artelia-canada-inc",
   "match": { "all": true },
   "awarded": "2025-02-03", "resolution": "25-02-065",
   "amount": 1198548.26, "tax": "unstated",
   "estimate": null,
   "mode": { "en": "Public tender, 2 bidders listed", "fr": "Appel d'offres public, 2 soumissionnaires inscrits" },
   "bidders": [["Shellex Groupe Conseil Inc.", null]],
   "seao": { "notice": "20044347/ORM250121", "year": 2025, "final": "blank" },
   "funds": [{"kind": "unstated", "en": "Base contract: charged half and half to two project accounts; the source is not named", "fr": "Contrat de base : imputé moitié-moitié à deux postes de projet; la source n'est pas nommée", "res": "25-02-065", "href": "https://www.ormstown.ca/wp-content/uploads/2025-02-10_PV-SE.pdf"}, {"kind": "grant", "en": "Change order (paving done with the master-plan work, up to 25%): \"entirely covered\" by the TECQ 2024-2028 water-infrastructure transfer", "fr": "Avenant (pavage fait avec les travaux du plan directeur, jusqu'à 25 %) : « entièrement couvert » par la TECQ 2024-2028", "res": "25-10-296", "href": "https://www.ormstown.ca/wp-content/uploads/2025-10-02-Extra.pdf"}, {"kind": "shared", "en": "October 2026 amendment, before tax: eligible costs shared 50/50 with Québec's transport ministry (agreement 202739), subject to its approval", "fr": "Amendement d'octobre 2026, avant taxes : coûts admissibles partagés à parts égales avec le ministère des Transports (entente 202739), sous réserve de son approbation", "amount": 67840, "res": "26-10-277", "href": "https://www.ormstown.ca/wp-content/uploads/10.-PV_2026-10-06.pdf"}],
   "note": { "en": "No estimate is published. The lines cite resolution 25-02-065; the engineer's April 2026 estimate also defined the works in borrowing by-law 173-2026.", "fr": "Aucune estimation n'est publiée. Les lignes citent la résolution 25-02-065; l'estimation de l'ingénieur d'avril 2026 a aussi défini les travaux du règlement d'emprunt 173-2026." },
   "links": [{ "kind": "recap", "en": "Two borrowing by-laws, $11.2 million", "fr": "Deux règlements d'emprunt, 11,2 millions $", "href_en": "/en/council-watch/borrowing-172-173-2026/", "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/" }]
  },
  {
   "id": "snow-equipment-2025",
   "object": { "en": "Purchase and installation of snow-removal equipment", "fr": "Achat et installation d'équipements de déneigement" },
   "contractor": "Équipements Pro-Fit Inc.",
   "payee": "equipements-pro-fit-inc",
   "match": { "text": ["d[ée]neig", "neige", "chasse", "gratte", "souffleu", "épandeu"] },
   "awarded": "2025",
   "amount": 115186.54, "tax": "unstated",
   "estimate": 115186.54,
   "mode": { "en": "Public tender, 1 bid", "fr": "Appel d'offres public, 1 soumission" },
   "bidders": [],
   "seao": { "notice": "20045175/ORM250127", "year": 2025, "final": "blank" },
   "funds": [{"kind": "lease", "en": "Lease-to-own through Rexcap (lessor: TD Bank), $95,186.45 before tax, shortened to 57 months on June 10, 2025 (25-06-211)", "fr": "Crédit-bail par Rexcap (locateur : Banque TD), 95 186,45 $ avant taxes, ramené à 57 mois le 10 juin 2025 (25-06-211)", "amount": 95186.45, "res": "25-04-119", "href": "https://www.ormstown.ca/wp-content/uploads/2025-04-03_PV-SE-1.pdf"}],
   "note": { "en": "SEAO's estimate equals the single bid to the cent. The payment lists show only small repair lines to this supplier; the equipment itself does not appear on them.", "fr": "L'estimation du SEAO est égale au sou près à l'unique soumission. Les listes de paiements ne montrent que de petites lignes de réparation à ce fournisseur; l'équipement lui-même n'y figure pas." }
  },
  {
   "id": "splash-pad-build-2025",
   "object": { "en": "Construction of a water-play area", "fr": "Construction d'une aire de jeux d'eau" },
   "contractor": "Installation Jeux-Tec Inc.",
   "payee": "installation-jeux-tec-inc",
   "match": { "all": true },
   "awarded": "2025",
   "amount": 185671.20, "tax": "unstated",
   "estimate": 185671.20,
   "mode": { "en": "Public tender, 1 bid", "fr": "Appel d'offres public, 1 soumission" },
   "bidders": [],
   "seao": { "notice": "20049162/ORM-250212", "year": 2025, "final": "blank" },
   "funds": [{"kind": "grant", "en": "A grant; the minutes do not name the program", "fr": "Une subvention; le procès-verbal ne nomme pas le programme", "amount": 125000, "res": "25-03-108", "href": "https://www.ormstown.ca/wp-content/uploads/2025-03-13_PV-SE-1.pdf"}, {"kind": "unstated", "en": "Project account 23-084-00-722, plus taxes; the source is not named", "fr": "Poste 23-084-00-722, plus taxes; la source n'est pas nommée", "amount": 89460.4, "res": "25-03-108", "href": "https://www.ormstown.ca/wp-content/uploads/2025-03-13_PV-SE-1.pdf"}],
   "note": { "en": "SEAO's estimate equals the single bid to the cent. Paid in phase 1 (2025) and phase 2 (July 6, 2026 list).", "fr": "L'estimation du SEAO est égale au sou près à l'unique soumission. Payé en phase 1 (2025) et phase 2 (liste du 6 juillet 2026)." }
  },
  {
   "id": "botreaux-2025",
   "object": { "en": "Rebuilding rang des Botreaux", "fr": "Réfection du rang des Botreaux" },
   "contractor": "Ali Excavation Inc.",
   "payee": "ali-excavation-inc",
   "match": { "text": ["botreaux"] },
   "awarded": "2025",
   "amount": 1991584.97, "tax": "unstated",
   "estimate": 1924783,
   "mode": { "en": "Public tender, 5 bids", "fr": "Appel d'offres public, 5 soumissions" },
   "bidders": [["Eurovia Québec Construction Inc.", 1996435.63], ["Roxboro Excavation Inc.", 2075000], ["Les Pavages Céka Inc.", 2511301.82], ["Les Pavages Ultra Inc.", 2770689.44]],
   "seao": { "notice": "20094120/ORM2025-03", "year": 2025, "final": "blank" },
   "funds": [{"kind": "borrowing", "en": "Borrowing by-law 166-2025 ($2,025,416.63, approved by Québec July 14, 2025); $2,025,000 in bonds issued October 2026 (26-10-269)", "fr": "Règlement d'emprunt 166-2025 (2 025 416,63 $, approuvé par Québec le 14 juillet 2025); 2 025 000 $ d'obligations émises en octobre 2026 (26-10-269)", "res": "25-10-294", "href": "https://www.ormstown.ca/wp-content/uploads/2025-10-02-Extra.pdf"}],
   "note": { "en": "Progress payments on this project are financed by a credit line and approved by separate resolutions, outside the monthly payment lists, so the Ledger does not carry them.", "fr": "Les décomptes de ce projet sont financés par une marge de crédit et approuvés par des résolutions distinctes, hors des listes mensuelles : le grand livre ne les porte donc pas." },
   "links": [{ "kind": "method", "en": "Why credit-line progress payments are excluded", "fr": "Pourquoi les décomptes sur marge de crédit sont exclus", "href_en": "/finances/budget/#method", "href_fr": "/finances/budget/#method" }]
  },
  {
   "id": "auditors-2026",
   "object": { "en": "Independent auditors for fiscal years 2025, 2026 and 2027", "fr": "Auditeurs indépendants pour les exercices financiers 2025, 2026 et 2027" },
   "contractor": "BCGO s.e.n.c.r.l.",
   "payee": "bcgo-s-e-n-c-r-l",
   "match": { "text": ["audit annuel 202[5-7]", "exercice 202[5-7]"] },
   "awarded": "2026",
   "amount": 101055, "tax": "unstated",
   "estimate": 93000,
   "mode": { "en": "1 bidder listed", "fr": "1 soumissionnaire inscrit" },
   "bidders": [],
   "seao": { "notice": "20110700/ORM-2025-15", "year": 2026, "final": "blank" },
   "funds": [{"kind": "unstated", "en": "Not stated in the minutes", "fr": "Non précisé au procès-verbal"}],
   "note": { "en": "Three years of audits. The 2025 audit would be billed in 2026; no such line is on the lists itemized so far. BCGO's earlier audit lines (2024 audit, grant audits) are under its profile.", "fr": "Trois années d'audit. L'audit de 2025 serait facturé en 2026; aucune ligne de ce genre ne figure aux listes détaillées jusqu'ici. Les lignes d'audit antérieures de BCGO (audit 2024, audits de subventions) sont à son profil." }
  },
  {
   "id": "prince-albert-2026",
   "object": { "en": "Rebuilding rue Prince-Albert (with Cullen and Oliver)", "fr": "Réfection de la rue Prince-Albert (avec Cullen et Oliver)" },
   "contractor": "Groupe M. Potvin",
   "payee": "le-groupe-mpotvin",
   "match": { "all": true },
   "awarded": "2026-04-13",
   "amount": 3809413.55, "tax": "before",
   "estimate": 3786125,
   "mode": { "en": "Public tender, 4 bids", "fr": "Appel d'offres public, 4 soumissions" },
   "bidders": [["Gérald Théoret Inc.", 3898212.23], ["Excavation Gricon", 4259411.54], ["Ali Excavation Inc.", 4683436.08]],
   "seao": { "notice": "20128370/ORM2025-02.1", "year": 2026, "final": "blank" },
   "funds": [{"kind": "borrowing", "en": "Borrowing by-law 173-2026 ($4.8 million, 40 years); Québec approved it July 7, 2026", "fr": "Règlement d'emprunt 173-2026 (4,8 millions $, 40 ans); approuvé par Québec le 7 juillet 2026", "res": "26-08-218", "href": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf"}, {"kind": "unstated", "en": "The award also cites \"any applicable grant\"; none is named", "fr": "L'octroi mentionne aussi « toute subvention applicable »; aucune n'est nommée", "res": "26-04-115", "href": "https://www.ormstown.ca/wp-content/uploads/PV_2026-04-13_WEB.pdf"}],
   "note": { "en": "$4,379,873.23 taxes included, per the minutes. A first progress payment to this contractor ($428,409.30) is on the October 6, 2026 list; the line does not name the project, and this is the contractor's only contract on record.", "fr": "4 379 873,23 $ taxes incluses, selon le procès-verbal. Un premier décompte à ce fournisseur (428 409,30 $) figure à la liste du 6 octobre 2026; la ligne ne nomme pas le projet, et c'est le seul contrat de ce fournisseur au dossier." },
   "links": [{ "kind": "recap", "en": "Two borrowing by-laws, $11.2 million", "fr": "Deux règlements d'emprunt, 11,2 millions $", "href_en": "/en/council-watch/borrowing-172-173-2026/", "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/" }]
  },
  {
   "id": "route-138a-2026",
   "object": { "en": "Rebuilding Route 138A (with 3e Rang, montée du Rocher and rang Tullochgorum)", "fr": "Réfection de la route 138-A (avec le 3e Rang, la montée du Rocher et le rang Tullochgorum)" },
   "contractor": "Ali Excavation Inc.",
   "payee": "ali-excavation-inc",
   "match": { "text": ["138", "rocher", "tullochgorum"] },
   "awarded": "2026-06-15", "resolution": "26-06-182",
   "src": { "kind": "minutes", "en": "Minutes, June 15, 2026 (special sitting)", "fr": "PV du 15 juin 2026 (séance extraordinaire)", "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-15_WEB.pdf", "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-15_WEB.pdf" },
   "amount": 3597786.29, "tax": "before",
   "estimate": 4762004,
   "mode": { "en": "Public tender, 3 bids", "fr": "Appel d'offres public, 3 soumissions" },
   "bidders": [["Eurovia Québec Construction Inc.", 5733952.73], ["Roxboro Excavation Inc.", 7651663.40]],
   "seao": { "notice": "20146530/ORM2025-08", "year": 2026, "final": "blank" },
   "funds": [{"kind": "grant", "en": "Québec road grant (PAVL, file NGE77363), up to this amount: 70% when work starts, 30% after the final report", "fr": "Subvention routière du Québec (PAVL, dossier NGE77363), jusqu'à ce montant : 70 % au début des travaux, 30 % après la reddition de comptes", "amount": 3704749, "res": "26-06-182", "href": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-15_WEB.pdf"}, {"kind": "borrowing", "en": "The balance, under borrowing by-law 172-2026 ($6,370,221)", "fr": "Le solde, par le règlement d'emprunt 172-2026 (6 370 221 $)", "res": "26-06-182", "href": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-15_WEB.pdf"}],
   "note": { "en": "$4,136,554.78 taxes included, per the minutes; the lowest bid came in $1.16 million under the estimate.", "fr": "4 136 554,78 $ taxes incluses, selon le procès-verbal; la plus basse soumission est arrivée 1,16 million $ sous l'estimation." },
   "links": [{ "kind": "recap", "en": "Two borrowing by-laws, $11.2 million", "fr": "Deux règlements d'emprunt, 11,2 millions $", "href_en": "/en/council-watch/borrowing-172-173-2026/", "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/" }]
  },
  {
   "id": "3e-rang-2026",
   "object": { "en": "Rebuilding the 3e Rang and chemin de la Rivière-Châteauguay", "fr": "Réfection du 3e rang et du chemin Rivière-Châteauguay" },
   "contractor": "Agence Chenail",
   "payee": null,
   "awarded": "2026-08-03", "resolution": "26-08-225",
   "amount": 1568399.77, "tax": "before",
   "estimate": 1300000,
   "mode": { "en": "Public tender ORM2025-08.1, 4 bids opened August 3, 2026", "fr": "Appel d'offres public ORM2025-08.1, 4 soumissions ouvertes le 3 août 2026" },
   "bidders": [["Excavation MF", 1626014.27], ["Ali Excavation Inc.", 1727791.05], ["Groupe MPotvin", 1751191]],
   "seao": { "notice": "20160258/ORM2025-08.1", "year": 2026, "final": "blank" },
   "funds": [{"kind": "borrowing", "en": "Borrowing by-law 172-2026", "fr": "Règlement d'emprunt 172-2026", "res": "26-08-225", "href": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf"}, {"kind": "pending", "en": "Council asked Québec to add this work to the road grant (PAVL) using savings on the 138A contract, subject to approval", "fr": "Le conseil a demandé à Québec d'ajouter ces travaux à la subvention routière (PAVL) grâce aux économies du contrat de la 138A, sous réserve d'approbation", "res": "26-07-202", "href": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf"}],
   "note": { "en": "The minutes award the contract to Agence Chenail, the lowest conforming of four bids, $268,400 over the estimate. Ormstown's SEAO report named Eurovia Québec Construction as the winner of the same notice, at the same price, as of October 25, 2026; the two records disagree. On October 6, 2026 council moved the 3e Rang paving to 2027 because of the ministry's bridge replacement.", "fr": "Le procès-verbal octroie le contrat à Agence Chenail, plus basse de quatre soumissions conformes, 268 400 $ au-dessus de l'estimation. Le rapport SEAO d'Ormstown nommait Eurovia Québec Construction comme adjudicataire du même avis, au même prix, en date du 25 octobre 2026 : les deux documents divergent. Le 6 octobre 2026, le conseil a reporté le pavage du 3e Rang à 2027 en raison du remplacement du pont par le ministère." },
   "links": [{ "kind": "recap", "en": "August 3, 2026 sitting", "fr": "séance du 3 août 2026", "href_en": "/en/council-watch/august-3-2026/", "href_fr": "/fr/conseil-municipal/3-aout-2026/" }, { "kind": "recap", "en": "October 6, 2026: paving moved to 2027", "fr": "6 octobre 2026 : pavage reporté à 2027", "href_en": "/en/council-watch/october-6-2026/", "href_fr": "/fr/conseil-municipal/6-octobre-2026/" }]
  },
  {
   "id": "quality-control-2026",
   "object": { "en": "Annual materials quality control and soil characterization", "fr": "Contrôle qualitatif des matériaux et caractérisation des sols, contrat annuel" },
   "contractor": "Groupe ABS",
   "payee": null,
   "awarded": "2026-07-06",
   "amount": 93874.21, "tax": "included",
   "estimate": null,
   "mode": { "en": "Lowest of 5 bids, as read at the sitting", "fr": "Plus basse de 5 soumissions, telle que lue en séance" },
   "bidders": [["GIE", 99000], ["Laboratoires GS", 105392.70], ["Solmatech", 117167.16], ["Laboratoire Montérégie", 167295.18]],
   "seao": { "notice": null, "year": 2026, "final": "absent" },
   "funds": [{"kind": "unstated", "en": "Not stated in the minutes", "fr": "Non précisé au procès-verbal"}],
   "note": { "en": "Reported by the Observer from the sitting (the livestream failed). Not on Ormstown's SEAO report as of the checked date.", "fr": "Rapporté par l'Observer depuis la salle (la diffusion a échoué). Absent du rapport SEAO d'Ormstown à la date de vérification." },
   "src": { "kind": "recap", "href_en": "/en/council-watch/july-6-2026/", "href_fr": "/fr/conseil-municipal/6-juillet-2026/" }
  },
  {
   "id": "road-salt-2026",
   "object": { "en": "De-icing salt, three years at a fixed price", "fr": "Sel de déglaçage, trois ans à prix fixe" },
   "contractor": "Compass Minerals Canada",
   "payee": null,
   "awarded": "2026-07-06",
   "amount": 102907.50, "tax": "before",
   "estimate": null,
   "mode": { "en": "$137.21 a tonne, about 750 tonnes a year; a one-year bid from Sel Windsor at $109.94 was not retained", "fr": "137,21 $ la tonne, environ 750 tonnes par année; une soumission d'un an de Sel Windsor à 109,94 $ n'a pas été retenue" },
   "bidders": [["Sel Windsor (one year)", null]],
   "seao": { "notice": null, "year": 2026, "final": "absent" },
   "funds": [{"kind": "unstated", "en": "Not stated in the minutes", "fr": "Non précisé au procès-verbal"}],
   "note": { "en": "Yearly maximum as read at the sitting. Not on Ormstown's SEAO report as of the checked date. Salt bought earlier came from Mines Seleine.", "fr": "Maximum annuel tel que lu en séance. Absent du rapport SEAO d'Ormstown à la date de vérification. Le sel acheté auparavant venait de Mines Seleine." },
   "src": { "kind": "recap", "href_en": "/en/council-watch/july-6-2026/", "href_fr": "/fr/conseil-municipal/6-juillet-2026/" }
  },
  {
   "id": "water-ops-2026",
   "object": { "en": "Support for operating the water and wastewater installations, one year", "fr": "Soutien à la gestion des installations d'eau potable et d'eaux usées, un an" },
   "contractor": "Groupe Hélios (Aquatech division)",
   "payee": null,
   "awarded": "2026-07-06",
   "amount": 47736, "tax": "before",
   "estimate": null,
   "mode": { "en": "As read at the sitting", "fr": "Tel que lu en séance" },
   "bidders": [],
   "seao": { "notice": null, "year": 2026, "final": "absent" },
   "funds": [{"kind": "unstated", "en": "Not stated in the minutes", "fr": "Non précisé au procès-verbal"}],
   "note": { "en": "The mayor said it complements the Town's single water employee after a second hire could not be recruited. Not on Ormstown's SEAO report as of the checked date.", "fr": "Le maire a dit qu'il complète l'unique employé de l'eau de la Municipalité, après l'échec du recrutement d'un second. Absent du rapport SEAO d'Ormstown à la date de vérification." },
   "src": { "kind": "recap", "href_en": "/en/council-watch/july-6-2026/", "href_fr": "/fr/conseil-municipal/6-juillet-2026/" }
  },
  {
   "id": "traffic-study-2026",
   "object": {
    "en": "Traffic study of four intersections on routes 138 and 201, with the Québec transport ministry",
    "fr": "Étude de circulation de quatre intersections des routes 138 et 201, avec le ministère des Transports"
   },
   "contractor": "GBI",
   "payee": null,
   "awarded": "2026-10-06",
   "amount": 54772.17,
   "tax": "before",
   "estimate": null,
   "mode": {
    "en": "Lowest of 3 price requests",
    "fr": "Plus bas de 3 prix demandés"
   },
   "bidders": [
    [
     "Artelia",
     62500
    ],
    [
     "Équipe Laurence",
     113900
    ]
   ],
   "seao": {
    "notice": null,
    "year": 2026,
    "final": "absent"
   },
   "funds": [{"kind": "unstated", "en": "Done in coordination with Québec's transport ministry; the minutes state no cost share", "fr": "Réalisée en coordination avec le ministère des Transports; le procès-verbal n'indique aucun partage des coûts", "res": "26-10-274", "href": "https://www.ormstown.ca/wp-content/uploads/10.-PV_2026-10-06.pdf"}],
   "note": {
    "en": "Resolution 26-10-274. Not on Ormstown's SEAO report as of the checked date.",
    "fr": "Résolution 26-10-274. Absent du rapport SEAO d'Ormstown à la date de vérification."
   },
   "src": {
    "kind": "recap",
    "href_en": "/en/council-watch/october-6-2026/",
    "href_fr": "/fr/conseil-municipal/6-octobre-2026/"
   }
  }
 ]
};

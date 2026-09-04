// ============================================================
// Ormstown Municipal Spending — data extract
// Source of truth: Municipal Spending Ledger (Notion), built
// exclusively from official procès-verbaux at ormstown.ca.
// Regenerate after each PV. The page (index.html)
// reads window.OO_SPENDING only. Amounts in CAD.
// "entries": [sitting, payee, category, amount, line-count] —
// named payees ≥ ~1 000 $; smaller lines grouped per category as
// «Autres fournisseurs», so every month sums exactly to its
// category totals and (for full-coverage months) to the adopted total.
// Categories are Observer-assigned (see provenance + tools/apply-category-rules.js).
// Generated: 2026-08-06
// ============================================================
window.OO_SPENDING = {
 "generated": "2026-09-02",
 "provenance": {
  "source": "Notion — 💰 Municipal Spending Ledger (built exclusively from official procès-verbaux at ormstown.ca)",
  "official_fields": "months[].total, months[].session, months[].url, budget.*, entries amounts/line counts",
  "observer_fields": "categories, gloss (descriptions), entries grouping, months[].note_fr/note_en",
  "categories_method": "observer-rules-v4",
  "gloss_method": "observer-editorial-v1",
  "tolerances": {
   "2026-01": 0.12,
   "2025-07": 10048.36
  },
  "tolerance_note": "Reconciliation tolerance is 0.005 $ (penny-exact) except where documented; 2026-01 carries a 0.12 $ gap from two digits unreadable in the scanned annex (BCGO, ICS), and 2025-07 carries a 10 048,36 $ gap between the annexe's three printed subtotals and its printed grand total / the adopted resolution — see that sitting's note.",
  "categories_note": "v4 (2026-08-14): content-aware mapping (finances/tools/category-rules.js) applied per ledger line by rebuild-entries.js. v3 added Regional shares & memberships and Insurance; v4 adds Policing — Sûreté du Québec (the provincial policing bill, previously inside Regional shares) and Software & IT (software, subscriptions and IT services previously split between Professional services and Supplies & operations). Each line is assigned by its payee AND entry text, leaving Other for genuinely unclassifiable items such as resident damage reimbursements.",
  "months_direct": {
   "2026-06": "Extracted from PV_2026-06-01_WEB.pdf (Annexe A, 214 lines), reconciled to every printed subtotal; fully itemized in the Notion ledger on 2026-08-06 (214 lines = 857,483.73, query-verified)."
  }
 },
 "availability_fr": "<strong>Ce que la Municipalité a rendu public :</strong> les procès-verbaux sont publiés jusqu'à la séance du <strong>6 juillet 2026</strong>, et cette page détaille les listes de dépenses jusqu'à cette même séance. Le PV de la séance du 3 août paraîtra de 4 à 6 semaines après son adoption; sa liste s'ajoutera ici dès sa publication. Vers le passé, 2025 est maintenant détaillé jusqu'à la séance du 14 juillet 2025; les séances antérieures de 2025 s'ajouteront progressivement.",
 "availability_en": "<strong>What the Town has made public:</strong> minutes are published up to the <strong>July 6, 2026</strong> sitting, and this page itemizes the spending lists up to that same sitting. Minutes of the August 3 sitting will appear 4–6 weeks after adoption; its list will be added here as soon as it is published. Going back, 2025 is now itemized down to the July 14, 2025 sitting; earlier 2025 sittings will be added progressively.",
 "budget": {
  "year": 2026,
  "adopted": "2025-12-17",
  "url": "https://www.ormstown.ca/wp-content/uploads/FEUILLET_Budget_2026_VF.pdf",
  "url_pti": "https://www.ormstown.ca/wp-content/uploads/FEUILLET_PTI_2026_VF.pdf",
  "revenues_total": 8339162,
  "expenses_total": 8339162,
  "expenses_total_prev": 8187367,
  "functions": [
   {
    "fr": "Administration générale",
    "en": "General administration",
    "b": 1958819,
    "prev": 1733357
   },
   {
    "fr": "Sécurité publique",
    "en": "Public safety",
    "b": 1074864,
    "prev": 1075934
   },
   {
    "fr": "Réseau routier",
    "en": "Roads",
    "b": 2093548,
    "prev": 1777461
   },
   {
    "fr": "Transport collectif",
    "en": "Public transit",
    "b": 212180,
    "prev": 118933
   },
   {
    "fr": "Eau et égouts",
    "en": "Water & sewers",
    "b": 1704947,
    "prev": 1479771
   },
   {
    "fr": "Matières résiduelles",
    "en": "Waste management",
    "b": 483469,
    "prev": 556378
   },
   {
    "fr": "Cours d'eau",
    "en": "Waterways",
    "b": 18204,
    "prev": 20204
   },
   {
    "fr": "Santé et bien-être",
    "en": "Health & welfare",
    "b": 56752,
    "prev": 50616
   },
   {
    "fr": "Aménagement et urbanisme",
    "en": "Planning & zoning",
    "b": 348756,
    "prev": 433211
   },
   {
    "fr": "Loisirs et culture",
    "en": "Recreation & culture",
    "b": 913320,
    "prev": 1021271
   },
   {
    "fr": "Frais de financement",
    "en": "Financing costs",
    "b": 265077,
    "prev": 205102
   },
   {
    "fr": "Affectations",
    "en": "Appropriations",
    "b": -790774,
    "prev": -284871
   }
  ],
  "pti": [
   {
    "fr": "Usine d'eau potable",
    "en": "Drinking-water plant",
    "y2026": 180000,
    "total": 16348075,
    "fund": "9 % règl. emprunt · 91 % subvention (PRIMEAU V 1.2)"
   },
   {
    "fr": "Plan de débordement des eaux usées",
    "en": "Sewer-overflow plan",
    "y2026": null,
    "total": 525000,
    "fund": "5 % budget courant · 95 % subvention (TECQ 24-28)"
   },
   {
    "fr": "Réseau d'aqueduc et d'égouts",
    "en": "Water & sewer network",
    "y2026": 3617295,
    "total": 13026043,
    "fund": "66 % règl. emprunt · 34 % subvention (TECQ 24-28, PAVL)",
    "note_fr": "À noter : au feuillet, la somme des trois années imprimées (13 351 833 $) diffère du total imprimé (écart de 325 790 $).",
    "note_en": "Note: in the leaflet, the three printed years sum to 13,351,833 $, which differs from the printed total by 325,790 $."
   },
   {
    "fr": "Réseau routier et pavage",
    "en": "Roads & paving",
    "y2026": 5091875,
    "total": 13755536,
    "fund": "32 % règl. emprunt · 68 % subvention (PAVL)"
   },
   {
    "fr": "Parcs",
    "en": "Parks",
    "y2026": null,
    "total": 298380,
    "fund": "34 % budget courant · 66 % subvention (PAFIRSPA)"
   },
   {
    "fr": "Bâtiments et autres",
    "en": "Buildings & other",
    "y2026": 130000,
    "total": 8230000,
    "fund": "64 % règl. emprunt · 3 % budget · 33 % subvention (PRACIM)"
   }
  ]
 },
 "categories": {
  "Salaries & HR": {
   "fr": "Salaires et RH",
   "en": "Salaries & HR",
   "color": "#4e79a7"
  },
  "Contracts — works": {
   "fr": "Contrats et travaux",
   "en": "Contracts & works",
   "color": "#f28e2b"
  },
  "Supplies & operations": {
   "fr": "Fournitures et opérations",
   "en": "Supplies & operations",
   "color": "#76b7b2"
  },
  "Professional services": {
   "fr": "Services professionnels",
   "en": "Professional services",
   "color": "#59a14f"
  },
  "Legal — external counsel": {
   "fr": "Services juridiques",
   "en": "Legal services",
   "color": "#e15759"
  },
  "Subsidies & community": {
   "fr": "Subventions et communauté",
   "en": "Grants & community",
   "color": "#edc948"
  },
  "Financing & debt": {
   "fr": "Financement et dette",
   "en": "Financing & debt",
   "color": "#b07aa1"
  },
  "Other": {
   "fr": "Autres",
   "en": "Other",
   "color": "#bab0ac"
  },
  "__rest": {
   "fr": "Pas encore détaillé",
   "en": "Not yet itemized",
   "color": "#d9d9d9"
  },
  "Utilities": {
   "fr": "Services publics (électricité, télécom, propane)",
   "en": "Utilities (electricity, telecom, propane)",
   "color": "#8175aa"
  },
  "Vehicle fuel & maintenance": {
   "fr": "Carburant et entretien des véhicules",
   "en": "Vehicle fuel & maintenance",
   "color": "#9c755f"
  },
  "Waste & recycling": {
   "fr": "Collecte des ordures et du recyclage",
   "en": "Garbage & recycling collection",
   "color": "#d37295"
  },
  "Regional shares & memberships": {
   "fr": "Quotes-parts, adhésions et cotisations",
   "en": "Regional shares & memberships",
   "color": "#767f4f"
  },
  "Insurance": {
   "fr": "Assurances",
   "en": "Insurance",
   "color": "#b3823e"
  },
  "Policing — SQ": {
   "fr": "Police — Sûreté du Québec",
   "en": "Policing — Sûreté du Québec",
   "color": "#499894"
  },
  "Software & IT": {
   "fr": "Logiciels et informatique",
   "en": "Software & IT",
   "color": "#a0cbe8"
  }
 },
 "gloss": {
  "Construction Émery Paquette Inc.": {
   "fr": "rénovation de l'hôtel de ville (décompte #5)",
   "en": "town hall renovation (progress pmt #5)"
  },
  "— (paie municipale)": {
   "fr": "paie des employés municipaux",
   "en": "municipal staff payroll"
  },
  "Robert Daoust Et Fils Inc.": {
   "fr": "collecte des ordures et du recyclage",
   "en": "garbage & recycling collection"
  },
  "Ministre du Revenu": {
   "fr": "retenues salariales (Québec)",
   "en": "payroll remittances (Québec)"
  },
  "Receveur Général": {
   "fr": "retenues salariales (fédéral)",
   "en": "payroll remittances (federal)"
  },
  "Receveur général du Canada": {
   "fr": "retenues salariales (fédéral)",
   "en": "payroll remittances (federal)"
  },
  "Caisse Desjardins": {
   "fr": "REER collectif des employés",
   "en": "employee group RRSP"
  },
  "TD Canada Trust": {
   "fr": "REER collectif des employés",
   "en": "employee group RRSP"
  },
  "Technivolt Électrique Inc.": {
   "fr": "travaux électriques — postes de pompage",
   "en": "electrical work — pumping stations"
  },
  "Services de Rebuts Soulanges Inc.": {
   "fr": "nettoyage du dépôt à neige Wellington",
   "en": "Wellington snow-depot cleanup"
  },
  "Hydro-Québec": {
   "fr": "électricité",
   "en": "electricity"
  },
  "Artelia Canada Inc.": {
   "fr": "étude géotechnique — réfection des rues",
   "en": "geotechnical study — street rebuild"
  },
  "Pg Solutions": {
   "fr": "logiciels de gestion municipale",
   "en": "municipal management software"
  },
  "Orflow Géosciences Inc.": {
   "fr": "études sur l'eau potable (puits)",
   "en": "drinking-water studies (wells)"
  },
  "Plancher Design Expert Inc.": {
   "fr": "planchers du sous-sol de l'hôtel de ville",
   "en": "town hall basement floors"
  },
  "Mcclintock, les Entreprises": {
   "fr": "déneigement",
   "en": "snow removal"
  },
  "Mines Seleine": {
   "fr": "sel de déglaçage",
   "en": "road salt"
  },
  "Régie intermunicipale de la patinoire": {
   "fr": "quote-part — patinoire régionale",
   "en": "share — regional arena"
  },
  "Complexe Médical Ormstown inc": {
   "fr": "loyer de la bibliothèque",
   "en": "library rent"
  },
  "Excavation Usereau Inc.": {
   "fr": "travaux d'excavation",
   "en": "excavation works"
  },
  "Diamètre Expert Conseil Inc.": {
   "fr": "services-conseils en ingénierie",
   "en": "engineering consulting"
  },
  "Dunton Rainville S.E.N.C.R.L.": {
   "fr": "services juridiques (cabinet d'avocats)",
   "en": "legal services (law firm)"
  },
  "Cmlex Conseil Inc.": {
   "fr": "services juridiques",
   "en": "legal services"
  },
  "Godbout, Sylvie-Anne, Me": {
   "fr": "procureure — cour municipale",
   "en": "municipal court prosecutor"
  },
  "Rancourt Legault Joncas": {
   "fr": "règlement d'un dossier judiciaire (transaction et quittance)",
   "en": "court-file settlement (transaction & release)"
  },
  "9534-8702 Québec Inc. (Petro Canada)": {
   "fr": "essence — véhicules municipaux",
   "en": "fuel — municipal vehicles"
  },
  "C. S. Brunette Inc.": {
   "fr": "essence — véhicules municipaux",
   "en": "fuel — municipal vehicles"
  },
  "2547-0857 Québec Inc. (Infotech)": {
   "fr": "logiciels municipaux (Sygem)",
   "en": "municipal software (Sygem)"
  },
  "Gleaner, The": {
   "fr": "publication du bulletin municipal",
   "en": "municipal newsletter publication"
  },
  "Ouellett Samantha": {
   "fr": "entretien ménager des bâtiments",
   "en": "building cleaning"
  },
  "Ouellet Samantha": {
   "fr": "entretien ménager des bâtiments",
   "en": "building cleaning"
  },
  "FQM": {
   "fr": "formation des élus / services fédération",
   "en": "elected-officials training / federation services"
  },
  "Gestion MSDM Inc.": {
   "fr": "loyer — garage municipal",
   "en": "municipal garage rent"
  },
  "Pyritest Inc. - Multitest": {
   "fr": "tests de sols",
   "en": "soil testing"
  },
  "Solution Informatique de la Montérégie": {
   "fr": "services informatiques",
   "en": "IT services"
  },
  "Sécurité Rousse Inc.": {
   "fr": "travaux de sécurité",
   "en": "security works"
  },
  "Quadient Canada Ltée": {
   "fr": "équipement postal",
   "en": "mailing equipment"
  },
  "Agence Denis Lepine Inc.": {
   "fr": "services professionnels",
   "en": "professional services"
  },
  "Bohemen Jamie (Enr.)": {
   "fr": "construction — cabanon puits St-Paul",
   "en": "construction — St-Paul well shed"
  },
  "Visa Desjardins": {
   "fr": "achats par carte de crédit municipale",
   "en": "municipal credit-card purchases"
  },
  "Forage Wellpuits": {
   "fr": "forage exploratoire — recherche d'eau potable",
   "en": "exploratory drilling — drinking-water search"
  },
  "SAAQ Société ass. Automobile": {
   "fr": "immatriculations des véhicules municipaux",
   "en": "municipal vehicle registrations"
  },
  "Beneva Inc.": {
   "fr": "assurance collective des employés",
   "en": "employee group insurance"
  },
  "AEDIFICA": {
   "fr": "honoraires professionnels (architecture)",
   "en": "professional fees (architecture)"
  },
  "9483-3100 Québec Inc.": {
   "fr": "réparations — pompes et égouts",
   "en": "repairs — pumps & sewers"
  },
  "9141855 Canada Inc.": {
   "fr": "entretien des véhicules municipaux",
   "en": "municipal vehicle maintenance"
  },
  "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)": {
   "fr": "petites lignes regroupées — le détail complet est dans le PV",
   "en": "smaller lines grouped — full detail is in the minutes"
  },
  "CRSBP Montérégie Inc.": {
   "fr": "quote-part — réseau régional des bibliothèques (CRSBP)",
   "en": "share — regional library network (CRSBP)"
  },
  "Bauval Carrières Régionales": {
   "fr": "pierre et matériaux granulaires",
   "en": "stone & granular materials"
  },
  "M.R.C. Haut Saint Laurent": {
   "fr": "quote-part annuelle — MRC du Haut-Saint-Laurent",
   "en": "annual share — Haut-Saint-Laurent RCM"
  },
  "FQM Assurances Inc.": {
   "fr": "assurances municipales (FQM)",
   "en": "municipal insurance (FQM)"
  },
  "Compteurs d'Eau du Québec": {
   "fr": "compteurs d'eau (réso 26-04-112)",
   "en": "water meters (res. 26-04-112)"
  },
  "Groupe Charlebois Inc.": {
   "fr": "organisation des évènements municipaux 2026 (1er versement)",
   "en": "2026 municipal events organization (1st instalment)"
  },
  "Robmusic": {
   "fr": "spectacle — Fête nationale du Québec 2026",
   "en": "show — Fête nationale du Québec 2026"
  },
  "9437-7843 Québec Inc.": {
   "fr": "remboursement d'un dépôt de garantie — projet rue Isabelle",
   "en": "guarantee-deposit refund — rue Isabelle project"
  },
  "CAUCA": {
   "fr": "répartition des appels d'urgence — service incendie",
   "en": "emergency-call dispatch — fire service"
  },
  "S.N.G. Services Mécaniques Inc.": {
   "fr": "entretien des véhicules municipaux",
   "en": "municipal vehicle maintenance"
  },
  "Meubles Burotic Inc.": {
   "fr": "mobilier — hôtel de ville et salle du conseil",
   "en": "furniture — town hall and council room"
  },
  "Bétonel / Dulux": {
   "fr": "peinture de marquage — parcs et rues",
   "en": "line-marking paint — parks and streets"
  },
  "Cégep de Saint-Laurent": {
   "fr": "formation du personnel — travaux publics",
   "en": "staff training — public works"
  },
  "Ministre des Finances": {
   "fr": "facturation des services de la Sûreté du Québec",
   "en": "Sûreté du Québec policing bill"
  },
  "Installation Jeux-Tec Inc.": {
   "fr": "construction des jeux d'eau (phase 2)",
   "en": "splash pad construction (phase 2)"
  }
 },
 "months": [
  {
   "m": "2025-07",
   "label_fr": "Juillet 2025",
   "label_en": "July 2025",
   "total": 1818914.95,
   "coverage": "full",
   "session": "Séance ordinaire 2025-07-14 (rés. 25-07-220)",
   "url": "https://www.ormstown.ca/wp-content/uploads/2025-07-14_PV.pdf",
   "note_fr": "Écart documenté de 10 048,36 $. Les trois sous-totaux imprimés à l'Annexe A — paiements à effectuer 221 662,69 $, salaires à autoriser au 27 juin 2025 147 496,84 $ et paiements émis durant le mois 1 459 803,78 $ — totalisent 1 828 963,31 $, alors que le grand total de l'annexe et la résolution 25-07-220 indiquent 1 818 914,95 $. La différence correspond exactement à deux lignes inscrites à l'annexe, au Receveur général, libellées « DAS FÉD JUIN 2024 » (9 914,24 $ et 134,12 $), qui sont comprises dans le sous-total du bloc « paiements à effectuer ». Cette page retient le montant adopté comme total de la séance et présente séparément le montant détaillé. À noter aussi : le grand total imprimé à l'annexe se lit « 1 818 9614,95 $ » (chiffre en trop).",
   "note_en": "Documented 10,048.36 $ discrepancy. The three subtotals printed in Annexe A — payments to be made 221,662.69 $, salaries to be authorized as at June 27, 2025 147,496.84 $, and payments issued during the month 1,459,803.78 $ — add up to 1,828,963.31 $, while the annexe's grand total and resolution 25-07-220 both give 1,818,914.95 $. The difference is exactly two lines listed in the annexe, payable to the Receveur général and labelled « DAS FÉD JUIN 2024 » (9,914.24 $ and 134.12 $), which are included in the « payments to be made » subtotal. This page uses the adopted amount as the sitting total and shows the itemized amount separately. Note also that the annexe's printed grand total reads « 1 818 9614,95 $ » (a stray digit).",
   "cats": {
    "Contracts — works": [
     1031323.65,
     25
    ],
    "Policing — SQ": [
     335458,
     1
    ],
    "Salaries & HR": [
     264739.68,
     16
    ],
    "Waste & recycling": [
     63502.81,
     2
    ],
    "Supplies & operations": [
     46298.66,
     96
    ],
    "Professional services": [
     42341.59,
     22
    ],
    "Utilities": [
     21629.78,
     6
    ],
    "Vehicle fuel & maintenance": [
     10161.91,
     42
    ],
    "Legal — external counsel": [
     9225.55,
     9
    ],
    "Software & IT": [
     4064.58,
     7
    ],
    "Regional shares & memberships": [
     117.1,
     1
    ],
    "Subsidies & community": [
     100,
     1
    ]
   }
  },
  {
   "m": "2025-08",
   "label_fr": "Août 2025",
   "label_en": "August 2025",
   "total": 257917.49,
   "coverage": "full",
   "session": "Séance ordinaire 2025-08-04 (rés. 25-08-232)",
   "url": "https://www.ormstown.ca/wp-content/uploads/2025-08-04_PV.pdf",
   "note_fr": "L'Annexe A du 4 août 2025 n'imprime aucun grand total : elle affiche deux sous-totaux, « Paiements à effectuer » 162 662,52 $ et « Salaire à autoriser » 95 254,97 $. La résolution 25-08-232 n'approuve formellement que les 162 662,52 $. Cette page retient la somme des deux sous-totaux imprimés, soit 257 917,49 $, pour rester comparable aux autres séances. Le paiement de 730 176,42 $ à Ali Excavation, autorisé le même soir par la résolution 25-08-234, figure déjà à la liste du 14 juillet 2025 et n'est donc pas compté ici.",
   "note_en": "The August 4, 2025 Annexe A prints no grand total: it shows two subtotals, « Paiements à effectuer » (payments to be made) 162,662.52 $ and « Salaire à autoriser » (salary to be authorized) 95,254.97 $. Resolution 25-08-232 formally approves only the 162,662.52 $. This page uses the sum of the two printed subtotals, 257,917.49 $, so the sitting stays comparable with the others. The 730,176.42 $ payment to Ali Excavation, authorized the same evening by resolution 25-08-234, already appears on the July 14, 2025 list and is therefore not counted here.",
   "cats": {
    "Salaries & HR": [
     95254.97,
     1
    ],
    "Waste & recycling": [
     55004.23,
     2
    ],
    "Professional services": [
     44244.3,
     15
    ],
    "Contracts — works": [
     42388.66,
     7
    ],
    "Supplies & operations": [
     13893.79,
     71
    ],
    "Software & IT": [
     3571.13,
     3
    ],
    "Vehicle fuel & maintenance": [
     3022.78,
     27
    ],
    "Legal — external counsel": [
     537.63,
     2
    ]
   }
  },
  {
   "m": "2025-09",
   "label_fr": "Septembre 2025",
   "label_en": "September 2025",
   "total": 728651.61,
   "coverage": "full",
   "session": "Séance ordinaire 2025-09-08 (rés. 25-09-252)",
   "url": "https://www.ormstown.ca/wp-content/uploads/2025-09-08.pdf",
   "note_fr": "La résolution 25-09-252 cite 441 915,58 $, soit uniquement le bloc « paiements à effectuer » de l'Annexe A; le grand total des trois blocs (paiements à effectuer 441 915,58 $ + salaires à autoriser au 20 août 2025 90 171,00 $ + paiements émis durant le mois 196 565,03 $) est de 728 651,61 $. Cette page utilise le grand total de l'annexe.",
   "note_en": "Resolution 25-09-252 quotes 441,915.58 $, which is only the « payments to be made » block of Annexe A; the grand total of the three blocks (payments to be made 441,915.58 $ + salaries to be authorized as at August 20, 2025 90,171.00 $ + payments issued during the month 196,565.03 $) is 728,651.61 $. This page uses the annexe grand total.",
   "cats": {
    "Professional services": [
     193105.1,
     22
    ],
    "Salaries & HR": [
     192056.62,
     19
    ],
    "Regional shares & memberships": [
     148663.5,
     1
    ],
    "Supplies & operations": [
     63727.02,
     100
    ],
    "Waste & recycling": [
     53228.33,
     2
    ],
    "Contracts — works": [
     41994.02,
     13
    ],
    "Utilities": [
     19000.35,
     5
    ],
    "Legal — external counsel": [
     7189.38,
     7
    ],
    "Software & IT": [
     4819.07,
     7
    ],
    "Vehicle fuel & maintenance": [
     4795.1,
     41
    ],
    "Other": [
     73.12,
     1
    ]
   }
  },
  {
   "m": "2025-10",
   "label_fr": "Octobre 2025",
   "label_en": "October 2025",
   "total": 643398.09,
   "coverage": "full",
   "session": "Séance extraordinaire 2025-10-02 (rés. 25-10-283)",
   "url": "https://www.ormstown.ca/wp-content/uploads/2025-10-02-Extra.pdf",
   "cats": {
    "Professional services": [
     185551.61,
     19
    ],
    "Salaries & HR": [
     151035.09,
     16
    ],
    "Contracts — works": [
     146146.32,
     7
    ],
    "Waste & recycling": [
     61756.13,
     2
    ],
    "Supplies & operations": [
     43675.2,
     61
    ],
    "Software & IT": [
     19775.47,
     7
    ],
    "Vehicle fuel & maintenance": [
     13028.17,
     28
    ],
    "Utilities": [
     10226.84,
     4
    ],
    "Legal — external counsel": [
     8304.07,
     3
    ],
    "Insurance": [
     2824.19,
     1
    ],
    "Other": [
     1000,
     1
    ],
    "Subsidies & community": [
     75,
     1
    ]
   },
   "note_fr": "La résolution 25-10-283 cite 329 508,05 $, soit uniquement le bloc « paiements à effectuer » de l'Annexe A; le grand total des trois blocs (paiements à effectuer + salaires + paiements émis durant le mois) est de 643 398,09 $. Cette page utilise le grand total de l'annexe.",
   "note_en": "Resolution 25-10-283 quotes 329,508.05 $, which is only the « payments to be made » block of Annexe A; the grand total of the three blocks (payments to be made + salaries + payments issued during the month) is 643,398.09 $. This page uses the annexe grand total."
  },
  {
   "m": "2025-11",
   "label_fr": "Novembre 2025",
   "label_en": "November 2025",
   "total": 1313054.64,
   "coverage": "full",
   "session": "Séance ordinaire 2025-11-17 (rés. 25-11-304)",
   "url": "https://www.ormstown.ca/wp-content/uploads/2025-11-17.pdf",
   "note_fr": "La résolution 25-11-304 cite 663 540,00 $, soit un seul bloc de l'Annexe A; le grand total des trois blocs est de 1 313 054,64 $. Cette page utilise le grand total de l'annexe.",
   "note_en": "Resolution 25-11-304 quotes 663,540.00 $, a single block of Annexe A; the grand total of the three blocks is 1,313,054.64 $. This page uses the annexe grand total.",
   "cats": {
    "Salaries & HR": [
     365056.14,
     33
    ],
    "Policing — SQ": [
     335457,
     1
    ],
    "Regional shares & memberships": [
     158663.5,
     2
    ],
    "Contracts — works": [
     139876.53,
     21
    ],
    "Professional services": [
     88726.15,
     28
    ],
    "Supplies & operations": [
     86217.76,
     126
    ],
    "Waste & recycling": [
     37904.1,
     1
    ],
    "Legal — external counsel": [
     37888.32,
     8
    ],
    "Utilities": [
     26348.79,
     7
    ],
    "Software & IT": [
     21458.34,
     15
    ],
    "Vehicle fuel & maintenance": [
     12286.38,
     45
    ],
    "Subsidies & community": [
     1969.85,
     2
    ],
    "Other": [
     1201.78,
     1
    ]
   }
  },
  {
   "m": "2025-12",
   "label_fr": "Décembre 2025",
   "label_en": "December 2025",
   "total": 395888.21,
   "coverage": "full",
   "session": "Séance ordinaire 2025-12-01 (rés. 25-12-325)",
   "url": "https://www.ormstown.ca/wp-content/uploads/PV-2025-12-01-Signe.pdf",
   "cats": {
    "Salaries & HR": [
     133836.79,
     14
    ],
    "Waste & recycling": [
     59590.37,
     2
    ],
    "Legal — external counsel": [
     46450.63,
     7
    ],
    "Supplies & operations": [
     44791.62,
     66
    ],
    "Regional shares & memberships": [
     43617.02,
     1
    ],
    "Contracts — works": [
     30946.35,
     16
    ],
    "Professional services": [
     21975.49,
     17
    ],
    "Software & IT": [
     6956.57,
     5
    ],
    "Utilities": [
     4016.16,
     4
    ],
    "Vehicle fuel & maintenance": [
     3707.21,
     33
    ]
   }
  },
  {
   "m": "2026-01",
   "label_fr": "Janvier 2026",
   "label_en": "January 2026",
   "total": 1037395.73,
   "coverage": "full",
   "session": "Séance ordinaire 2026-01-19 (rés. 26-01-006)",
   "url": "https://www.ormstown.ca/wp-content/uploads/2026-01-19-Signe.pdf",
   "note_fr": "Écart de 0,12 $ documenté : deux montants dont le dernier chiffre est illisible au scan (BCGO, ICS). Un décompte de 386 621,55 $ (Rang des Botreaux, marge de crédit) est approuvé séparément et exclu de ce total.",
   "note_en": "A documented 0.12 $ gap: two amounts whose last digit is unreadable in the scan (BCGO, ICS). A separate 386,621.55 $ progress payment (Rang des Botreaux, credit line) is approved separately and excluded from this total.",
   "cats": {
    "Contracts — works": [
     352728.24,
     17
    ],
    "Salaries & HR": [
     316212.98,
     24
    ],
    "Waste & recycling": [
     109283.02,
     5
    ],
    "Professional services": [
     77965.72,
     33
    ],
    "Supplies & operations": [
     72504.96,
     113
    ],
    "Software & IT": [
     39930.09,
     22
    ],
    "Utilities": [
     28138.78,
     13
    ],
    "Legal — external counsel": [
     21642.12,
     10
    ],
    "Vehicle fuel & maintenance": [
     17439.7,
     77
    ],
    "Subsidies & community": [
     1550,
     2
    ]
   }
  },
  {
   "m": "2026-02",
   "label_fr": "Février 2026",
   "label_en": "February 2026",
   "total": 331550.55,
   "coverage": "full",
   "session": "Séance ordinaire 2026-02-02",
   "url": "https://www.ormstown.ca/wp-content/uploads/2026-02-02.pdf",
   "cats": {
    "Salaries & HR": [
     217108.32,
     43
    ],
    "Waste & recycling": [
     48220.1,
     2
    ],
    "Utilities": [
     18696.65,
     5
    ],
    "Supplies & operations": [
     13750.14,
     15
    ],
    "Legal — external counsel": [
     13380.26,
     3
    ],
    "Professional services": [
     10898.2,
     5
    ],
    "Vehicle fuel & maintenance": [
     4321.84,
     33
    ],
    "Contracts — works": [
     3136.94,
     2
    ],
    "Regional shares & memberships": [
     1175.04,
     2
    ],
    "Software & IT": [
     863.06,
     1
    ]
   },
   "note_fr": "Un décompte Solmatech de 7 599,85 $ (marge de crédit, Rang des Botreaux) est approuvé séparément et exclu de ce total. Une facture Infotech de 5 170,73 $, inscrite aussi à la liste de mars, n'est comptée qu'en mars, où le total réconcilie au sou près.",
   "note_en": "A 7,599.85 $ Solmatech progress payment (credit line, Rang des Botreaux) is approved separately and excluded from this total. An Infotech invoice of 5,170.73 $ also appears on the March list and is counted only in March, where the total reconciles to the penny."
  },
  {
   "m": "2026-03",
   "label_fr": "Mars 2026",
   "label_en": "March 2026",
   "total": 531570.43,
   "coverage": "full",
   "session": "Séance ordinaire 2026-03-02 (rés. 26-03-048)",
   "url": "https://www.ormstown.ca/wp-content/uploads/PV-2026-03-02-pour-site-web.pdf",
   "cats": {
    "Salaries & HR": [
     180404.3,
     11
    ],
    "Supplies & operations": [
     134575.86,
     116
    ],
    "Regional shares & memberships": [
     70817.38,
     3
    ],
    "Contracts — works": [
     67745.82,
     17
    ],
    "Vehicle fuel & maintenance": [
     21319.8,
     103
    ],
    "Utilities": [
     18983.16,
     14
    ],
    "Professional services": [
     17976.91,
     6
    ],
    "Software & IT": [
     17681.33,
     10
    ],
    "Legal — external counsel": [
     2065.87,
     3
    ]
   },
   "note_fr": "Un décompte de 568 200,33 $ financé par la marge de crédit (réfection du Rang des Botreaux) est approuvé séparément et exclu de ce total.",
   "note_en": "A 568,200.33 $ progress payment financed by the credit line (Rang des Botreaux rebuild) is approved separately and excluded from this total."
  },
  {
   "m": "2026-04",
   "label_fr": "Avril 2026",
   "label_en": "April 2026",
   "total": 561662.02,
   "coverage": "full",
   "session": "Séance ordinaire 2026-04-13 (rés. 26-04-084)",
   "url": "https://www.ormstown.ca/wp-content/uploads/PV_2026-04-13_WEB.pdf",
   "note_fr": "Trois décomptes financés par la marge de crédit du projet Rang des Botreaux (58 748,41 $) sont approuvés séparément et exclus de ce total.",
   "note_en": "Three progress payments financed by the Rang des Botreaux credit line (58,748.41 $) are approved separately and excluded from this total.",
   "cats": {
    "Salaries & HR": [
     161209.19,
     6
    ],
    "Professional services": [
     87161.96,
     22
    ],
    "Contracts — works": [
     80681.84,
     12
    ],
    "Vehicle fuel & maintenance": [
     42496.4,
     65
    ],
    "Supplies & operations": [
     38318.66,
     74
    ],
    "Legal — external counsel": [
     32422.11,
     10
    ],
    "Waste & recycling": [
     31833.44,
     1
    ],
    "Software & IT": [
     31283.73,
     19
    ],
    "Utilities": [
     30777.13,
     10
    ],
    "Insurance": [
     20913.51,
     2
    ],
    "Regional shares & memberships": [
     3650,
     2
    ],
    "Other": [
     914.05,
     1
    ]
   }
  },
  {
   "m": "2026-05",
   "label_fr": "Mai 2026",
   "label_en": "May 2026",
   "total": 378826.66,
   "coverage": "full",
   "session": "Séance ordinaire 2026-05-04 (rés. 26-05-134)",
   "url": "https://www.ormstown.ca/wp-content/uploads/PV_2026-05-04_WEB.pdf",
   "cats": {
    "Salaries & HR": [
     152311.18,
     1
    ],
    "Contracts — works": [
     49792.84,
     12
    ],
    "Professional services": [
     36471,
     17
    ],
    "Supplies & operations": [
     31642.65,
     57
    ],
    "Waste & recycling": [
     30954.47,
     1
    ],
    "Software & IT": [
     28877.09,
     13
    ],
    "Utilities": [
     20445.93,
     12
    ],
    "Legal — external counsel": [
     18508.14,
     13
    ],
    "Regional shares & memberships": [
     6178.73,
     2
    ],
    "Vehicle fuel & maintenance": [
     3644.63,
     9
    ]
   }
  },
  {
   "m": "2026-06",
   "label_fr": "Juin 2026",
   "label_en": "June 2026",
   "total": 857483.73,
   "coverage": "full",
   "session": "Séance ordinaire 2026-06-01, rés. 26-06-150",
   "url": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf",
   "note_fr": "À noter : la résolution 26-06-150 mentionne « des montants totalisant 387 570,97 $ », soit le sous-total d'un seul des blocs de l'annexe A. Le GRAND TOTAL de l'annexe jointe au procès-verbal est de 857 483,73 $ (paiements à effectuer 229 343,09 $, salaires 188 397,20 $, paiements effectués 387 570,97 $ et remboursement d'un dépôt de garantie 52 172,47 $); c'est ce total, conforme à la méthode des autres mois, qui est présenté ici.",
   "note_en": "Note: resolution 26-06-150 reads “amounts totalling $387,570.97”, which corresponds to the subtotal of only one block of Annex A. The GRAND TOTAL of the annex attached to the minutes is $857,483.73 (payments to be made $229,343.09, salaries $188,397.20, payments made $387,570.97 and a guarantee-deposit refund $52,172.47); that total, consistent with the other months' method, is what is shown here.",
   "cats": {
    "Salaries & HR": [
     198418.03,
     10
    ],
    "Regional shares & memberships": [
     183336.75,
     1
    ],
    "Supplies & operations": [
     102134.38,
     69
    ],
    "Insurance": [
     99620.55,
     2
    ],
    "Professional services": [
     79946.14,
     19
    ],
    "Contracts — works": [
     68471.5,
     13
    ],
    "Waste & recycling": [
     45489.22,
     1
    ],
    "Software & IT": [
     29025.06,
     11
    ],
    "Utilities": [
     24220.25,
     29
    ],
    "Vehicle fuel & maintenance": [
     12676.69,
     44
    ],
    "Subsidies & community": [
     10803.69,
     11
    ],
    "Legal — external counsel": [
     2191.72,
     3
    ],
    "Other": [
     1149.75,
     1
    ]
   }
  },
  {
   "m": "2026-07",
   "label_fr": "Juillet 2026",
   "label_en": "July 2026",
   "total": 1206322.39,
   "coverage": "full",
   "session": "Séance ordinaire 2026-07-06, rés. 26-07-187",
   "url": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf",
   "note_fr": "À noter : la résolution 26-07-187 mentionne « des montants totalisant 601 832,15 $ », soit le sous-total d'un seul des blocs de l'annexe A — la même particularité qu'en juin. Le GRAND TOTAL de l'annexe jointe au procès-verbal est de 1 206 322,39 $ (paiements à effectuer 370 830,22 $, salaires 233 660,02 $ et paiements effectués 601 832,15 $); c'est ce total, conforme à la méthode des autres mois, qui est présenté ici.",
   "note_en": "Note: resolution 26-07-187 reads “amounts totalling $601,832.15”, which corresponds to the subtotal of only one block of Annex A — the same quirk as in June. The GRAND TOTAL of the annex attached to the minutes is $1,206,322.39 (payments to be made $370,830.22, salaries $233,660.02 and payments made $601,832.15); that total, consistent with the other months’ method, is what is shown here.",
   "cats": {
    "Policing — SQ": [
     356381,
     1
    ],
    "Salaries & HR": [
     233872.71,
     2
    ],
    "Contracts — works": [
     209551.34,
     11
    ],
    "Regional shares & memberships": [
     184020.85,
     3
    ],
    "Professional services": [
     72776.62,
     22
    ],
    "Supplies & operations": [
     52689.44,
     118
    ],
    "Waste & recycling": [
     44125.65,
     1
    ],
    "Utilities": [
     18798.34,
     20
    ],
    "Legal — external counsel": [
     16982.72,
     7
    ],
    "Vehicle fuel & maintenance": [
     8926.1,
     46
    ],
    "Software & IT": [
     8197.62,
     17
    ]
   }
  }
 ],
 "entries": [
  [
   "2025-07",
   "Ali Excavation Inc.",
   "Contracts — works",
   730176.42,
   1
  ],
  [
   "2025-07",
   "Ministre des Finances",
   "Policing — SQ",
   335458,
   1
  ],
  [
   "2025-07",
   "Construction Émery Paquette Inc.",
   "Contracts — works",
   170359.11,
   2
  ],
  [
   "2025-07",
   "— (paie municipale)",
   "Salaries & HR",
   147496.84,
   1
  ],
  [
   "2025-07",
   "Ministre du Revenu",
   "Salaries & HR",
   71427.6,
   3
  ],
  [
   "2025-07",
   "Installation Jeux-Tec Inc.",
   "Contracts — works",
   68042.77,
   2
  ],
  [
   "2025-07",
   "Robert Daoust Et Fils Inc.",
   "Waste & recycling",
   63502.81,
   2
  ],
  [
   "2025-07",
   "Receveur Général",
   "Salaries & HR",
   29059.67,
   4
  ],
  [
   "2025-07",
   "Plantes et décor Latour",
   "Contracts — works",
   21925.73,
   1
  ],
  [
   "2025-07",
   "Hydro-Québec",
   "Utilities",
   21352.17,
   3
  ],
  [
   "2025-07",
   "Caisse Desjardins",
   "Salaries & HR",
   12767.12,
   2
  ],
  [
   "2025-07",
   "Complexe Médical Ormstown",
   "Supplies & operations",
   9772.61,
   1
  ],
  [
   "2025-07",
   "Technivolt Électrique Inc.",
   "Contracts — works",
   9011.74,
   5
  ],
  [
   "2025-07",
   "Orflow Géosciences Inc.",
   "Professional services",
   8450.67,
   3
  ],
  [
   "2025-07",
   "Groupe SGM Inc.",
   "Contracts — works",
   8190.82,
   3
  ],
  [
   "2025-07",
   "Services de Rebuts Soulanges Inc.",
   "Contracts — works",
   7388.3,
   2
  ],
  [
   "2025-07",
   "Tenco Inc.",
   "Vehicle fuel & maintenance",
   5974.45,
   2
  ],
  [
   "2025-07",
   "Gleaner, The",
   "Professional services",
   5843.04,
   2
  ],
  [
   "2025-07",
   "Pelouse Alex Gaulin",
   "Contracts — works",
   5499.99,
   1
  ],
  [
   "2025-07",
   "DHC Avocats",
   "Legal — external counsel",
   5237.06,
   5
  ],
  [
   "2025-07",
   "Bionest Inc.",
   "Contracts — works",
   4926.14,
   2
  ],
  [
   "2025-07",
   "Productions Andréanne Martin",
   "Professional services",
   4886.44,
   1
  ],
  [
   "2025-07",
   "Réal Huot Inc.",
   "Supplies & operations",
   4802.08,
   1
  ],
  [
   "2025-07",
   "Netccl.com inc.",
   "Professional services",
   4768.02,
   1
  ],
  [
   "2025-07",
   "Géant du Conteneur (Le)",
   "Supplies & operations",
   4139.1,
   1
  ],
  [
   "2025-07",
   "Dunton Rainville S.E.N.C.R.L.",
   "Legal — external counsel",
   3988.49,
   4
  ],
  [
   "2025-07",
   "Gestion MSDM Inc.",
   "Supplies & operations",
   3423.26,
   1
  ],
  [
   "2025-07",
   "Ouellet Samantha",
   "Professional services",
   3403.26,
   2
  ],
  [
   "2025-07",
   "Environor Canada Inc.",
   "Supplies & operations",
   3350.6,
   1
  ],
  [
   "2025-07",
   "Robmusic",
   "Professional services",
   3177.62,
   1
  ],
  [
   "2025-07",
   "Boyle Réfrigération Climatisation Inc",
   "Contracts — works",
   2938.76,
   2
  ],
  [
   "2025-07",
   "Dagenais, J. Architecte & Ass. Inc.",
   "Professional services",
   2874.38,
   1
  ],
  [
   "2025-07",
   "Tech-Mix, Division BauVal Inc.",
   "Supplies & operations",
   2670.68,
   1
  ],
  [
   "2025-07",
   "Jardins Gemelas Inc. (Les)",
   "Supplies & operations",
   2534.33,
   1
  ],
  [
   "2025-07",
   "CCESI - Centre conseil en sécurité incendie",
   "Professional services",
   2500,
   1
  ],
  [
   "2025-07",
   "Quincaillerie R. Gauthier Inc.",
   "Supplies & operations",
   2038.28,
   17
  ],
  [
   "2025-07",
   "TD Canada Trust",
   "Salaries & HR",
   2019.25,
   2
  ],
  [
   "2025-07",
   "Gauthier, René (Essence)",
   "Vehicle fuel & maintenance",
   1897.85,
   19
  ],
  [
   "2025-07",
   "9339-0953 Qc Inc",
   "Supplies & operations",
   1626.9,
   1
  ],
  [
   "2025-07",
   "Visa Desjardins",
   "Supplies & operations",
   1464.96,
   2
  ],
  [
   "2025-07",
   "Lamb J. & Son",
   "Contracts — works",
   1379.7,
   1
  ],
  [
   "2025-07",
   "Thibault, Jacques (Pierreville)",
   "Professional services",
   1379.7,
   1
  ],
  [
   "2025-07",
   "Eurofins Environex",
   "Professional services",
   1319.35,
   3
  ],
  [
   "2025-07",
   "Productions Marie Chevrier Inc",
   "Professional services",
   1235.98,
   1
  ],
  [
   "2025-07",
   "Discair Productions",
   "Professional services",
   1092.26,
   1
  ],
  [
   "2025-07",
   "Divers - Employé",
   "Salaries & HR",
   1071.45,
   2
  ],
  [
   "2025-07",
   "Jalec Inc.",
   "Software & IT",
   1056.45,
   2
  ],
  [
   "2025-07",
   "D'Amour & Fils Inc. (R.S)",
   "Supplies & operations",
   1048.52,
   21
  ],
  [
   "2025-07",
   "TBL Telecom",
   "Software & IT",
   1014.08,
   1
  ],
  [
   "2025-07",
   "Carrière Ali Inc.",
   "Supplies & operations",
   1010.09,
   1
  ],
  [
   "2025-07",
   "Groupe Kopers Inc.",
   "Software & IT",
   1006.03,
   1
  ],
  [
   "2025-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   2289.61,
   21
  ],
  [
   "2025-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   1410.87,
   4
  ],
  [
   "2025-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   8417.25,
   47
  ],
  [
   "2025-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   988.02,
   3
  ],
  [
   "2025-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Contracts — works",
   1484.17,
   3
  ],
  [
   "2025-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Subsidies & community",
   100,
   1
  ],
  [
   "2025-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Salaries & HR",
   897.75,
   2
  ],
  [
   "2025-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Regional shares & memberships",
   117.1,
   1
  ],
  [
   "2025-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   277.61,
   3
  ],
  [
   "2025-08",
   "— (paie municipale)",
   "Salaries & HR",
   95254.97,
   1
  ],
  [
   "2025-08",
   "Robert Daoust Et Fils Inc.",
   "Waste & recycling",
   55004.23,
   2
  ],
  [
   "2025-08",
   "Les Industries Simexco Inc.",
   "Contracts — works",
   29047.48,
   1
  ],
  [
   "2025-08",
   "Artelia Canada Inc.",
   "Professional services",
   23911.93,
   1
  ],
  [
   "2025-08",
   "J.R. Mécanique Ltée",
   "Contracts — works",
   8305.64,
   1
  ],
  [
   "2025-08",
   "Orflow Géosciences Inc.",
   "Professional services",
   4351.8,
   1
  ],
  [
   "2025-08",
   "Eurofins Environex",
   "Professional services",
   3420.52,
   4
  ],
  [
   "2025-08",
   "Service Informatique D.L. Inc",
   "Software & IT",
   3227.35,
   2
  ],
  [
   "2025-08",
   "Technivolt Électrique Inc.",
   "Contracts — works",
   3210.71,
   4
  ],
  [
   "2025-08",
   "Groupe Domisa Inc.",
   "Professional services",
   2807.69,
   1
  ],
  [
   "2025-08",
   "Loisir et Sport Montérégie",
   "Professional services",
   2586.94,
   1
  ],
  [
   "2025-08",
   "Gleaner, The",
   "Professional services",
   2414.48,
   1
  ],
  [
   "2025-08",
   "Écho-Tech H2O Inc.",
   "Professional services",
   2144.28,
   1
  ],
  [
   "2025-08",
   "Bionest Inc.",
   "Contracts — works",
   1824.83,
   1
  ],
  [
   "2025-08",
   "Quincaillerie R. Gauthier Inc.",
   "Supplies & operations",
   1782.17,
   18
  ],
  [
   "2025-08",
   "Équip. Laplante & Lévesque Ltée",
   "Supplies & operations",
   1437.19,
   1
  ],
  [
   "2025-08",
   "Gauthier, René (Essence)",
   "Vehicle fuel & maintenance",
   1361.02,
   12
  ],
  [
   "2025-08",
   "D'Amour & Fils Inc. (R.S)",
   "Supplies & operations",
   1348.15,
   13
  ],
  [
   "2025-08",
   "AESL Instrumentation Inc.",
   "Supplies & operations",
   1102.61,
   1
  ],
  [
   "2025-08",
   "Discair Productions",
   "Professional services",
   1092.26,
   1
  ],
  [
   "2025-08",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   1661.76,
   15
  ],
  [
   "2025-08",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   1514.4,
   4
  ],
  [
   "2025-08",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   8223.67,
   38
  ],
  [
   "2025-08",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Legal — external counsel",
   537.63,
   2
  ],
  [
   "2025-08",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   343.78,
   1
  ],
  [
   "2025-09",
   "M.R.C. Haut Saint Laurent",
   "Regional shares & memberships",
   148663.5,
   1
  ],
  [
   "2025-09",
   "Artelia Canada Inc.",
   "Professional services",
   137064.56,
   2
  ],
  [
   "2025-09",
   "— (paie municipale)",
   "Salaries & HR",
   90171,
   1
  ],
  [
   "2025-09",
   "Ministre du Revenu",
   "Salaries & HR",
   59429.95,
   4
  ],
  [
   "2025-09",
   "Robert Daoust Et Fils Inc.",
   "Waste & recycling",
   53228.33,
   2
  ],
  [
   "2025-09",
   "Les Industries Simexco Inc.",
   "Contracts — works",
   20000,
   1
  ],
  [
   "2025-09",
   "Hydro-Québec",
   "Utilities",
   18922.25,
   3
  ],
  [
   "2025-09",
   "Receveur Général",
   "Salaries & HR",
   16596.86,
   2
  ],
  [
   "2025-09",
   "Caisse Desjardins",
   "Salaries & HR",
   15900.3,
   6
  ],
  [
   "2025-09",
   "Groupe Domisa Inc.",
   "Professional services",
   15057.71,
   1
  ],
  [
   "2025-09",
   "Isabelle Bouchard, M.Sc.A.",
   "Professional services",
   12901.86,
   1
  ],
  [
   "2025-09",
   "Pelouse Alex Gaulin",
   "Contracts — works",
   10999.98,
   2
  ],
  [
   "2025-09",
   "Complexe Médical Ormstown inc",
   "Supplies & operations",
   10207.28,
   1
  ],
  [
   "2025-09",
   "CCESI - Centre conseil en sécurité incendie",
   "Professional services",
   7642.5,
   1
  ],
  [
   "2025-09",
   "Chemtrade Chemicals Canada Ltd.",
   "Supplies & operations",
   6854.38,
   1
  ],
  [
   "2025-09",
   "Dunton Rainville S.E.N.C.R.L.",
   "Legal — external counsel",
   6752.72,
   5
  ],
  [
   "2025-09",
   "Ouellet Samantha",
   "Professional services",
   6392.61,
   3
  ],
  [
   "2025-09",
   "Atout RH Inc.",
   "Salaries & HR",
   6112.39,
   1
  ],
  [
   "2025-09",
   "9386-0120 Québec Inc",
   "Supplies & operations",
   4139.1,
   1
  ],
  [
   "2025-09",
   "Distribution Lazure Inc.",
   "Supplies & operations",
   4037.57,
   5
  ],
  [
   "2025-09",
   "Compteurs d'Eau du Québec",
   "Professional services",
   3564.23,
   1
  ],
  [
   "2025-09",
   "Construction DJL Inc.",
   "Supplies & operations",
   3551.77,
   4
  ],
  [
   "2025-09",
   "Gauthier, René (Essence)",
   "Vehicle fuel & maintenance",
   3418.89,
   23
  ],
  [
   "2025-09",
   "Jalec Inc.",
   "Software & IT",
   3298.64,
   2
  ],
  [
   "2025-09",
   "Solmatech Inc.",
   "Professional services",
   2984.75,
   1
  ],
  [
   "2025-09",
   "Technivolt Électrique Inc.",
   "Supplies & operations",
   2845.63,
   2
  ],
  [
   "2025-09",
   "Ali Excavation Inc.",
   "Supplies & operations",
   2710.5,
   2
  ],
  [
   "2025-09",
   "Gestion MSDM Inc.",
   "Supplies & operations",
   2563.94,
   1
  ],
  [
   "2025-09",
   "Grue Mobile Veilleux Inc.",
   "Contracts — works",
   2480.01,
   1
  ],
  [
   "2025-09",
   "Orflow Géosciences Inc.",
   "Professional services",
   2477.71,
   1
  ],
  [
   "2025-09",
   "Quadient Canada Ltée",
   "Supplies & operations",
   2299.5,
   1
  ],
  [
   "2025-09",
   "Servalve",
   "Supplies & operations",
   2273.63,
   1
  ],
  [
   "2025-09",
   "9483-3100 Québec Inc.",
   "Contracts — works",
   2167.28,
   2
  ],
  [
   "2025-09",
   "Quincaillerie R. Gauthier Inc.",
   "Supplies & operations",
   2141.66,
   15
  ],
  [
   "2025-09",
   "Eurofins Environex",
   "Professional services",
   2031.9,
   5
  ],
  [
   "2025-09",
   "Ormstown Fire Department",
   "Supplies & operations",
   1886.2,
   2
  ],
  [
   "2025-09",
   "COMAQ",
   "Salaries & HR",
   1736.12,
   2
  ],
  [
   "2025-09",
   "Dynapompe Inc.",
   "Supplies & operations",
   1636.09,
   1
  ],
  [
   "2025-09",
   "TD Canada Trust",
   "Salaries & HR",
   1615.4,
   1
  ],
  [
   "2025-09",
   "Hibon Inc.",
   "Contracts — works",
   1570.74,
   1
  ],
  [
   "2025-09",
   "Bottier du Cinq (Le)",
   "Supplies & operations",
   1454.59,
   3
  ],
  [
   "2025-09",
   "Quincaillerie Machabée",
   "Supplies & operations",
   1382.09,
   3
  ],
  [
   "2025-09",
   "Équipements Pro-Fit Inc.",
   "Supplies & operations",
   1379.7,
   1
  ],
  [
   "2025-09",
   "Lamb J. & Son",
   "Contracts — works",
   1379.7,
   1
  ],
  [
   "2025-09",
   "Services de Rebuts Soulanges Inc.",
   "Contracts — works",
   1347.68,
   1
  ],
  [
   "2025-09",
   "Échafauds Plus (Laval) Inc.",
   "Supplies & operations",
   1261.91,
   2
  ],
  [
   "2025-09",
   "Groupe Lou-Tec Inc.",
   "Supplies & operations",
   1251.03,
   2
  ],
  [
   "2025-09",
   "Service Informatique D.L. Inc",
   "Software & IT",
   1175.05,
   2
  ],
  [
   "2025-09",
   "DR Conseils s.e.c.",
   "Professional services",
   1151.21,
   2
  ],
  [
   "2025-09",
   "Discair Productions",
   "Professional services",
   1092.26,
   1
  ],
  [
   "2025-09",
   "Carrière Ali Inc.",
   "Supplies & operations",
   1088.71,
   1
  ],
  [
   "2025-09",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   1376.21,
   18
  ],
  [
   "2025-09",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   743.8,
   3
  ],
  [
   "2025-09",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   8761.74,
   51
  ],
  [
   "2025-09",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Legal — external counsel",
   436.66,
   2
  ],
  [
   "2025-09",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Contracts — works",
   2048.63,
   4
  ],
  [
   "2025-09",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   345.38,
   3
  ],
  [
   "2025-09",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Salaries & HR",
   494.6,
   2
  ],
  [
   "2025-09",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   78.1,
   2
  ],
  [
   "2025-09",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Other",
   73.12,
   1
  ],
  [
   "2025-10",
   "Les Industries Simexco Inc.",
   "Contracts — works",
   136527.5,
   1
  ],
  [
   "2025-10",
   "Artelia Canada Inc.",
   "Professional services",
   118388.32,
   1
  ],
  [
   "2025-10",
   "— (paie municipale)",
   "Salaries & HR",
   86208.43,
   1
  ],
  [
   "2025-10",
   "Robert Daoust Et Fils Inc.",
   "Waste & recycling",
   61756.13,
   2
  ],
  [
   "2025-10",
   "Ministre du Revenu",
   "Salaries & HR",
   40049.88,
   4
  ],
  [
   "2025-10",
   "BCGO S.E.N.C.R.L.",
   "Professional services",
   33572.71,
   5
  ],
  [
   "2025-10",
   "Receveur Général",
   "Salaries & HR",
   19643.03,
   7
  ],
  [
   "2025-10",
   "Solmatech Inc.",
   "Professional services",
   13506.11,
   1
  ],
  [
   "2025-10",
   "Gestar Inc.",
   "Professional services",
   11267.56,
   1
  ],
  [
   "2025-10",
   "Cmp Mayer Inc.",
   "Supplies & operations",
   11204.32,
   1
  ],
  [
   "2025-10",
   "Garage C.P. & Fils Inc.",
   "Vehicle fuel & maintenance",
   10715.75,
   6
  ],
  [
   "2025-10",
   "Complexe Médical Ormstown inc",
   "Supplies & operations",
   9922.6,
   1
  ],
  [
   "2025-10",
   "Hydro-Québec",
   "Utilities",
   9840.68,
   2
  ],
  [
   "2025-10",
   "Solution Informatique de la Montérégie",
   "Software & IT",
   9795.8,
   2
  ],
  [
   "2025-10",
   "Groupe Quantik Activis inc.",
   "Software & IT",
   8603.29,
   2
  ],
  [
   "2025-10",
   "Dunton Rainville S.E.N.C.R.L.",
   "Legal — external counsel",
   8304.07,
   3
  ],
  [
   "2025-10",
   "Caisse Desjardins",
   "Salaries & HR",
   3401.67,
   1
  ],
  [
   "2025-10",
   "Groupe SGM Inc.",
   "Contracts — works",
   3147.51,
   1
  ],
  [
   "2025-10",
   "Environor Canada Inc.",
   "Supplies & operations",
   2971.31,
   1
  ],
  [
   "2025-10",
   "FQM Assurances Inc.",
   "Insurance",
   2824.19,
   1
  ],
  [
   "2025-10",
   "Gestion MSDM Inc.",
   "Supplies & operations",
   2563.94,
   1
  ],
  [
   "2025-10",
   "Gleaner, The",
   "Professional services",
   2414.48,
   1
  ],
  [
   "2025-10",
   "Quincaillerie R. Gauthier Inc.",
   "Supplies & operations",
   2363.24,
   15
  ],
  [
   "2025-10",
   "Eurofins Environex",
   "Professional services",
   2195.17,
   5
  ],
  [
   "2025-10",
   "Ali Excavation Inc.",
   "Supplies & operations",
   2182.65,
   3
  ],
  [
   "2025-10",
   "9386-0120 Québec Inc",
   "Supplies & operations",
   2104.04,
   1
  ],
  [
   "2025-10",
   "Mcclintock, les Entreprises",
   "Contracts — works",
   1837.89,
   1
  ],
  [
   "2025-10",
   "Ouellet Samantha",
   "Professional services",
   1701.63,
   1
  ],
  [
   "2025-10",
   "Technivolt Électrique Inc.",
   "Contracts — works",
   1666.77,
   2
  ],
  [
   "2025-10",
   "Grue Mobile Veilleux Inc.",
   "Contracts — works",
   1586.95,
   1
  ],
  [
   "2025-10",
   "Atlantis Pompe",
   "Supplies & operations",
   1422.36,
   1
  ],
  [
   "2025-10",
   "Lamb J. & Son",
   "Contracts — works",
   1379.7,
   1
  ],
  [
   "2025-10",
   "9483-3100 Québec Inc.",
   "Supplies & operations",
   1228.3,
   2
  ],
  [
   "2025-10",
   "Visa Desjardins",
   "Salaries & HR",
   1192.04,
   1
  ],
  [
   "2025-10",
   "Gauthier, René (Essence)",
   "Vehicle fuel & maintenance",
   1159.31,
   10
  ],
  [
   "2025-10",
   "Discair Productions",
   "Professional services",
   1092.26,
   1
  ],
  [
   "2025-10",
   "Carrière Ali Inc.",
   "Supplies & operations",
   1080.23,
   2
  ],
  [
   "2025-10",
   "Service Informatique D.L. Inc",
   "Software & IT",
   1014.08,
   1
  ],
  [
   "2025-10",
   "Tremblay Madeleine",
   "Other",
   1000,
   1
  ],
  [
   "2025-10",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   1153.11,
   12
  ],
  [
   "2025-10",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   1413.37,
   3
  ],
  [
   "2025-10",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   6632.21,
   33
  ],
  [
   "2025-10",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   362.3,
   2
  ],
  [
   "2025-10",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   386.16,
   2
  ],
  [
   "2025-10",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Salaries & HR",
   540.04,
   2
  ],
  [
   "2025-10",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Subsidies & community",
   75,
   1
  ],
  [
   "2025-11",
   "Ministre des Finances",
   "Policing — SQ",
   335457,
   1
  ],
  [
   "2025-11",
   "— (paie municipale)",
   "Salaries & HR",
   239187,
   1
  ],
  [
   "2025-11",
   "M.R.C. Haut Saint Laurent",
   "Regional shares & memberships",
   148663.5,
   1
  ],
  [
   "2025-11",
   "Ministre du Revenu",
   "Salaries & HR",
   73522.63,
   8
  ],
  [
   "2025-11",
   "Réfrigération Yvan Allison",
   "Contracts — works",
   62623.03,
   1
  ],
  [
   "2025-11",
   "Receveur Général",
   "Salaries & HR",
   39167.49,
   10
  ],
  [
   "2025-11",
   "Robert Daoust Et Fils Inc.",
   "Waste & recycling",
   37904.1,
   1
  ],
  [
   "2025-11",
   "Services de Rebuts Soulanges Inc.",
   "Contracts — works",
   28786.71,
   2
  ],
  [
   "2025-11",
   "Hydro-Québec",
   "Utilities",
   25957.55,
   4
  ],
  [
   "2025-11",
   "Dunton Rainville S.E.N.C.R.L.",
   "Legal — external counsel",
   22916.25,
   3
  ],
  [
   "2025-11",
   "BCGO S.E.N.C.R.L.",
   "Professional services",
   20718.5,
   4
  ],
  [
   "2025-11",
   "Complexe Médical Ormstown inc",
   "Supplies & operations",
   19845.2,
   2
  ],
  [
   "2025-11",
   "Groupe Domisa Inc.",
   "Professional services",
   17188.76,
   1
  ],
  [
   "2025-11",
   "Service Sous-Marin",
   "Contracts — works",
   16096.17,
   2
  ],
  [
   "2025-11",
   "DHC Avocats",
   "Legal — external counsel",
   14846.29,
   4
  ],
  [
   "2025-11",
   "Contrôles Laurentide Ltée",
   "Supplies & operations",
   12076.94,
   4
  ],
  [
   "2025-11",
   "Caisse Desjardins",
   "Salaries & HR",
   11330.13,
   6
  ],
  [
   "2025-11",
   "CCESI - Centre conseil en sécurité incendie",
   "Professional services",
   11122.5,
   2
  ],
  [
   "2025-11",
   "Pelouse Alex Gaulin",
   "Contracts — works",
   10999.98,
   2
  ],
  [
   "2025-11",
   "9188-0781 Québec Inc",
   "Contracts — works",
   10611.54,
   1
  ],
  [
   "2025-11",
   "OH du Haut-Saint-Laurent",
   "Regional shares & memberships",
   10000,
   1
  ],
  [
   "2025-11",
   "Ics Inc.",
   "Software & IT",
   9146.72,
   2
  ],
  [
   "2025-11",
   "Isabelle Bouchard, M.Sc.A.",
   "Professional services",
   7741.11,
   1
  ],
  [
   "2025-11",
   "Terapro Construction",
   "Vehicle fuel & maintenance",
   7677.26,
   6
  ],
  [
   "2025-11",
   "Ouellet Samantha",
   "Professional services",
   6806.52,
   4
  ],
  [
   "2025-11",
   "Groupe Civitas Inc.",
   "Professional services",
   6611.06,
   1
  ],
  [
   "2025-11",
   "Eurofins Environex",
   "Professional services",
   6432.29,
   3
  ],
  [
   "2025-11",
   "Ormstown Fire Department",
   "Supplies & operations",
   5436.2,
   1
  ],
  [
   "2025-11",
   "Gestion MSDM Inc.",
   "Supplies & operations",
   5127.88,
   2
  ],
  [
   "2025-11",
   "Chemtrade Chemicals Canada Ltd.",
   "Supplies & operations",
   5106.37,
   1
  ],
  [
   "2025-11",
   "Noël & Fils",
   "Supplies & operations",
   4220.07,
   1
  ],
  [
   "2025-11",
   "Laurentide Environnement Inc.",
   "Supplies & operations",
   3652.67,
   2
  ],
  [
   "2025-11",
   "9386-0120 Québec Inc",
   "Supplies & operations",
   3104.33,
   1
  ],
  [
   "2025-11",
   "Groupe SGM Inc.",
   "Contracts — works",
   2840.64,
   2
  ],
  [
   "2025-11",
   "Service Informatique D.L. Inc",
   "Software & IT",
   2797.17,
   2
  ],
  [
   "2025-11",
   "Technivolt Électrique Inc.",
   "Contracts — works",
   2575.36,
   3
  ],
  [
   "2025-11",
   "Bionest Inc.",
   "Contracts — works",
   2514.01,
   2
  ],
  [
   "2025-11",
   "Orflow Géosciences Inc.",
   "Professional services",
   2500.71,
   1
  ],
  [
   "2025-11",
   "Discair Productions",
   "Professional services",
   2443.22,
   2
  ],
  [
   "2025-11",
   "Gleaner, The",
   "Professional services",
   2414.48,
   1
  ],
  [
   "2025-11",
   "Compteurs d'Eau du Québec",
   "Software & IT",
   2379.98,
   1
  ],
  [
   "2025-11",
   "Distribution Lazure Inc.",
   "Supplies & operations",
   2297.61,
   3
  ],
  [
   "2025-11",
   "Groupe Quantik Activis inc.",
   "Software & IT",
   2288.01,
   2
  ],
  [
   "2025-11",
   "Pompaction Inc.",
   "Supplies & operations",
   2284.99,
   1
  ],
  [
   "2025-11",
   "Prud'homme Technologies Inc.",
   "Supplies & operations",
   2272.08,
   13
  ],
  [
   "2025-11",
   "Laboratoire GS Inc.",
   "Professional services",
   1960.32,
   1
  ],
  [
   "2025-11",
   "Ali Excavation Inc.",
   "Supplies & operations",
   1928.93,
   2
  ],
  [
   "2025-11",
   "Construction DJL Inc.",
   "Supplies & operations",
   1923.14,
   1
  ],
  [
   "2025-11",
   "École Notre-Dame-du-Rosaire",
   "Subsidies & community",
   1914.85,
   1
  ],
  [
   "2025-11",
   "Mini-Excavation Clinton Ykema",
   "Contracts — works",
   1724.63,
   1
  ],
  [
   "2025-11",
   "Jalec Inc.",
   "Software & IT",
   1525.79,
   3
  ],
  [
   "2025-11",
   "Gauthier, René (Essence)",
   "Vehicle fuel & maintenance",
   1488.48,
   14
  ],
  [
   "2025-11",
   "D'Amour & Fils Inc. (R.S)",
   "Supplies & operations",
   1325.64,
   24
  ],
  [
   "2025-11",
   "C. S. Brunette Inc.",
   "Vehicle fuel & maintenance",
   1222.23,
   10
  ],
  [
   "2025-11",
   "Quincaillerie R. Gauthier Inc.",
   "Supplies & operations",
   1204.09,
   9
  ],
  [
   "2025-11",
   "Michel Hamilton",
   "Other",
   1201.78,
   1
  ],
  [
   "2025-11",
   "Complexe Enviro Connexions Ltée",
   "Supplies & operations",
   1197.22,
   1
  ],
  [
   "2025-11",
   "Thibault & Associés",
   "Professional services",
   1161.25,
   1
  ],
  [
   "2025-11",
   "Entreprises C. Sauvé Inc.",
   "Contracts — works",
   1104.47,
   1
  ],
  [
   "2025-11",
   "Cimsoft Corp DBA Aveva Select CND E",
   "Software & IT",
   1096.52,
   1
  ],
  [
   "2025-11",
   "Hoskin Scientifique Limitée",
   "Supplies & operations",
   1056.62,
   1
  ],
  [
   "2025-11",
   "Visa Desjardins",
   "Software & IT",
   1041.35,
   1
  ],
  [
   "2025-11",
   "Ministre des Finances (Y2007896)",
   "Supplies & operations",
   1038.52,
   1
  ],
  [
   "2025-11",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   1898.41,
   15
  ],
  [
   "2025-11",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   1625.43,
   6
  ],
  [
   "2025-11",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Salaries & HR",
   1848.89,
   8
  ],
  [
   "2025-11",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   11119.26,
   56
  ],
  [
   "2025-11",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Contracts — works",
   -0.01,
   4
  ],
  [
   "2025-11",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   1182.8,
   3
  ],
  [
   "2025-11",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   391.24,
   3
  ],
  [
   "2025-11",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Subsidies & community",
   55,
   1
  ],
  [
   "2025-11",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Legal — external counsel",
   125.78,
   1
  ],
  [
   "2025-12",
   "— (paie municipale)",
   "Salaries & HR",
   100017.67,
   1
  ],
  [
   "2025-12",
   "Robert Daoust Et Fils Inc.",
   "Waste & recycling",
   59590.37,
   2
  ],
  [
   "2025-12",
   "Dunton Rainville S.E.N.C.R.L.",
   "Legal — external counsel",
   46212.39,
   5
  ],
  [
   "2025-12",
   "OH du Haut-Saint-Laurent",
   "Regional shares & memberships",
   43617.02,
   1
  ],
  [
   "2025-12",
   "Ministre du Revenu",
   "Salaries & HR",
   21992.19,
   2
  ],
  [
   "2025-12",
   "Les Formulaires Ducharme Inc.",
   "Supplies & operations",
   13009.89,
   2
  ],
  [
   "2025-12",
   "Technivolt Électrique Inc.",
   "Contracts — works",
   10332.96,
   7
  ],
  [
   "2025-12",
   "AEDIFICA",
   "Professional services",
   8324.19,
   2
  ],
  [
   "2025-12",
   "Ali Excavation Inc.",
   "Supplies & operations",
   6835.91,
   3
  ],
  [
   "2025-12",
   "Services de Rebuts Soulanges Inc.",
   "Contracts — works",
   6273.21,
   1
  ],
  [
   "2025-12",
   "Drumco Énergie",
   "Supplies & operations",
   5617.14,
   3
  ],
  [
   "2025-12",
   "Solution Informatique de la Montérégie",
   "Software & IT",
   5364.45,
   1
  ],
  [
   "2025-12",
   "D'Amour & Fils Inc. (R.S)",
   "Supplies & operations",
   4817.91,
   19
  ],
  [
   "2025-12",
   "Bionest Inc.",
   "Contracts — works",
   4236.96,
   2
  ],
  [
   "2025-12",
   "M.R.C. de Pontiac",
   "Salaries & HR",
   3953.68,
   1
  ],
  [
   "2025-12",
   "Hydro-Québec",
   "Utilities",
   3676.82,
   1
  ],
  [
   "2025-12",
   "Caisse Desjardins",
   "Salaries & HR",
   3551.39,
   1
  ],
  [
   "2025-12",
   "Pelouse Alex Gaulin",
   "Contracts — works",
   3300,
   1
  ],
  [
   "2025-12",
   "9386-0120 Québec Inc",
   "Supplies & operations",
   3104.33,
   1
  ],
  [
   "2025-12",
   "Arboriste AB",
   "Contracts — works",
   2529.45,
   1
  ],
  [
   "2025-12",
   "Solmatech Inc.",
   "Professional services",
   2431.72,
   1
  ],
  [
   "2025-12",
   "Gleaner, The",
   "Professional services",
   2414.48,
   1
  ],
  [
   "2025-12",
   "9534-8702 Québec Inc. (Petro Canada)",
   "Vehicle fuel & maintenance",
   2293.92,
   18
  ],
  [
   "2025-12",
   "Eurofins Environex",
   "Professional services",
   2216.75,
   6
  ],
  [
   "2025-12",
   "TD Canada Trust",
   "Salaries & HR",
   2019.25,
   2
  ],
  [
   "2025-12",
   "Isolation TK",
   "Contracts — works",
   1921.23,
   1
  ],
  [
   "2025-12",
   "Robitaille Equipement Inc.",
   "Supplies & operations",
   1838.9,
   2
  ],
  [
   "2025-12",
   "Boivin & Gauvin Inc.",
   "Professional services",
   1746.76,
   1
  ],
  [
   "2025-12",
   "Carrière Ali Inc.",
   "Supplies & operations",
   1685.09,
   2
  ],
  [
   "2025-12",
   "Une Affaire de Famille",
   "Professional services",
   1680,
   1
  ],
  [
   "2025-12",
   "Service Informatique D.L. Inc",
   "Software & IT",
   1106.06,
   2
  ],
  [
   "2025-12",
   "Discair Productions",
   "Professional services",
   1092.26,
   1
  ],
  [
   "2025-12",
   "Groupe SGM Inc.",
   "Contracts — works",
   1066.55,
   1
  ],
  [
   "2025-12",
   "Groupe Brunet",
   "Supplies & operations",
   1026.73,
   1
  ],
  [
   "2025-12",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   2069.33,
   4
  ],
  [
   "2025-12",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   6855.72,
   33
  ],
  [
   "2025-12",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Contracts — works",
   1285.99,
   2
  ],
  [
   "2025-12",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   1413.29,
   15
  ],
  [
   "2025-12",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Salaries & HR",
   2302.61,
   7
  ],
  [
   "2025-12",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Legal — external counsel",
   238.24,
   2
  ],
  [
   "2025-12",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   339.34,
   3
  ],
  [
   "2025-12",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   486.06,
   2
  ],
  [
   "2026-01",
   "Construction Émery Paquette Inc.",
   "Contracts — works",
   225767,
   1
  ],
  [
   "2026-01",
   "— (paie municipale)",
   "Salaries & HR",
   182166.41,
   1
  ],
  [
   "2026-01",
   "Robert Daoust Et Fils Inc.",
   "Waste & recycling",
   109283.02,
   5
  ],
  [
   "2026-01",
   "Ministre du Revenu",
   "Salaries & HR",
   74366.24,
   4
  ],
  [
   "2026-01",
   "Technivolt Électrique Inc.",
   "Contracts — works",
   50168.64,
   4
  ],
  [
   "2026-01",
   "Receveur Général",
   "Salaries & HR",
   39903.75,
   4
  ],
  [
   "2026-01",
   "Services de Rebuts Soulanges Inc.",
   "Contracts — works",
   34179.66,
   2
  ],
  [
   "2026-01",
   "Hydro-Québec",
   "Utilities",
   26385.61,
   4
  ],
  [
   "2026-01",
   "Artelia Canada Inc.",
   "Professional services",
   22995,
   1
  ],
  [
   "2026-01",
   "Pg Solutions",
   "Software & IT",
   21103.11,
   1
  ],
  [
   "2026-01",
   "Orflow Géosciences Inc.",
   "Professional services",
   17295.62,
   3
  ],
  [
   "2026-01",
   "Plancher Design Expert Inc.",
   "Contracts — works",
   14703.37,
   1
  ],
  [
   "2026-01",
   "Ics Inc.",
   "Software & IT",
   10031.53,
   2
  ],
  [
   "2026-01",
   "Complexe Médical Ormstown inc",
   "Supplies & operations",
   9922.6,
   1
  ],
  [
   "2026-01",
   "Caisse Desjardins",
   "Salaries & HR",
   9844.87,
   3
  ],
  [
   "2026-01",
   "Mcclintock, les Entreprises",
   "Contracts — works",
   9629.16,
   1
  ],
  [
   "2026-01",
   "Bohemen Jamie (Enr.)",
   "Contracts — works",
   7853.11,
   3
  ],
  [
   "2026-01",
   "Rancourt Legault Joncas",
   "Legal — external counsel",
   7500,
   1
  ],
  [
   "2026-01",
   "9534-8702 Québec Inc. (Petro Canada)",
   "Vehicle fuel & maintenance",
   7394.16,
   47
  ],
  [
   "2026-01",
   "Visa Desjardins",
   "Supplies & operations",
   7288.79,
   3
  ],
  [
   "2026-01",
   "Ouellett Samantha",
   "Professional services",
   7128.45,
   4
  ],
  [
   "2026-01",
   "Dunton Rainville S.E.N.C.R.L.",
   "Legal — external counsel",
   6869.83,
   5
  ],
  [
   "2026-01",
   "BCGO S.E.N.C.R.L.",
   "Professional services",
   6257.44,
   2
  ],
  [
   "2026-01",
   "2547-0857 Québec Inc. (Infotech)",
   "Software & IT",
   6058.5,
   14
  ],
  [
   "2026-01",
   "FQM",
   "Salaries & HR",
   5699.03,
   2
  ],
  [
   "2026-01",
   "Godbout, Sylvie-Anne, Me",
   "Legal — external counsel",
   5454.13,
   1
  ],
  [
   "2026-01",
   "Gleaner, The",
   "Professional services",
   4828.96,
   2
  ],
  [
   "2026-01",
   "Remorquage Brunette",
   "Vehicle fuel & maintenance",
   4058.62,
   2
  ],
  [
   "2026-01",
   "McKenna Mike",
   "Professional services",
   4055.16,
   1
  ],
  [
   "2026-01",
   "Eurofins Environex",
   "Professional services",
   4010.91,
   6
  ],
  [
   "2026-01",
   "Boivin & Gauvin Inc.",
   "Supplies & operations",
   3904.1,
   1
  ],
  [
   "2026-01",
   "Les Formulaires Ducharme Inc.",
   "Supplies & operations",
   3708.29,
   1
  ],
  [
   "2026-01",
   "C. S. Brunette Inc.",
   "Vehicle fuel & maintenance",
   3402.09,
   25
  ],
  [
   "2026-01",
   "Environor Canada Inc.",
   "Supplies & operations",
   3379.35,
   1
  ],
  [
   "2026-01",
   "SEMS",
   "Supplies & operations",
   3186.93,
   1
  ],
  [
   "2026-01",
   "Savaria",
   "Contracts — works",
   3124,
   1
  ],
  [
   "2026-01",
   "9386-0120 Québec Inc",
   "Supplies & operations",
   3104.33,
   1
  ],
  [
   "2026-01",
   "Groupe SGM Inc.",
   "Contracts — works",
   2918.11,
   1
  ],
  [
   "2026-01",
   "Gestion MSDM Inc.",
   "Supplies & operations",
   2667.42,
   1
  ],
  [
   "2026-01",
   "M.R.C. Haut Saint Laurent",
   "Contracts — works",
   2536.95,
   1
  ],
  [
   "2026-01",
   "Ness, D.R.",
   "Supplies & operations",
   2338.38,
   1
  ],
  [
   "2026-01",
   "Tech-Mix, Division BauVal Inc.",
   "Supplies & operations",
   2186.41,
   1
  ],
  [
   "2026-01",
   "Discair Productions",
   "Professional services",
   2184.52,
   2
  ],
  [
   "2026-01",
   "Taverne de la Ferme",
   "Salaries & HR",
   2065.12,
   1
  ],
  [
   "2026-01",
   "Laboratoire GS Inc.",
   "Professional services",
   1960.32,
   1
  ],
  [
   "2026-01",
   "9483-3100 Québec Inc.",
   "Contracts — works",
   1848.24,
   2
  ],
  [
   "2026-01",
   "Traiteur Pelchat Inc.",
   "Supplies & operations",
   1846.5,
   1
  ],
  [
   "2026-01",
   "Nordikeau",
   "Professional services",
   1844.2,
   1
  ],
  [
   "2026-01",
   "Harnois Énergies Inc.",
   "Vehicle fuel & maintenance",
   1735.94,
   1
  ],
  [
   "2026-01",
   "Sécurité & Serrurier Clément",
   "Supplies & operations",
   1721.76,
   4
  ],
  [
   "2026-01",
   "Multi Graph Ormstown SENC",
   "Supplies & operations",
   1667.14,
   1
  ],
  [
   "2026-01",
   "Équipements Colpron Inc. (Les)",
   "Supplies & operations",
   1559.86,
   3
  ],
  [
   "2026-01",
   "Club Lions Ormstown",
   "Subsidies & community",
   1500,
   1
  ],
  [
   "2026-01",
   "Servicofax",
   "Supplies & operations",
   1465.67,
   2
  ],
  [
   "2026-01",
   "G.P. ag Distribution",
   "Supplies & operations",
   1411.25,
   2
  ],
  [
   "2026-01",
   "DHC Avocats",
   "Legal — external counsel",
   1395.91,
   2
  ],
  [
   "2026-01",
   "Refuge Chaby et Chiens",
   "Professional services",
   1387.43,
   2
  ],
  [
   "2026-01",
   "Manoir d'Youville",
   "Supplies & operations",
   1326.86,
   1
  ],
  [
   "2026-01",
   "Visa Desjardins",
   "Software & IT",
   1287.11,
   2
  ],
  [
   "2026-01",
   "Énergie P38 Inc. / Budget Propane",
   "Utilities",
   1269.51,
   6
  ],
  [
   "2026-01",
   "Lac-Matic Inc.",
   "Supplies & operations",
   1235.44,
   1
  ],
  [
   "2026-01",
   "Librairies Boyer",
   "Supplies & operations",
   1223.2,
   5
  ],
  [
   "2026-01",
   "TD Canada Trust",
   "Salaries & HR",
   1211.55,
   3
  ],
  [
   "2026-01",
   "Méga Fun Montréal Inc",
   "Supplies & operations",
   1149.75,
   1
  ],
  [
   "2026-01",
   "Bottier du Cinq (Le)",
   "Supplies & operations",
   1142.98,
   5
  ],
  [
   "2026-01",
   "Xylem Canada",
   "Supplies & operations",
   1142.56,
   1
  ],
  [
   "2026-01",
   "DR Conseils s.e.c.",
   "Professional services",
   1113.21,
   1
  ],
  [
   "2026-01",
   "Service Informatique D.L. Inc",
   "Software & IT",
   1106.06,
   2
  ],
  [
   "2026-01",
   "Paquet, Lyne",
   "Professional services",
   1105,
   1
  ],
  [
   "2026-01",
   "Laurentide Environnement Inc.",
   "Supplies & operations",
   1065.86,
   2
  ],
  [
   "2026-01",
   "Noël & Fils",
   "Supplies & operations",
   1063.52,
   1
  ],
  [
   "2026-01",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   11796.01,
   71
  ],
  [
   "2026-01",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   848.89,
   2
  ],
  [
   "2026-01",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   343.78,
   1
  ],
  [
   "2026-01",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   1799.5,
   6
  ],
  [
   "2026-01",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Salaries & HR",
   956.01,
   6
  ],
  [
   "2026-01",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Subsidies & community",
   50,
   1
  ],
  [
   "2026-01",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Legal — external counsel",
   422.25,
   1
  ],
  [
   "2026-01",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   483.66,
   3
  ],
  [
   "2026-02",
   "— (paie municipale)",
   "Salaries & HR",
   143802.32,
   1
  ],
  [
   "2026-02",
   "Robert Daoust Et Fils Inc.",
   "Waste & recycling",
   48220.1,
   2
  ],
  [
   "2026-02",
   "Ministre du Revenu",
   "Salaries & HR",
   47113.29,
   3
  ],
  [
   "2026-02",
   "Receveur général du Canada",
   "Salaries & HR",
   19001.03,
   4
  ],
  [
   "2026-02",
   "Hydro-Québec",
   "Utilities",
   18417.23,
   2
  ],
  [
   "2026-02",
   "Cmlex Conseil Inc.",
   "Legal — external counsel",
   12359.85,
   1
  ],
  [
   "2026-02",
   "Pyritest Inc. - Multitest",
   "Professional services",
   6293,
   1
  ],
  [
   "2026-02",
   "Quadient Canada Ltée",
   "Supplies & operations",
   4599,
   1
  ],
  [
   "2026-02",
   "9534-8702 Québec Inc. (Petro Canada)",
   "Vehicle fuel & maintenance",
   3743.37,
   28
  ],
  [
   "2026-02",
   "9483-3100 Québec Inc.",
   "Supplies & operations",
   2983.61,
   2
  ],
  [
   "2026-02",
   "Caisse Desjardins",
   "Salaries & HR",
   2953.76,
   1
  ],
  [
   "2026-02",
   "Gestion MSDM Inc.",
   "Supplies & operations",
   2667.42,
   1
  ],
  [
   "2026-02",
   "Pelouse Alex Gaulin",
   "Contracts — works",
   2586.94,
   1
  ],
  [
   "2026-02",
   "Nature Action Québec Inc.",
   "Professional services",
   2174.08,
   1
  ],
  [
   "2026-02",
   "Ouellet Samantha",
   "Professional services",
   1752.68,
   1
  ],
  [
   "2026-02",
   "Carrière Ali Inc.",
   "Supplies & operations",
   1660.09,
   2
  ],
  [
   "2026-02",
   "9386-0120 Québec Inc",
   "Supplies & operations",
   1118.14,
   1
  ],
  [
   "2026-02",
   "Dunton Rainville S.E.N.C.R.L.",
   "Legal — external counsel",
   1020.41,
   2
  ],
  [
   "2026-02",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   721.88,
   8
  ],
  [
   "2026-02",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   578.47,
   5
  ],
  [
   "2026-02",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Salaries & HR",
   4237.92,
   34
  ],
  [
   "2026-02",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Regional shares & memberships",
   1175.04,
   2
  ],
  [
   "2026-02",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   678.44,
   2
  ],
  [
   "2026-02",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   279.42,
   3
  ],
  [
   "2026-02",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   863.06,
   1
  ],
  [
   "2026-02",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Contracts — works",
   550,
   1
  ],
  [
   "2026-03",
   "— (paie municipale)",
   "Salaries & HR",
   176710.91,
   1
  ],
  [
   "2026-03",
   "Mines Seleine",
   "Supplies & operations",
   50361.21,
   2
  ],
  [
   "2026-03",
   "Régie intermunicipale de la patinoire",
   "Regional shares & memberships",
   39387,
   1
  ],
  [
   "2026-03",
   "CRSBP Montérégie Inc.",
   "Regional shares & memberships",
   31430.38,
   2
  ],
  [
   "2026-03",
   "Mcclintock, les Entreprises",
   "Contracts — works",
   21417,
   3
  ],
  [
   "2026-03",
   "Complexe Médical Ormstown",
   "Supplies & operations",
   19845.2,
   1
  ],
  [
   "2026-03",
   "Diamètre Expert Conseil Inc.",
   "Contracts — works",
   17849.3,
   2
  ],
  [
   "2026-03",
   "9483-3100 Québec Inc.",
   "Supplies & operations",
   16295.25,
   3
  ],
  [
   "2026-03",
   "Hydro-Québec",
   "Utilities",
   15399.33,
   2
  ],
  [
   "2026-03",
   "Artelia Canada Inc.",
   "Professional services",
   14492.6,
   1
  ],
  [
   "2026-03",
   "9534-8702 Québec Inc. (Petro Canada)",
   "Vehicle fuel & maintenance",
   13855.18,
   86
  ],
  [
   "2026-03",
   "Bauval Carrières Régionales",
   "Supplies & operations",
   10594.32,
   2
  ],
  [
   "2026-03",
   "Solution Informatique de la Montérégie",
   "Software & IT",
   9748.89,
   4
  ],
  [
   "2026-03",
   "Sécurité Rousse Inc.",
   "Contracts — works",
   8987.75,
   3
  ],
  [
   "2026-03",
   "Technivolt Électrique Inc.",
   "Contracts — works",
   6898.5,
   1
  ],
  [
   "2026-03",
   "Garage C.P. & Fils Inc.",
   "Vehicle fuel & maintenance",
   5717.6,
   6
  ],
  [
   "2026-03",
   "G.P. ag Distribution",
   "Supplies & operations",
   5437.98,
   1
  ],
  [
   "2026-03",
   "2547-0857 Québec Inc. (Infotech)",
   "Software & IT",
   5170.73,
   1
  ],
  [
   "2026-03",
   "Ouellet Samantha",
   "Contracts — works",
   3964.3,
   2
  ],
  [
   "2026-03",
   "Énergie P38 Inc. / Budget Propane",
   "Utilities",
   3339.5,
   10
  ],
  [
   "2026-03",
   "Sport Direct.ca",
   "Supplies & operations",
   3290.58,
   1
  ],
  [
   "2026-03",
   "Drumco Énergie",
   "Supplies & operations",
   3168.62,
   2
  ],
  [
   "2026-03",
   "Environor Canada Inc.",
   "Supplies & operations",
   3057.02,
   1
  ],
  [
   "2026-03",
   "Pelouse Alex Gaulin",
   "Contracts — works",
   2586.94,
   1
  ],
  [
   "2026-03",
   "Phaneuf Équipement Agricole",
   "Supplies & operations",
   2215.81,
   1
  ],
  [
   "2026-03",
   "Discair Productions",
   "Professional services",
   2184.52,
   2
  ],
  [
   "2026-03",
   "Technivolt Électrique Inc.",
   "Supplies & operations",
   2043.56,
   5
  ],
  [
   "2026-03",
   "Service Informatique D.L. Inc",
   "Software & IT",
   2028.16,
   2
  ],
  [
   "2026-03",
   "DHC Avocats",
   "Legal — external counsel",
   1842.53,
   2
  ],
  [
   "2026-03",
   "Grue Mobile Veilleux Inc.",
   "Contracts — works",
   1423.4,
   1
  ],
  [
   "2026-03",
   "Équipements Quinton Inc.",
   "Supplies & operations",
   1389.45,
   6
  ],
  [
   "2026-03",
   "JBF Javel-Bois-Franc Inc.",
   "Supplies & operations",
   1385.46,
   1
  ],
  [
   "2026-03",
   "Lamb J. & Son",
   "Contracts — works",
   1379.7,
   1
  ],
  [
   "2026-03",
   "Services de Rebuts Soulanges Inc.",
   "Contracts — works",
   1355.22,
   1
  ],
  [
   "2026-03",
   "Construction J. Théoret Inc.",
   "Contracts — works",
   1333.71,
   1
  ],
  [
   "2026-03",
   "Eurofins Environex",
   "Professional services",
   1299.79,
   3
  ],
  [
   "2026-03",
   "Multi Graph Ormstown SENC",
   "Supplies & operations",
   1195.74,
   1
  ],
  [
   "2026-03",
   "Sanibert",
   "Supplies & operations",
   1115.89,
   4
  ],
  [
   "2026-03",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Legal — external counsel",
   223.34,
   1
  ],
  [
   "2026-03",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   13179.77,
   85
  ],
  [
   "2026-03",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Salaries & HR",
   3693.39,
   10
  ],
  [
   "2026-03",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   1747.02,
   11
  ],
  [
   "2026-03",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   244.33,
   2
  ],
  [
   "2026-03",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   733.55,
   3
  ],
  [
   "2026-03",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Contracts — works",
   550,
   1
  ],
  [
   "2026-04",
   "— (paie municipale)",
   "Salaries & HR",
   153529.43,
   1
  ],
  [
   "2026-04",
   "Forage Wellpuits",
   "Contracts — works",
   51297.07,
   1
  ],
  [
   "2026-04",
   "Artelia Canada Inc.",
   "Professional services",
   40364.85,
   2
  ],
  [
   "2026-04",
   "Robert Daoust Et Fils Inc.",
   "Waste & recycling",
   31833.44,
   1
  ],
  [
   "2026-04",
   "Hydro-Québec",
   "Utilities",
   29848.86,
   4
  ],
  [
   "2026-04",
   "SAAQ Société ass. Automobile",
   "Vehicle fuel & maintenance",
   22428.16,
   1
  ],
  [
   "2026-04",
   "9483-3100 Québec Inc.",
   "Contracts — works",
   21313.51,
   2
  ],
  [
   "2026-04",
   "Beneva Inc.",
   "Insurance",
   20913.51,
   2
  ],
  [
   "2026-04",
   "2547-0857 Québec Inc. (Infotech)",
   "Software & IT",
   18738.39,
   9
  ],
  [
   "2026-04",
   "Cmlex Conseil Inc.",
   "Legal — external counsel",
   17318.15,
   2
  ],
  [
   "2026-04",
   "Dunton Rainville S.E.N.C.R.L.",
   "Legal — external counsel",
   14248.58,
   6
  ],
  [
   "2026-04",
   "AEDIFICA",
   "Professional services",
   12293.13,
   1
  ],
  [
   "2026-04",
   "9141855 Canada Inc.",
   "Vehicle fuel & maintenance",
   11501.29,
   7
  ],
  [
   "2026-04",
   "Orflow Géosciences Inc.",
   "Professional services",
   10060.31,
   1
  ],
  [
   "2026-04",
   "9534-8702 Québec Inc. (Petro Canada)",
   "Vehicle fuel & maintenance",
   8249.67,
   55
  ],
  [
   "2026-04",
   "Pyritest Inc. - Multitest",
   "Professional services",
   8165.11,
   1
  ],
  [
   "2026-04",
   "Pg Solutions",
   "Software & IT",
   7444.65,
   1
  ],
  [
   "2026-04",
   "Guy Dandurand",
   "Supplies & operations",
   6916.12,
   1
  ],
  [
   "2026-04",
   "Visa Desjardins",
   "Supplies & operations",
   5663.31,
   5
  ],
  [
   "2026-04",
   "Gestion MSDM Inc.",
   "Supplies & operations",
   5334.84,
   2
  ],
  [
   "2026-04",
   "Ouellett Samantha",
   "Professional services",
   5258.04,
   3
  ],
  [
   "2026-04",
   "A.E.M.F.S.Q.",
   "Regional shares & memberships",
   3500,
   1
  ],
  [
   "2026-04",
   "Bauval Carrières Régionales",
   "Supplies & operations",
   3179.44,
   4
  ],
  [
   "2026-04",
   "BCGO S.E.N.C.R.L.",
   "Professional services",
   3018.09,
   1
  ],
  [
   "2026-04",
   "Gleaner, The",
   "Professional services",
   2888.18,
   2
  ],
  [
   "2026-04",
   "Caisse Desjardins",
   "Salaries & HR",
   2838.11,
   2
  ],
  [
   "2026-04",
   "Technivolt Électrique Inc.",
   "Contracts — works",
   2661.39,
   4
  ],
  [
   "2026-04",
   "Services de Rebuts Soulanges Inc.",
   "Contracts — works",
   2510.66,
   2
  ],
  [
   "2026-04",
   "Solution Informatique de la Montérégie",
   "Software & IT",
   2252.72,
   2
  ],
  [
   "2026-04",
   "Nova Mobilier Environnement Inc.",
   "Supplies & operations",
   2224.77,
   1
  ],
  [
   "2026-04",
   "TD Canada Trust",
   "Salaries & HR",
   2043.46,
   1
  ],
  [
   "2026-04",
   "Groupe SGM Inc.",
   "Contracts — works",
   2041.4,
   2
  ],
  [
   "2026-04",
   "Visa Desjardins",
   "Software & IT",
   1898.61,
   2
  ],
  [
   "2026-04",
   "Mission Communications",
   "Professional services",
   1611.68,
   1
  ],
  [
   "2026-04",
   "Eurofins Environex",
   "Professional services",
   1575.16,
   3
  ],
  [
   "2026-04",
   "CNESST",
   "Salaries & HR",
   1435.74,
   1
  ],
  [
   "2026-04",
   "JBF Javel-Bois-Franc Inc.",
   "Supplies & operations",
   1385.46,
   1
  ],
  [
   "2026-04",
   "9386-0120 Québec Inc",
   "Supplies & operations",
   1379.7,
   1
  ],
  [
   "2026-04",
   "Union des Municipalités du Québec",
   "Salaries & HR",
   1362.45,
   1
  ],
  [
   "2026-04",
   "Sécurité & Serrurier Clément",
   "Supplies & operations",
   1241.76,
   6
  ],
  [
   "2026-04",
   "Prud'homme Technologies Inc.",
   "Supplies & operations",
   1153.97,
   1
  ],
  [
   "2026-04",
   "Bottier du Cinq (Le)",
   "Supplies & operations",
   1081,
   6
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Legal — external counsel",
   855.38,
   2
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   928.27,
   6
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   8758.29,
   46
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   317.28,
   2
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   1927.41,
   7
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   949.36,
   5
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Contracts — works",
   857.81,
   1
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Regional shares & memberships",
   150,
   1
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Other",
   914.05,
   1
  ],
  [
   "2026-05",
   "— (paie municipale)",
   "Salaries & HR",
   152311.18,
   1
  ],
  [
   "2026-05",
   "Excavation Usereau Inc.",
   "Contracts — works",
   34176.32,
   1
  ],
  [
   "2026-05",
   "Robert Daoust Et Fils Inc.",
   "Waste & recycling",
   30954.47,
   1
  ],
  [
   "2026-05",
   "Pg Solutions",
   "Software & IT",
   23358.17,
   3
  ],
  [
   "2026-05",
   "Hydro-Québec",
   "Utilities",
   18852.84,
   3
  ],
  [
   "2026-05",
   "Orflow Géosciences Inc.",
   "Professional services",
   18121.55,
   1
  ],
  [
   "2026-05",
   "Dunton Rainville S.E.N.C.R.L.",
   "Legal — external counsel",
   13351.2,
   9
  ],
  [
   "2026-05",
   "Complexe Médical Ormstown inc",
   "Supplies & operations",
   6783.33,
   1
  ],
  [
   "2026-05",
   "Agence Denis Lepine Inc.",
   "Professional services",
   5892.47,
   1
  ],
  [
   "2026-05",
   "FQM",
   "Regional shares & memberships",
   5517.62,
   1
  ],
  [
   "2026-05",
   "Mcclintock, les Entreprises",
   "Contracts — works",
   4569.58,
   2
  ],
  [
   "2026-05",
   "Cmlex Conseil Inc.",
   "Legal — external counsel",
   4239.72,
   1
  ],
  [
   "2026-05",
   "9483-3100 Québec Inc.",
   "Contracts — works",
   3506.75,
   2
  ],
  [
   "2026-05",
   "Pompaction Inc.",
   "Supplies & operations",
   3221.26,
   1
  ],
  [
   "2026-05",
   "Eurofins Environex",
   "Professional services",
   3002.58,
   3
  ],
  [
   "2026-05",
   "9188-0781 Québec Inc",
   "Contracts — works",
   2989.35,
   1
  ],
  [
   "2026-05",
   "Gestion MSDM Inc.",
   "Supplies & operations",
   2667.42,
   1
  ],
  [
   "2026-05",
   "AGRÉBEC INC.",
   "Supplies & operations",
   2539.8,
   1
  ],
  [
   "2026-05",
   "Bauval Carrières Régionales",
   "Supplies & operations",
   2367.85,
   4
  ],
  [
   "2026-05",
   "Service Informatique D.L. Inc",
   "Software & IT",
   2338.6,
   5
  ],
  [
   "2026-05",
   "Chartrand Fanny",
   "Professional services",
   2328.24,
   2
  ],
  [
   "2026-05",
   "Technivolt Électrique Inc.",
   "Contracts — works",
   2308.48,
   4
  ],
  [
   "2026-05",
   "Discair Productions",
   "Professional services",
   2184.52,
   2
  ],
  [
   "2026-05",
   "Laurentide Environnement Inc.",
   "Supplies & operations",
   1968.48,
   1
  ],
  [
   "2026-05",
   "Garage C.P. & Fils Inc.",
   "Vehicle fuel & maintenance",
   1917.25,
   1
  ],
  [
   "2026-05",
   "Ouellett Samantha",
   "Professional services",
   1752.68,
   1
  ],
  [
   "2026-05",
   "Ducore Expertise Inc.",
   "Professional services",
   1707.38,
   1
  ],
  [
   "2026-05",
   "2547-0857 Québec Inc. (Infotech)",
   "Software & IT",
   1701.64,
   1
  ],
  [
   "2026-05",
   "Services de Rebuts Soulanges Inc.",
   "Contracts — works",
   1532.39,
   1
  ],
  [
   "2026-05",
   "Énergie P38 Inc. / Budget Propane",
   "Utilities",
   1311.37,
   6
  ],
  [
   "2026-05",
   "9386-0120 Québec Inc",
   "Supplies & operations",
   1220.17,
   1
  ],
  [
   "2026-05",
   "Équip. Albert Billette Inc. (Les)",
   "Supplies & operations",
   1172.72,
   1
  ],
  [
   "2026-05",
   "Distribution Lazure Inc.",
   "Supplies & operations",
   1133.81,
   1
  ],
  [
   "2026-05",
   "Solution Informatique de la Montérégie",
   "Software & IT",
   1070.11,
   2
  ],
  [
   "2026-05",
   "Carrière Ali Inc.",
   "Supplies & operations",
   1034.75,
   1
  ],
  [
   "2026-05",
   "Bottier du Cinq (Le)",
   "Supplies & operations",
   1009.77,
   1
  ],
  [
   "2026-05",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   6523.29,
   43
  ],
  [
   "2026-05",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Legal — external counsel",
   917.22,
   3
  ],
  [
   "2026-05",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   1727.38,
   8
  ],
  [
   "2026-05",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Contracts — works",
   709.97,
   1
  ],
  [
   "2026-05",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   1481.58,
   6
  ],
  [
   "2026-05",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   408.57,
   2
  ],
  [
   "2026-05",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   281.72,
   3
  ],
  [
   "2026-05",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Regional shares & memberships",
   661.11,
   1
  ],
  [
   "2026-06",
   "— (paie municipale)",
   "Salaries & HR",
   188397.2,
   1
  ],
  [
   "2026-06",
   "M.R.C. Haut Saint Laurent",
   "Regional shares & memberships",
   183336.75,
   1
  ],
  [
   "2026-06",
   "FQM Assurances Inc.",
   "Insurance",
   99620.55,
   2
  ],
  [
   "2026-06",
   "Compteurs d'Eau du Québec",
   "Supplies & operations",
   57843,
   1
  ],
  [
   "2026-06",
   "9437-7843 Québec Inc.",
   "Contracts — works",
   52172.47,
   1
  ],
  [
   "2026-06",
   "Robert Daoust Et Fils Inc.",
   "Waste & recycling",
   45489.22,
   1
  ],
  [
   "2026-06",
   "Groupe Charlebois Inc.",
   "Professional services",
   29893.5,
   1
  ],
  [
   "2026-06",
   "Hydro-Québec",
   "Utilities",
   23937.26,
   26
  ],
  [
   "2026-06",
   "AEDIFICA",
   "Professional services",
   18439.7,
   1
  ],
  [
   "2026-06",
   "Pg Solutions",
   "Software & IT",
   17654.47,
   1
  ],
  [
   "2026-06",
   "Robmusic",
   "Professional services",
   10863.99,
   1
  ],
  [
   "2026-06",
   "Bétonel / Dulux",
   "Supplies & operations",
   8668.93,
   1
  ],
  [
   "2026-06",
   "CAUCA",
   "Professional services",
   7967.23,
   2
  ],
  [
   "2026-06",
   "Services de Rebuts Soulanges Inc.",
   "Contracts — works",
   7286.54,
   2
  ],
  [
   "2026-06",
   "2547-0857 Québec Inc. (Infotech)",
   "Software & IT",
   7092.28,
   5
  ],
  [
   "2026-06",
   "Complexe Médical Ormstown inc",
   "Supplies & operations",
   7012.12,
   1
  ],
  [
   "2026-06",
   "Meubles Burotic Inc.",
   "Supplies & operations",
   6953.4,
   1
  ],
  [
   "2026-06",
   "Ouellet Samantha",
   "Professional services",
   5258.04,
   3
  ],
  [
   "2026-06",
   "9141855 Canada Inc.",
   "Vehicle fuel & maintenance",
   5141.47,
   5
  ],
  [
   "2026-06",
   "Livestock Breeders Association",
   "Subsidies & community",
   5000,
   1
  ],
  [
   "2026-06",
   "Cégep de Saint-Laurent",
   "Salaries & HR",
   4127.6,
   1
  ],
  [
   "2026-06",
   "9534-8702 Québec Inc. (Petro Canada)",
   "Vehicle fuel & maintenance",
   3675.09,
   28
  ],
  [
   "2026-06",
   "S.N.G. Services Mécaniques Inc.",
   "Vehicle fuel & maintenance",
   3643.93,
   4
  ],
  [
   "2026-06",
   "Environor Canada Inc.",
   "Supplies & operations",
   3057.02,
   1
  ],
  [
   "2026-06",
   "Solution Informatique de la Montérégie",
   "Software & IT",
   2782.82,
   2
  ],
  [
   "2026-06",
   "Gestion MSDM Inc.",
   "Supplies & operations",
   2667.42,
   1
  ],
  [
   "2026-06",
   "Sécurité Rousse Inc.",
   "Contracts — works",
   2535.05,
   3
  ],
  [
   "2026-06",
   "Bottier du Cinq (Le)",
   "Supplies & operations",
   2418.54,
   3
  ],
  [
   "2026-06",
   "Gleaner, The",
   "Professional services",
   2414.48,
   1
  ],
  [
   "2026-06",
   "COMAQ",
   "Salaries & HR",
   2242.01,
   1
  ],
  [
   "2026-06",
   "Pompaction Inc.",
   "Supplies & operations",
   2094.07,
   2
  ],
  [
   "2026-06",
   "Légion royale canadienne — Ormstown",
   "Subsidies & community",
   2000,
   1
  ],
  [
   "2026-06",
   "Bionest Inc.",
   "Contracts — works",
   1779.75,
   1
  ],
  [
   "2026-06",
   "Eurofins Environex",
   "Professional services",
   1763.15,
   5
  ],
  [
   "2026-06",
   "Chartrand Fanny",
   "Professional services",
   1603.9,
   1
  ],
  [
   "2026-06",
   "Dunton Rainville S.E.N.C.R.L.",
   "Legal — external counsel",
   1544.98,
   2
  ],
  [
   "2026-06",
   "Formation R.C.R. RF",
   "Salaries & HR",
   1513.3,
   2
  ],
  [
   "2026-06",
   "Ambioterra",
   "Subsidies & community",
   1416,
   1
  ],
  [
   "2026-06",
   "JBF Javel-Bois-Franc Inc.",
   "Supplies & operations",
   1385.46,
   1
  ],
  [
   "2026-06",
   "Construction J. Théoret Inc.",
   "Contracts — works",
   1382.57,
   1
  ],
  [
   "2026-06",
   "Mcclintock, les Entreprises",
   "Contracts — works",
   1172.75,
   1
  ],
  [
   "2026-06",
   "Ouimet Johane",
   "Other",
   1149.75,
   1
  ],
  [
   "2026-06",
   "Discair Productions",
   "Professional services",
   1092.26,
   1
  ],
  [
   "2026-06",
   "Prud'homme Technologies Inc.",
   "Supplies & operations",
   1078.16,
   1
  ],
  [
   "2026-06",
   "Carrière Ali Inc.",
   "Supplies & operations",
   1045.83,
   2
  ],
  [
   "2026-06",
   "Service Informatique D.L. Inc",
   "Software & IT",
   1014.08,
   1
  ],
  [
   "2026-06",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Salaries & HR",
   2137.92,
   5
  ],
  [
   "2026-06",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Subsidies & community",
   2387.69,
   8
  ],
  [
   "2026-06",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   7910.43,
   54
  ],
  [
   "2026-06",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   481.41,
   2
  ],
  [
   "2026-06",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   216.2,
   7
  ],
  [
   "2026-06",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Contracts — works",
   2142.37,
   4
  ],
  [
   "2026-06",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   649.89,
   3
  ],
  [
   "2026-06",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   282.99,
   3
  ],
  [
   "2026-06",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Legal — external counsel",
   646.74,
   1
  ],
  [
   "2026-07",
   "Ministre des Finances",
   "Policing — SQ",
   356381,
   1
  ],
  [
   "2026-07",
   "— (paie municipale)",
   "Salaries & HR",
   233660.02,
   1
  ],
  [
   "2026-07",
   "M.R.C. Haut Saint Laurent",
   "Regional shares & memberships",
   183336.75,
   1
  ],
  [
   "2026-07",
   "Installation Jeux-Tec Inc.",
   "Contracts — works",
   149346.78,
   1
  ],
  [
   "2026-07",
   "Robert Daoust Et Fils Inc.",
   "Waste & recycling",
   44125.65,
   1
  ],
  [
   "2026-07",
   "Marquage Et Traçage du Québec Inc.",
   "Contracts — works",
   29504.02,
   1
  ],
  [
   "2026-07",
   "AEDIFICA",
   "Professional services",
   26398.83,
   2
  ],
  [
   "2026-07",
   "Hydro-Québec",
   "Utilities",
   18581.14,
   18
  ],
  [
   "2026-07",
   "Archives Lanaudière",
   "Professional services",
   14581.24,
   1
  ],
  [
   "2026-07",
   "Cmlex Conseil Inc.",
   "Legal — external counsel",
   11784.97,
   1
  ],
  [
   "2026-07",
   "Groupe Villeneuve",
   "Contracts — works",
   10659.04,
   2
  ],
  [
   "2026-07",
   "Services de Rebuts Soulanges Inc.",
   "Contracts — works",
   9947.32,
   2
  ],
  [
   "2026-07",
   "Robmusic",
   "Professional services",
   8147.99,
   1
  ],
  [
   "2026-07",
   "Complexe Médical Ormstown inc",
   "Supplies & operations",
   7517.76,
   2
  ],
  [
   "2026-07",
   "Pelouse Alex Gaulin",
   "Contracts — works",
   6663.33,
   1
  ],
  [
   "2026-07",
   "SIMO Management Inc.",
   "Professional services",
   6612.84,
   1
  ],
  [
   "2026-07",
   "9534-8702 Québec Inc. (Petro Canada)",
   "Vehicle fuel & maintenance",
   5857.63,
   32
  ],
  [
   "2026-07",
   "Distribution Lazure Inc.",
   "Supplies & operations",
   5292.2,
   1
  ],
  [
   "2026-07",
   "Dunton Rainville S.E.N.C.R.L.",
   "Legal — external counsel",
   4014.36,
   4
  ],
  [
   "2026-07",
   "Sanibert",
   "Supplies & operations",
   3986.94,
   4
  ],
  [
   "2026-07",
   "Pg Solutions",
   "Software & IT",
   3828.69,
   1
  ],
  [
   "2026-07",
   "Gestion MSDM Inc.",
   "Supplies & operations",
   3580.91,
   2
  ],
  [
   "2026-07",
   "Ouellet Samantha",
   "Professional services",
   3505.36,
   2
  ],
  [
   "2026-07",
   "Drumco Énergie",
   "Supplies & operations",
   3055.76,
   6
  ],
  [
   "2026-07",
   "Shellex Groupe Conseil",
   "Professional services",
   2716.29,
   1
  ],
  [
   "2026-07",
   "Gleaner, The",
   "Professional services",
   2414.48,
   1
  ],
  [
   "2026-07",
   "Carrière Ali Inc.",
   "Supplies & operations",
   2274.66,
   2
  ],
  [
   "2026-07",
   "Décors Véronneau",
   "Supplies & operations",
   2270.73,
   1
  ],
  [
   "2026-07",
   "Jardins Gemelas Inc. (Les)",
   "Supplies & operations",
   2069.55,
   1
  ],
  [
   "2026-07",
   "Eurofins Environex",
   "Professional services",
   1910.32,
   4
  ],
  [
   "2026-07",
   "Mission Communications",
   "Professional services",
   1818.74,
   1
  ],
  [
   "2026-07",
   "G.P. ag Distribution",
   "Supplies & operations",
   1804.46,
   1
  ],
  [
   "2026-07",
   "Robitaille Equipement Inc.",
   "Supplies & operations",
   1673.47,
   1
  ],
  [
   "2026-07",
   "Paquet, Lyne",
   "Professional services",
   1615,
   1
  ],
  [
   "2026-07",
   "Jalec Inc.",
   "Software & IT",
   1485.48,
   2
  ],
  [
   "2026-07",
   "Tremblay Grues Service Inc",
   "Contracts — works",
   1441.79,
   1
  ],
  [
   "2026-07",
   "Gérard Maheu Inc.",
   "Supplies & operations",
   1328.15,
   2
  ],
  [
   "2026-07",
   "Phaneuf Équipement Agricole",
   "Supplies & operations",
   1296.87,
   1
  ],
  [
   "2026-07",
   "D'Amour & Fils Inc. (R.S)",
   "Supplies & operations",
   1241.81,
   16
  ],
  [
   "2026-07",
   "Mécamobile Inc.",
   "Vehicle fuel & maintenance",
   1192.28,
   4
  ],
  [
   "2026-07",
   "DHC Avocats",
   "Legal — external counsel",
   1183.39,
   2
  ],
  [
   "2026-07",
   "9141855 Canada Inc.",
   "Vehicle fuel & maintenance",
   1173.84,
   1
  ],
  [
   "2026-07",
   "Martech Inc.",
   "Supplies & operations",
   1164.98,
   1
  ],
  [
   "2026-07",
   "Service Informatique D.L. Inc",
   "Software & IT",
   1129.06,
   2
  ],
  [
   "2026-07",
   "Discair Productions",
   "Professional services",
   1092.26,
   1
  ],
  [
   "2026-07",
   "9339-0953 Qc Inc",
   "Supplies & operations",
   1034.77,
   1
  ],
  [
   "2026-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   13096.42,
   76
  ],
  [
   "2026-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Contracts — works",
   1989.06,
   3
  ],
  [
   "2026-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   1963.27,
   6
  ],
  [
   "2026-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Software & IT",
   1754.39,
   12
  ],
  [
   "2026-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   702.35,
   9
  ],
  [
   "2026-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Salaries & HR",
   212.69,
   1
  ],
  [
   "2026-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   217.2,
   2
  ],
  [
   "2026-07",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Regional shares & memberships",
   684.1,
   2
  ]
 ]
};

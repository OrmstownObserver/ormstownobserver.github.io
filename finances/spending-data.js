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
 "generated": "2026-08-06",
 "provenance": {
  "source": "Notion — 💰 Municipal Spending Ledger (built exclusively from official procès-verbaux at ormstown.ca)",
  "official_fields": "months[].total, months[].session, months[].url, budget.*, entries amounts/line counts",
  "observer_fields": "categories, gloss (descriptions), entries grouping, months[].note_fr/note_en",
  "categories_method": "observer-rules-v2.1",
  "gloss_method": "observer-editorial-v1",
  "tolerances": {
   "2026-01": 0.12
  },
  "tolerance_note": "Reconciliation tolerance is 0.005 $ (penny-exact) except where documented; 2026-01 carries a 0.12 $ gap from two digits unreadable in the scanned annex (BCGO, ICS).",
  "categories_note": "v2.1 (2026-08-07): entries and category totals are regenerated from the line-level ledger export (finances/tools/rebuild-entries.js), with the payee rules of apply-category-rules.js applied per line. Unlike v2, grouped small lines now carry their line-accurate category, so refined categories (Utilities, Vehicle fuel & maintenance, Waste & recycling) are exact rather than floors.",
  "months_direct": {
   "2026-06": "Extracted from PV_2026-06-01_WEB.pdf (Annexe A, 214 lines), reconciled to every printed subtotal; fully itemized in the Notion ledger on 2026-08-06 (214 lines = 857,483.73, query-verified)."
  }
 },
 "availability_fr": "<strong>Ce que la Municipalité a rendu public :</strong> les procès-verbaux sont publiés jusqu'aux séances de <strong>juin 2026</strong>, et cette page détaille les listes de dépenses jusqu'à la séance du <strong>1<sup>er</sup> juin 2026</strong>. Les PV des séances de juillet et d'août paraîtront de 4 à 6 semaines après leur adoption; leurs listes s'ajouteront ici dès leur publication.",
 "availability_en": "<strong>What the Town has made public:</strong> minutes are published up to the <strong>June 2026</strong> sittings, and this page itemizes the spending lists up to the <strong>June 1, 2026</strong> sitting. Minutes of the July and August sittings will appear 4–6 weeks after adoption; their lists will be added here as soon as they are published.",
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
  }
 },
 "months": [
  {
   "m": "2025-10",
   "label_fr": "Octobre 2025",
   "label_en": "October 2025",
   "total": 329508.05,
   "coverage": "partial",
   "session": "Séance extraordinaire 2025-10-02 (rés. 25-10-283)",
   "url": "https://www.ormstown.ca/wp-content/uploads/2025-10-02-Extra.pdf",
   "cats": {
    "Legal — external counsel": [
     8304.07,
     3
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
     350191.29,
     16
    ],
    "Salaries & HR": [
     310513.95,
     22
    ],
    "Waste & recycling": [
     109283.02,
     5
    ],
    "Professional services": [
     105219.31,
     49
    ],
    "Supplies & operations": [
     75585.14,
     102
    ],
    "Utilities": [
     28102.04,
     12
    ],
    "Legal — external counsel": [
     21642.12,
     10
    ],
    "Other": [
     17919.04,
     22
    ],
    "Vehicle fuel & maintenance": [
     17439.7,
     77
    ],
    "Subsidies & community": [
     1500,
     1
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
     18659.91,
     4
    ],
    "Supplies & operations": [
     15050.99,
     18
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
     3891.41,
     30
    ],
    "Contracts — works": [
     3136.94,
     2
    ],
    "Other": [
     1204.42,
     4
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
     135152.23,
     117
    ],
    "Contracts — works": [
     67745.82,
     17
    ],
    "Other": [
     39387,
     1
    ],
    "Professional services": [
     35658.24,
     16
    ],
    "Subsidies & community": [
     31430.38,
     2
    ],
    "Vehicle fuel & maintenance": [
     20743.43,
     102
    ],
    "Utilities": [
     18983.16,
     14
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
     180760.25,
     7
    ],
    "Professional services": [
     115904.88,
     36
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
     39833.37,
     76
    ],
    "Legal — external counsel": [
     32422.11,
     10
    ],
    "Waste & recycling": [
     31833.44,
     1
    ],
    "Utilities": [
     30703.65,
     8
    ],
    "Other": [
     7026.08,
     9
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
    "Professional services": [
     63925.44,
     27
    ],
    "Contracts — works": [
     49792.84,
     12
    ],
    "Supplies & operations": [
     33478.58,
     60
    ],
    "Waste & recycling": [
     30954.47,
     1
    ],
    "Utilities": [
     20409.19,
     11
    ],
    "Legal — external counsel": [
     18508.14,
     13
    ],
    "Other": [
     6553.87,
     5
    ],
    "Vehicle fuel & maintenance": [
     2892.95,
     7
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
    "Other": [
     334131.13,
     4
    ],
    "Salaries & HR": [
     200566.42,
     11
    ],
    "Professional services": [
     108833.57,
     29
    ],
    "Supplies & operations": [
     102272.01,
     70
    ],
    "Waste & recycling": [
     45489.22,
     1
    ],
    "Utilities": [
     24220.25,
     29
    ],
    "Contracts — works": [
     16299.03,
     12
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
    ]
   }
  }
 ],
 "entries": [
  [
   "2025-10",
   "Dunton Rainville S.E.N.C.R.L.",
   "Legal — external counsel",
   8304.07,
   3
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
   "Professional services",
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
   "Supplies & operations",
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
   "Visa Desjardins",
   "Supplies & operations",
   8575.9,
   5
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
   "Professional services",
   6058.5,
   14
  ],
  [
   "2026-01",
   "FQM",
   "Other",
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
   "Other",
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
   "Other",
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
   "Other",
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
   "Other",
   1326.86,
   1
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
   "Other",
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
   "Service Informatique D.L. Inc",
   "Supplies & operations",
   1014.08,
   1
  ],
  [
   "2026-01",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   10648.32,
   63
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
   "Professional services",
   1891.48,
   7
  ],
  [
   "2026-01",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Other",
   1578.21,
   11
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
   "Legal — external counsel",
   422.25,
   1
  ],
  [
   "2026-01",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   446.92,
   2
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
   2022.73,
   11
  ],
  [
   "2026-02",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   148.04,
   2
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
   "Other",
   1204.42,
   4
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
   242.68,
   2
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
   "Other",
   39387,
   1
  ],
  [
   "2026-03",
   "CRSBP Montérégie Inc.",
   "Subsidies & community",
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
   "Professional services",
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
   "Professional services",
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
   "Professional services",
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
   13756.14,
   86
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
   1170.65,
   10
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
   "Professional services",
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
   "Salaries & HR",
   20913.51,
   2
  ],
  [
   "2026-04",
   "2547-0857 Québec Inc. (Infotech)",
   "Professional services",
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
   "Visa Desjardins",
   "Supplies & operations",
   7561.92,
   7
  ],
  [
   "2026-04",
   "Pg Solutions",
   "Professional services",
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
   "Other",
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
   "Professional services",
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
   "Other",
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
   854.79,
   4
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   8374.39,
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
   2234.57,
   9
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Other",
   2163.63,
   7
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Contracts — works",
   857.81,
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
   "Professional services",
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
   "Other",
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
   "Professional services",
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
   "Service Informatique D.L. Inc",
   "Professional services",
   1324.52,
   4
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
   "Professional services",
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
   "Service Informatique D.L. Inc",
   "Supplies & operations",
   1014.08,
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
   7345.14,
   45
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
   "Contracts — works",
   709.97,
   1
  ],
  [
   "2026-05",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Vehicle fuel & maintenance",
   975.7,
   6
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
   "Other",
   1036.25,
   4
  ],
  [
   "2026-05",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Utilities",
   244.98,
   2
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
   "Other",
   183336.75,
   1
  ],
  [
   "2026-06",
   "FQM Assurances Inc.",
   "Other",
   97472.16,
   1
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
   "Other",
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
   "Professional services",
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
   "Professional services",
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
   "Professional services",
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
   "FQM Assurances Inc.",
   "Salaries & HR",
   2148.39,
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
   "Professional services",
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
   8048.06,
   55
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
   993.67,
   4
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
  ]
 ]
};

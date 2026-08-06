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
// Generated: 2026-08-06
// ============================================================
window.OO_SPENDING = {
 "generated": "2026-08-06",
 "provenance": {
  "source": "Notion — 💰 Municipal Spending Ledger (built exclusively from official procès-verbaux at ormstown.ca)",
  "official_fields": "months[].total, months[].session, months[].url, budget.*, entries amounts/line counts",
  "observer_fields": "categories, gloss (descriptions), entries grouping, months[].note_fr/note_en",
  "categories_method": "observer-manual-v1",
  "gloss_method": "observer-editorial-v1",
  "tolerances": { "2026-01": 0.12 },
  "tolerance_note": "Reconciliation tolerance is 0.005 $ (penny-exact) except where documented; 2026-01 carries a 0.12 $ gap from two digits unreadable in the scanned annex (BCGO, ICS)."
 },
 "availability_fr": "<strong>Ce que la Municipalité a rendu public :</strong> les procès-verbaux sont publiés jusqu'aux séances de <strong>juin 2026</strong> (1<sup>er</sup> et 15 juin). Cette page détaille les listes de dépenses jusqu'à la séance du <strong>4 mai 2026</strong>; les listes des séances de juin sont en cours d'ajout. Les PV paraissent normalement de 4 à 6 semaines après leur adoption; les dépenses les plus récentes s'ajoutent donc ici au fil de leur publication.",
 "availability_en": "<strong>What the Town has made public:</strong> minutes are published up to the <strong>June 2026</strong> sittings (June 1 and 15). This page itemizes the spending lists up to the <strong>May 4, 2026</strong> sitting; the June lists are being added. Minutes normally appear 4–6 weeks after adoption; the most recent spending is added here as it is published.",
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
     459474.31,
     21
    ],
    "Salaries & HR": [
     310513.95,
     22
    ],
    "Supplies & operations": [
     121126.88,
     191
    ],
    "Professional services": [
     105219.31,
     49
    ],
    "Legal — external counsel": [
     21642.12,
     10
    ],
    "Other": [
     17919.04,
     22
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
    "Contracts — works": [
     51357.04,
     4
    ],
    "Supplies & operations": [
     37602.31,
     52
    ],
    "Legal — external counsel": [
     13380.26,
     3
    ],
    "Professional services": [
     10898.2,
     5
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
     174878.82,
     233
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
    "Supplies & operations": [
     113033.42,
     149
    ],
    "Contracts — works": [
     112515.28,
     13
    ],
    "Legal — external counsel": [
     32422.11,
     10
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
    "Contracts — works": [
     80747.31,
     13
    ],
    "Professional services": [
     63925.44,
     27
    ],
    "Supplies & operations": [
     56780.72,
     78
    ],
    "Legal — external counsel": [
     18508.14,
     13
    ],
    "Other": [
     6553.87,
     5
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
   "Contracts — works",
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
   "Supplies & operations",
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   11852.15,
   66
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
   "Supplies & operations",
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
   "Supplies & operations",
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
   "Supplies & operations",
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
   "Supplies & operations",
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Other",
   1578.21,
   11
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
   "DR Conseils s.e.c.",
   "Professional services",
   1535.46,
   2
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   1469.23,
   6
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
   "Supplies & operations",
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
   "Service Informatique D.L. Inc",
   "Supplies & operations",
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
   "2026-02",
   "— (paie municipale)",
   "Salaries & HR",
   143802.32,
   1
  ],
  [
   "2026-02",
   "Robert Daoust Et Fils Inc.",
   "Contracts — works",
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
   "Supplies & operations",
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Salaries & HR",
   4237.92,
   34
  ],
  [
   "2026-02",
   "9534-8702 Québec Inc. (Petro Canada)",
   "Supplies & operations",
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   2413.45,
   15
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
   "Ouellett Samantha",
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Other",
   1204.42,
   4
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
   "Professional services",
   678.44,
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
   "Contracts — works",
   31833.44,
   1
  ],
  [
   "2026-04",
   "Hydro-Québec",
   "Supplies & operations",
   29848.86,
   4
  ],
  [
   "2026-04",
   "SAAQ Société ass. Automobile",
   "Supplies & operations",
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
   "Supplies & operations",
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   9546.46,
   52
  ],
  [
   "2026-04",
   "9534-8702 Québec Inc. (Petro Canada)",
   "Supplies & operations",
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   2234.57,
   9
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Other",
   2163.63,
   7
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
   "Contracts — works",
   857.81,
   1
  ],
  [
   "2026-04",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Legal — external counsel",
   855.38,
   2
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Supplies & operations",
   31144.55,
   74
  ],
  [
   "2026-05",
   "Robert Daoust Et Fils Inc.",
   "Contracts — works",
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
   "Supplies & operations",
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Professional services",
   16553.25,
   22
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Contracts — works",
   11046.94,
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
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Other",
   1036.25,
   4
  ],
  [
   "2026-05",
   "— Autres fournisseurs (voir PV) / Other suppliers (see minutes)",
   "Legal — external counsel",
   917.22,
   3
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
   "Complexe Médical Ormstown inc",
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
   "Supplies & operations",
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
   "Supplies & operations",
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
   "Supplies & operations",
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
   "Supplies & operations",
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
   "Service Informatique D.L. Inc.",
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
   "Supplies & operations",
   15171.12,
   98
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
   "Legal — external counsel",
   223.34,
   1
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
  ]
 ]
};

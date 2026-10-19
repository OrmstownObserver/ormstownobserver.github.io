// ============================================================
// Ormstown Observer — the Ledger's context: the "why" beside the numbers.
// HAND-AUTHORED. Not generated, and nothing in the ingest pipeline
// (tools/) writes it, so a ledger rebuild never touches it.
//
// Three groups, keyed by what the ledger already has:
//   categories  category URL slug (ledger-data.js SLUGS)
//   sittings    YYYY-MM, as in spending-data.js months[].m
//   payees      payee slug, as frozen in tests/payee-slugs.json
//
// Each entry:  { en, fr,                 one or two plain sentences
//                points: [{ en, fr, src }],   a fact and ITS source
//                quote:  { en, fr, who: {en, fr}, src },   optional
//                links:  [{ kind, en, fr, href_en, href_fr }] }
// A source / link: { kind, href_en, href_fr, en?, fr? }   (en/fr = label)
// kinds: recap (Council Watch) · story · minutes · document · budget ·
//        method · ledger
//
// RULES (node finances/tests/validate.js, check 13, enforces the
// mechanical ones):
//  - Every point says where it comes from. A figure is either printed in
//    the official minutes (src kind "minutes", the sitting's PV) or in a
//    page the Observer has published. "Works out to" figures are the
//    Observer's arithmetic on printed lines, and say so.
//  - A figure taken from a Council Watch page is carried here only when
//    that page sources it to the minutes, an official document or the
//    Observer in the room. A figure the page took from the recording is
//    not restated: link the page instead, and let it carry its caveat.
//  - A quote must already be published on an Observer page (where it
//    passed the newsroom's sourcing rules) or be in an official record.
//    Never a quote whose only source is an auto-transcript.
//  - No judgement. Explain what the money is for; let the reader judge.
//  - Plain text only: the page renders it with textContent.
//  - Links: pages of this site (/en/…, /fr/…, /finances/…) or documents
//    on www.ormstown.ca. Both languages, each to its own page.
// ============================================================
window.OO_LEDGER_CONTEXT = {
 "updated": "2026-10-19",
 "categories": {
  "salaries-hr": {
   "en": "What it costs to employ the Town's staff: the payroll itself, the source deductions sent on to Revenu Québec and the Receiver General, the employees' group RRSP, plus training and job postings. Payroll appears in the minutes as one lump sum per sitting, so no one's individual pay can be read here.",
   "fr": "Ce que coûte le personnel de la Municipalité : la paie elle-même, les retenues à la source remises à Revenu Québec et au Receveur général, le REER collectif des employés, ainsi que la formation et les offres d'emploi. La paie figure au procès-verbal comme un seul montant par séance : le salaire d'une personne ne peut donc pas se lire ici.",
   "points": [
    {
     "en": "On September 8, 2026, council opened hiring for a full-time fire-service director, a post that will add to this category once filled.",
     "fr": "Le 8 septembre 2026, le conseil a lancé l'embauche d'un directeur du service incendie à temps plein, un poste qui s'ajoutera à cette catégorie une fois pourvu.",
     "src": {
      "kind": "recap",
      "href_en": "/en/council-watch/full-time-fire-chief-emergency-plan/",
      "href_fr": "/fr/conseil-municipal/directeur-incendie-temps-plein/"
     }
    }
   ],
   "links": [
    {
     "kind": "method",
     "en": "How the Observer sorts each line",
     "fr": "Comment l'Observer classe chaque ligne",
     "href_en": "/finances/budget/#method",
     "href_fr": "/finances/budget/#method"
    }
   ]
  },
  "contracts-works": {
   "en": "Construction and repair work done for the Town by contractors: paving, the town hall renovation, the splash pad, electrical work at the pumping stations. Large contracts are awarded by a council resolution of their own, and the payment list then cites that resolution as each instalment (\"décompte\") is paid.",
   "fr": "Les travaux de construction et de réfection confiés à des entrepreneurs : pavage, rénovation de l'hôtel de ville, jeux d'eau, électricité des postes de pompage. Les gros contrats sont accordés par une résolution distincte du conseil, que la liste de paiements cite ensuite à chaque décompte versé.",
   "points": [
    {
     "en": "The largest single line in the ledger: $1,112,884 to Ali Excavation for paving Upper Concession, on the January 20, 2025 list.",
     "fr": "La plus grosse ligne du grand livre : 1 112 884 $ à Ali Excavation pour le pavage de la montée Upper Concession, à la liste du 20 janvier 2025.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Jan. 20, 2025",
      "fr": "PV du 20 janv. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-01-20_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-01-20_PV.pdf"
     }
    },
    {
     "en": "On the July 14, 2025 list, a further $730,176 to Ali Excavation, described as a final settlement agreement under resolution 25-06-213.",
     "fr": "À la liste du 14 juillet 2025, 730 176 $ de plus à Ali Excavation, décrits comme le règlement d'une entente finale en vertu de la résolution 25-06-213.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, July 14, 2025",
      "fr": "PV du 14 juill. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-07-14_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-07-14_PV.pdf"
     }
    },
    {
     "en": "The splash pad was built in two phases: equipment from Les Industries Simexco and installation by Installation Jeux-Tec in 2025 (phase 1), then $149,347 to Jeux-Tec for phase 2 on the July 6, 2026 list.",
     "fr": "Les jeux d'eau ont été construits en deux phases : équipement des Industries Simexco et installation par Installation Jeux-Tec en 2025 (phase 1), puis 149 347 $ à Jeux-Tec pour la phase 2 à la liste du 6 juillet 2026.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, July 6, 2026",
      "fr": "PV du 6 juill. 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf"
     }
    }
   ],
   "links": [
    {
     "kind": "recap",
     "en": "The Town buys into three private lots to loop the water main",
     "fr": "La Municipalité acquiert des parcelles pour boucler l'aqueduc",
     "href_en": "/en/council-watch/buys-three-lots-loop-water-main/",
     "href_fr": "/fr/conseil-municipal/parcelles-pour-boucler-aqueduc/"
    }
   ]
  },
  "supplies-operations": {
   "en": "The day-to-day running of the Town: road salt, gravel and asphalt, water meters, hardware, signage, office supplies, library books and the library's rent, and the many small purchases grouped as \"other suppliers\".",
   "fr": "Le fonctionnement courant de la Municipalité : sel de déglaçage, gravier et asphalte, compteurs d'eau, quincaillerie, signalisation, fournitures de bureau, livres de la bibliothèque et loyer de celle-ci, et les nombreux petits achats regroupés sous « autres fournisseurs ».",
   "points": [
    {
     "en": "The library's premises are rented from Complexe Médical Ormstown: about $9,900 a month through February 2026, about $7,000 a month for April to June 2026.",
     "fr": "Les locaux de la bibliothèque sont loués au Complexe Médical Ormstown : environ 9 900 $ par mois jusqu'en février 2026, environ 7 000 $ par mois d'avril à juin 2026.",
     "src": {
      "kind": "ledger",
      "en": "Ledger lines",
      "fr": "Lignes du grand livre",
      "href_en": "/finances/",
      "href_fr": "/finances/"
     }
    },
    {
     "en": "Water meters: $57,843 to Compteurs d'Eau du Québec under resolution 26-04-112, on the June 1, 2026 list.",
     "fr": "Compteurs d'eau : 57 843 $ à Compteurs d'Eau du Québec en vertu de la résolution 26-04-112, à la liste du 1er juin 2026.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, June 1, 2026",
      "fr": "PV du 1er juin 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf"
     }
    }
   ]
  },
  "professional-services": {
   "en": "Outside experts the Town hires for a job rather than keeping on staff: engineers, architects, surveyors, geotechnical and environmental consultants, laboratories, and event organizers. Lawyers have their own category.",
   "fr": "Les experts externes que la Municipalité engage pour un mandat plutôt que d'avoir à son emploi : ingénieurs, architectes, arpenteurs, consultants en géotechnique et en environnement, laboratoires et organisateurs d'événements. Les avocats ont leur propre catégorie.",
   "points": [
    {
     "en": "Most of it is Artelia Canada's engineering mandate under resolution 25-02-065: preliminary and final plans and specifications, and geotechnical and ecological studies, for the street-rebuild infrastructure works.",
     "fr": "L'essentiel est le mandat d'ingénierie d'Artelia Canada, en vertu de la résolution 25-02-065 : plans et devis préliminaires et définitifs, et études géotechnique et écologique, pour les travaux d'infrastructure de réfection des rues.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Sept. 8, 2025",
      "fr": "PV du 8 sept. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-09-08.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-09-08.pdf"
     }
    },
    {
     "en": "$50,687 to Solmatech for environmental characterization of soils under resolution 26-06-163, on the August 3, 2026 list.",
     "fr": "50 687 $ à Solmatech pour la caractérisation environnementale des sols en vertu de la résolution 26-06-163, à la liste du 3 août 2026.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Aug. 3, 2026",
      "fr": "PV du 3 août 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf"
     }
    }
   ]
  },
  "legal-services": {
   "en": "Fees of outside law firms and of the municipal court prosecutor. The payment lists name the firm and usually a file number, but not what the case is about, so most of these lines cannot be explained from the minutes alone.",
   "fr": "Les honoraires des cabinets d'avocats externes et de la procureure à la cour municipale. Les listes de paiements nomment le cabinet et souvent un numéro de dossier, mais pas l'objet de l'affaire : la plupart de ces lignes ne peuvent donc pas s'expliquer par le seul procès-verbal.",
   "points": [
    {
     "en": "Two Dunton Rainville invoices labelled \"Projet Élections\" under resolution 25-07-225, around the November 2025 municipal election: $16,687 (Nov. 17 list) and $18,130 (Dec. 1 list).",
     "fr": "Deux factures de Dunton Rainville intitulées « Projet Élections », en vertu de la résolution 25-07-225, autour de l'élection municipale de novembre 2025 : 16 687 $ (liste du 17 novembre) et 18 130 $ (liste du 1er décembre).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Dec. 1, 2025",
      "fr": "PV du 1er déc. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2025-12-01-Signe.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2025-12-01-Signe.pdf"
     }
    }
   ]
  },
  "subsidies-community": {
   "en": "Grants and donations to local organizations, school bursaries, and help for community events. It is one of the smallest categories in the ledger.",
   "fr": "Les subventions et dons aux organismes locaux, les bourses scolaires et l'aide aux événements communautaires. C'est l'une des plus petites catégories du grand livre.",
   "points": [
    {
     "en": "The Livestock Breeders Association received $5,000 in 2025 (resolution 25-02-067) and $5,000 in 2026 (resolution 26-04-126).",
     "fr": "La Livestock Breeders Association a reçu 5 000 $ en 2025 (résolution 25-02-067) et 5 000 $ en 2026 (résolution 26-04-126).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, June 1, 2026",
      "fr": "PV du 1er juin 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf"
     }
    }
   ],
   "links": [
    {
     "kind": "recap",
     "en": "Who gets the Rec-Center? The new policy for local non-profits",
     "fr": "Qui obtient la salle? La nouvelle politique pour les OBNL locaux",
     "href_en": "/en/council-watch/who-gets-the-rec-center/",
     "href_fr": "/fr/conseil-municipal/qui-obtient-la-salle/"
    }
   ]
  },
  "financing-debt": {
   "en": "Loan principal and interest. Borrowing itself is decided by by-law, not on the payment lists, and no line on the lists itemized so far falls in this category.",
   "fr": "Le capital et les intérêts des emprunts. L'emprunt lui-même se décide par règlement, et non aux listes de paiements; aucune ligne des listes détaillées jusqu'ici ne tombe dans cette catégorie.",
   "links": [
    {
     "kind": "recap",
     "en": "Two borrowing by-laws, $4.8 million",
     "fr": "Deux règlements d'emprunt, 4,8 millions $",
     "href_en": "/en/council-watch/borrowing-172-173-2026/",
     "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/"
    }
   ]
  },
  "utilities": {
   "en": "Electricity, telephone, internet and propane for municipal buildings and equipment. Almost all of it is Hydro-Québec.",
   "fr": "L'électricité, le téléphone, Internet et le propane des bâtiments et équipements municipaux. Presque tout va à Hydro-Québec."
  },
  "vehicle-fuel-maintenance": {
   "en": "Fuel, repairs, parts, towing and registration for the Town's trucks and equipment, and vehicle purchases.",
   "fr": "Le carburant, les réparations, les pièces, le remorquage et l'immatriculation des camions et de l'équipement municipaux, ainsi que l'achat de véhicules.",
   "points": [
    {
     "en": "Two 2024 Chevrolet Silverado trucks, $122,073 from Valleyfield Chevrolet, on the March 3, 2025 list.",
     "fr": "Deux camionnettes Chevrolet Silverado 2024, 122 073 $ chez Valleyfield Chevrolet, à la liste du 3 mars 2025.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Mar. 3, 2025",
      "fr": "PV du 3 mars 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-03-03_PV-1.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-03-03_PV-1.pdf"
     }
    }
   ]
  },
  "waste-recycling": {
   "en": "Garbage, recycling and leaf collection, almost all by Robert Daoust et Fils, plus containers at the écocentre. Garbage is billed by the tonne collected, so the bill moves with how much the town throws out; recycling is billed per collection.",
   "fr": "La collecte des ordures, du recyclage et des feuilles, presque entièrement par Robert Daoust et Fils, plus les conteneurs de l'écocentre. Les ordures sont facturées à la tonne recueillie : la facture suit donc ce que la ville jette. Le recyclage est facturé par collecte.",
   "points": [
    {
     "en": "Each garbage line gives the tonnage. Dividing amount by tonnes works out to $322.29 a tonne for 2025 collections and $334.21 a tonne for 2026 collections (the Observer's arithmetic).",
     "fr": "Chaque ligne d'ordures indique le tonnage. Le montant divisé par les tonnes donne 322,29 $ la tonne pour les collectes de 2025 et 334,21 $ la tonne pour celles de 2026 (calcul de l'Observer).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Aug. 3, 2026",
      "fr": "PV du 3 août 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf"
     }
    }
   ]
  },
  "regional-shares": {
   "en": "Ormstown's share of the costs of regional bodies it belongs to, billed as \"quotes-parts\": the MRC du Haut-Saint-Laurent, the regional arena in Huntingdon, the regional library network (CRSBP) and the regional housing office, plus association dues.",
   "fr": "La part d'Ormstown des coûts des organismes régionaux dont elle fait partie, facturée en quotes-parts : la MRC du Haut-Saint-Laurent, la patinoire régionale de Huntingdon, le réseau régional des bibliothèques (CRSBP) et l'office d'habitation, plus les cotisations aux associations.",
   "points": [
    {
     "en": "The MRC's share is paid in instalments: $148,664 each in 2025, $183,337 each in 2026 (the 1st and 2nd 2026 instalments, on the June 1 and July 6 lists).",
     "fr": "La quote-part de la MRC se paie en versements : 148 664 $ chacun en 2025, 183 337 $ chacun en 2026 (1er et 2e versements de 2026, aux listes du 1er juin et du 6 juillet).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, July 6, 2026",
      "fr": "PV du 6 juill. 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf"
     }
    }
   ]
  },
  "insurance": {
   "en": "The Town's combined municipal insurance, through FQM Assurances, and the employees' group insurance.",
   "fr": "L'assurance municipale combinée, par FQM Assurances, et l'assurance collective des employés.",
   "points": [
    {
     "en": "The 2026 combined municipal insurance, $97,472, renewed on April 13 and paid on the June 1, 2026 list.",
     "fr": "L'assurance municipale combinée de 2026, 97 472 $, renouvelée le 13 avril et payée à la liste du 1er juin 2026.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, June 1, 2026",
      "fr": "PV du 1er juin 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf"
     }
    }
   ]
  },
  "policing-sq": {
   "en": "Ormstown has no police force of its own: the Sûreté du Québec polices it, and the Town pays its share of the bill to the Ministre des Finances in instalments.",
   "fr": "Ormstown n'a pas de corps de police : la Sûreté du Québec dessert son territoire, et la Municipalité paie sa part de la facture au ministre des Finances, en versements.",
   "points": [
    {
     "en": "For 2025, two instalments of $335,458 and $335,457 (July 14 and Nov. 17, 2025 lists). The first 2026 instalment, on the July 6, 2026 list, is $356,381.",
     "fr": "Pour 2025, deux versements de 335 458 $ et 335 457 $ (listes du 14 juillet et du 17 novembre 2025). Le premier versement de 2026, à la liste du 6 juillet 2026, est de 356 381 $.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, July 6, 2026",
      "fr": "PV du 6 juill. 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf"
     }
    }
   ]
  },
  "software-it": {
   "en": "The software the Town runs on (municipal management, accounting, payroll), licences and subscriptions, and outside IT support.",
   "fr": "Les logiciels sur lesquels tourne la Municipalité (gestion municipale, comptabilité, paie), les licences et abonnements, et le soutien informatique externe."
  },
  "other": {
   "en": "Lines that fit no other category, mostly reimbursements to residents, for example for plumbing or drain damage.",
   "fr": "Les lignes qui n'entrent dans aucune autre catégorie, surtout des remboursements à des résidents, par exemple pour des dommages de plomberie ou de drain."
  }
 },
 "sittings": {
  "2025-01": {
   "en": "The largest list in the ledger, and one line explains most of it: the paving of Upper Concession.",
   "fr": "La plus grosse liste du grand livre, et une seule ligne en explique l'essentiel : le pavage de la montée Upper Concession.",
   "points": [
    {
     "en": "$1,112,884 to Ali Excavation for paving Upper Concession, more than half of the $1,908,530 approved that night.",
     "fr": "1 112 884 $ à Ali Excavation pour le pavage de la montée Upper Concession, plus de la moitié des 1 908 530 $ approuvés ce soir-là.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Jan. 20, 2025",
      "fr": "PV du 20 janv. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-01-20_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-01-20_PV.pdf"
     }
    }
   ]
  },
  "2025-02": {
   "en": "A small list, about a third of it payroll and source deductions. The largest other items are garbage and recycling collection, the regional library network's 2025 fee and electricity.",
   "fr": "Une petite liste, dont environ le tiers va à la paie et aux retenues à la source. Les autres gros postes sont la collecte des ordures et du recyclage, la tarification 2025 du réseau régional des bibliothèques et l'électricité.",
   "points": [
    {
     "en": "$25,995 to CRSBP Montérégie, the regional library network's 2025 annual fee.",
     "fr": "25 995 $ au CRSBP Montérégie, la tarification annuelle 2025 du réseau régional des bibliothèques.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Feb. 3, 2025",
      "fr": "PV du 3 févr. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-02-03_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-02-03_PV.pdf"
     }
    },
    {
     "en": "$12,848 to Diamètre Expert Conseil for fees on subdividing the council room, part of the town hall project.",
     "fr": "12 848 $ à Diamètre Expert Conseil en honoraires pour la subdivision de la salle du conseil, dans le cadre du projet de l'hôtel de ville.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Feb. 3, 2025",
      "fr": "PV du 3 févr. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-02-03_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-02-03_PV.pdf"
     }
    }
   ]
  },
  "2025-03": {
   "en": "Two pickup trucks are the largest item on this list, followed by the second progress payment on the Upper Concession paving and the Town's 2025 share of the regional arena.",
   "fr": "Deux camionnettes forment le plus gros poste de cette liste, suivies du deuxième décompte du pavage de la montée Upper Concession et de la quote-part 2025 de la patinoire régionale.",
   "points": [
    {
     "en": "$122,073 to Valleyfield Chevrolet for two 2024 Chevrolet Silverado trucks.",
     "fr": "122 073 $ à Valleyfield Chevrolet pour deux Chevrolet Silverado 2024.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Mar. 3, 2025",
      "fr": "PV du 3 mars 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-03-03_PV-1.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-03-03_PV-1.pdf"
     }
    },
    {
     "en": "$62,082 to Ali Excavation, progress payment #2 on the Upper Concession work.",
     "fr": "62 082 $ à Ali Excavation, décompte no 2 des travaux de la montée Upper Concession.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Mar. 3, 2025",
      "fr": "PV du 3 mars 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-03-03_PV-1.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-03-03_PV-1.pdf"
     }
    },
    {
     "en": "$33,040 to the Régie intermunicipale de la patinoire, Ormstown's 2025 share of the Huntingdon arena, and a $15,620 deposit (50%) to Savaria for the town hall's wheelchair lift.",
     "fr": "33 040 $ à la Régie intermunicipale de la patinoire, quote-part 2025 d'Ormstown pour l'aréna de Huntingdon, et un dépôt de 15 620 $ (50 %) à Savaria pour le monte-personne de l'hôtel de ville.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Mar. 3, 2025",
      "fr": "PV du 3 mars 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-03-03_PV-1.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-03-03_PV-1.pdf"
     }
    }
   ]
  },
  "2025-04": {
   "en": "The first 2025 instalment to the MRC and the year's insurance renewal lead this list, which also carries the first progress payment on the town hall renovation.",
   "fr": "Le premier versement de 2025 à la MRC et le renouvellement des assurances de l'année mènent cette liste, qui porte aussi le premier décompte de la rénovation de l'hôtel de ville.",
   "points": [
    {
     "en": "$148,664 to the MRC du Haut-Saint-Laurent (1st 2025 instalment), plus $54,056 to the MRC for maintenance work on the Grande décharge watercourse.",
     "fr": "148 664 $ à la MRC du Haut-Saint-Laurent (1er versement de 2025), plus 54 056 $ à la MRC pour l'entretien du cours d'eau de la Grande décharge.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Apr. 7, 2025",
      "fr": "PV du 7 avril 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-04-07_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-04-07_PV.pdf"
     }
    },
    {
     "en": "$87,300 to FQM Assurances for the 2025–2026 policy renewal.",
     "fr": "87 300 $ à FQM Assurances pour le renouvellement de la police 2025-2026.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Apr. 7, 2025",
      "fr": "PV du 7 avril 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-04-07_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-04-07_PV.pdf"
     }
    },
    {
     "en": "$39,973 to Construction Émery Paquette, progress payment #1 on the town hall work (resolution 25-02-064), and $28,514 to resurface the courts at the recreation centre.",
     "fr": "39 973 $ à Construction Émery Paquette, décompte no 1 des travaux de l'hôtel de ville (résolution 25-02-064), et 28 514 $ pour refaire le revêtement des terrains du centre récréatif.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Apr. 7, 2025",
      "fr": "PV du 7 avril 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-04-07_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-04-07_PV.pdf"
     }
    }
   ]
  },
  "2025-05": {
   "en": "A list without a large contract: payroll and source deductions are 38% of it, and two months of garbage collection (February and March) were billed on it.",
   "fr": "Une liste sans gros contrat : la paie et les retenues à la source en font 38 %, et deux mois de collecte des ordures (février et mars) y ont été facturés.",
   "points": [
    {
     "en": "$14,372 for Firefighter 1 training for six new firefighters.",
     "fr": "14 372 $ pour la formation Pompier 1 de six nouveaux pompiers.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, May 5, 2025",
      "fr": "PV du 5 mai 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-05-05_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-05-05_PV.pdf"
     }
    },
    {
     "en": "$12,435 to the Municipality of Franklin for snow clearing on Rang Dumas, winter 2024–2025.",
     "fr": "12 435 $ à la Municipalité de Franklin pour le déneigement du rang Dumas, hiver 2024-2025.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, May 5, 2025",
      "fr": "PV du 5 mai 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-05-05_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-05-05_PV.pdf"
     }
    }
   ],
   "links": [
    {
     "kind": "recap",
     "href_en": "/en/council-watch/april-13-2026/",
     "href_fr": "/fr/conseil-municipal/13-avril-2026/",
     "en": "April 13, 2026 sitting: the Rang Dumas agreement with Franklin",
     "fr": "séance du 13 avril 2026 : l'entente du rang Dumas avec Franklin"
    }
   ]
  },
  "2025-06": {
   "en": "The second 2025 instalment to the MRC is the largest item. The town hall work continues, with progress payment #2 to the contractor and the platform for the wheelchair lift.",
   "fr": "Le deuxième versement de 2025 à la MRC est le plus gros poste. Les travaux de l'hôtel de ville se poursuivent : décompte no 2 à l'entrepreneur et plateforme du monte-personne.",
   "points": [
    {
     "en": "$148,664 to the MRC du Haut-Saint-Laurent (2nd 2025 instalment).",
     "fr": "148 664 $ à la MRC du Haut-Saint-Laurent (2e versement de 2025).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, June 2, 2025",
      "fr": "PV du 2 juin 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-06-02_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-06-02_PV.pdf"
     }
    },
    {
     "en": "$48,286 to Construction Émery Paquette, progress payment #2 (resolution 25-02-064), and $12,496 to Savaria for the lift platform.",
     "fr": "48 286 $ à Construction Émery Paquette, décompte no 2 (résolution 25-02-064), et 12 496 $ à Savaria pour la plateforme du monte-personne.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, June 2, 2025",
      "fr": "PV du 2 juin 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-06-02_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-06-02_PV.pdf"
     }
    },
    {
     "en": "$32,536 to Marquage et Traçage du Québec for painting road lines in 2025.",
     "fr": "32 536 $ à Marquage et Traçage du Québec pour le lignage des chemins en 2025.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, June 2, 2025",
      "fr": "PV du 2 juin 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-06-02_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-06-02_PV.pdf"
     }
    }
   ]
  },
  "2025-07": {
   "en": "A $1.8-million list, carried by three large items: a final settlement with the paving contractor, the first half of the 2025 police bill, and two progress payments on the town hall renovation.",
   "fr": "Une liste de 1,8 million $, portée par trois gros postes : un règlement final avec l'entrepreneur en pavage, la première moitié de la facture policière de 2025 et deux décomptes de la rénovation de l'hôtel de ville.",
   "points": [
    {
     "en": "$730,176 to Ali Excavation, described as a final settlement agreement under resolution 25-06-213.",
     "fr": "730 176 $ à Ali Excavation, décrits comme le règlement d'une entente finale en vertu de la résolution 25-06-213.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, July 14, 2025",
      "fr": "PV du 14 juill. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-07-14_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-07-14_PV.pdf"
     }
    },
    {
     "en": "$335,458 to the Ministre des Finances for Sûreté du Québec policing in 2025.",
     "fr": "335 458 $ au ministre des Finances pour les services de la Sûreté du Québec en 2025.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, July 14, 2025",
      "fr": "PV du 14 juill. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-07-14_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-07-14_PV.pdf"
     }
    },
    {
     "en": "Progress payments #3 ($80,585) and #4 ($89,774) to Construction Émery Paquette for the town hall work (resolution 25-02-064).",
     "fr": "Décomptes no 3 (80 585 $) et no 4 (89 774 $) à Construction Émery Paquette pour les travaux de l'hôtel de ville (résolution 25-02-064).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, July 14, 2025",
      "fr": "PV du 14 juill. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-07-14_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-07-14_PV.pdf"
     }
    }
   ]
  },
  "2025-08": {
   "en": "The smallest list in the ledger. Payroll is more than a third of it; the splash pad equipment and the street-rebuild engineering are the largest other items.",
   "fr": "La plus petite liste du grand livre. La paie en représente plus du tiers; l'équipement des jeux d'eau et l'ingénierie de la réfection des rues sont les autres gros postes.",
   "points": [
    {
     "en": "$29,047 to Les Industries Simexco for splash pad equipment (phase 1) and $23,912 to Artelia Canada for preliminary plans and specifications (resolution 25-02-065).",
     "fr": "29 047 $ aux Industries Simexco pour l'équipement des jeux d'eau (phase 1) et 23 912 $ à Artelia Canada pour les plans et devis préliminaires (résolution 25-02-065).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Aug. 4, 2025",
      "fr": "PV du 4 août 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-08-04_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-08-04_PV.pdf"
     }
    },
    {
     "en": "$8,306 to J.R. Mécanique for pipe and hardware for the St-Paul well pump, marked \"URGENT\" on the list.",
     "fr": "8 306 $ à J.R. Mécanique pour un tuyau et de la quincaillerie pour la pompe du puits St-Paul, marqués « URGENT » à la liste.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Aug. 4, 2025",
      "fr": "PV du 4 août 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-08-04_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-08-04_PV.pdf"
     }
    }
   ]
  },
  "2025-09": {
   "en": "Engineering for the street rebuilds leads this list: $137,065 to Artelia Canada in two invoices under resolution 25-02-065, beside the MRC's third 2025 instalment.",
   "fr": "L'ingénierie de la réfection des rues mène cette liste : 137 065 $ à Artelia Canada en deux factures, en vertu de la résolution 25-02-065, à côté du troisième versement de 2025 à la MRC.",
   "points": [
    {
     "en": "$106,388 and $30,677 to Artelia Canada for preliminary plans and specifications for the infrastructure works.",
     "fr": "106 388 $ et 30 677 $ à Artelia Canada pour les plans et devis préliminaires des travaux d'infrastructure.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Sept. 8, 2025",
      "fr": "PV du 8 sept. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-09-08.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-09-08.pdf"
     }
    },
    {
     "en": "$148,664 to the MRC du Haut-Saint-Laurent (3rd 2025 instalment) and $20,000 to Les Industries Simexco for splash pad equipment.",
     "fr": "148 664 $ à la MRC du Haut-Saint-Laurent (3e versement de 2025) et 20 000 $ aux Industries Simexco pour l'équipement des jeux d'eau.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Sept. 8, 2025",
      "fr": "PV du 8 sept. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-09-08.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-09-08.pdf"
     }
    }
   ]
  },
  "2025-10": {
   "en": "An extraordinary sitting, a month before the November 2025 municipal election. Its list is led by splash pad equipment and Artelia Canada's completed phase 1 and 2 studies.",
   "fr": "Une séance extraordinaire, un mois avant l'élection municipale de novembre 2025. Sa liste est menée par l'équipement des jeux d'eau et les études des phases 1 et 2 d'Artelia Canada, terminées.",
   "points": [
    {
     "en": "$136,528 to Les Industries Simexco for splash pad equipment (phase 1) and $118,388 to Artelia Canada for its phase 1 and 2 studies, listed as 100% complete.",
     "fr": "136 528 $ aux Industries Simexco pour l'équipement des jeux d'eau (phase 1) et 118 388 $ à Artelia Canada pour ses études des phases 1 et 2, inscrites comme complétées à 100 %.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Oct. 2, 2025",
      "fr": "PV du 2 oct. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-10-02-Extra.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-10-02-Extra.pdf"
     }
    },
    {
     "en": "$13,797 to BCGO for the annual audit of 2024, and $13,506 to Solmatech for characterizing piled soil at 9 rue St-Paul.",
     "fr": "13 797 $ à BCGO pour l'audit annuel de 2024, et 13 506 $ à Solmatech pour la caractérisation de sols en piles au 9, rue St-Paul.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Oct. 2, 2025",
      "fr": "PV du 2 oct. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-10-02-Extra.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-10-02-Extra.pdf"
     }
    }
   ]
  },
  "2025-11": {
   "en": "The second half of the 2025 police bill and the last 2025 instalment to the MRC account for more than a third of this list.",
   "fr": "La seconde moitié de la facture policière de 2025 et le dernier versement de 2025 à la MRC représentent plus du tiers de cette liste.",
   "points": [
    {
     "en": "$335,457 to the Ministre des Finances for Sûreté du Québec services, and $148,664 to the MRC du Haut-Saint-Laurent (4th 2025 instalment).",
     "fr": "335 457 $ au ministre des Finances pour les services de la Sûreté du Québec, et 148 664 $ à la MRC du Haut-Saint-Laurent (4e versement de 2025).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Nov. 17, 2025",
      "fr": "PV du 17 nov. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-11-17.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-11-17.pdf"
     }
    },
    {
     "en": "$62,623 to Réfrigération Yvan Allison to replace a heating and air-conditioning system.",
     "fr": "62 623 $ à Réfrigération Yvan Allison pour le remplacement d'un système de chauffage et de climatisation.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Nov. 17, 2025",
      "fr": "PV du 17 nov. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-11-17.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-11-17.pdf"
     }
    }
   ]
  },
  "2025-12": {
   "en": "This list carries costs of the November 2025 election, legal support and printed ballots, and the Town's contribution to the regional housing office for 2024.",
   "fr": "Cette liste porte des coûts de l'élection de novembre 2025, soutien juridique et bulletins de vote imprimés, et la contribution de la Municipalité à l'office d'habitation régional pour 2024.",
   "points": [
    {
     "en": "$43,617 to the OH du Haut-Saint-Laurent, the municipal contribution under its 2024 financial statements (resolution 25-07-224).",
     "fr": "43 617 $ à l'OH du Haut-Saint-Laurent, contribution municipale selon ses états financiers 2024 (résolution 25-07-224).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Dec. 1, 2025",
      "fr": "PV du 1er déc. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2025-12-01-Signe.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2025-12-01-Signe.pdf"
     }
    },
    {
     "en": "$18,130 to Dunton Rainville labelled \"Projet Élections\" (resolution 25-07-225) and $11,334 to Les Formulaires Ducharme for the 2025 election ballots.",
     "fr": "18 130 $ à Dunton Rainville sous l'intitulé « Projet Élections » (résolution 25-07-225) et 11 334 $ aux Formulaires Ducharme pour les bulletins de vote de l'élection 2025.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Dec. 1, 2025",
      "fr": "PV du 1er déc. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2025-12-01-Signe.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2025-12-01-Signe.pdf"
     }
    }
   ]
  },
  "2026-01": {
   "en": "The largest item is the fifth progress payment on the town hall renovation.",
   "fr": "Le plus gros poste est le cinquième décompte de la rénovation de l'hôtel de ville.",
   "points": [
    {
     "en": "$225,767 to Construction Émery Paquette, progress payment #5 (resolution 25-02-064).",
     "fr": "225 767 $ à Construction Émery Paquette, décompte no 5 (résolution 25-02-064).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Jan. 19, 2026",
      "fr": "PV du 19 janv. 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2026-01-19-Signe.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2026-01-19-Signe.pdf"
     }
    }
   ]
  },
  "2026-02": {
   "en": "A quiet list: payroll and its source deductions are 65% of it.",
   "fr": "Une liste tranquille : la paie et les retenues à la source en font 65 %.",
   "points": [
    {
     "en": "The largest item other than payroll is December 2025 garbage collection, $36,386 to Robert Daoust et Fils for 112.90 tonnes.",
     "fr": "Le plus gros poste hors paie est la collecte des ordures de décembre 2025 : 36 386 $ à Robert Daoust et Fils pour 112,90 tonnes.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Feb. 2, 2026",
      "fr": "PV du 2 févr. 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2026-02-02.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2026-02-02.pdf"
     }
    }
   ]
  },
  "2026-03": {
   "en": "After payroll, this list is led by the year's regional fees and winter road salt.",
   "fr": "Après la paie, cette liste est menée par les tarifs régionaux de l'année et le sel de déglaçage de l'hiver.",
   "points": [
    {
     "en": "$39,387 to the Régie intermunicipale de la patinoire, Ormstown's 2026 share of the Huntingdon arena ($33,040 for 2025), and $26,997 to CRSBP Montérégie, the library network's 2026 fee ($25,995 for 2025).",
     "fr": "39 387 $ à la Régie intermunicipale de la patinoire, quote-part 2026 d'Ormstown pour l'aréna de Huntingdon (33 040 $ pour 2025), et 26 997 $ au CRSBP Montérégie, tarification 2026 du réseau des bibliothèques (25 995 $ pour 2025).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Mar. 2, 2026",
      "fr": "PV du 2 mars 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2026-03-02-pour-site-web.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2026-03-02-pour-site-web.pdf"
     }
    },
    {
     "en": "$50,361 to Mines Seleine for two deliveries of road salt, about 436 tonnes, under resolution 25-06-199.",
     "fr": "50 361 $ à Mines Seleine pour deux livraisons de sel de déglaçage, environ 436 tonnes, en vertu de la résolution 25-06-199.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Mar. 2, 2026",
      "fr": "PV du 2 mars 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2026-03-02-pour-site-web.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2026-03-02-pour-site-web.pdf"
     }
    }
   ]
  },
  "2026-04": {
   "en": "The sitting that adopted borrowing by-law 173-2026, $4.8 million for sewer, water and storm-sewer work on Prince-Albert, Cullen and Oliver, and awarded that work. Several amounts approved here were paid on later lists.",
   "fr": "La séance qui a adopté le règlement d'emprunt 173-2026, 4,8 millions $ pour l'égout, l'aqueduc et le pluvial des rues Prince-Albert, Cullen et Oliver, et qui a octroyé ces travaux. Plusieurs montants approuvés ce soir-là ont été payés aux listes suivantes.",
   "points": [
    {
     "en": "By-law 173-2026 adopted unanimously (resolution 26-04-102), borrowing over 40 years; the contract went to Groupe M. Potvin for $4,379,873.23 taxes included, conditional on Quebec approving the borrowing.",
     "fr": "Règlement 173-2026 adopté à l'unanimité (résolution 26-04-102), emprunt sur 40 ans; le contrat est allé à Groupe M. Potvin pour 4 379 873,23 $ taxes incluses, sous réserve de l'approbation de l'emprunt par Québec.",
     "src": {
      "kind": "recap",
      "href_en": "/en/council-watch/borrowing-172-173-2026/",
      "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/"
     }
    },
    {
     "en": "Approved here, paid on the June 1 list: water meters ($57,843, resolution 26-04-112), $5,000 for the Livestock Breeders Association (26-04-126) and $2,000 for the Royal Canadian Legion (26-04-089).",
     "fr": "Approuvés ici, payés à la liste du 1er juin : les compteurs d'eau (57 843 $, résolution 26-04-112), 5 000 $ pour la Livestock Breeders Association (26-04-126) et 2 000 $ pour la Légion royale canadienne (26-04-089).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, June 1, 2026",
      "fr": "PV du 1er juin 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf"
     }
    }
   ],
   "links": [
    {
     "kind": "recap",
     "href_en": "/en/council-watch/april-13-2026/",
     "href_fr": "/fr/conseil-municipal/13-avril-2026/",
     "en": "April 13, 2026 sitting",
     "fr": "séance du 13 avril 2026"
    },
    {
     "kind": "recap",
     "href_en": "/en/council-watch/borrowing-172-173-2026/",
     "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/",
     "en": "Two borrowing by-laws, $11.2 million",
     "fr": "Deux règlements d'emprunt, 11,2 millions $"
    }
   ]
  },
  "2026-05": {
   "en": "Water and new software lead this list: a sewer connection on Route 201, the search for new drinking-water sources, and the start-up of the Town's new PG Solutions software suite.",
   "fr": "L'eau et un nouveau logiciel mènent cette liste : un branchement d'égout sur la route 201, la recherche de nouvelles sources d'eau potable et la mise en route de la nouvelle suite logicielle PG Solutions.",
   "points": [
    {
     "en": "$34,176 to Excavation Usereau for a sewer connection on Route 201 (resolution 25-06-193).",
     "fr": "34 176 $ à Excavation Usereau pour un branchement d'égout sur la route 201 (résolution 25-06-193).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, May 4, 2026",
      "fr": "PV du 4 mai 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-05-04_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-05-04_WEB.pdf"
     }
    },
    {
     "en": "$18,122 to Orflow Géosciences for drinking-water research (resolution 25-09-266).",
     "fr": "18 122 $ à Orflow Géosciences pour la recherche en eau potable (résolution 25-09-266).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, May 4, 2026",
      "fr": "PV du 4 mai 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-05-04_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-05-04_WEB.pdf"
     }
    },
    {
     "en": "$14,783 to PG Solutions for start-up support and $8,986 more for the new \"SFM\" software (resolution 25-10-287).",
     "fr": "14 783 $ à PG Solutions pour l'accompagnement à la mise en route et 8 986 $ de plus pour le nouveau logiciel « SFM » (résolution 25-10-287).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, May 4, 2026",
      "fr": "PV du 4 mai 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-05-04_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-05-04_WEB.pdf"
     }
    }
   ]
  },
  "2026-06": {
   "en": "The 2025 financial statements were tabled at this sitting, and council restarted by-law 173-2026 after Quebec's municipal affairs ministry found errors in it. The list itself carries the first 2026 instalment to the MRC and the year's municipal insurance.",
   "fr": "Les états financiers 2025 ont été déposés à cette séance, et le conseil a relancé le règlement 173-2026 après que le ministère des Affaires municipales y eut relevé des erreurs. La liste elle-même porte le premier versement de 2026 à la MRC et l'assurance municipale de l'année.",
   "points": [
    {
     "en": "Notice of motion for by-law 173.1-2026 (resolution 26-06-162), because the ministry found errors about who could vote on the borrowing.",
     "fr": "Avis de motion du règlement 173.1-2026 (résolution 26-06-162), le ministère ayant relevé des erreurs quant aux personnes habiles à voter sur l'emprunt.",
     "src": {
      "kind": "recap",
      "href_en": "/en/council-watch/borrowing-172-173-2026/",
      "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/"
     }
    },
    {
     "en": "$183,337 to the MRC du Haut-Saint-Laurent (1st 2026 instalment) and $97,472 to FQM Assurances for the 2026 combined municipal insurance.",
     "fr": "183 337 $ à la MRC du Haut-Saint-Laurent (1er versement de 2026) et 97 472 $ à FQM Assurances pour l'assurance municipale combinée de 2026.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, June 1, 2026",
      "fr": "PV du 1er juin 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf"
     }
    },
    {
     "en": "$52,172 refunded to 9437-7843 Québec Inc.: the guarantee deposit on the rue Isabelle project.",
     "fr": "52 172 $ remboursés à 9437-7843 Québec Inc. : le dépôt de garantie du projet de la rue Isabelle.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, June 1, 2026",
      "fr": "PV du 1er juin 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf"
     }
    }
   ],
   "links": [
    {
     "kind": "recap",
     "href_en": "/en/council-watch/june-1-2026/",
     "href_fr": "/fr/conseil-municipal/1-juin-2026/",
     "en": "June 1, 2026 sitting",
     "fr": "séance du 1er juin 2026"
    },
    {
     "kind": "recap",
     "href_en": "/en/council-watch/borrowing-172-173-2026/",
     "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/",
     "en": "Two borrowing by-laws, $11.2 million",
     "fr": "Deux règlements d'emprunt, 11,2 millions $"
    }
   ]
  },
  "2026-07": {
   "en": "The first 2026 police instalment, the MRC's second instalment and phase 2 of the splash pad make up most of this list. Council also refinanced an old paving loan and fixed road-salt prices for three years.",
   "fr": "Le premier versement policier de 2026, le deuxième versement à la MRC et la phase 2 des jeux d'eau forment l'essentiel de cette liste. Le conseil a aussi refinancé un ancien emprunt de pavage et fixé le prix du sel pour trois ans.",
   "points": [
    {
     "en": "$356,381 for Sûreté du Québec services (1st 2026 instalment), $183,337 to the MRC (2nd instalment), $149,347 to Installation Jeux-Tec for splash pad phase 2.",
     "fr": "356 381 $ pour les services de la Sûreté du Québec (1er versement de 2026), 183 337 $ à la MRC (2e versement), 149 347 $ à Installation Jeux-Tec pour la phase 2 des jeux d'eau.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, July 6, 2026",
      "fr": "PV du 6 juill. 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf"
     }
    },
    {
     "en": "The $466,200 still owed on the 2019 paving loan for chemin de la Rivière-Châteauguay (by-law 117-2019) was refinanced, repayable 2027 to 2031.",
     "fr": "Les 466 200 $ restant dus sur l'emprunt de pavage de 2019 du chemin de la Rivière-Châteauguay (règlement 117-2019) ont été refinancés, remboursables de 2027 à 2031.",
     "src": {
      "kind": "recap",
      "href_en": "/en/council-watch/july-6-2026/",
      "href_fr": "/fr/conseil-municipal/6-juillet-2026/"
     }
    },
    {
     "en": "Road salt from Compass Minerals at $137.21 a tonne, fixed for three years, for about 750 tonnes a year.",
     "fr": "Sel de déglaçage de Compass Minerals à 137,21 $ la tonne, prix fixé pour trois ans, pour environ 750 tonnes par année.",
     "src": {
      "kind": "recap",
      "href_en": "/en/council-watch/july-6-2026/",
      "href_fr": "/fr/conseil-municipal/6-juillet-2026/"
     }
    }
   ],
   "links": [
    {
     "kind": "recap",
     "href_en": "/en/council-watch/july-6-2026/",
     "href_fr": "/fr/conseil-municipal/6-juillet-2026/",
     "en": "July 6, 2026 sitting",
     "fr": "séance du 6 juillet 2026"
    }
   ]
  },
  "2026-08": {
   "en": "The town hall renovation closed out on this list with its final progress payment. Council also awarded the 3e Rang and chemin de la Rivière-Châteauguay reconstruction, financed under borrowing by-law 172-2026; its payments are not on the lists itemized so far.",
   "fr": "La rénovation de l'hôtel de ville s'est conclue à cette liste par son décompte final. Le conseil a aussi octroyé la reconstruction du 3e Rang et du chemin de la Rivière-Châteauguay, financée par le règlement d'emprunt 172-2026; ses paiements ne figurent pas encore aux listes détaillées.",
   "points": [
    {
     "en": "Final progress payment #6 to Construction Émery Paquette, $64,944, less an $8,623 credit for epoxy work (resolution 25-02-064).",
     "fr": "Décompte final no 6 à Construction Émery Paquette, 64 944 $, moins un crédit de 8 623 $ pour les travaux d'époxy (résolution 25-02-064).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Aug. 3, 2026",
      "fr": "PV du 3 août 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf"
     }
    },
    {
     "en": "$50,687 to Solmatech for environmental characterization of soils (resolution 26-06-163).",
     "fr": "50 687 $ à Solmatech pour la caractérisation environnementale des sols (résolution 26-06-163).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Aug. 3, 2026",
      "fr": "PV du 3 août 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf"
     }
    }
   ],
   "links": [
    {
     "kind": "recap",
     "href_en": "/en/council-watch/august-3-2026/",
     "href_fr": "/fr/conseil-municipal/3-aout-2026/",
     "en": "August 3, 2026 sitting",
     "fr": "séance du 3 août 2026"
    },
    {
     "kind": "recap",
     "href_en": "/en/council-watch/borrowing-172-173-2026/",
     "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/",
     "en": "Two borrowing by-laws, $11.2 million",
     "fr": "Deux règlements d'emprunt, 11,2 millions $"
    }
   ]
  }
 },
 "payees": {
  "ali-excavation-inc": {
   "en": "The paving and road contractor behind the two largest lines in the ledger, and the winner of the Route 138A, 3e Rang, montée du Rocher and rang Tullochgorum contract awarded in June 2026.",
   "fr": "L'entrepreneur en pavage et en voirie derrière les deux plus grosses lignes du grand livre, et l'adjudicataire du contrat de la route 138A, du 3e Rang, de la montée du Rocher et du rang Tullochgorum octroyé en juin 2026.",
   "points": [
    {
     "en": "$1,112,884 for paving Upper Concession (Jan. 20, 2025 list).",
     "fr": "1 112 884 $ pour le pavage de la montée Upper Concession (liste du 20 janvier 2025).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Jan. 20, 2025",
      "fr": "PV du 20 janv. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-01-20_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-01-20_PV.pdf"
     }
    },
    {
     "en": "$730,176 described as a final settlement agreement under resolution 25-06-213 (July 14, 2025 list).",
     "fr": "730 176 $ décrits comme le règlement d'une entente finale en vertu de la résolution 25-06-213 (liste du 14 juillet 2025).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, July 14, 2025",
      "fr": "PV du 14 juill. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-07-14_PV.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-07-14_PV.pdf"
     }
    },
    {
     "en": "Awarded $4,136,554.78 taxes included on June 15, 2026 (resolution 26-06-182), the lowest of three bids; paid partly by a $3,704,749 provincial road grant, the rest under by-law 172-2026. Its payments are not on the lists itemized so far.",
     "fr": "Contrat de 4 136 554,78 $ taxes incluses octroyé le 15 juin 2026 (résolution 26-06-182), la plus basse de trois soumissions; payé en partie par une subvention routière provinciale de 3 704 749 $, le reste par le règlement 172-2026. Ses paiements ne figurent pas encore aux listes détaillées.",
     "src": {
      "kind": "recap",
      "href_en": "/en/council-watch/borrowing-172-173-2026/",
      "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/"
     }
    }
   ],
   "links": [
    {
     "kind": "recap",
     "href_en": "/en/council-watch/borrowing-172-173-2026/",
     "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/",
     "en": "Two borrowing by-laws, $11.2 million",
     "fr": "Deux règlements d'emprunt, 11,2 millions $"
    }
   ]
  },
  "construction-emery-paquette-inc": {
   "en": "The contractor for the town hall renovation (resolution 25-02-064), paid in six progress payments (\"décomptes\") from April 2025 to the final one in August 2026.",
   "fr": "L'entrepreneur de la rénovation de l'hôtel de ville (résolution 25-02-064), payé en six décomptes, d'avril 2025 au décompte final d'août 2026.",
   "points": [
    {
     "en": "Final progress payment #6, $64,944, less an $8,623 credit for epoxy work.",
     "fr": "Décompte final no 6, 64 944 $, moins un crédit de 8 623 $ pour les travaux d'époxy.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Aug. 3, 2026",
      "fr": "PV du 3 août 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf"
     }
    }
   ]
  },
  "ministre-des-finances": {
   "en": "Almost everything paid to the Ministre des Finances is the Sûreté du Québec policing bill: Ormstown has no police force of its own, and pays its share in instalments.",
   "fr": "Presque tout ce qui est versé au ministre des Finances est la facture de la Sûreté du Québec : Ormstown n'a pas de corps de police et paie sa part en versements.",
   "points": [
    {
     "en": "2025: $335,458 and $335,457. 2026: first instalment $356,381.",
     "fr": "2025 : 335 458 $ et 335 457 $. 2026 : premier versement de 356 381 $.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, July 6, 2026",
      "fr": "PV du 6 juill. 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf"
     }
    }
   ]
  },
  "robert-daoust-et-fils-inc": {
   "en": "The Town's garbage, recycling and leaf-collection contractor. Garbage is billed by the tonne, recycling by the collection.",
   "fr": "L'entrepreneur de la collecte des ordures, du recyclage et des feuilles. Les ordures sont facturées à la tonne, le recyclage à la collecte.",
   "points": [
    {
     "en": "Amount divided by the tonnage printed on each garbage line works out to $322.29 a tonne for 2025 collections and $334.21 for 2026 (the Observer's arithmetic).",
     "fr": "Le montant divisé par le tonnage inscrit à chaque ligne d'ordures donne 322,29 $ la tonne pour les collectes de 2025 et 334,21 $ pour celles de 2026 (calcul de l'Observer).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Aug. 3, 2026",
      "fr": "PV du 3 août 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-08-03_WEB.pdf"
     }
    }
   ]
  },
  "m-r-c-haut-saint-laurent": {
   "en": "The regional county municipality (MRC) Ormstown belongs to. The Town pays its share of the MRC's budget, the \"quotes-parts\", in instalments.",
   "fr": "La municipalité régionale de comté dont Ormstown fait partie. La Municipalité paie sa part du budget de la MRC, les quotes-parts, en versements.",
   "points": [
    {
     "en": "Instalments of $148,664 in 2025 and $183,337 in 2026.",
     "fr": "Versements de 148 664 $ en 2025 et de 183 337 $ en 2026.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, July 6, 2026",
      "fr": "PV du 6 juill. 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf"
     }
    }
   ]
  },
  "artelia-canada-inc": {
   "en": "The engineering firm on the street-rebuild infrastructure mandate (resolution 25-02-065): plans and specifications, and geotechnical and ecological studies. Its April 2026 estimate also defined the works in borrowing by-law 173-2026.",
   "fr": "La firme d'ingénierie du mandat d'infrastructure de réfection des rues (résolution 25-02-065) : plans et devis, études géotechnique et écologique. Son estimation d'avril 2026 a aussi défini les travaux du règlement d'emprunt 173-2026.",
   "links": [
    {
     "kind": "recap",
     "href_en": "/en/council-watch/borrowing-172-173-2026/",
     "href_fr": "/fr/conseil-municipal/emprunts-172-173-2026/",
     "en": "Two borrowing by-laws, $11.2 million",
     "fr": "Deux règlements d'emprunt, 11,2 millions $"
    },
    {
     "kind": "recap",
     "href_en": "/en/council-watch/october-6-2026/",
     "href_fr": "/fr/conseil-municipal/6-octobre-2026/",
     "en": "October 6, 2026: its contract amended",
     "fr": "séance du 6 octobre 2026 : son contrat modifié"
    }
   ]
  },
  "installation-jeux-tec-inc": {
   "en": "The splash pad installer: phase 1 in 2025, phase 2 on the July 6, 2026 list.",
   "fr": "L'installateur des jeux d'eau : phase 1 en 2025, phase 2 à la liste du 6 juillet 2026.",
   "points": [
    {
     "en": "$149,347 for phase 2 of the splash pad.",
     "fr": "149 347 $ pour la phase 2 des jeux d'eau.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, July 6, 2026",
      "fr": "PV du 6 juill. 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2026-07-06-WEB.pdf"
     }
    }
   ]
  },
  "fqm-assurances-inc": {
   "en": "The Town's insurer, through the Fédération québécoise des municipalités.",
   "fr": "L'assureur de la Municipalité, par la Fédération québécoise des municipalités.",
   "points": [
    {
     "en": "$97,472.16 for the 2026 combined municipal insurance, renewed on April 13 and paid on the June 1 list.",
     "fr": "97 472,16 $ pour l'assurance municipale combinée de 2026, renouvelée le 13 avril et payée à la liste du 1er juin.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, June 1, 2026",
      "fr": "PV du 1er juin 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-06-01_WEB.pdf"
     }
    }
   ],
   "links": [
    {
     "kind": "recap",
     "href_en": "/en/council-watch/april-13-2026/",
     "href_fr": "/fr/conseil-municipal/13-avril-2026/",
     "en": "April 13, 2026 sitting",
     "fr": "séance du 13 avril 2026"
    }
   ]
  },
  "pg-solutions": {
   "en": "The supplier of the Town's municipal management software. Under resolutions 25-10-286 and 25-10-287 (October 2025) the Town bought a new suite (\"SFM\") and start-up support, paid in pieces on the lists from January to August 2026.",
   "fr": "Le fournisseur du logiciel de gestion municipale. En vertu des résolutions 25-10-286 et 25-10-287 (octobre 2025), la Municipalité a acheté une nouvelle suite (« SFM ») et un accompagnement à la mise en route, payés par tranches aux listes de janvier à août 2026.",
   "points": [
    {
     "en": "$21,103 for the new SFM software on the January 19, 2026 list, the largest single payment.",
     "fr": "21 103 $ pour le nouveau logiciel SFM à la liste du 19 janvier 2026, le plus gros paiement.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Jan. 19, 2026",
      "fr": "PV du 19 janv. 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2026-01-19-Signe.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2026-01-19-Signe.pdf"
     }
    }
   ]
  },
  "savaria": {
   "en": "The supplier of the town hall's wheelchair lift (\"monte-personne\"), paid in three parts.",
   "fr": "Le fournisseur du monte-personne de l'hôtel de ville, payé en trois parties.",
   "points": [
    {
     "en": "A $15,620 deposit (50%, Mar. 2025), $12,496 for the platform (June 2025) and a $3,124 holdback (10%) released on the January 19, 2026 list.",
     "fr": "Un dépôt de 15 620 $ (50 %, mars 2025), 12 496 $ pour la plateforme (juin 2025) et une retenue de 3 124 $ (10 %) libérée à la liste du 19 janvier 2026.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Jan. 19, 2026",
      "fr": "PV du 19 janv. 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2026-01-19-Signe.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2026-01-19-Signe.pdf"
     }
    }
   ]
  },
  "regie-intermunicipale-de-la-patinoire": {
   "en": "The intermunicipal board that runs the regional arena in Huntingdon. Ormstown pays a yearly share.",
   "fr": "La régie intermunicipale qui exploite la patinoire régionale de Huntingdon. Ormstown paie une quote-part annuelle.",
   "points": [
    {
     "en": "$33,040 for 2025 (Mar. 3, 2025 list) and $39,387 for 2026 (Mar. 2, 2026 list).",
     "fr": "33 040 $ pour 2025 (liste du 3 mars 2025) et 39 387 $ pour 2026 (liste du 2 mars 2026).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Mar. 2, 2026",
      "fr": "PV du 2 mars 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2026-03-02-pour-site-web.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2026-03-02-pour-site-web.pdf"
     }
    }
   ]
  },
  "crsbp-monteregie-inc": {
   "en": "The regional library network (Réseau BIBLIO de la Montérégie) the Ormstown library belongs to. The Town pays a yearly fee plus operating costs.",
   "fr": "Le réseau régional des bibliothèques (Réseau BIBLIO de la Montérégie) auquel appartient la bibliothèque d'Ormstown. La Municipalité paie une tarification annuelle, plus des frais d'exploitation.",
   "points": [
    {
     "en": "Annual fee: $25,995 for 2025, $26,997 for 2026.",
     "fr": "Tarification annuelle : 25 995 $ pour 2025, 26 997 $ pour 2026.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Mar. 2, 2026",
      "fr": "PV du 2 mars 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2026-03-02-pour-site-web.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2026-03-02-pour-site-web.pdf"
     }
    }
   ]
  },
  "oh-du-haut-saint-laurent": {
   "en": "The regional housing office (Office d'habitation du Haut-Saint-Laurent), which runs low-rent housing in the region. Ormstown contributes its share of the office's yearly results.",
   "fr": "L'Office d'habitation du Haut-Saint-Laurent, qui gère des logements à loyer modique dans la région. Ormstown verse sa part des résultats annuels de l'office.",
   "points": [
    {
     "en": "$43,617 for 2024, under resolution 25-07-224, on the Dec. 1, 2025 list.",
     "fr": "43 617 $ pour 2024, en vertu de la résolution 25-07-224, à la liste du 1er décembre 2025.",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Dec. 1, 2025",
      "fr": "PV du 1er déc. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV-2025-12-01-Signe.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV-2025-12-01-Signe.pdf"
     }
    },
    {
     "en": "For 2025, the Observer reported the share presented at the July 6, 2026 sitting.",
     "fr": "Pour 2025, l'Observer a rapporté la part présentée à la séance du 6 juillet 2026.",
     "src": {
      "kind": "recap",
      "href_en": "/en/council-watch/july-6-2026/",
      "href_fr": "/fr/conseil-municipal/6-juillet-2026/"
     }
    }
   ]
  },
  "orflow-geosciences-inc": {
   "en": "Hydrogeology consultants working on the Town's drinking water: studies of its wells and the search for new sources.",
   "fr": "Consultants en hydrogéologie qui travaillent sur l'eau potable de la Municipalité : études de ses puits et recherche de nouvelles sources.",
   "points": [
    {
     "en": "$18,122 for drinking-water research under resolution 25-09-266 (May 4, 2026 list).",
     "fr": "18 122 $ pour la recherche en eau potable en vertu de la résolution 25-09-266 (liste du 4 mai 2026).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, May 4, 2026",
      "fr": "PV du 4 mai 2026",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/PV_2026-05-04_WEB.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/PV_2026-05-04_WEB.pdf"
     }
    }
   ],
   "links": [
    {
     "kind": "recap",
     "href_en": "/en/council-watch/april-13-2026/",
     "href_fr": "/fr/conseil-municipal/13-avril-2026/",
     "en": "April 13, 2026 sitting: hydrogeologist contract",
     "fr": "séance du 13 avril 2026 : contrat d'hydrogéologue"
    }
   ]
  },
  "les-industries-simexco-inc": {
   "en": "The supplier of the splash pad's equipment, phase 1, paid over three lists in 2025.",
   "fr": "Le fournisseur de l'équipement des jeux d'eau, phase 1, payé sur trois listes en 2025.",
   "points": [
    {
     "en": "$29,047 (Aug. 4), $20,000 (Sept. 8) and $136,528 (Oct. 2, 2025).",
     "fr": "29 047 $ (4 août), 20 000 $ (8 septembre) et 136 528 $ (2 octobre 2025).",
     "src": {
      "kind": "minutes",
      "en": "Minutes, Oct. 2, 2025",
      "fr": "PV du 2 oct. 2025",
      "href_en": "https://www.ormstown.ca/wp-content/uploads/2025-10-02-Extra.pdf",
      "href_fr": "https://www.ormstown.ca/wp-content/uploads/2025-10-02-Extra.pdf"
     }
    }
   ]
  }
 }
};

// ============================================================
// Ormstown Observer — the Ledger's lexicon: plain words → filters.
// HAND-AUTHORED. Nothing in the ingest pipeline (tools/) writes it.
//
// The query bar at the top of /finances/ parses what a reader types
// ("gas june 2025", "essence juin 2025", "dunton", "over 25,000 2026")
// into the same filters the rail offers. This file is the whole of what
// it understands; ledger-app.js (parseAsk) holds the mechanics and never
// calls any service. A word that is not here is searched as free text,
// exactly as before.
//
// Groups, keyed by what the ledger already has:
//   categories  category URL slug (ledger-data.js SLUGS) → words
//   suppliers   a short name → { en, fr (chip label), slugs: [...], words }
//               slugs are payee slugs (tests/payee-slugs.json, or a slug
//               the live store builds from payments.json). Several slugs
//               per supplier are normal: the minutes spell a name in
//               ALL CAPS one month and in full the next, and each
//               spelling has its own frozen slug.
//   views       tab name → words ("suppliers" opens the Suppliers tab)
//   amount      over / under / credits → words; a number must follow
//               over/under ("over 25,000", "plus de 25 000")
//   months      1..12 → words, full and short, both languages
//   time        lastSitting / thisYear / lastYear → phrases
//   stop        words dropped from the free text once anything else
//               matched ("how much did the Town spend on …")
//
// RULES (node finances/tests/validate.js, check 15, enforces them):
//  - Every target is real: a category slug in SLUGS, a tab, a payee slug
//    that resolves. A typo here would silently send a reader nowhere.
//  - Every entry carries words in BOTH languages (en and fr arrays); a
//    supplier's words are shared, its chip label is bilingual.
//  - A word belongs to ONE target only. Longest phrase wins at parse
//    time, so "hydro quebec" can be a supplier while "hydro" alone is
//    also the supplier, never the Utilities category as well.
//  - Words are matched accent- and case-insensitively on whole tokens:
//    "Essence", "essence" and "ESSENCE" are the same word; "gas" does
//    not match "gasket". Write them lower-case, accents optional.
//  - No judgement, no editorial words. "Legal fees" is a category; what
//    the reader thinks of them is theirs.
//  - Unsure about a synonym? Leave it out and note it in the hand-over:
//    a wrong chip is worse than a free-text search.
// ============================================================
window.OO_LEDGER_LEXICON = {
 "updated": "2026-10-30",

 "categories": {
  "salaries-hr": {
   "en": ["salary", "salaries", "payroll", "wages", "wage", "staff", "employees", "employee", "hr", "human resources", "training", "hiring"],
   "fr": ["salaire", "salaires", "paie", "personnel", "employes", "employe", "rh", "ressources humaines", "formation", "embauche"]
  },
  "contracts-works": {
   "en": ["contract", "contracts", "works", "paving", "construction", "renovation", "renovations", "asphalt", "contractor", "contractors", "infrastructure", "splash pad"],
   "fr": ["contrat", "contrats", "travaux", "pavage", "construction", "renovation", "renovations", "asphalte", "entrepreneur", "entrepreneurs", "jeux d'eau"]
  },
  "supplies-operations": {
   "en": ["supplies", "operations", "hardware", "office supplies", "parts", "gravel", "equipment", "rental", "rentals", "materials"],
   "fr": ["fournitures", "operations", "quincaillerie", "fournitures de bureau", "pieces", "gravier", "equipement", "equipements", "location", "locations", "materiaux"]
  },
  "professional-services": {
   "en": ["professional services", "professional", "professionals", "consultant", "consultants", "consulting", "engineering", "engineer", "engineers", "architect", "architects", "accountant", "accountants", "audit", "auditor", "auditors", "surveyor"],
   "fr": ["services professionnels", "professionnel", "professionnels", "consultant", "consultants", "ingenierie", "ingenieur", "ingenieurs", "architecte", "architectes", "comptable", "comptables", "audit", "verificateur", "verificateurs", "arpenteur"]
  },
  "legal-services": {
   "en": ["lawyer", "lawyers", "legal", "legal fees", "legal services", "attorney", "attorneys", "counsel", "litigation", "prosecutor", "court", "notary", "bailiff"],
   "fr": ["avocat", "avocats", "avocate", "juridique", "juridiques", "frais juridiques", "services juridiques", "procureur", "procureure", "litige", "litiges", "cour", "notaire", "huissier"]
  },
  "subsidies-community": {
   "en": ["grant", "grants", "subsidy", "subsidies", "donation", "donations", "community", "sponsorship", "sponsorships", "community groups"],
   "fr": ["subvention", "subventions", "don", "dons", "communaute", "communautaire", "commandite", "commandites", "organismes"]
  },
  "financing-debt": {
   "en": ["financing", "debt", "loan", "loans", "interest", "borrowing", "bond", "bonds", "capital repayment"],
   "fr": ["financement", "dette", "emprunt", "emprunts", "interets", "obligations financieres", "remboursement de capital"]
  },
  "utilities": {
   "en": ["electricity", "power", "utilities", "utility", "telecom", "telephone", "phone", "phones", "internet", "propane", "heating"],
   "fr": ["electricite", "services publics", "telecom", "telephone", "telephones", "internet", "propane", "chauffage"]
  },
  "vehicle-fuel-maintenance": {
   "en": ["gas", "gasoline", "fuel", "diesel", "vehicle", "vehicles", "truck", "trucks", "tires", "tire", "garage", "mechanic", "mechanics", "vehicle maintenance"],
   "fr": ["essence", "carburant", "carburants", "diesel", "vehicule", "vehicules", "camion", "camions", "pneus", "pneu", "garage", "mecanique", "mecanicien", "entretien des vehicules"]
  },
  "waste-recycling": {
   "en": ["garbage", "trash", "waste", "recycling", "compost", "composting", "landfill", "collection", "dump", "refuse"],
   "fr": ["ordures", "dechets", "recyclage", "compost", "compostage", "enfouissement", "collecte", "vidanges", "matieres residuelles", "rebuts"]
  },
  "regional-shares": {
   "en": ["regional", "regional shares", "shares", "quota", "quotas", "membership", "memberships", "dues", "association", "associations"],
   "fr": ["regional", "regionale", "quote-part", "quotes-parts", "quote part", "quotes parts", "adhesion", "adhesions", "cotisation", "cotisations", "association", "associations"]
  },
  "insurance": {
   "en": ["insurance", "insurer", "insurers", "premium", "premiums", "claim", "claims"],
   "fr": ["assurance", "assurances", "assureur", "assureurs", "prime", "primes", "reclamation", "reclamations"]
  },
  "policing-sq": {
   "en": ["police", "policing", "sq", "surete", "surete du quebec", "quebec police"],
   "fr": ["police", "policier", "policiers", "sq", "surete", "surete du quebec"]
  },
  "software-it": {
   "en": ["software", "computer", "computers", "licence", "licences", "license", "licenses", "website", "web site", "hosting", "tech", "information technology", "i t"],
   "fr": ["logiciel", "logiciels", "informatique", "ordinateur", "ordinateurs", "licence", "licences", "site web", "hebergement", "technologies de l'information", "ti"]
  },
  "other": {
   "en": ["other", "miscellaneous", "misc"],
   "fr": ["autres", "autre", "divers"]
  }
 },

 "suppliers": {
  "dunton": {
   "en": "Dunton Rainville", "fr": "Dunton Rainville",
   "slugs": ["dunton-rainville-s-e-n-c-r-l", "dunton-rainville-senc-avocats", "dunton-rainville"],
   "words": ["dunton", "dunton rainville", "rainville"]
  },
  "petro": {
   "en": "Petro-Canada", "fr": "Petro-Canada",
   "slugs": ["9534-8702-quebec-inc-petro-canada", "9534-8702-quebec-inc", "petro-canada", "superpass-essence-petro-canada", "superpass"],
   "words": ["petro", "petro canada", "petrocanada", "superpass"]
  },
  "daoust": {
   "en": "Robert Daoust et Fils", "fr": "Robert Daoust et Fils",
   "slugs": ["robert-daoust-et-fils-inc"],
   "words": ["daoust", "robert daoust", "daoust et fils"]
  },
  "hydro": {
   "en": "Hydro-Québec", "fr": "Hydro-Québec",
   "slugs": ["hydro-quebec"],
   "words": ["hydro", "hydro quebec", "hydroquebec"]
  },
  "ali": {
   "en": "Ali Excavation", "fr": "Ali Excavation",
   "slugs": ["ali-excavation-inc", "carriere-ali-inc"],
   "words": ["ali", "ali excavation", "carriere ali"]
  },
  "artelia": {
   "en": "Artelia Canada", "fr": "Artelia Canada",
   "slugs": ["artelia-canada-inc"],
   "words": ["artelia"]
  },
  "simexco": {
   "en": "Les Industries Simexco", "fr": "Les Industries Simexco",
   "slugs": ["les-industries-simexco-inc"],
   "words": ["simexco", "industries simexco"]
  },
  "mrc": {
   "en": "MRC du Haut-Saint-Laurent", "fr": "MRC du Haut-Saint-Laurent",
   "slugs": ["m-r-c-haut-saint-laurent"],
   "words": ["mrc", "m r c", "mrc haut saint laurent", "mrc du haut saint laurent", "haut saint laurent"]
  },
  "paquette": {
   "en": "Construction Émery Paquette", "fr": "Construction Émery Paquette",
   "slugs": ["construction-emery-paquette-inc", "construction-emery-paquette"],
   "words": ["paquette", "emery paquette", "construction emery paquette"]
  },
  "jeux-tec": {
   "en": "Installation Jeux-Tec", "fr": "Installation Jeux-Tec",
   "slugs": ["installation-jeux-tec-inc"],
   "words": ["jeux tec", "jeuxtec", "installation jeux tec"]
  },
  "fqm": {
   "en": "FQM (Fédération québécoise des municipalités)", "fr": "FQM (Fédération québécoise des municipalités)",
   "slugs": ["fqm", "fqm-assurances-inc", "fqm-fonds-de-defense-services-juridiques", "fqm-services-cooperative-de-solidarite"],
   "words": ["fqm", "federation quebecoise des municipalites"]
  },
  "technivolt": {
   "en": "Technivolt Électrique", "fr": "Technivolt Électrique",
   "slugs": ["technivolt-electrique-inc"],
   "words": ["technivolt"]
  },
  "soulanges": {
   "en": "Services de Rebuts Soulanges", "fr": "Services de Rebuts Soulanges",
   "slugs": ["services-de-rebuts-soulanges-inc"],
   "words": ["soulanges", "rebuts soulanges"]
  },
  "chevrolet": {
   "en": "Valleyfield Chevrolet", "fr": "Valleyfield Chevrolet",
   "slugs": ["valleyfield-chevrolet"],
   "words": ["chevrolet", "valleyfield chevrolet"]
  },
  "seleine": {
   "en": "Mines Seleine", "fr": "Mines Seleine",
   "slugs": ["mines-seleine"],
   "words": ["seleine", "mines seleine"]
  },
  "desjardins": {
   "en": "Desjardins", "fr": "Desjardins",
   "slugs": ["caisse-desjardins", "visa-desjardins"],
   "words": ["desjardins", "caisse desjardins", "visa desjardins"]
  },
  "pg-solutions": {
   "en": "PG Solutions", "fr": "PG Solutions",
   "slugs": ["pg-solutions"],
   "words": ["pg solutions", "pg"]
  },
  "solmatech": {
   "en": "Solmatech", "fr": "Solmatech",
   "slugs": ["solmatech-inc"],
   "words": ["solmatech"]
  },
  "patinoire": {
   "en": "Régie intermunicipale de la patinoire", "fr": "Régie intermunicipale de la patinoire",
   "slugs": ["regie-intermunicipale-de-la-patinoire"],
   "words": ["patinoire", "regie de la patinoire", "regie intermunicipale de la patinoire"]
  },
  "aedifica": {
   "en": "Aedifica", "fr": "Aedifica",
   "slugs": ["aedifica"],
   "words": ["aedifica"]
  },
  "bcgo": {
   "en": "BCGO", "fr": "BCGO",
   "slugs": ["bcgo-s-e-n-c-r-l"],
   "words": ["bcgo"]
  },
  "wellpuits": {
   "en": "Forage Wellpuits", "fr": "Forage Wellpuits",
   "slugs": ["forage-wellpuits"],
   "words": ["wellpuits", "forage wellpuits"]
  },
  "revenu": {
   "en": "Ministre du Revenu (Revenu Québec)", "fr": "Ministre du Revenu (Revenu Québec)",
   "slugs": ["ministre-du-revenu"],
   "words": ["revenu quebec", "ministre du revenu"]
  },
  "receveur": {
   "en": "Receiver General of Canada", "fr": "Receveur général du Canada",
   "slugs": ["receveur-general", "receveur-general-du-canada"],
   "words": ["receveur general", "receiver general", "receveur general du canada", "receiver general of canada"]
  },
  "finances": {
   "en": "Ministre des Finances", "fr": "Ministre des Finances",
   "slugs": ["ministre-des-finances", "ministre-des-finances-y2007896"],
   "words": ["ministre des finances", "minister of finance"]
  },
  "gleaner": {
   "en": "The Gleaner", "fr": "The Gleaner",
   "slugs": ["gleaner-the"],
   "words": ["gleaner", "the gleaner"]
  },
  "bell": {
   "en": "Bell", "fr": "Bell",
   "slugs": ["bell-canada", "bell-mobilite"],
   "words": ["bell", "bell canada", "bell mobilite"]
  },
  "cogeco": {
   "en": "Cogeco", "fr": "Cogeco",
   "slugs": ["cogeco"],
   "words": ["cogeco"]
  },
  "wm": {
   "en": "WM Québec", "fr": "WM Québec",
   "slugs": ["wm-quebec-inc"],
   "words": ["wm", "waste management", "wm quebec"]
  },
  "dhc": {
   "en": "DHC Avocats", "fr": "DHC Avocats",
   "slugs": ["dhc-avocats"],
   "words": ["dhc", "dhc avocats"]
  },
  "cmlex": {
   "en": "Cmlex Conseil", "fr": "Cmlex Conseil",
   "slugs": ["cmlex-conseil-inc"],
   "words": ["cmlex"]
  },
  "infotech": {
   "en": "Infotech", "fr": "Infotech",
   "slugs": ["2547-0857-quebec-inc-infotech", "infotech"],
   "words": ["infotech"]
  },
  "usereau": {
   "en": "Excavation Usereau", "fr": "Excavation Usereau",
   "slugs": ["excavation-usereau-inc"],
   "words": ["usereau", "excavation usereau"]
  },
  "charlebois": {
   "en": "Groupe Charlebois", "fr": "Groupe Charlebois",
   "slugs": ["groupe-charlebois-inc"],
   "words": ["charlebois", "groupe charlebois"]
  },
  "domisa": {
   "en": "Groupe Domisa", "fr": "Groupe Domisa",
   "slugs": ["groupe-domisa-inc"],
   "words": ["domisa", "groupe domisa"]
  },
  "orflow": {
   "en": "Orflow Géosciences", "fr": "Orflow Géosciences",
   "slugs": ["orflow-geosciences-inc"],
   "words": ["orflow"]
  },
  "compteurs": {
   "en": "Compteurs d'Eau du Québec", "fr": "Compteurs d'Eau du Québec",
   "slugs": ["compteurs-d-eau-du-quebec"],
   "words": ["compteurs d eau", "compteurs d eau du quebec", "water meters"]
  },
  "allison": {
   "en": "Réfrigération Yvan Allison", "fr": "Réfrigération Yvan Allison",
   "slugs": ["refrigeration-yvan-allison"],
   "words": ["allison", "yvan allison"]
  },
  "marquage": {
   "en": "Marquage et Traçage du Québec", "fr": "Marquage et Traçage du Québec",
   "slugs": ["marquage-et-tracage-du-quebec-inc"],
   "words": ["marquage", "marquage et tracage", "tracage"]
  },
  "crsbp": {
   "en": "CRSBP Montérégie", "fr": "CRSBP Montérégie",
   "slugs": ["crsbp-monteregie-inc"],
   "words": ["crsbp", "reseau biblio", "crsbp monteregie"]
  },
  "harnois": {
   "en": "Harnois Énergies", "fr": "Harnois Énergies",
   "slugs": ["harnois-energies-inc"],
   "words": ["harnois", "harnois energies"]
  },
  "gauthier": {
   "en": "Gauthier, René (essence)", "fr": "Gauthier, René (essence)",
   "slugs": ["gauthier-rene-essence"],
   "words": ["rene gauthier", "gauthier essence"]
  },
  "pieces-auto": {
   "en": "Pièces d'Auto Valleyfield", "fr": "Pièces d'Auto Valleyfield",
   "slugs": ["pieces-d-auto-valleyfield-inc", "pieces-d-auto-valleyfield"],
   "words": ["pieces d auto", "pieces d auto valleyfield"]
  },
  "staples": {
   "en": "Staples / Bureau en Gros", "fr": "Bureau en Gros / Staples",
   "slugs": ["staples-canada-ulc", "staples-professionnel"],
   "words": ["staples", "bureau en gros"]
  },
  "amazon": {
   "en": "Amazon", "fr": "Amazon",
   "slugs": ["amazon-ca"],
   "words": ["amazon"]
  },
  "canva": {
   "en": "Canva", "fr": "Canva",
   "slugs": ["canva"],
   "words": ["canva"]
  },
  "adobe": {
   "en": "Adobe", "fr": "Adobe",
   "slugs": ["adobe-inc"],
   "words": ["adobe"]
  },
  "microsoft": {
   "en": "Microsoft", "fr": "Microsoft",
   "slugs": ["microsoft-canada-ins"],
   "words": ["microsoft"]
  },
  "purolator": {
   "en": "Purolator", "fr": "Purolator",
   "slugs": ["purolator-inc"],
   "words": ["purolator"]
  },
  "postes": {
   "en": "Canada Post", "fr": "Postes Canada",
   "slugs": ["societe-canadienne-des-postes"],
   "words": ["postes canada", "canada post", "poste canada"]
  },
  "saaq": {
   "en": "SAAQ", "fr": "SAAQ",
   "slugs": ["saaq-societe-ass-automobile", "saaq-societe-ass-automobile-quebec"],
   "words": ["saaq", "immatriculation", "registration"]
  },
  "cnesst": {
   "en": "CNESST", "fr": "CNESST",
   "slugs": ["cnesst"],
   "words": ["cnesst", "csst"]
  },
  "umq": {
   "en": "UMQ (Union des municipalités du Québec)", "fr": "UMQ (Union des municipalités du Québec)",
   "slugs": ["union-des-municipalites-du-quebec"],
   "words": ["umq", "union des municipalites", "union des municipalites du quebec"]
  },
  "nethris": {
   "en": "Nethris", "fr": "Nethris",
   "slugs": ["nethris"],
   "words": ["nethris"]
  },
  "rancourt": {
   "en": "Rancourt Legault Joncas", "fr": "Rancourt Legault Joncas",
   "slugs": ["rancourt-legault-joncas"],
   "words": ["rancourt", "rancourt legault", "rancourt legault joncas"]
  },
  "law-jean-baptiste": {
   "en": "Law Jean-Baptiste Avocats", "fr": "Law Jean-Baptiste Avocats",
   "slugs": ["law-jean-baptiste-avocats-s-e-n-c"],
   "words": ["jean baptiste", "law jean baptiste"]
  },
  "nordikeau": {
   "en": "Nordikeau", "fr": "Nordikeau",
   "slugs": ["nordikeau"],
   "words": ["nordikeau"]
  },
  "eurofins": {
   "en": "Eurofins Environex", "fr": "Eurofins Environex",
   "slugs": ["eurofins-environex"],
   "words": ["eurofins", "environex"]
  },
  "savaria": {
   "en": "Savaria", "fr": "Savaria",
   "slugs": ["savaria"],
   "words": ["savaria"]
  },
  "payroll": {
   "en": "Municipal payroll", "fr": "Paie municipale",
   "slugs": ["paie-municipale", "salaire-personnel-municipal", "municipalite-d-ormstown-paie"],
   "words": ["paie municipale", "municipal payroll"]
  }
 },

 "views": {
  "payees": {
   "en": ["suppliers", "supplier list", "vendors", "who was paid", "by supplier"],
   "fr": ["fournisseurs", "liste des fournisseurs", "qui a ete paye", "par fournisseur"]
  },
  "categories": {
   "en": ["categories", "by category", "where does the money go", "breakdown"],
   "fr": ["categories", "par categorie", "ou va l argent", "repartition"]
  },
  "sittings": {
   "en": ["sittings", "meetings", "by sitting", "reconciliation"],
   "fr": ["seances", "par seance", "reunions", "rapprochement"]
  },
  "payments": {
   "en": ["lines", "payments", "every line", "all lines"],
   "fr": ["lignes", "paiements", "chaque ligne", "toutes les lignes"]
  },
  "disclosures": {
   "en": ["law", "the law", "what the law requires", "disclosures", "disclosure", "must publish", "required by law"],
   "fr": ["loi", "la loi", "ce que la loi exige", "divulgation", "divulgations", "obligations legales", "doit publier"]
  }
 },

 "amount": {
  "over": {
   "en": ["over", "more than", "above", "at least", "minimum", "min", "greater than", "exceeding"],
   "fr": ["plus de", "plus que", "au dessus de", "au moins", "minimum", "min", "superieur a", "superieurs a", "a partir de", "depassant"]
  },
  "under": {
   "en": ["under", "less than", "below", "at most", "maximum", "max", "up to", "smaller than"],
   "fr": ["moins de", "moins que", "sous", "au plus", "maximum", "max", "jusqu a", "inferieur a", "inferieurs a"]
  },
  "credits": {
   "en": ["credit", "credits", "refund", "refunds", "reimbursement", "reimbursements"],
   "fr": ["credit", "credits", "remboursement", "remboursements", "ristourne", "ristournes"]
  }
 },

 "months": {
  "1":  { "en": ["january", "jan"], "fr": ["janvier", "janv"] },
  "2":  { "en": ["february", "feb"], "fr": ["fevrier", "fevr", "fev"] },
  "3":  { "en": ["march", "mar"], "fr": ["mars"] },
  "4":  { "en": ["april", "apr"], "fr": ["avril", "avr"] },
  "5":  { "en": ["may"], "fr": ["mai"] },
  "6":  { "en": ["june", "jun"], "fr": ["juin"] },
  "7":  { "en": ["july", "jul"], "fr": ["juillet", "juil"] },
  "8":  { "en": ["august", "aug"], "fr": ["aout"] },
  "9":  { "en": ["september", "sep", "sept"], "fr": ["septembre", "sept"] },
  "10": { "en": ["october", "oct"], "fr": ["octobre", "oct"] },
  "11": { "en": ["november", "nov"], "fr": ["novembre", "nov"] },
  "12": { "en": ["december", "dec"], "fr": ["decembre", "dec"] }
 },

 "time": {
  "lastSitting": {
   "en": ["last sitting", "latest sitting", "last meeting", "latest meeting", "last list", "latest list", "most recent sitting"],
   "fr": ["derniere seance", "derniere reunion", "derniere liste", "seance la plus recente"]
  },
  "thisYear": {
   "en": ["this year", "current year"],
   "fr": ["cette annee", "annee en cours", "annee courante"]
  },
  "lastYear": {
   "en": ["last year", "previous year"],
   "fr": ["l an dernier", "l annee derniere", "annee derniere", "annee precedente", "an dernier"]
  }
 },

 "stop": {
  "en": ["how", "much", "many", "did", "does", "do", "the", "a", "an", "and", "or", "of", "on", "in", "for", "to", "at", "by", "with", "was", "were", "is", "are", "be", "been", "has", "have", "had", "it", "its", "that", "this", "these", "those", "what", "which", "who", "whom", "whose", "when", "town", "municipality", "ormstown", "council", "spend", "spent", "spending", "money", "cost", "costs", "paid", "total", "list", "lists", "sitting of", "show", "me", "all", "dollars", "dollar", "s"],
  "fr": ["combien", "est", "ce", "que", "qu", "qui", "quoi", "quel", "quelle", "quels", "quelles", "la", "le", "les", "l", "d", "de", "du", "des", "un", "une", "en", "pour", "sur", "et", "ou", "au", "aux", "a", "avec", "par", "dans", "ont", "ete", "a ete", "depense", "depenses", "depensees", "depenser", "municipalite", "ville", "ormstown", "conseil", "argent", "cout", "couts", "paye", "payes", "payee", "payees", "total", "liste", "listes", "seance du", "montrer", "moi", "tous", "toutes", "dollars", "dollar"]
 }
};

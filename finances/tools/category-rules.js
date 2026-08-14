// Single source of truth for the Observer's category mapping, applied per
// ledger line by rebuild-entries.js and build-payments.js.
// Precedence: sentinel payees keep their ledger category; LINE_RULES
// (payee + entry content) win over PAYEE_RULES (payee only); otherwise the
// ledger's category stands. Method: observer-rules-v4 (content-aware;
// adds Policing — SQ and Software & IT).
'use strict';

// Categories introduced by the Observer (added to the data file if missing).
const NEW_CATS = {
  'Utilities': { fr: 'Services publics (électricité, télécom, propane)', en: 'Utilities (electricity, telecom, propane)', color: '#8175aa' },
  'Vehicle fuel & maintenance': { fr: 'Carburant et entretien des véhicules', en: 'Vehicle fuel & maintenance', color: '#9c755f' },
  'Waste & recycling': { fr: 'Collecte des ordures et du recyclage', en: 'Garbage & recycling collection', color: '#d37295' },
  'Regional shares & memberships': { fr: 'Quotes-parts, adhésions et cotisations', en: 'Regional shares & memberships', color: '#767f4f' },
  'Insurance': { fr: 'Assurances', en: 'Insurance', color: '#b3823e' },
  'Policing — SQ': { fr: 'Police — Sûreté du Québec', en: 'Policing — Sûreté du Québec', color: '#499894' },
  'Software & IT': { fr: 'Logiciels et informatique', en: 'Software & IT', color: '#a0cbe8' }
};

// [payeeRegex, entryRegex, category] — content-based, checked first.
const LINE_RULES = [
  [/^CRSBP/i, /quote|annuel/i, 'Regional shares & memberships'], // annual operating fees / tariff of the regional library network
  [/^M\.?R\.?C\.?/i, /quote/i, 'Regional shares & memberships'],
  [/^M\.?R\.?C\.?/i, /cours d'eau/i, 'Contracts — works'],
  [/^FQM$/i, /formation/i, 'Salaries & HR'],
  [/^FQM$/i, /adhésion|cotisation/i, 'Regional shares & memberships'],
  [/^(UMQ|Union des Municipalités)/i, /formation/i, 'Salaries & HR'],
  [/^ADMQ/i, /cotisation|adhésion/i, 'Regional shares & memberships'],
  [/^Réseau [Dd].[Ii]nformation Municipale/i, /affichage|poste/i, 'Salaries & HR'], // job postings
  [/^9437-7843/, /dépôt de garantie/i, 'Contracts — works'], // guarantee-deposit refund tied to the rue Isabelle works project
  [/^Ministre des Finances/, /\bSQ\b|Sûreté/i, 'Policing — SQ'], // provincial policing bill (versements)
  [/^Visa Desjardins/, /Adobe|logiciel/i, 'Software & IT'] // software purchased on the municipal credit card
];

// [payeeRegex, category] — whole payee.
const PAYEE_RULES = [
  // utilities
  [/^Hydro-Québec$/i, 'Utilities'],
  [/^Bell Canada$/i, 'Utilities'],
  [/^Bell Mobilité$/i, 'Utilities'],
  [/^Cogeco$/i, 'Utilities'],
  [/^Énergie P38/i, 'Utilities'],
  // vehicles
  [/9534-8702/, 'Vehicle fuel & maintenance'],
  [/^C\.?\s?S\.? Brunette/i, 'Vehicle fuel & maintenance'],
  [/^Harnois Énergies/i, 'Vehicle fuel & maintenance'],
  [/^SPH Services Pétrolier/i, 'Vehicle fuel & maintenance'],
  [/^9141855 Canada/, 'Vehicle fuel & maintenance'],
  [/^Garage C\.P\./i, 'Vehicle fuel & maintenance'],
  [/^Garage S\.D\./i, 'Vehicle fuel & maintenance'],
  [/^Remorquage Brunette/i, 'Vehicle fuel & maintenance'],
  [/^Pièces d'Auto Valleyfield/i, 'Vehicle fuel & maintenance'],
  [/^S\.N\.G\. Services Mécaniques/i, 'Vehicle fuel & maintenance'],
  [/^SuperPass/i, 'Vehicle fuel & maintenance'],
  [/^SAAQ/i, 'Vehicle fuel & maintenance'],
  // waste
  [/^Robert Daoust/i, 'Waste & recycling'],
  // regional bodies, associations, subscriptions
  [/^Régie intermunicipale/i, 'Regional shares & memberships'],
  [/^Info Excavation/i, 'Regional shares & memberships'],
  [/^Scabric/i, 'Regional shares & memberships'],
  [/^A\.?E\.?M\.?F\.?S\.?Q/i, 'Regional shares & memberships'],
  [/^(UMQ|Union des Municipalités)/i, 'Regional shares & memberships'],
  [/^Réseau [Dd].[Ii]nformation Municipale/i, 'Regional shares & memberships'],
  // insurance
  [/^FQM Assurances/i, 'Insurance'],
  [/^Beneva/i, 'Insurance'],
  // policing
  [/^Ministère de la Sécurité publique/i, 'Policing — SQ'],
  // software & IT
  [/^Pg Solutions/i, 'Software & IT'],
  [/^2547-0857/, 'Software & IT'],                        // Infotech (Sygem)
  [/^Service Informatique D\.?L\.?/i, 'Software & IT'],
  [/^Solution Informatique de la Montérégie/i, 'Software & IT'],
  [/^Nethris/i, 'Software & IT'],                         // payroll-software fees
  [/^Ics Inc/i, 'Software & IT'],
  [/^Jalec/i, 'Software & IT'],                           // network access & radio/IT equipment
  [/^Adobe Inc/i, 'Software & IT'],
  [/^Microsoft Canada/i, 'Software & IT'],
  [/^CANVA$/i, 'Software & IT'],
  // content-identified reassignments out of "Other"
  [/^Librairie Renaud-Bray/i, 'Supplies & operations'],   // library books
  [/^Librairies Boyer/i, 'Supplies & operations'],        // library books
  [/Formulaires Ducharme/i, 'Supplies & operations'],     // election/registry forms
  [/^Traiteur Pelchat/i, 'Supplies & operations'],        // catering for municipal events/training
  [/^Manoir d'Youville/i, 'Supplies & operations'],       // meeting venue
  [/^St-James Anglican/i, 'Supplies & operations'],       // venue rental
  [/^UCMU/i, 'Supplies & operations'],                    // fire-scene support costs
  [/^ADMQ/i, 'Supplies & operations'],                    // non-dues ADMQ purchases (software keys)
  [/^CRSBP/i, 'Supplies & operations'],                   // non-quote CRSBP fees/supplies
  [/^Fonds [Dd].[Ii]nformation/i, 'Supplies & operations'], // land-registry mutation notices
  [/^Leclerc Stéphane/i, 'Subsidies & community']         // goodwill gesture
];

function mapCategory(payee, entry, ledgerCat) {
  if (/^—/.test(payee)) return ledgerCat; // sentinels (payroll, grouped rest)
  for (const [pre, ere, cat] of LINE_RULES) {
    if (pre.test(payee) && ere.test(entry || '')) return cat;
  }
  for (const [re, cat] of PAYEE_RULES) {
    if (re.test(payee)) return cat;
  }
  return ledgerCat;
}

module.exports = { NEW_CATS, LINE_RULES, PAYEE_RULES, mapCategory, METHOD: 'observer-rules-v4' };

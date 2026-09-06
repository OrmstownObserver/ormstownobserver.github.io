# 2025-02-03 category audit (197 lines, $316,077.76) — findings

Ledger cat -> proposed. mapCategory() is a no-op on all of these (no rule
covers the payee), so whatever the ledger says is what publishes.

## Clear-cut misfiles
| Payee | Entry (short) | Amt | Ledger | Proposed | Why |
|---|---|---|---|---|---|
| D'AMOUR & FILS INC. (R.S) | Vadrouille, balai, produit nett.- Parc des Érables | 67.98 | Salaries & HR | Supplies & operations | cleaning goods; payee is 138 rows Supplies elsewhere |
| QUINCAILLERIE R. GAUTHIER INC. | 3 clés -Parc des Érables | 12.00 | Salaries & HR | Supplies & operations | hardware; payee 24 rows Supplies |
| SANIBERT | Toilette chaufée 4 sem. -Parc des Érables | 302.09 | Salaries & HR | Supplies & operations | portable toilet rental; sibling Sanibert row same sitting = Waste & recycling |
| Pelouse Alex Gaulin | Contrat déneigement patinoire -1er paiement | 2586.94 | Salaries & HR | Contracts — works | contracted works; payee 6 rows Contracts — works |
| J.T. SPORT | Réparer fuite de gaz - Scie à chaine - Pompiers | 98.83 | Utilities | Supplies & operations | equipment repair, not a utility; payee 5 rows Supplies |
| IGA ORMSTOWN | Papiers mouchoir, articles nettoyage - Garage 201 | 39.05 | Vehicle fuel & maintenance | Supplies & operations | consumables that happen to be for the garage; payee 34 rows Supplies |
| TBL Telecom | Accès Internet Fibre -Janvier 2025 - HDV | 1014.08 | Supplies & operations | Software & IT | identical Service Informatique D.L. fibre lines are Software & IT |
| TELMATIK | Appels d'urgence Janv. 2025 + Minutes excéd. | 115.74 | Software & IT | Supplies & operations | Telmatik precedent = Supplies (7 of 10 rows) |

Subtotal moved OUT of Salaries & HR: 2,969.01
Subtotal moved OUT of Vehicle fuel & maintenance: 39.05
Subtotal moved OUT of Utilities: 98.83

## Needs a judgment call (flag to Jesse, do not silently change)
| Payee | Entry | Amt | Ledger | Note |
|---|---|---|---|---|
| D'AMOUR & FILS | Gants doubles cuir, gant bleu -Garage 201 | 87.33 | Vehicle fuel & maintenance | PPE for garage staff; Supplies is likelier but defensible as-is |
| PRUD'HOMME TECHNOLOGIES | Entretien extincteurs -Garage 138A | 162.37 | Vehicle fuel & maintenance | fire-extinguisher servicing in a building, not a vehicle -> Supplies; existing precedent for this payee IS Supplies |
| QUINCAILLERIE R. GAUTHIER | Pile, soufflette, embout indus - Hose à Air - Garage 201 | 76.37 | Vehicle fuel & maintenance | shop consumables -> Supplies |
| OUELLET SAMANTHA | Entretien ménager sem du 30 déc au 12 janv | 1370.00 | Salaries & HR | cleaning contractor; site precedent for this payee = Professional services (11 rows) |
| Forgues Diane | Srvs consultation RH du 6 au 15 janv. 2025 | 5807.61 | Salaries & HR | HR consultant — Professional services vs Salaries & HR; Salaries defensible |
| DIVERS - EMPLOYÉ | Carole Chabot - Remb carte cadeau (maladie) | 50.00 | Salaries & HR | employee reimbursement -> Salaries & HR is correct per v4 |
| DIVERS - EMPLOYÉ | Erica Holzgang - Remb Tim Horton Fête | 26.03 | Supplies & operations | ok |

## Correctly handled (credit to whoever did this)
- ÉQUIP. LAPLANTE & LEVESQUE "Retour Tuyau Galv + frais retour" = -221.27 captured NEGATIVE
- Salaire line present as its own row, 94,542.54, Salaries & HR
- Blocks tie: 164,059.27 + 94,542.54 + 57,475.95 = 316,077.76 = printed GRAND TOTAL

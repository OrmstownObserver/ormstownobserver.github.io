# Q1-2025 ingest — state as of 2026-09-05

## Done
- 4 sittings verified penny-exact vs printed Annexe A GRAND TOTALs:
  2025-01-20 1,908,530.21 (284) | 2025-02-03 316,077.76 (197)
  2025-03-03   711,840.39 (268) | 2025-04-07 945,509.19 (339)
  Apr 7 total row corrected by Jesse in Notion 555,653.38 -> 945,509.19.
- All 1,088 lines category-audited.
- 49 of 50 corrections APPLIED to Notion (plan.json has the ids + targets).

## NOT done
1. ONE correction outstanding: 2025-02-03 TBL Telecom "Accès Internet Fibre
   -Janvier 2025 - HDV", 1014.08, Supplies & operations -> Software & IT.
   Its page id was never captured (my id query filtered Supplies out).
   Re-query: Council Session LIKE 'PV 2025-02-03%' AND Payee LIKE 'TBL%'.
2. Read-back verification of all 49 writes.
3. The export itself: build raw {month:[[Payee,Entry,Amount,Category],...]}
   for ALL 17 months, seed 4 new months in spending-data.js months[],
   then rebuild-entries.js -> build-payments.js -> full test suite.
4. Frozen test fixtures WILL need bumping (validate-lines grand totals,
   render-check line/sitting/credit/petro counts).

## Editorial decisions locked in with Jesse
- Professional services = administrative / office / HR bought-in work
  (the "should town hall already do this?" test). Forgues Diane -> Prof svcs.
- "Labourish" contracted work -> Contracts — works. Ouellet Samantha (cleaning)
  -> Contracts — works, DEVIATING from her 23-row Professional services
  precedent. This makes the payee inconsistent across sittings until v5.
- v5 proposal parked: add a "Buildings & grounds" and/or "Contracted labour"
  category; would move ~600k of the current 959k out of Professional services
  (Artelia, AEDIFICA, Orflow, Eurofins, Domisa...). Draft before touching.

## Net effect of the 50 corrections (zero-sum, verified)
  Salaries & HR        -59,136.22
  Subsidies & community -6,679.48
  Software & IT         -2,369.82
  Financing & debt      -2,181.66
  Vehicle fuel & maint.   -277.79
  Utilities               +103.23
  Supplies & operations +2,039.42
  Contracts — works    +12,562.63
  Professional services+55,939.69

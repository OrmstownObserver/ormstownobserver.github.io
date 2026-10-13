# Community Compass and Bylaw Registries

This is the local implementation runbook for AI agents working on The Ormstown
Observer's Community Compass and Bylaw Registries work. It is intentionally
product- and workflow-focused; canonical IDs, credentials, database ownership,
and final operating decisions live in Notion.

## Canonical Pointers

Use the current Notion pages for source-of-truth status, ownership, IDs,
credentials, and cross-platform continuity:

- Community Compass product entry
- Existing bylaw procedure
- Bylaw registry
- System Registry
- Observer Desk
- Master AI Manual

Do not copy secrets, private IDs, or credential values into this repository.

## Product Shape

Community Compass is the broader reusable regional platform for collecting,
parsing, maintaining, and sharing municipal information. The Ormstown Observer
site is the reference implementation, not the whole product.

The current public Q&A interface under `en/ask/`, `fr/posez-une-question/`, and
`ask.js` is one Community Compass component. It answers concise reader questions
from indexed municipal sources and should keep its reader-facing disclaimers,
source links, rate limiting, and citation discipline.

Bylaw Registries is a reusable Community Compass module for municipal bylaw
records, bilingual summaries, English translations, explainers, source/version
tracking, status tracking, and editorial review. The current Ormstown
implementation lives in `scripts/export-bylaws.py`, `dist/bylaws.json`,
`bylaws-register.js`, `bylaws-register.css`, and the bilingual
`bylaws-regulations` pages.

## Pipeline Map

The intended workflow is:

1. Discover municipal sources, official files, public notices, minutes, pages,
   and archive snapshots.
2. Record source URL, source type, version, document date, retrieval date,
   language, and current/historical status in the registry.
3. Export registry data through the established allowlist and validation rules.
4. Produce bilingual summaries, explainers, or full translations as separate
   draft artifacts with source and claim citations.
5. Send drafts through editorial review before any public route, index, Notion
   status, commit, push, or publication update.
6. Publish or index only through a separately authorized publication workflow.
7. Use the indexed sources to support concise Q&A answers, deeper explainers,
   and links to official French source text where applicable.
8. Refresh records and corrections when source documents, legal status, public
   notices, or editorial decisions change.

Do not collapse these stages. A registry row, generated draft, reviewed draft,
published page, and indexed Q&A source are different states.

## Draft and Publication Boundary

`drafts/bylaw-explainers/**` is draft-only. Draft files, local verification
notes, and a `READY FOR EDITOR` label are not live publication, not legal
verification, and not permission to create public routes.

As of the local observation on 2026-10-11, there were 42 local draft bylaw
explainers: 28 marked ready for editor and 14 requiring an editor decision.
Those counts are a dated status observation, not inferred legal validity.

Also as of 2026-10-11, the Notion registry snapshot reported by the user had 92
rows: 52 In force, 6 Amended, 21 Repealed, 1 Draft, and 12 unknown, with all
`Web Ready` values false, while the public static snapshot contained 80 records.
Do not bulk-toggle `Web Ready`, wipe public data, or assume the public snapshot
and registry are meant to match until an editor authorizes the reconciliation.

The local Community Compass corpus observation was 174 documents generated on
2026-10-10. Treat that as an implementation snapshot, not proof that the full
multi-municipality or full-translation pipeline is production-ready.

## Source and Legal-Status Rules

- Prefer primary municipal sources: official bylaws, minutes, public notices,
  agendas, forms, and official document pages.
- Preserve bylaw numbering, annex references, tables, section labels, dates,
  source URLs, and uncertainty notes.
- Distinguish current, amended, repealed, draft, historical, and unknown status.
  Unknown status stays unknown until a reliable source resolves it.
- The official French source text is authoritative where the municipality's
  original legal text is French. English summaries or translations must not
  silently replace the French source.
- Keep source attribution, copyright/reuse questions, and publication authority
  separate. Unsettled reuse-law questions may affect publication decisions, but
  they are not a blanket gate on internal planning or pipeline design.
- The user-reported judge comment is unverified context unless and until a
  source is attached. Do not turn it into a legal conclusion.
- Do not invent a municipal-permission requirement. Do not invent legal
  clearance. Record uncertainty plainly and route publication-sensitive choices
  to an editor.

## Editorial Controls

All public-facing material should be factual, bilingual where required,
transparent about sources, and cautious about legal interpretation. Community
Compass answers and bylaw explainers should be useful civic journalism, not legal
advice.

Every substantive claim in a bylaw explainer or translation should trace back to
a source document, registry field, page citation, or explicit editorial note.
When source text is ambiguous, conflicting, incomplete, or missing, preserve that
uncertainty rather than smoothing it over.

Publication-sensitive actions require separate authorization. That includes
creating public article routes, adding index links, setting Notion publication
status, running publish scripts, committing, pushing, triggering n8n webhooks, or
changing workflow permissions.

## Municipality Configuration

Keep municipality-specific configuration isolated. A reusable Community Compass
or Bylaw Registries workflow should separate:

- Municipality name and reader-facing product labels
- Official host allowlists and source sections
- Language routes and translation policy
- Registry/database IDs and archive roots
- Source-status vocabulary and editorial status vocabulary
- Publication paths, index pages, and Q&A corpus names

For the Observer reference implementation, legacy internal names such as
`ogpt-sources.json`, `observer-ogpt-*`, and `ogpt_*` remain in place unless the
backend is coordinated. Do not rename internal working identifiers just because
the reader-facing name is Community Compass.

## Acceptance Checks

Before handing off Community Compass or Bylaw Registries work, verify:

- `AGENTS.md` still points agents to `CLAUDE.md`.
- `CLAUDE.md` still points relevant agents to this runbook.
- Generated files such as `front-page.json` and `ogpt-sources.json` were not
  hand-edited.
- Draft-only bylaw explainers were not moved into public routes without explicit
  publication authorization.
- Registry exports did not drop records unexpectedly, disable existing public
  data, or bulk-change `Web Ready`.
- Source links, legal status, uncertainty notes, and official French source
  references remain visible in the relevant artifact.
- Any claim of live publication is backed by a committed/pushed public page and
  a separate live verification, not just a draft file or local build.

## Next Steps

Coordinate this local runbook with the Notion product entry, existing bylaw
procedure, registry, System Registry, Observer Desk, and Master AI Manual. After
that reconciliation, update only the smallest necessary local pointers or
implementation notes so future agents can find the canonical rules quickly
without duplicating Notion.

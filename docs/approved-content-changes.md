# Administrator-approved field changes — phase 1

Supported operations are `update` and `image` for uniquely mapped existing restaurants/cafes and attractions. Other operations are explicitly routed to human handling; they cannot enter the former broad model-edit path. The previous add/university/guide implementations remain available in source for a later, separately specified rollout, but the new acceptance gate does not dispatch them.

## Administrator workflow

1. Load current public default-branch data from Admin. Select city, category and stable frontend entry ID. No fuzzy target selection is automatic.
2. Select only the fields to change. The original submission remains visible. Confirm exact replacement text; selecting an empty value explicitly requests clearing that field. Unselected fields remain untouched. Images are append-only, preserve existing order, and include all accepted uploads.
3. Confirm the target and values. A private, app-authored approval comment records issue payload hash, public base commit, before/after fields, actor and time.
4. The private Agent reads the latest app-authored record, verifies the payload hash, and applies deterministic edits. This route does not ask the Content Agent to research or rewrite text.
5. Verify exact source changes, generated fields, other entries, file scope and actual page registry. Legacy literal objects are patched by ID using the TypeScript AST. Conflicting branches or ambiguous mappings stop for human resolution.
6. Only after deterministic checks succeed, one AI comparison receives target, operation, before, confirmed submission and actual after. It cannot edit files or override a hard failure. Its concerns and the existing RAG Judge scores are separate in Admin.
7. AI concerns or low scores can be manually accepted only with all hard checks passed, current approval/payload, completed evaluation run and matching PR head/base commits. A reason is required. Ready never merges the PR.

## Boundaries

- Normalization permits CRLF to LF only. The existing generator compresses whitespace and applies display fallbacks; if that prevents exact output (including some explicit clears), the new validator rejects it. It does not silently relax comparison. Such cases need a generator-specific follow-up or human handling.
- Targets absent from the unique source-to-frontend mapping (including custom London data paths and legacy name/category differences) are not offered. No guessed ID is invented.
- A submitted field update does not authorize fact checking to change an address, opening hours, or other field. Administrators can explicitly select and confirm additional fields when appropriate.
- A base update that changes the target, legacy source or registry requires reconfirmation. Unrelated base updates may still conflict with an old PR branch; update that branch and reevaluate.
- Historical low-score reports without the new fidelity record are display-only, never eligible for manual override.
- GitHub writes are not atomic. Approvals are checked before/after Ready; later PR changes invalidate the prior report. Final human merge review remains necessary.

## Release order

Deploy the public website first (new Admin API/UI, contracts and `scripts/verify-approved-change.mts`). Then publish the private Agent changes, including its lockfile and workflow. `GITHUB_APP_ID` is populated from existing `CONTENT_AGENT_APP_ID` in Actions and must identify the same app as the website's approval comments. No new secret value is committed.

The private package adds the TypeScript 5 parser under `typescript-parser`: TypeScript 7 remains the type checker, while the legacy literal editor needs the older compiler AST API. No database migration is needed; approval and evaluation evidence remain in private Issue comments.

## Regression checks

Public: `node --import tsx --test scripts/approved-change.test.mts scripts/contribution-evaluation.test.mts scripts/manual-contribution-review.test.mts scripts/admin-review-route.test.mts`, plus `npx playwright test e2e/approved-change.spec.ts`.

Private: `npm test` and `npm run typecheck`.

Tests cover the #24 description/postcode regression, duplicate city names, wrong IDs, unauthorized fields, image ordering/duplication, legacy literals, source/engine parity, repeated materialization, stale/forged approval and administrator confirmation.

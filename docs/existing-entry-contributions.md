# Existing-entry contributions

Restaurant and attraction `update` / `image` submissions now select a registered existing entry. Other submission modes are unchanged. Entries without an unambiguous canonical/legacy mapping remain unavailable for automatic editing; the form directs the contributor to “其他补充”.

## Contract

`existingEdit` contains the exact target (city, region, category, stable ID and source), a complete canonical field snapshot, and only changed text fields. Empty `after` explicitly requests clearing that field. Images are uploaded separately; clients cannot submit replacement image URLs. This payload is a contributor request, not administrator approval.

The form shows the actual page's text/images as a read-only reference and preloads canonical fields for editing. Legacy display values can differ from canonical values (Tilt's Cocktail Bar vs Drinks); untouched fields are not synchronized as a side effect. Names/IDs are not editable through this flow.

The submission API verifies the target and snapshot against deployed sources before creating an Issue. The Admin checks current repository sources again, limits selection to the contributor's target, and preloads the submitted changes. Both Admin approval and the Agent reject changes outside the contributor's requested fields or altered replacement text. Old submissions without this payload retain the previous manual target-selection workflow.

Image-only submissions require at least one upload and no text changes. Existing legacy-only images are retained before appending approved images, including Tilt's three `/contributions/5/` images. Snapshot conflicts fail closed and require manual handling; no implicit overwrite or rebase occurs.

## Runtime and release

`/api/contributions/entries` reads only public source files and filters candidates against the actual frontend registry. `next.config.ts` explicitly traces these data files for deployed server functions. No repository credentials are exposed by the endpoint.

Release both repositories: the private Agent schema/validation changes must accompany the website update. The private changes are backward compatible, so deploy them first, then the public website. Do not include unrelated News, fortune, map or local environment files in these commits.

## Verification

- `node --import tsx --test scripts/existing-contribution.test.mts scripts/approved-change.test.mts`
- `npx playwright test e2e/existing-contribution.spec.ts` (real local catalog; Issue creation and R2 upload mocked)
- `npm run lint`, `npx next typegen`, `npx tsc --noEmit --pretty false`, `npm run build`
- Private repository: `npm test`, `npm run typecheck`

Real Tilt tests cover exact legacy identity, text replacement, preservation of unrelated fields, old-image retention, stale snapshots, no-op rejection, and image-only restrictions. Browser tests exercise 360px and 1280px layouts. They do not create live Issues or PRs or invoke the AI Judge.

## Extended regression pass — 2026-09-18

- Added real submission-route tests using the real catalog, schema and request handler, with only GitHub writes replaced by an in-memory recorder. Covers target/version spoofing, image rights, image-only restrictions, malformed fields, honeypot and rate limiting.
- Added Admin approval tests using repository fixtures and mocked GitHub transport. Both preview and direct approval now reject a stale complete contributor snapshot, including changed fields the contributor did not edit.
- Added four private Agent integration replays: Tilt text, Tilt image, Avebury full description and Avebury cleared address. Each clones into an isolated temporary repository, executes both data generators and the actual frontend registry checker, repeats for byte-identical output, then verifies rejection of an unrelated file. These tests skip explicitly when the public checkout is unavailable; all four ran locally.
- Generated-data comparisons now ignore JSON object key order only. Tests still reject modified values and reordered arrays. This fixes false failures when explicitly clearing an optional field.
- Browser regressions also cover target switching, clearing selected uploads, unchanged submissions, catalog retry, rejected-submission draft retention and explicit empty fields.
- Updated stale city-test expectations to include existing Wiltshire and Swansea's eight restaurants plus one attraction. No content data was changed.

No live Issue, PR, R2 upload, AI Judge or deployed Admin round trip is exercised by these offline tests.

# Selected website improvements

Implements the four selected topics in the 21-page website review: motion choice,
restaurant keyword search, actionable contribution progress, and event calendars.
No content submissions, publication actions, or private Agent code are changed.

## Browsing choice

- The Explore carriage retains its existing 900 ms idle departure in immersive mode.
- Quick browsing removes the pinned journey and automatic scrolling, exposes ordinary
  destination links, and remembers the choice in this browser under
  `cffa:carriage-view:v1`. If storage is unavailable, the choice still works for the session.
- Reduced-motion and mobile behavior remain supported. Switching modes keeps the
  reader at the carriage controls; skipping moves keyboard focus to the directory.

## Restaurant search

- Search name, cuisine, and tags with trimmed, case-insensitive substring matching.
- Keyword and cuisine conditions are combined. No ranking, pricing, AI, or API calls.
- `q` and `cuisine` are shareable URL parameters; history and reload preserve them.
  Separate cafe grids use `cafe-q` and `cafe-cuisine` so their controls are independent.
- Existing `restaurant` deep links are preserved. Single-cuisine grids also offer search.

## Contribution progress

- Program errors cannot be overridden; an AI-only failure can still use the existing
  verified manual review flow. Editing, approval validation, and authentication remain unchanged.
- Draft, ready, blocked, merged, deployment-failed, and live are distinct publication states.
- GitHub must report a non-draft open PR as mergeable and clean before it is described as mergeable.
- Live requires the latest non-transient production deployment to have a successful
  latest status and its SHA to equal or descend from the PR merge SHA.
- A preview, older success followed by a pending/failed deployment, missing evidence,
  permission error, or a deployment that lacks the merge does not prove the site is live.
- The GitHub App needs **Deployments: Read-only** on the public repository, and the
  deployment integration must publish production deployment records. If those records
  are unavailable, the admin page says deployment is unverified; no Vercel token is added.
- This uses repository-level GitHub deployment evidence. It does not probe the production
  domain or establish which of multiple Vercel projects owns a domain. A future multi-project
  setup should scope evidence to the intended project/environment before displaying live.

## Local calendars

- Export the next recorded LFM, a single upcoming convention, or the unexpired filtered list.
- Uses existing event facts, stable event UIDs, all-day dates, exclusive end dates, CRLF,
  escaped text, and UTF-8 line folding. Cancelled and ended events are excluded.
- Downloaded files are snapshots, not subscriptions or reservations. Check official
  links before travel and set reminders in the calendar application.
- Import `.ics` locally for preview only: up to 1 MB / 200 event records. Nothing is
  uploaded, persisted, or added to the website. Display original time zone labels;
  recurring rules are identified but not expanded. Imported text is not rendered as HTML.
- The ICS parser is loaded only when importing. The Furcon page receives one request-time
  London date for server/client consistency and updates its date when the browser stays open.

## Verification

```bash
node --import tsx --test scripts/ux-improvements.test.mts scripts/contribution-publication.test.mts
npx playwright test e2e/ux-improvements.spec.ts e2e/explore-autoplay.spec.ts e2e/admin-contribution-routing.spec.ts e2e/admin-score-review.spec.ts e2e/admin-submission-edit.spec.ts --workers=1
npx next typegen
npx tsc --noEmit --pretty false
npm run lint
npm run check:generated
npm run build
```

Admin tests use offline fixtures: they do not trigger real workflows or merge PRs.
Real GitHub App permissions and Vercel production evidence still need a read-only
acceptance check after deployment. `check:generated` refreshes generated timestamps;
timestamp-only changes are not part of these features.

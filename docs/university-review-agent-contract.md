# University review Agent contract

University submissions are append-only student testimony records. The Agent orchestrates validation, private image retrieval, deterministic materialization, and a Draft PR; it must not summarize, rewrite, translate, or embellish the submitted review.

## Accepted input

- `type` must be `university`.
- `universitySlug` must resolve through `lib/universities/catalog.ts`; `other` requires manual mapping before processing.
- The public author is `{ kind: "anonymous" }` unless `discloseSubmitterName` is true and `submitterName` is present.
- Rating, study years, stage, programme, review body, image order, and captions must match the accepted Issue payload.

## Allowlisted public changes

- `data/universities/reviews.json`
- `public/contributions/universities/<universitySlug>/review-<issueNumber>/<1-5>.webp`

University jobs must not modify application components, prompts, navigation, or another content collection.

## Deterministic materialization

After checking out the public repository, write the accepted Issue payload to a temporary JSON file and run:

```bash
npx tsx scripts/materialize-university-review.mts \
  --submission /tmp/submission.json \
  --issue-number 42
```

The command validates the payload, rejects unmapped schools, appends or replaces the record idempotently, and prints the required public image destinations. For every private R2 image key, the Agent must download the object, normalize orientation, strip EXIF/GPS/device metadata, convert it to WebP, and write it to the corresponding destination before opening the Draft PR.

## Evaluation gates

1. Re-running the same Issue produces one review, not a duplicate.
2. Anonymous public records contain no name field or private R2 key.
3. Named public records use the submitted display name without rewriting.
4. Rating and text equal the accepted payload after schema trimming only.
5. Public image count and captions match the submission, and every destination file exists.
6. Changed paths stay inside the two allowlisted locations.
7. `npm run test:university-reviews`, lint, TypeScript, and production build pass.
8. Passing evaluation only marks the PR ready; a human still merges it.

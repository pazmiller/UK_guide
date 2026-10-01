export function submissionRevision( submission?: { revision?: number } | null )
{
  return submission?.revision ?? 1;
}

export function submissionBranch( issueNumber: number, revision = 1 )
{
  return `agent/submission-${issueNumber}${revision === 1 ? '' : `-r${revision}`}`;
}

export function parseSubmissionBranch( branch: string )
{
  const match = branch.match( /^agent\/submission-([1-9]\d*)(?:-r([1-9]\d*))?$/ );
  return match ? { issueNumber: Number( match[1] ), revision: Number( match[2] ?? 1 ) } : null;
}

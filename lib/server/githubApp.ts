import 'server-only';

import { createAppAuth } from '@octokit/auth-app';
import type { ContributionSubmission } from '@/lib/contributions/schema';

const GITHUB_API_VERSION = '2026-03-10';
const ISSUE_DATA_PREFIX = '<!-- contribution-data:';
const ISSUE_DATA_SUFFIX = ' -->';

type GitHubIssue = {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  created_at: string;
  labels: Array<string | { name?: string }>;
  pull_request?: unknown;
};

type GitHubAppConfig = {
  appId: string;
  privateKey: string;
  installationId: number;
};

function readGitHubAppConfig(): GitHubAppConfig
{
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replaceAll( '\\n', '\n' );
  const installationId = Number( process.env.GITHUB_APP_INSTALLATION_ID );

  if ( !appId || !privateKey || !Number.isInteger( installationId ) || installationId <= 0 )
  {
    throw new Error( 'GitHub App credentials are not configured.' );
  }

  return { appId, privateKey, installationId };
}

export function getContributionRepository()
{
  const repository = process.env.CONTRIBUTION_GITHUB_REPOSITORY;
  const match = repository?.match( /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/ );
  if ( !match ) throw new Error( 'CONTRIBUTION_GITHUB_REPOSITORY is not configured.' );

  return { owner: match[ 1 ], repo: match[ 2 ], fullName: repository };
}

async function getInstallationToken()
{
  const config = readGitHubAppConfig();
  const auth = createAppAuth( config );
  const authentication = await auth( {
    type: 'installation',
    installationId: config.installationId,
  } );

  return authentication.token;
}

export async function githubRequest<T>( path: string, init: RequestInit = {} ): Promise<T>
{
  const token = await getInstallationToken();
  const response = await fetch( `https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
      ...init.headers,
    },
  } );

  if ( !response.ok )
  {
    throw new Error( `GitHub API request failed with status ${response.status}.` );
  }

  if ( response.status === 204 ) return undefined as T;
  return response.json() as Promise<T>;
}

function escapeHtml( value: string )
{
  return value
    .replaceAll( '&', '&amp;' )
    .replaceAll( '<', '&lt;' )
    .replaceAll( '>', '&gt;' )
    .replaceAll( '"', '&quot;' )
    .replaceAll( "'", '&#39;' );
}

function encodeSubmission( submission: ContributionSubmission )
{
  return Buffer.from( JSON.stringify( submission ), 'utf8' ).toString( 'base64url' );
}

export function parseSubmissionFromIssue( body: string | null )
{
  if ( !body ) return null;
  const start = body.indexOf( ISSUE_DATA_PREFIX );
  if ( start < 0 ) return null;
  const valueStart = start + ISSUE_DATA_PREFIX.length;
  const end = body.indexOf( ISSUE_DATA_SUFFIX, valueStart );
  if ( end < 0 ) return null;

  try
  {
    return JSON.parse( Buffer.from( body.slice( valueStart, end ), 'base64url' ).toString( 'utf8' ) ) as ContributionSubmission;
  } catch
  {
    return null;
  }
}

function buildIssueBody( submission: ContributionSubmission )
{
  const source = submission.sourceUrl
    ? `<a href="${escapeHtml( submission.sourceUrl )}">Open submitted link</a>`
    : 'Not supplied';

  const restaurantDetails = submission.type === 'restaurant' ? [
    `- **Cuisine:** ${escapeHtml( submission.cuisine === 'Other' ? submission.customCuisine : submission.cuisine || 'Not supplied' )}`,
    `- **Price:** ${escapeHtml( submission.price || 'Not supplied' )}`,
    `- **Recommendation reason:** ${escapeHtml( submission.recommendReason || 'Not supplied' )}`,
    `- **Signature dishes:** ${escapeHtml( submission.recommendSignatures || 'Not supplied' )}`,
  ] : [];

  return [
    '## Submission details',
    '',
    `- **Type:** ${escapeHtml( submission.type )}`,
    `- **Intent:** ${escapeHtml( submission.intent )}`,
    `- **Place / topic:** ${escapeHtml( submission.name )}`,
    `- **City / area:** ${escapeHtml( submission.city )}`,
    `- **Submitted by:** ${escapeHtml( submission.submitterName || 'Anonymous' )}`,
    `- **Source:** ${source}`,
    `- **Private image objects:** ${submission.imageKeys.length}`,
    ...restaurantDetails,
    '',
    '## Contributor notes',
    '',
    `<pre>${escapeHtml( submission.details )}</pre>`,
    '',
    'Raw submission data is private. Do not copy personal information into a public pull request.',
    '',
    `${ISSUE_DATA_PREFIX}${encodeSubmission( submission )}${ISSUE_DATA_SUFFIX}`,
  ].join( '\n' );
}

const labelColours: Record<string, string> = {
  'status:submitted': '1D76DB',
  'status:accepted': '0E8A16',
  'status:agent-running': 'FBCA04',
  'status:draft-pr': '5319E7',
  'status:ready': '0E8A16',
  'status:failed': 'D93F0B',
  'status:merged': '6F42C1',
  'status:closed': '6A737D',
};

async function ensureLabel( label: string )
{
  const repository = getContributionRepository();
  try
  {
    await githubRequest( `/repos/${repository.owner}/${repository.repo}/labels`, {
      method: 'POST',
      body: JSON.stringify( {
        name: label,
        color: labelColours[ label ] ?? 'BFDADC',
      } ),
    } );
  } catch ( error )
  {
    if ( error instanceof Error && error.message.includes( '422' ) ) return;
    throw error;
  }
}

export async function createContributionIssue( submission: ContributionSubmission )
{
  const repository = getContributionRepository();
  const labels = [
    'status:submitted',
    `type:${submission.type}`,
    `intent:${submission.intent}`,
  ];
  await Promise.all( labels.map( ensureLabel ) );

  return githubRequest<GitHubIssue>( `/repos/${repository.owner}/${repository.repo}/issues`, {
    method: 'POST',
    body: JSON.stringify( {
      title: `[投稿] ${submission.name} · ${submission.city}`,
      body: buildIssueBody( submission ),
      labels,
    } ),
  } );
}

export async function listContributionIssues()
{
  const repository = getContributionRepository();
  const issues = await githubRequest<GitHubIssue[]>(
    `/repos/${repository.owner}/${repository.repo}/issues?state=all&per_page=100&sort=created&direction=desc`,
  );

  return issues.filter( issue => !issue.pull_request ).map( issue => ( {
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
    createdAt: issue.created_at,
    labels: issue.labels.map( label => typeof label === 'string' ? label : label.name ?? '' ).filter( Boolean ),
    submission: parseSubmissionFromIssue( issue.body ),
  } ) );
}

export async function replaceStatusLabel( issueNumber: number, status: string, closeIssue = false )
{
  const repository = getContributionRepository();
  await ensureLabel( status );
  const issue = await githubRequest<GitHubIssue>( `/repos/${repository.owner}/${repository.repo}/issues/${issueNumber}` );
  const labels = issue.labels
    .map( label => typeof label === 'string' ? label : label.name ?? '' )
    .filter( label => label && !label.startsWith( 'status:' ) );

  await githubRequest( `/repos/${repository.owner}/${repository.repo}/issues/${issueNumber}`, {
    method: 'PATCH',
    body: JSON.stringify( {
      labels: [ ...labels, status ],
      ...( closeIssue ? { state: 'closed', state_reason: 'not_planned' } : {} ),
    } ),
  } );
}

export async function dispatchContributionWorkflow( eventType: string, payload: Record<string, unknown> )
{
  const repository = getContributionRepository();
  await githubRequest( `/repos/${repository.owner}/${repository.repo}/dispatches`, {
    method: 'POST',
    body: JSON.stringify( {
      event_type: eventType,
      client_payload: payload,
    } ),
  } );
}

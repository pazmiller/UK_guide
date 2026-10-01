import 'server-only';

import { createAppAuth } from '@octokit/auth-app';
import { createHash } from 'node:crypto';
import type { ContributionSubmission, TipRouting } from '@/lib/contributions/schema';
import { requiresApprovedChange } from '@/lib/contributions/schema';
import { loadManualReview } from './manualContributionReview';
import type { ChangeRequest } from '@/lib/contributions/change-contract';
import { submissionBranch, submissionRevision } from '@/lib/contributions/revision';

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

export class GitHubRequestError extends Error
{
  readonly path: string;

  constructor( readonly status: number, path: string )
  {
    super( `GitHub API request failed with status ${status}.` );
    this.name = 'GitHubRequestError';
    this.path = path.split( /[?#]/, 1 )[0];
  }
}

export function describeGitHubReadFailure( error: unknown, context: 'manual-review' | 'ready-pr' | 'actions-run', issueNumber: number )
{
  const status = error instanceof GitHubRequestError ? error.status : null;
  console.warn( '[contributions] GitHub read failed.', {
    context, issueNumber, status,
    kind: error instanceof GitHubRequestError ? 'http' : error instanceof TypeError ? 'connection-or-response' : 'unexpected',
  } );
  if ( status === 401 ) return 'GitHub 身份验证失败（401），请检查网站 GitHub App 配置。';
  if ( status === 403 ) return 'GitHub 拒绝读取审核资料（403），请检查网站 GitHub App 的仓库访问权限。';
  if ( status === 404 ) return '未找到审核资料（404），请检查记录是否已删除以及 GitHub App 的仓库访问权限。';
  if ( status === 429 || ( status !== null && status >= 500 ) ) return `GitHub 服务暂时不可用（${status}），请稍后刷新重试。`;
  if ( status !== null ) return `读取 GitHub 审核资料失败（${status}），请稍后重试；若持续失败，请检查服务器日志。`;
  if ( error instanceof TypeError ) return '暂时无法连接或读取 GitHub，请检查网络后刷新重试。';
  return '核对 GitHub 审核资料时发生异常，请检查网站配置和服务器日志后重试。';
}

export async function githubRequest<T>( path: string, init: RequestInit = {} ): Promise<T>
{
  const token = await getInstallationToken();
  const response = await fetch( `https://api.github.com${path}`, {
    ...init,
    cache: 'no-store',
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
    throw new GitHubRequestError( response.status, path );
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

export function submissionHashFromIssue( body: string | null )
{
  const encoded = body?.match( /<!-- contribution-data:([A-Za-z0-9_-]+) -->/ )?.[1];
  return encoded ? createHash( 'sha256' ).update( Buffer.from( encoded, 'base64url' ) ).digest( 'hex' ) : '';
}

export function buildIssueBody( submission: ContributionSubmission )
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

  const universityDetails = submission.type === 'university' ? [
    `- **University slug:** ${escapeHtml( submission.universitySlug )}`,
    `- **Study years:** ${escapeHtml( submission.studyYear )}`,
    `- **Stage:** ${escapeHtml( submission.studyStage )}`,
    `- **Programme:** ${escapeHtml( submission.studyProgram )}`,
    `- **Rating:** ${submission.rating?.toFixed( 1 ) ?? 'Not supplied'} / 5`,
    `- **Name visibility:** ${submission.discloseSubmitterName ? 'Public' : 'Anonymous'}`,
    `- **Particularly good:** ${escapeHtml( submission.universityPros || 'Not supplied' )}`,
    `- **Particularly bad:** ${escapeHtml( submission.universityCons || 'Not supplied' )}`,
  ] : [];

  const imageDetails = submission.type === 'university'
    ? submission.imageKeys.map( ( _, index ) =>
      `- **Image ${index + 1}:** ${escapeHtml( submission.imageCaptions?.[ index ] || 'No description supplied' )}`,
    )
    : [];

  return [
    '## Submission details',
    '',
    `- **Type:** ${escapeHtml( submission.type )}`,
    `- **Intent:** ${escapeHtml( submission.intent )}`,
    `- **Region:** ${escapeHtml( submission.region )}`,
    `- **Place / topic:** ${escapeHtml( submission.name )}`,
    ...( submission.city ? [ `- **City / area:** ${escapeHtml( submission.city )}` ] : [] ),
    `- **Submitted by:** ${escapeHtml( submission.submitterName || 'Anonymous' )}`,
    `- **Source:** ${source}`,
    `- **Private image objects:** ${submission.imageKeys.length}`,
    ...restaurantDetails,
    ...universityDetails,
    ...imageDetails,
    '',
    '## Contributor notes',
    '',
    `<pre>${escapeHtml( submission.details )}</pre>`,
    ...( submission.existingEdit ? [
      '', '## Selected existing entry',
      `<pre>${escapeHtml( submission.existingEdit.target.city )} / ${escapeHtml( submission.existingEdit.target.id )}</pre>`,
      ...submission.existingEdit.changes.flatMap( change => [
        `### ${escapeHtml( change.field )}`,
        'Before:', `<pre>${escapeHtml( submission.existingEdit!.before[change.field] )}</pre>`,
        'Requested after:', `<pre>${escapeHtml( change.after )}</pre>`,
      ] ),
    ] : [] ),
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
  'status:manual-review': 'D9B46F',
  'status:manual-ready': '0F766E',
  'status:merged': '6F42C1',
  'status:closed': '6A737D',
  'routing:guide': 'D9B46F',
  'routing:agent': '0F766E',
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
  const issueContext = submission.type === 'university'
    ? `${submission.studyYear} · ${submission.studyProgram}`
    : submission.city;

  return githubRequest<GitHubIssue>( `/repos/${repository.owner}/${repository.repo}/issues`, {
    method: 'POST',
    body: JSON.stringify( {
      title: `[投稿] ${submission.name} · ${issueContext}`,
      body: buildIssueBody( submission ),
      labels,
    } ),
  } );
}

async function readyContributionPrUrl( issueNumber: number, revision: number )
{
  const repository = process.env.PUBLIC_GITHUB_REPOSITORY!;
  const head = `${repository.split( '/' )[0]}:${submissionBranch( issueNumber, revision )}`;
  const prs = await githubRequest<Array<{ html_url: string; draft: boolean }>>(
    `/repos/${repository}/pulls?state=open&head=${encodeURIComponent( head )}`,
  );
  return prs.find( pr => !pr.draft )?.html_url ?? null;
}

export async function listContributionIssues()
{
  const repository = getContributionRepository();
  const issues = await githubRequest<GitHubIssue[]>(
    `/repos/${repository.owner}/${repository.repo}/issues?state=all&per_page=100&sort=created&direction=desc`,
  );

  return Promise.all( issues.filter( issue => !issue.pull_request ).map( async issue => ( {
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
    createdAt: issue.created_at,
    labels: issue.labels.map( label => typeof label === 'string' ? label : label.name ?? '' ).filter( Boolean ),
    submission: parseSubmissionFromIssue( issue.body ),
    submissionHash: submissionHashFromIssue( issue.body ),
    readyPrUrl: issue.labels.some( label => ['status:ready', 'status:manual-ready'].includes( typeof label === 'string' ? label : label.name ?? '' ) )
      ? await readyContributionPrUrl( issue.number, submissionRevision( parseSubmissionFromIssue( issue.body ) ) ).catch( error => { describeGitHubReadFailure( error, 'ready-pr', issue.number ); return null; } ) : null,
    review: issue.labels.some( label => [ 'status:manual-review', 'status:manual-ready', 'status:failed' ].includes( typeof label === 'string' ? label : label.name ?? '' ) )
      ? await loadManualReview( issue.number ).catch( error => ( { report: null, eligible: false, message: describeGitHubReadFailure( error, 'manual-review', issue.number ), prUrl: null } ) ) : null,
  } ) ) );
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

export async function acceptContributionIssue( issueNumber: number, tipRouting?: TipRouting, change?: ChangeRequest )
{
  const repository = getContributionRepository();
  const issue = await githubRequest<GitHubIssue>( `/repos/${repository.owner}/${repository.repo}/issues/${issueNumber}` );
  const submission = parseSubmissionFromIssue( issue.body );
  if ( !submission ) throw new Error( `Issue #${issueNumber} has no valid contribution payload.` );
  if ( requiresApprovedChange( submission ) && ( !change || change.issueNumber !== issueNumber ) ) throw new Error( 'An explicit approved field change is required.' );
  if ( submission.type === 'tip' && !tipRouting ) throw new Error( 'Helpful tips require an admin routing choice.' );
  if ( submission.type !== 'tip' && tipRouting ) throw new Error( 'Only helpful tips accept an admin routing choice.' );

  const routingLabel = tipRouting ? `routing:${tipRouting}` : '';
  await Promise.all( [ 'status:accepted', routingLabel ].filter( Boolean ).map( ensureLabel ) );
  const labels = issue.labels
    .map( label => typeof label === 'string' ? label : label.name ?? '' )
    .filter( label => label && !label.startsWith( 'status:' ) && !label.startsWith( 'routing:' ) );

  await githubRequest( `/repos/${repository.owner}/${repository.repo}/issues/${issueNumber}`, {
    method: 'PATCH',
    body: JSON.stringify( { labels: [ ...labels, ...( routingLabel ? [ routingLabel ] : [] ), 'status:accepted' ] } ),
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

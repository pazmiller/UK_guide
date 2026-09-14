import 'server-only';
import { evaluationReportSchema, judgeOnlyFailure, parseEvaluationComment, REPORT_PREFIX, type EvaluationReport } from '@/lib/contributions/evaluation';
import { getContributionRepository, githubRequest, replaceStatusLabel, dispatchContributionWorkflow } from './githubApp';
import { createHash } from 'node:crypto';
import { CHANGE_PREFIX, changeRequestSchema } from '@/lib/contributions/change-contract';

async function currentApprovalMatches( issueNumber: number, report: EvaluationReport ) {
  if ( !report.fidelity ) return false;
  const repo = getContributionRepository().fullName;
  const issue = await githubRequest<{ body: string }>( `/repos/${repo}/issues/${issueNumber}` );
  const encoded = issue.body.match( /<!-- contribution-data:([A-Za-z0-9_-]+) -->/ )?.[1];
  if ( !encoded ) return false;
  const hash = ( value: string ) => createHash( 'sha256' ).update( value ).digest( 'hex' );
  if ( hash( Buffer.from( encoded, 'base64url' ).toString( 'utf8' ) ) !== report.fidelity.submissionHash ) return false;
  let latest = '';
  for ( let page = 1; page <= 20; page++ ) {
    const comments = await githubRequest<Comment[]>( `/repos/${repo}/issues/${issueNumber}/comments?per_page=100&page=${page}` );
    for ( const comment of comments ) if ( comment.performed_via_github_app?.id === Number( process.env.GITHUB_APP_ID ) && comment.body.includes( CHANGE_PREFIX ) ) latest = comment.body;
    if ( comments.length < 100 ) {
      const start = latest.indexOf( CHANGE_PREFIX ) + CHANGE_PREFIX.length, end = latest.indexOf( ' -->', start );
      try { const request = changeRequestSchema.parse( JSON.parse( latest.slice( start, end ) ) ); return request.issueNumber === issueNumber && hash( JSON.stringify( request ) ) === report.fidelity.requestHash; } catch { return false; }
    }
  }
  return false;
}

type Comment = { id: number; body: string; performed_via_github_app?: { id: number } | null };
type PullRequest = { number: number; node_id: string; draft: boolean; state: string; merged: boolean; head: { sha: string; ref: string; repo: { full_name: string } }; base: { sha: string; ref: string; repo: { full_name: string } } };
export type ManualReview = { report: EvaluationReport | null; eligible: boolean; message: string; prUrl: string | null };

export class ReviewConflict extends Error {}

function publicRepository(): string
{
  const repo = process.env.PUBLIC_GITHUB_REPOSITORY;
  if ( !repo || !/^[\w.-]+\/[\w.-]+$/.test( repo ) ) throw new Error( 'PUBLIC_GITHUB_REPOSITORY is not configured.' );
  return repo;
}

async function latestReport( issueNumber: number ): Promise<{ report: EvaluationReport | null; failure: string }>
{
  const repo = getContributionRepository().fullName;
  const appId = Number( process.env.GITHUB_APP_ID );
  if ( !Number.isSafeInteger( appId ) || appId <= 0 ) throw new Error( 'GitHub App identity missing.' );
  let latest: EvaluationReport | null = null;
  let failure = '';
  for ( let page = 1; page <= 20; page++ ) {
    const comments = await githubRequest<Comment[]>( `/repos/${repo}/issues/${issueNumber}/comments?per_page=100&page=${page}` );
    for ( const comment of comments ) {
      if ( comment.performed_via_github_app?.id !== appId ) continue;
      if ( comment.body.startsWith( 'Agent run failed before completion:' ) ) { latest = null; failure = comment.body.slice( 0, 1200 ); continue; }
      if ( !comment.body.includes( REPORT_PREFIX ) ) continue;
      // A newer malformed assessment invalidates an older one rather than falling back.
      latest = parseEvaluationComment( comment.body );
      failure = '';
    }
    if ( comments.length < 100 ) return { report: latest?.issueNumber === issueNumber ? latest : null, failure };
  }
  throw new Error( 'Too many comments to verify the latest evaluation.' );
}

export function matchingReviewCommit( report: EvaluationReport, pr: PullRequest, repo: string ): boolean
{
  return pr.number === report.pullRequestNumber && pr.state === 'open' && !pr.merged
    && pr.head.ref === `agent/submission-${report.issueNumber}`
    && pr.head.repo.full_name === repo && pr.base.repo.full_name === repo
    && pr.head.sha === report.headSha && pr.base.sha === report.baseSha;
}

export async function loadManualReview( issueNumber: number ): Promise<ManualReview>
{
  const { report, failure } = await latestReport( issueNumber );
  if ( !report ) {
    const repo = publicRepository();
    const prs = await githubRequest<PullRequest[]>( `/repos/${repo}/pulls?state=open&head=${encodeURIComponent( `${repo.split( '/' )[0]}:agent/submission-${issueNumber}` )}` );
    return { report: null, eligible: false, message: failure || '缺少可信的完整评估记录，请重新评估；不能仅凭历史平均分放行。', prUrl: prs.length === 1 ? `https://github.com/${repo}/pull/${prs[0].number}` : null };
  }
  const repo = publicRepository();
  const prUrl = `https://github.com/${repo}/pull/${report.pullRequestNumber}`;
  if ( !await currentApprovalMatches( issueNumber, report ) ) return { report, prUrl, eligible: false, message: '缺少本版投稿的字段校验，或批准内容已改变。请重新确认修改范围并评估。' };
  const pr = await githubRequest<PullRequest>( `/repos/${repo}/pulls/${report.pullRequestNumber}` );
  if ( !matchingReviewCommit( report, pr, repo ) ) return { report, prUrl, eligible: false, message: 'PR 已关闭或提交/基线发生变化，旧评分不能用于放行，请重新评估。' };
  const run = await githubRequest<{ status: string }>( `/repos/${getContributionRepository().fullName}/actions/runs/${report.runId}` );
  if ( run.status !== 'completed' ) return { report, prUrl, eligible: false, message: '本次评估尚未结束，请稍后刷新。' };
  return { report, prUrl, eligible: pr.draft && judgeOnlyFailure( report ), message: !pr.draft ? 'PR 已为 Ready；原 AI 结论仍保留。' : judgeOnlyFailure( report ) ? '程序检查已通过；请核对内容差异和 AI 疑点／低评分。人工放行不会合并 PR。' : '存在程序检查失败，不允许人工绕过。' };
}

async function setDraft( pr: PullRequest, draft: boolean )
{
  if ( pr.draft === draft ) return;
  const mutation = draft ? 'convertPullRequestToDraft' : 'markPullRequestReadyForReview';
  const result = await githubRequest<{ errors?: unknown[]; data?: unknown }>( '/graphql', {
    method: 'POST', body: JSON.stringify( { query: `mutation($id: ID!) { ${mutation}(input: {pullRequestId: $id}) { pullRequest { id } } }`, variables: { id: pr.node_id } } ),
  } );
  if ( result.errors?.length || !result.data ) throw new Error( 'GitHub could not change PR review state.' );
}

export async function manuallyApproveContribution( issueNumber: number, headSha: string, reason: string, actor: string )
{
  const issuePath = `/repos/${getContributionRepository().fullName}/issues/${issueNumber}`;
  const issue = await githubRequest<{ state: string; labels: Array<{ name: string }> }>( issuePath );
  if ( issue.state !== 'open' || !issue.labels.some( label => label.name === 'status:manual-review' ) ) throw new ReviewConflict( '这条投稿不处于待人工审核状态，请刷新。' );
  const review = await loadManualReview( issueNumber );
  if ( !review.eligible || !review.report || review.report.headSha !== headSha ) throw new ReviewConflict( review.message );
  const report = evaluationReportSchema.parse( review.report );
  const repo = publicRepository();
  const prPath = `/repos/${repo}/pulls/${report.pullRequestNumber}`;
  const pr = await githubRequest<PullRequest>( prPath );
  if ( !await currentApprovalMatches( issueNumber, report ) ) throw new ReviewConflict( '批准内容已变化，请重新审核。' );
  if ( !matchingReviewCommit( report, pr, repo ) || !pr.draft ) throw new ReviewConflict( 'PR 已发生变化，请刷新并重新评估。' );
  // Record the decision before mutation so even a partial failure has an audit trail.
  await githubRequest( `${issuePath}/comments`, { method: 'POST', body: JSON.stringify( { body: `人工放行决定（不代表 AI 通过；执行结果以 PR 状态为准）\n管理员：@${actor}\n时间：${new Date().toISOString()}\nPR：#${report.pullRequestNumber}\nCommit：${headSha}\n原评分：${report.judgeAverage.toFixed( 2 )} / 95\n理由：${reason}` } ) } );
  await setDraft( pr, false );
  const after = await githubRequest<PullRequest>( prPath );
  if ( !matchingReviewCommit( report, after, repo ) || !await currentApprovalMatches( issueNumber, report ) ) {
    if ( after.state === 'open' ) await setDraft( after, true );
    throw new ReviewConflict( '放行期间 PR 发生变化，已撤回 Ready，请重新评估。' );
  }
  await replaceStatusLabel( issueNumber, 'status:manual-ready' );
  const finalPr = await githubRequest<PullRequest>( prPath );
  if ( !matchingReviewCommit( report, finalPr, repo ) || !await currentApprovalMatches( issueNumber, report ) ) {
    await invalidateManualReview( issueNumber, report.pullRequestNumber );
    await dispatchContributionWorkflow( 'content-pr-updated', { issueNumber, pullRequestNumber: report.pullRequestNumber } );
    throw new ReviewConflict( 'PR 已更新，本次放行失效，已要求重新评估。' );
  }
}

export async function reevaluateContribution( issueNumber: number )
{
  const issue = await githubRequest<{ state: string; labels: Array<{ name: string }> }>( `/repos/${getContributionRepository().fullName}/issues/${issueNumber}` );
  if ( issue.state !== 'open' || !issue.labels.some( label => [ 'status:failed', 'status:manual-review', 'status:manual-ready' ].includes( label.name ) ) ) throw new ReviewConflict( '当前状态不能重新评估，请刷新。' );
  const repo = publicRepository();
  const prs = await githubRequest<PullRequest[]>( `/repos/${repo}/pulls?state=open&head=${encodeURIComponent( `${repo.split( '/' )[0]}:agent/submission-${issueNumber}` )}` );
  if ( prs.length !== 1 || prs[0].head.repo.full_name !== repo || prs[0].head.ref !== `agent/submission-${issueNumber}` ) throw new ReviewConflict( '没有唯一的现有开放 PR，无法重新评估。' );
  await setDraft( prs[0], true );
  await replaceStatusLabel( issueNumber, 'status:agent-running' );
  try {
    await dispatchContributionWorkflow( 'content-pr-updated', { issueNumber, pullRequestNumber: prs[0].number } );
  } catch ( error ) { await replaceStatusLabel( issueNumber, 'status:failed' ); throw error; }
}

export async function invalidateManualReview( issueNumber: number, prNumber: number )
{
  const issue = await githubRequest<{ labels: Array<{ name: string }> }>( `/repos/${getContributionRepository().fullName}/issues/${issueNumber}` );
  if ( !issue.labels.some( label => [ 'status:manual-review', 'status:manual-ready' ].includes( label.name ) ) ) return;
  const pr = await githubRequest<PullRequest>( `/repos/${publicRepository()}/pulls/${prNumber}` );
  if ( pr.state === 'open' ) await setDraft( pr, true );
  await replaceStatusLabel( issueNumber, 'status:agent-running' );
}

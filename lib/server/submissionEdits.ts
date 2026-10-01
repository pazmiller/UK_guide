import 'server-only';
import { contributionSubmissionSchema, type ContributionSubmission } from '@/lib/contributions/schema';
import { editableSubmissionStatuses, type AdminSubmissionEdits } from '@/lib/contributions/admin-edit';
import { submissionBranch, submissionRevision } from '@/lib/contributions/revision';
import { findCandidate } from '@/lib/contributions/change-engine';
import { validateExistingEdit } from '@/lib/contributions/existing';
import { currentChangeSources } from './approvedChanges';
import { buildIssueBody, getContributionRepository, githubRequest, parseSubmissionFromIssue, submissionHashFromIssue } from './githubApp';
import { ReviewConflict } from './manualContributionReview';

type EditableIssue = { body: string; state: string; labels: Array<string | { name?: string }> };
type PreviousPr = { number: number; node_id: string; state: string; draft: boolean; merged_at: string | null; html_url: string };
const names = ( issue: EditableIssue ) => issue.labels.map( label => typeof label === 'string' ? label : label.name ?? '' );

export async function saveSubmissionEdits( issueNumber: number, expectedHash: string, edits: AdminSubmissionEdits, actor: string )
{
  const issuePath = `/repos/${getContributionRepository().fullName}/issues/${issueNumber}`;
  const issue = await githubRequest<EditableIssue>( issuePath );
  const original = parseSubmissionFromIssue( issue.body );
  if ( !original || issue.state !== 'open' || !names( issue ).some( label => editableSubmissionStatuses.includes( label ) ) )
    throw new ReviewConflict( '当前投稿正在等待／运行 Agent，或已关闭／合并，不能编辑。请刷新后重试。' );
  if ( submissionHashFromIssue( issue.body ) !== expectedHash ) throw new ReviewConflict( '投稿已被其他管理员修改，请刷新后重新编辑。' );

  const common = ['name', 'city', 'region', 'details', 'sourceUrl'];
  const allowed = original.existingEdit ? ['sourceUrl', ...( original.intent === 'update' ? ['existingChanges'] : [] )]
    : original.type === 'university' ? ['details', 'sourceUrl', 'studyStartYear', 'studyEndYear', 'studyStage', 'studyProgram', 'universityPros', 'universityCons', 'rating']
    : [...common, ...( original.type === 'restaurant' ? ['cuisine', 'customCuisine', 'price', 'recommendReason', 'recommendSignatures'] : [] )];
  if ( Object.keys( edits ).some( key => !allowed.includes( key ) ) ) throw new ReviewConflict( '不能更改投稿类型、处理方式、已选条目身份、图片或投稿者授权。' );
  const { existingChanges, ...fields } = edits;
  const nextInput = { ...original, ...fields };
  if ( existingChanges && original.existingEdit ) nextInput.existingEdit = { ...original.existingEdit, changes: existingChanges };
  if ( original.type === 'university' ) nextInput.studyYear = `${nextInput.studyStartYear}–${nextInput.studyEndYear}`;
  if ( original.type === 'restaurant' && nextInput.cuisine !== 'Other' ) nextInput.customCuisine = '';
  const parsed = contributionSubmissionSchema.safeParse( nextInput );
  if ( !parsed.success ) throw new ReviewConflict( parsed.error.issues[0]?.message ?? '请检查修改内容。' );
  const next: ContributionSubmission = parsed.data;
  if ( next.existingEdit ) {
    const source = await currentChangeSources();
    try {
      const candidate = findCandidate( source.files, next.existingEdit.target );
      validateExistingEdit( next.existingEdit, { ...candidate, cityName: next.city, display: {}, images: [] }, next.intent, next.type, next.region, next.name, next.city, next.imageKeys.length );
    } catch ( error ) { throw new ReviewConflict( error instanceof Error ? error.message : '现有条目已变化，请重新核对。' ); }
  }
  const before = contributionSubmissionSchema.parse( original );
  const changedFields = ( Object.keys( next ) as Array<keyof ContributionSubmission> ).filter( key => JSON.stringify( next[key] ) !== JSON.stringify( before[key] ) );
  if ( !changedFields.length ) throw new ReviewConflict( '内容没有变化，无需保存。' );

  const publicRepository = process.env.PUBLIC_GITHUB_REPOSITORY!;
  const oldRevision = submissionRevision( original );
  const branch = submissionBranch( issueNumber, oldRevision );
  const prs = await githubRequest<PreviousPr[]>( `/repos/${publicRepository}/pulls?state=all&head=${encodeURIComponent( `${publicRepository.split( '/' )[0]}:${branch}` )}` );
  if ( prs.some( pr => pr.merged_at ) ) throw new ReviewConflict( '此投稿的 PR 已合并，请另建修改资料投稿。' );
  const openPrs = prs.filter( pr => pr.state === 'open' );
  next.revision = oldRevision + 1;
  const diff = Object.fromEntries( changedFields.map( key => [key, { before: before[key], after: next[key] }] ) );
  const audit = `管理员 @${actor} 请求保存投稿修订：第 ${oldRevision} 版 → 第 ${next.revision} 版（是否保存成功以 Issue 正文版本为准）。\n旧投稿 SHA256：${expectedHash}\n旧审批与评分不适用于新版，保存不会启动 Agent。\n${openPrs.map( pr => `旧 PR：${pr.html_url}` ).join( '\n' )}\n\n<pre>${JSON.stringify( diff, null, 2 ).replaceAll( '&', '&amp;' ).replaceAll( '<', '&lt;' ).replaceAll( '>', '&gt;' )}</pre>`;
  if ( audit.length > 60000 ) throw new ReviewConflict( '本次修改过长，请分次保存。' );
  for ( const pr of openPrs.filter( pr => !pr.draft ) ) {
    const result = await githubRequest<{ data?: unknown; errors?: unknown[] }>( '/graphql', {
      method: 'POST', body: JSON.stringify( { query: 'mutation($id: ID!) { convertPullRequestToDraft(input: {pullRequestId: $id}) { pullRequest { id } } }', variables: { id: pr.node_id } } ),
    } );
    if ( result.errors?.length || !result.data ) throw new ReviewConflict( '旧 PR 无法撤回 Ready，尚未保存投稿，请稍后重试。' );
  }
  const latest = await githubRequest<EditableIssue>( issuePath );
  if ( latest.state !== 'open' || submissionHashFromIssue( latest.body ) !== expectedHash || !names( latest ).some( label => editableSubmissionStatuses.includes( label ) ) )
    throw new ReviewConflict( '保存期间投稿状态已改变，请刷新后重新编辑。' );

  await githubRequest( `${issuePath}/comments`, { method: 'POST', body: JSON.stringify( { body: audit } ) } );
  const context = next.type === 'university' ? `${next.studyYear} · ${next.studyProgram}` : next.city;
  await githubRequest( issuePath, { method: 'PATCH', body: JSON.stringify( {
    title: `[投稿] ${next.name} · ${context}`, body: buildIssueBody( next ),
    labels: [...names( latest ).filter( label => label && !label.startsWith( 'status:' ) && !label.startsWith( 'routing:' ) ), 'status:submitted'],
  } ) } );
  // Close only after the new revision is saved: old-PR webhooks must see the new version.
  let warning = '';
  for ( const pr of openPrs ) {
    try { await githubRequest( `/repos/${publicRepository}/pulls/${pr.number}`, { method: 'PATCH', body: JSON.stringify( { state: 'closed' } ) } ); }
    catch { warning = '新版已保存，但旧 PR 关闭失败；旧 PR 已撤回 Draft，请到 GitHub 手动关闭，勿合并旧版本。'; }
  }
  return { ok: true, revision: next.revision, ...( warning ? { warning } : {} ) };
}

import 'server-only';
import { createHash } from 'node:crypto';
import { changeRequestSchema, CHANGE_PREFIX, type ChangeRequest } from '@/lib/contributions/change-contract';
import { candidates, expectedFiles, findCandidate, splitImages, type Files } from '@/lib/contributions/change-engine';
import { getContributionRepository, githubRequest, parseSubmissionFromIssue } from './githubApp';
import { ReviewConflict } from './manualContributionReview';
import { normalizeExact, type ChangeTarget } from '@/lib/contributions/change-contract';

function selectedTargetMatches( left: ChangeTarget, right: ChangeTarget ) {
  return JSON.stringify( left ) === JSON.stringify( right );
}

const hash = ( value: string ) => createHash( 'sha256' ).update( value ).digest( 'hex' );
export async function changeIssue( issueNumber: number ) {
  const issue = await githubRequest<{ body: string; state: string; labels: Array<{ name: string }> }>( `/repos/${getContributionRepository().fullName}/issues/${issueNumber}` );
  const submission = parseSubmissionFromIssue( issue.body );
  const encoded = issue.body.match( /<!-- contribution-data:([A-Za-z0-9_-]+) -->/ )?.[1];
  if ( !submission || !encoded || issue.state !== 'open' ) throw new ReviewConflict( '投稿不存在、已关闭或数据不完整。' );
  return { issue, submission, submissionHash: hash( Buffer.from( encoded, 'base64url' ).toString( 'utf8' ) ) };
}
export async function currentChangeSources() {
  const repo = process.env.PUBLIC_GITHUB_REPOSITORY;
  if ( !repo || !/^[\w.-]+\/[\w.-]+$/.test( repo ) ) throw new Error( 'PUBLIC_GITHUB_REPOSITORY missing.' );
  const branch = process.env.PUBLIC_DEFAULT_BRANCH || 'master';
  const commit = await githubRequest<{ sha: string }>( `/repos/${repo}/commits/${encodeURIComponent( branch )}` );
  const tree = await githubRequest<{ truncated: boolean; tree: Array<{ path: string; type: string }> }>( `/repos/${repo}/git/trees/${commit.sha}?recursive=1` );
  if ( tree.truncated ) throw new ReviewConflict( '仓库目录不完整，不能确认修改范围。' );
  const paths = tree.tree.filter( item => item.type === 'blob' && ( ['src/DATA.md', 'src/DATA.json', 'lib/server/cities.ts', 'lib/server/contributionCities.ts', 'data/cityRegistry.ts'].includes( item.path ) || /^data\/(?:(?:europa|london)\/)?[\w-]+\.ts$/.test( item.path ) ) ).map( item => item.path );
  const files: Files = Object.fromEntries( await Promise.all( paths.map( async file => {
    const content = await githubRequest<{ content: string; encoding: string }>( `/repos/${repo}/contents/${file}?ref=${commit.sha}` );
    if ( content.encoding !== 'base64' ) throw new ReviewConflict( '文件过大或无法读取。' );
    return [file, Buffer.from( content.content, 'base64' ).toString( 'utf8' )];
  } ) ) );
  return { baseSha: commit.sha, files };
}
export async function prepareChange( issueNumber: number ) {
  const loaded = await changeIssue( issueNumber );
  if ( !['restaurant', 'attraction'].includes( loaded.submission.type ) || !['update', 'image'].includes( loaded.submission.intent ) )
    throw new ReviewConflict( '第一阶段仅自动处理已有餐厅／景点的字段修改和补充图片；此操作需要人工处理。' );
  const source = await currentChangeSources();
  if ( loaded.submission.existingEdit ) {
    const edit = loaded.submission.existingEdit;
    let entry;
    try { entry = findCandidate( source.files, edit.target ); }
    catch { throw new ReviewConflict( '用户选择的条目已变化，不能自动改选其他条目。' ); }
    for ( const [field, value] of Object.entries( edit.before ) ) {
      if ( normalizeExact( entry.fields[field as keyof typeof entry.fields] ?? '' ) !== normalizeExact( value ) ) throw new ReviewConflict( '用户提交后原资料已变化，请先人工处理冲突。' );
    }
  }
  return { baseSha: source.baseSha, submissionHash: loaded.submissionHash,
    candidates: candidates( source.files ).filter( candidate => ( loaded.submission.type === 'attraction' ? candidate.target.category === 'attraction' : candidate.target.category !== 'attraction' ) && candidate.target.region === loaded.submission.region && ( !loaded.submission.existingEdit || selectedTargetMatches( candidate.target, loaded.submission.existingEdit.target ) ) ),
    imagePaths: loaded.submission.imageKeys.map( ( _, i ) => `/contributions/${issueNumber}/${i + 1}.webp` ),
  };
}
export async function approveChange( issueNumber: number, input: ChangeRequest, actor: string ) {
  const request = changeRequestSchema.parse( { ...input, issueNumber, actor, approvedAt: new Date().toISOString() } );
  if ( request.fields.every( field => field.before === field.after ) ) throw new ReviewConflict( '内容已经相同，无需提交修改。' );
  const loaded = await changeIssue( issueNumber );
  if ( !loaded.issue.labels.some( label => ['status:submitted', 'status:failed', 'status:manual-review'].includes( label.name ) ) ) throw new ReviewConflict( '当前投稿正在处理或已完成，请刷新。' );
  if ( loaded.submissionHash !== request.submissionHash || loaded.submission.intent !== request.operation || !['restaurant', 'attraction'].includes( loaded.submission.type ) ) throw new ReviewConflict( '投稿内容已变化，请重新确认。' );
  if ( loaded.submission.existingEdit ) {
    const edit = loaded.submission.existingEdit;
    if ( !selectedTargetMatches( request.target, edit.target ) ) throw new ReviewConflict( '不能更换用户指定的条目。' );
    const textChanges = request.fields.filter( item => item.field !== 'images' );
    if ( textChanges.length !== edit.changes.length || edit.changes.some( item => !textChanges.some( approved => approved.field === item.field && normalizeExact( approved.after ) === normalizeExact( item.after ) && normalizeExact( approved.before ) === normalizeExact( edit.before[item.field] ) ) ) ) throw new ReviewConflict( '批准内容必须与用户提交的字段修改一致；需要其他修改请另建投稿。' );
  }
  if ( ( loaded.submission.type === 'attraction' ) !== ( request.target.category === 'attraction' ) || loaded.submission.region !== request.target.region ) throw new ReviewConflict( '目标类型或地区与投稿不一致。' );
  const source = await currentChangeSources();
  if ( request.baseSha !== source.baseSha ) throw new ReviewConflict( '网站版本已更新，请重新载入修改预览。' );
  try {
    const candidate = findCandidate( source.files, request.target );
    if ( loaded.submission.existingEdit ) {
      for ( const [field, before] of Object.entries( loaded.submission.existingEdit.before ) ) {
        if ( normalizeExact( candidate.fields[field as keyof typeof candidate.fields] ?? '' ) !== normalizeExact( before ) ) throw new ReviewConflict( '用户提交后原资料已变化，请先人工处理冲突。' );
      }
    }
    expectedFiles( source.files, request );
  } catch ( error ) { throw new ReviewConflict( error instanceof Error ? error.message : '无法确认目标和字段范围。' ); }
  const images = loaded.submission.imageKeys.map( ( _, i ) => `/contributions/${issueNumber}/${i + 1}.webp` );
  const imageChange = request.fields.find( item => item.field === 'images' );
  if ( images.length && ( !loaded.submission.imageRightsConfirmed || !imageChange ) ) throw new ReviewConflict( '必须确认版权并纳入全部投稿图片。' );
  if ( imageChange && JSON.stringify( splitImages( imageChange.after ) ) !== JSON.stringify( [...new Set( [...splitImages( imageChange.before ), ...images] )] ) ) throw new ReviewConflict( '图片仅允许按顺序补充本次上传的图片。' );
  if ( request.operation === 'image' && !images.length ) throw new ReviewConflict( '没有可补充的图片。' );
  const again = await changeIssue( issueNumber );
  if ( again.submissionHash !== loaded.submissionHash ) throw new ReviewConflict( '确认期间投稿已变化。' );
  const json = JSON.stringify( request ).replaceAll( '<', '\\u003c' ).replaceAll( '>', '\\u003e' );
  if ( json.length > 50000 ) throw new ReviewConflict( '批准内容过长，请拆成多个投稿。' );
  await githubRequest( `/repos/${getContributionRepository().fullName}/issues/${issueNumber}/comments`, { method: 'POST', body: JSON.stringify( { body: `管理员 @${actor} 批准字段修改。目标：${request.target.city} / ${request.target.id}\n\n${CHANGE_PREFIX}${json} -->` } ) } );
  return request;
}

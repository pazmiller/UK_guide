import 'server-only';
import type { Publication } from '@/lib/contributions/progress';
import { submissionBranch } from '@/lib/contributions/revision';
import { githubRequest } from './githubApp';

type Deployment = { id: number; sha: string; production_environment: boolean; transient_environment: boolean; environment: string; created_at: string };
type DeploymentStatus = { state: string; environment_url?: string; log_url?: string };
export type ProductionEvidence = { deployment: Deployment; status: DeploymentStatus | undefined } | null;
type Pr = { number: number; state: string; draft: boolean; merged: boolean; merge_commit_sha: string | null; mergeable: boolean | null; mergeable_state: string; head: { ref: string; repo: { full_name: string } }; base: { ref: string; repo: { full_name: string } } };

export async function latestProductionEvidence(): Promise<ProductionEvidence> {
  const repo = process.env.PUBLIC_GITHUB_REPOSITORY!;
  const deployments = await githubRequest<Deployment[]>( `/repos/${repo}/deployments?per_page=100` );
  const deployment = deployments.filter( item => item.production_environment && !item.transient_environment )
    .sort( ( a, b ) => b.created_at.localeCompare( a.created_at ) )[0];
  if ( !deployment ) return null;
  const statuses = await githubRequest<DeploymentStatus[]>( `/repos/${repo}/deployments/${deployment.id}/statuses?per_page=1` );
  return { deployment, status: statuses[0] };
}

export async function loadContributionPublication( issue: number, revision: number, production: () => Promise<ProductionEvidence> ): Promise<Publication> {
  const repo = process.env.PUBLIC_GITHUB_REPOSITORY!;
  const branch = submissionBranch( issue, revision );
  const prs = await githubRequest<Pr[]>( `/repos/${repo}/pulls?state=all&head=${encodeURIComponent( `${repo.split( '/' )[0]}:${branch}` )}` );
  const candidates = prs.filter( pr => pr.head.ref === branch && pr.head.repo?.full_name === repo && pr.base.repo?.full_name === repo && pr.base.ref === (process.env.PUBLIC_DEFAULT_BRANCH ?? 'master') );
  if ( candidates.length !== 1 ) return { state: 'unknown', prUrl: null, message: '没有找到唯一的本版网站 PR，请打开私人 Issue 核对或刷新重试。' };
  const pr = await githubRequest<Pr>( `/repos/${repo}/pulls/${candidates[0].number}` );
  const prUrl = `https://github.com/${repo}/pull/${pr.number}`;
  if ( !pr.merged ) {
    if ( pr.state !== 'open' ) return { state: 'blocked', prUrl, message: '网站 PR 已关闭但未合并，请核对关闭原因。' };
    if ( pr.draft ) return { state: 'draft', prUrl, message: 'PR 仍为 Draft，请等待评估完成或核对人工审核结果。' };
    return pr.mergeable === true && pr.mergeable_state === 'clean'
      ? { state: 'ready', prUrl, message: 'GitHub 当前报告 PR 无合并阻碍。打开网站 PR 核对差异后再合并；合并后仍需等待生产部署。' }
      : { state: 'blocked', prUrl, message: 'PR 已为 Ready，但合并条件尚未全部核实。请打开 PR 查看 CI、审批或冲突提示；这不表示 Agent 处理失败。' };
  }
  const pending: Publication = { state: 'merged', prUrl, message: 'PR 已合并；尚未核实包含该修改的成功生产部署。请在 Vercel 查看，稍后刷新。' };
  try {
    const evidence = await production();
    if ( !evidence || !pr.merge_commit_sha ) return pending;
    const { deployment, status } = evidence;
    const comparison = deployment.sha === pr.merge_commit_sha ? 'identical' : (await githubRequest<{ status: string }>( `/repos/${repo}/compare/${pr.merge_commit_sha}...${deployment.sha}` )).status;
    if ( !['identical', 'ahead'].includes( comparison ) ) return pending;
    if ( status?.state === 'success' ) return { state: 'live', prUrl, message: '已核实：最新生产部署成功，部署提交包含这条投稿。', deploymentUrl: /^https:\/\//.test( status.environment_url ?? '' ) ? status.environment_url : undefined };
    if ( status && ['failure', 'error'].includes( status.state ) ) return { state: 'deployment-failed', prUrl, message: 'PR 已合并，但包含该修改的最新生产部署失败。请查看 Vercel 构建日志并修复；无需重新投稿。' };
    return pending;
  } catch {
    return { ...pending, message: 'PR 已合并；无法读取生产部署证据。请检查 GitHub App 的 Deployments 只读权限及 Vercel 部署记录；上线状态待核实。' };
  }
}

import type { EvaluationReport } from './evaluation';
import { judgeOnlyFailure } from './evaluation';

export type Publication = {
  state: 'draft' | 'ready' | 'blocked' | 'merged' | 'live' | 'deployment-failed' | 'unknown';
  prUrl: string | null;
  message: string;
  deploymentUrl?: string;
};

export function contributionProgress( status: string, report?: EvaluationReport | null, publication?: Publication | null, reviewEligible?: boolean ) {
  if ( publication?.state === 'live' ) return { label: '网站已上线', tone: 'success', next: publication.message };
  if ( publication?.state === 'deployment-failed' ) return { label: '已合并 · 部署失败', tone: 'error', next: publication.message };
  if ( status === 'status:merged' || publication?.state === 'merged' ) return { label: '已合并 · 上线待核实', tone: 'info', next: publication?.message ?? 'PR 合并不代表部署完成。请在 Vercel 核对生产部署状态。' };
  if ( status === 'status:failed' || (report && !report.deterministicPassed) ) return { label: '程序处理失败', tone: 'error', next: '先展开技术详情定位错误；投稿有误可编辑后重新处理，代码或依赖问题需修复后重试。程序检查不能人工跳过。' };
  if ( status === 'status:manual-review' ) return report && reviewEligible !== false && judgeOnlyFailure( report )
    ? { label: 'AI 疑点／评分不足 · 待人工审核', tone: 'warning', next: '程序检查已通过。核对 PR 差异和下方 AI 说明后，可修改投稿重新处理，或填写理由人工放行。放行不会合并或上线。' }
    : { label: '审核证据待核实', tone: 'warning', next: '查看下方缺少的证据或未通过检查，刷新或重新评估。核验完成前不能人工放行。' };
  if ( ['status:ready', 'status:manual-ready'].includes( status ) ) return {
    label: publication?.state === 'ready' ? 'PR 可合并 · 尚未上线' : 'PR 待核实 · 尚未上线',
    tone: publication?.state === 'ready' ? 'success' : 'warning',
    next: publication?.message ?? '打开网站 PR 核对当前检查与冲突状态；Ready 只表示可供审核，不代表已经合并。',
  };
  if ( status === 'status:draft-pr' ) return { label: 'Draft PR · 评估尚未完成', tone: 'info', next: '等待完整评估结果；Draft PR 不能直接合并。若运行已停止，请检查 Actions 日志。' };
  if ( status === 'status:closed' ) return { label: '投稿已关闭', tone: 'info', next: '这条投稿不再等待处理；关闭投稿不代表网站内容已发布。' };
  if ( ['status:accepted', 'status:agent-running'].includes( status ) ) return { label: 'Agent 处理中', tone: 'info', next: '等待本次运行完成后刷新。无需重复提交同一条内容。' };
  return { label: '待管理员确认', tone: 'info', next: '核对投稿内容后交给 Agent；修改资料或补充图片需先确认目标条目与修改范围。' };
}

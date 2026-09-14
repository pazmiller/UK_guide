'use client';

import { useState } from 'react';
import type { ManualReview } from '@/lib/server/manualContributionReview';

export default function ContributionScoreReview( { review, canApprove, canReevaluate, busy, onApprove, onReevaluate }: {
  review: ManualReview;
  canApprove: boolean;
  canReevaluate: boolean;
  busy: boolean;
  onApprove: ( headSha: string, reason: string ) => void;
  onReevaluate: () => void;
} )
{
  const [ confirming, setConfirming ] = useState( false );
  const [ reason, setReason ] = useState( '' );
  const report = review.report;
  return (
    <section aria-label="AI 评分与人工审核" className="mt-5 rounded-xl border border-[#D9B46F]/60 bg-[#FFF8E8] p-5 text-[#1D3557]">
      <h3 className="text-base font-bold">AI 评分与人工审核</h3>
      {report && <>
        {report.fidelity && <div className="mt-4 space-y-3">
          <p className="text-sm font-bold">投稿内容核对：{report.fidelity.result.verdict === 'pass' ? '通过' : '需要人工确认'} · {report.fidelity.target.city} / {report.fidelity.target.id}</p>
          <p className="whitespace-pre-wrap text-sm">{report.fidelity.result.explanation}</p>
          {report.fidelity.fields.map( field => <div key={field.field} className="grid gap-3 rounded border border-[#D9B46F]/50 bg-white p-3 md:grid-cols-3">
            <div><p className="text-xs opacity-60">{field.field} · 修改前</p><p className="whitespace-pre-wrap break-words text-sm">{field.before || '（空）'}</p></div>
            <div><p className="text-xs opacity-60">管理员确认的投稿内容</p><p className="whitespace-pre-wrap break-words text-sm">{field.after || '（空）'}</p></div>
            <div><p className="text-xs opacity-60">程序验证后的实际内容</p><p className="whitespace-pre-wrap break-words text-sm">{field.after || '（空）'}</p></div>
          </div> )}
          {report.fidelity.result.issues.map( ( issue, i ) => <p key={i} className="text-sm text-amber-900">{issue.field}：{issue.reason}（原文：{issue.before}；投稿：{issue.submitted}；修改后：{issue.after}）</p> )}
        </div>}
        <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <p><strong className="text-3xl font-semibold text-[#93611B]">{report.judgeAverage.toFixed( 2 )}</strong><span className="ml-2 text-sm">/ {report.threshold} 分门槛</span></p>
          <p className="text-sm">第一次 {report.judgeScores[0].toFixed( 2 )} · 第二次 {report.judgeScores[1].toFixed( 2 )}</p>
        </div>
        <p className="mt-2 text-xs">确定性检查：{report.deterministicPassed ? '通过' : '未通过'} · 检索召回：{( report.sourceRecall * 100 ).toFixed( 1 )}% · 本次投稿检索：{report.dynamicCasePassed ? '通过' : '未通过'}</p>
        <p className="mt-4 whitespace-pre-wrap border-l-2 border-[#D9B46F] pl-3 text-sm leading-6">{report.explanation}</p>
        <p className="mt-3 text-xs opacity-65">评估提交 {report.headSha.slice( 0, 12 )} · {new Date( report.evaluatedAt ).toLocaleString( 'zh-CN' )}</p>
      </>}
      <p className="mt-3 text-sm leading-6">{review.message}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {review.prUrl && <a href={review.prUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-md border border-[#1D3557]/25 px-4 text-sm font-bold underline underline-offset-4">查看 PR 修改 ↗</a>}
        {canReevaluate && review.prUrl && <button type="button" disabled={busy} onClick={onReevaluate} className="min-h-11 rounded-md border border-[#1D3557]/25 px-4 text-sm font-bold disabled:opacity-40">重新评估现有 PR</button>}
        {canApprove && review.eligible && !confirming && <button type="button" disabled={busy} onClick={() => setConfirming( true )} className="min-h-11 rounded-md bg-[#1D3557] px-4 text-sm font-bold text-white disabled:opacity-40">人工放行到 Ready</button>}
      </div>
      {confirming && canApprove && review.eligible && report && <form className="mt-4 border-t border-[#D9B46F]/50 pt-4" onSubmit={event => { event.preventDefault(); if ( reason.trim() ) onApprove( report.headSha, reason.trim() ); }}>
        <label className="grid gap-2 text-sm font-bold">人工放行理由（必填）
          <textarea required maxLength={500} value={reason} onChange={event => setReason( event.target.value )} className="min-h-24 w-full rounded-md border border-[#1D3557]/30 bg-white p-3 font-normal" />
        </label>
        <p className="mt-2 text-xs leading-5">确认即表示你已检查 PR 修改。本操作保留原始 AI 评分，仅将 Draft 改为 Ready；不会合并或上线。后续修改需要重新审核。</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="submit" disabled={busy || !reason.trim()} className="min-h-11 rounded-md bg-[#0F766E] px-4 text-sm font-bold text-white disabled:opacity-40">{busy ? '正在核验并放行…' : '确认人工放行'}</button>
          <button type="button" disabled={busy} onClick={() => setConfirming( false )} className="min-h-11 px-4 text-sm underline">取消</button>
        </div>
      </form>}
    </section>
  );
}

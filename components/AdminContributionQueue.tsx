'use client';

import { useState } from 'react';
import { ExternalLink, FileImage, LoaderCircle, Play, RefreshCw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ContributionSubmission } from '@/lib/contributions/schema';
import { contributionIntentLabels, contributionRegionLabels, contributionTypeLabels } from '@/lib/contributions/schema';

export type AdminContributionIssue = {
  number: number;
  title: string;
  url: string;
  createdAt: string;
  labels: string[];
  submission: ContributionSubmission | null;
};

const statusLabels: Record<string, string> = {
  'status:submitted': '待处理',
  'status:accepted': '等待 Agent',
  'status:agent-running': 'Agent 处理中',
  'status:draft-pr': 'Draft PR',
  'status:ready': '等待 PR 审核',
  'status:failed': '处理失败',
  'status:merged': '已合并',
  'status:closed': '已关闭',
};

function issueStatus( labels: string[] )
{
  return labels.find( label => label.startsWith( 'status:' ) ) ?? 'status:submitted';
}

export default function AdminContributionQueue( { issues }: { issues: AdminContributionIssue[] } )
{
  const router = useRouter();
  const [ activeAction, setActiveAction ] = useState( '' );
  const [ error, setError ] = useState( '' );

  async function updateIssue( issueNumber: number, action: 'accept' | 'close' )
  {
    const actionId = `${issueNumber}:${action}`;
    setActiveAction( actionId );
    setError( '' );
    try
    {
      const response = await fetch( `/api/admin/contributions/${issueNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { action } ),
      } );
      const result = await response.json() as { error?: string };
      if ( !response.ok ) throw new Error( result.error ?? '操作没有完成。' );
      router.refresh();
    } catch ( caught )
    {
      setError( caught instanceof Error ? caught.message : '操作没有完成。' );
    } finally
    {
      setActiveAction( '' );
    }
  }

  if ( issues.length === 0 )
  {
    return <p className="border-y border-[#1D3557]/14 py-10 text-center font-bold text-[#1D3557]/60">审核队列目前是空的。</p>;
  }

  return (
    <div>
      {error && <p role="alert" className="mb-4 border-l-4 border-[#C92935] bg-[#C92935]/6 px-4 py-3 text-sm font-bold text-[#A51F2B]">{error}</p>}
      <div className="border-t border-[#1D3557]/14">
        {issues.map( issue => {
          const submission = issue.submission;
          const status = issueStatus( issue.labels );
          const canStart = status === 'status:submitted' || status === 'status:failed';
          const closed = status === 'status:closed' || status === 'status:merged';

          return (
            <article key={issue.number} className="border-b border-[#1D3557]/14 py-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide">
                    <span className="text-[#E63946]">Submission #{issue.number}</span>
                    <span className="border border-[#1D3557]/16 px-2 py-1 text-[#1D3557]/68">{statusLabels[ status ] ?? status}</span>
                    {submission && <span className="text-[#0F766E]">{contributionTypeLabels[ submission.type ]} · {contributionIntentLabels[ submission.intent ]}</span>}
                  </div>
                  <h2 className="mt-3 text-2xl font-black text-[#1D3557]">{submission?.name ?? issue.title}</h2>
                  {submission ? (
                    <>
                      <p className="mt-1 text-sm font-bold text-[#1D3557]/55">{submission.city} · {contributionRegionLabels[ submission.region ] ?? '英国 / UK'} · {new Date( issue.createdAt ).toLocaleString( 'zh-CN' )}</p>
                      {submission.type === 'restaurant' && (
                        <dl className="mt-4 grid border-y border-[#1D3557]/12 bg-[#F6F8FC] sm:grid-cols-2">
                          {[
                            [ '菜系', submission.cuisine === 'Other' ? submission.customCuisine : submission.cuisine ],
                            [ '价位', submission.price ],
                            [ '推荐理由', submission.recommendReason ],
                            [ '推荐招牌菜', submission.recommendSignatures ],
                          ].map( ( [ label, value ] ) => (
                            <div key={label} className="border-b border-[#1D3557]/10 px-4 py-3 last:border-b-0 sm:odd:border-r">
                              <dt className="text-xs font-black uppercase tracking-wide text-[#1D3557]/48">{label}</dt>
                              <dd className="mt-1 whitespace-pre-wrap text-sm font-bold leading-6 text-[#1D3557]">{value || '未填写'}</dd>
                            </div>
                          ) )}
                        </dl>
                      )}
                      <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-[#1D3557]/76">{submission.details}</p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
                        {submission.sourceUrl && <a href={submission.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#0F766E] underline decoration-[#0F766E]/35 underline-offset-4 hover:decoration-[#0F766E]"><ExternalLink className="h-3.5 w-3.5" />查看投稿链接</a>}
                        <a href={issue.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#1D3557]/65 underline decoration-[#1D3557]/25 underline-offset-4 hover:text-[#1D3557]"><ExternalLink className="h-3.5 w-3.5" />打开私人 Issue</a>
                      </div>
                      {submission.imageKeys.length > 0 && (
                        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                          {submission.imageKeys.map( ( key, index ) => (
                            <a key={key} href={`/api/admin/contributions/images?key=${encodeURIComponent( key )}`} target="_blank" rel="noreferrer" className="group relative aspect-[4/3] overflow-hidden border border-[#1D3557]/14 bg-[#EDF1F7]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`/api/admin/contributions/images?key=${encodeURIComponent( key )}`} alt={`投稿图片 ${index + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                              <FileImage className="absolute bottom-2 right-2 h-4 w-4 text-white drop-shadow" />
                            </a>
                          ) )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="mt-3 text-sm font-bold text-[#C92935]">无法读取这条 Issue 的结构化投稿数据。</p>
                  )}
                </div>

                {!closed && submission && (
                  <div className="flex shrink-0 gap-2 lg:flex-col">
                    {canStart && (
                      <button type="button" onClick={() => updateIssue( issue.number, 'accept' )} disabled={Boolean( activeAction )} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#0F766E] px-4 text-sm font-black text-white hover:bg-[#0B625C] disabled:opacity-50">
                        {activeAction === `${issue.number}:accept` ? <LoaderCircle className="h-4 w-4 animate-spin" /> : status === 'status:failed' ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {status === 'status:failed' ? '重新处理' : '交给 Agent 处理'}
                      </button>
                    )}
                    <button type="button" onClick={() => updateIssue( issue.number, 'close' )} disabled={Boolean( activeAction )} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#C92935]/30 px-4 text-sm font-black text-[#A51F2B] hover:border-[#C92935] disabled:opacity-50">
                      {activeAction === `${issue.number}:close` ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      关闭投稿
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        } )}
      </div>
    </div>
  );
}

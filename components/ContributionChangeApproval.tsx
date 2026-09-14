'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fieldLabels, type ChangeField, type ChangeRequest } from '@/lib/contributions/change-contract';
import type { Candidate } from '@/lib/contributions/change-engine';
import type { ContributionSubmission } from '@/lib/contributions/schema';

type Preview = { baseSha: string; submissionHash: string; candidates: Candidate[]; imagePaths: string[] };
export default function ContributionChangeApproval( { issueNumber, submission }: { issueNumber: number; submission: ContributionSubmission } ) {
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>( null );
  const [targetIndex, setTargetIndex] = useState( '' );
  const [fields, setFields] = useState<Partial<Record<ChangeField, string>>>( {} );
  const [busy, setBusy] = useState( false );
  const [error, setError] = useState( '' );
  const [confirmed, setConfirmed] = useState( false );
  const candidate = preview?.candidates[Number( targetIndex )];
  const supported = ['restaurant', 'attraction'].includes( submission.type ) && ['update', 'image'].includes( submission.intent );
  async function post( body: unknown ) {
    const response = await fetch( `/api/admin/contributions/${issueNumber}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( body ) } );
    const data = await response.json();
    if ( !response.ok ) throw new Error( data.error || '无法确认修改，请重新载入。' );
    return data;
  }
  async function load() {
    setBusy( true ); setError( '' );
    try { setPreview( await post( { action: 'prepare-change' } ) ); setTargetIndex( '' ); setFields( {} ); setConfirmed( false ); }
    catch ( error ) { setError( error instanceof Error ? error.message : '载入失败。' ); }
    finally { setBusy( false ); }
  }
  function selectTarget( index: string ) {
    setTargetIndex( index ); setConfirmed( false );
    const item = preview?.candidates[Number( index )];
    const oldImages = ( item?.fields.images || '' ).split( /\n|[,，;；]/ ).map( part => part.trim() ).filter( Boolean );
    setFields( preview?.imagePaths.length ? { images: [...new Set( [...oldImages, ...preview.imagePaths] )].join( ', ' ) } : {} );
  }
  async function approve() {
    if ( !preview || !candidate || !targetIndex || !confirmed ) return;
    setBusy( true ); setError( '' );
    const change: ChangeRequest = { version: 1, issueNumber, submissionHash: preview.submissionHash, baseSha: preview.baseSha, actor: 'server-verified', approvedAt: new Date().toISOString(), target: candidate.target, operation: submission.intent as 'update' | 'image', fields: Object.entries( fields ).map( ([field, after]) => ( { field: field as ChangeField, before: candidate.fields[field as ChangeField] ?? '', after } ) ) };
    try { await post( { action: 'accept', change } ); setPreview( null ); router.refresh(); }
    catch ( error ) { setError( error instanceof Error ? error.message : '批准失败。' ); }
    finally { setBusy( false ); }
  }
  if ( !supported ) return <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6">此操作需要人工处理。当前自动流程仅支持已有餐厅／景点的字段修改与补充图片。</p>;
  return <section className="mt-4 rounded-xl border border-[#1D3557]/20 bg-[#F6F8FC] p-4" aria-label="确认投稿修改范围">
    <button type="button" disabled={busy} onClick={load} className="min-h-11 rounded-md bg-[#0F766E] px-4 text-sm font-bold text-white disabled:opacity-50">{busy ? '正在核对…' : '载入目标并确认修改'}</button>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {preview && <div className="mt-4 space-y-4">
      <label className="grid gap-2 text-sm font-bold">选择指定城市和条目 ID
        <select value={targetIndex} disabled={busy} onChange={event => selectTarget( event.target.value )} className="min-h-11 w-full rounded border bg-white p-2">
          <option value="">请选择；请核对投稿中的城市和名称</option>
          {preview.candidates.map( ( item, index ) => <option key={`${item.target.city}:${item.target.id}`} value={String( index )}>{item.target.city} · {item.target.name} · {item.target.id}</option> )}
        </select>
      </label>
      {targetIndex !== '' && candidate && <>
        <p className="text-xs leading-5">仅勾选本次要修改的字段。未勾选的字段保持不变；勾选后留空表示明确清空。下方内容是管理员最终确认的发布文本。</p>
        <p className="text-xs leading-5">简介用于页面短简介；没有独立备注／景点推荐原因时，也用于详情正文。备注用于详情正文。找不到目标的旧条目需要先人工映射 ID。</p>
        {( Object.keys( fieldLabels ) as ChangeField[] ).filter( field => ( submission.intent !== 'image' || field === 'images' ) && ( submission.type !== 'attraction' || !['cuisine', 'recommendSignatures'].includes( field ) ) ).map( field => <div key={field} className="rounded border border-[#1D3557]/15 bg-white p-3">
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={fields[field] !== undefined} disabled={busy || field === 'images'} onChange={event => { setConfirmed( false ); setFields( old => { const next = { ...old }; if ( event.target.checked ) next[field] = field === 'summary' ? submission.details : field === 'recommendReason' ? submission.recommendReason : field === 'recommendSignatures' ? submission.recommendSignatures : field === 'price' ? submission.price : field === 'cuisine' ? ( submission.cuisine === 'Other' ? submission.customCuisine : submission.cuisine ) : candidate.fields[field] ?? ''; else delete next[field]; return next; } ); }} />{fieldLabels[field]}</label>
          {fields[field] !== undefined && <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div><p className="text-xs text-slate-500">修改前</p><p className="whitespace-pre-wrap break-words text-sm">{candidate.fields[field] || '（空）'}</p></div>
            <label className="grid gap-1 text-xs">确认的新内容<textarea aria-label={`${fieldLabels[field]}确认的新内容`} value={fields[field]} readOnly={field === 'images'} disabled={busy} onChange={event => { setFields( old => ( { ...old, [field]: event.target.value } ) ); setConfirmed( false ); }} maxLength={10000} className="min-h-24 w-full rounded border p-2 text-sm" /></label>
          </div>}
        </div> )}
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={event => setConfirmed( event.target.checked )} />我已核对目标 ID、投稿原文和以上新内容；只批准这些字段的修改。</label>
        <button type="button" disabled={busy || !confirmed || !Object.keys( fields ).length} onClick={approve} className="min-h-11 rounded-md bg-[#1D3557] px-4 text-sm font-bold text-white disabled:opacity-40">确认范围并启动 Agent</button>
      </>}
    </div>}
  </section>;
}

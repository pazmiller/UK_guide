'use client';

import { useState, type FormEvent } from 'react';
import type { AdminSubmissionEdits } from '@/lib/contributions/admin-edit';
import { fieldLabels, type ChangeField } from '@/lib/contributions/change-contract';
import { textFields } from '@/lib/contributions/existing';
import { restaurantCuisineOptions, universityStudyStages, type ContributionSubmission } from '@/lib/contributions/schema';

type Props = {
  issueNumber: number;
  submission: ContributionSubmission;
  submissionHash: string;
  onCancel: () => void;
  onSaved: ( message: string ) => void;
};
type TextField = Exclude<keyof AdminSubmissionEdits, 'existingChanges' | 'rating' | 'region' | 'cuisine' | 'studyStage'>;
const inputClass = 'min-h-11 w-full min-w-0 rounded-lg border border-[#1D3557]/20 bg-white px-3 py-2 text-base font-normal text-[#1D3557] outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15';

export default function AdminContributionEditor( { issueNumber, submission, submissionHash, onCancel, onSaved }: Props ) {
  const [draft, setDraft] = useState( submission );
  const [values, setValues] = useState<Partial<Record<ChangeField, string>>>( () => ( {
    ...submission.existingEdit?.before,
    ...Object.fromEntries( ( submission.existingEdit?.changes ?? [] ).map( change => [change.field, change.after] ) ),
  } ) );
  const [confirmed, setConfirmed] = useState( false );
  const [busy, setBusy] = useState( false );
  const [error, setError] = useState( '' );
  const existing = submission.existingEdit;
  const university = submission.type === 'university';
  const editableKeys: Array<keyof Omit<AdminSubmissionEdits, 'existingChanges'>> = existing ? ['sourceUrl'] : university
    ? ['details', 'sourceUrl', 'studyStartYear', 'studyEndYear', 'studyStage', 'studyProgram', 'universityPros', 'universityCons', 'rating']
    : ['name', 'city', 'region', 'details', 'sourceUrl', ...( submission.type === 'restaurant' ? ['cuisine', 'customCuisine', 'price', 'recommendReason', 'recommendSignatures'] as const : [] )];
  const edits: AdminSubmissionEdits = Object.fromEntries( editableKeys.filter( key => draft[key] !== submission[key] ).map( key => [key, draft[key]] ) );
  const fields = textFields.filter( field => existing?.target.category !== 'attraction' || !['cuisine', 'recommendSignatures'].includes( field ) );
  if ( existing && submission.intent === 'update' ) {
    const changes = fields.filter( field => ( values[field] ?? '' ) !== existing.before[field] ).map( field => ( { field, after: values[field] ?? '' } ) );
    if ( changes.length !== existing.changes.length || changes.some( change => !existing.changes.some( old => old.field === change.field && old.after === change.after ) ) ) edits.existingChanges = changes;
  }
  const changed = Object.keys( edits ).length > 0;
  function update<K extends keyof ContributionSubmission>( field: K, value: ContributionSubmission[K] ) {
    setDraft( old => ( { ...old, [field]: value } ) ); setConfirmed( false );
  }
  function textField( field: TextField, label: string, options: { maxLength: number; rows?: number; required?: boolean; type?: 'url' } ) {
    return <label key={field} className="grid min-w-0 gap-2 text-sm font-bold">{label}
      {options.rows ? <textarea value={draft[field]} rows={options.rows} maxLength={options.maxLength} required={options.required} onChange={event => update( field, event.target.value )} className={`${inputClass} resize-y leading-7`} />
        : <input type={options.type ?? 'text'} value={draft[field]} maxLength={options.maxLength} required={options.required} onChange={event => update( field, event.target.value )} className={inputClass} />}
    </label>;
  }
  async function save( event: FormEvent<HTMLFormElement> ) {
    event.preventDefault();
    if ( !changed || !confirmed ) return;
    setBusy( true ); setError( '' );
    try {
      const response = await fetch( `/api/admin/contributions/${issueNumber}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { action: 'save-submission', submissionHash, edits } ) } );
      const result = await response.json();
      if ( !response.ok ) throw new Error( result.error || '保存失败，请重试。' );
      onSaved( `投稿已保存。旧审批与评分已失效，请重新处理。${result.warning ? ` ${result.warning}` : ''}` );
    } catch ( error ) {
      setError( error instanceof Error ? error.message : '保存失败，请重试。' );
    } finally { setBusy( false ); }
  }
  return <form onSubmit={save} aria-label="编辑投稿内容" className="mt-5 min-w-0 rounded-xl border border-[#1D3557]/20 bg-[#F6F8FC] p-4 text-[#1D3557] sm:p-6">
    <header className="border-b border-[#1D3557]/15 pb-4"><h3 className="text-xl font-bold">编辑投稿内容</h3><p className="mt-2 text-sm leading-6 text-[#1D3557]/70">下面已填入当前投稿，可逐项修改。先保存，再点击“重新 AI 审核”；修改资料／补充图片仍需确认目标与修改范围。保存不会自动发布，也不会立即启动处理。</p></header>
    <fieldset disabled={busy} className="mt-5 min-w-0 space-y-5 disabled:opacity-60">
      {existing ? <>
        <div className="rounded-lg border border-[#1D3557]/15 bg-white p-4"><p className="text-xs font-bold text-[#0F766E]">已选条目 · 身份与原文保持不变</p><p className="mt-2 break-words font-bold">{existing.target.city} · {existing.target.name}</p><p className="mt-1 break-all text-xs text-[#1D3557]/60">ID：{existing.target.id}</p></div>
        {submission.intent === 'update' ? <div className="space-y-4"><p className="text-sm leading-6">在新内容中修改；恢复成原文会取消该字段的修改，留空表示清空该字段。保存后仍需重新确认修改范围。</p>
          {fields.map( field => <div key={field} className="grid min-w-0 gap-3 rounded-lg border border-[#1D3557]/10 bg-white p-3 sm:grid-cols-2">
            <div className="min-w-0"><p className="text-xs font-bold text-[#1D3557]/55">{fieldLabels[field]} · 原文（只读）</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{existing.before[field] || '（空）'}</p></div>
            <label className="grid min-w-0 gap-2 text-sm font-bold">{fieldLabels[field]} · 新内容<textarea value={values[field] ?? ''} rows={['summary', 'notes', 'recommendReason'].includes( field ) ? 4 : 2} maxLength={10000} onChange={event => { setValues( old => ( { ...old, [field]: event.target.value } ) ); setConfirmed( false ); }} className={`${inputClass} resize-y leading-7`} /></label>
          </div> )}
        </div> : <p className="text-sm leading-6">这是补充图片投稿。所选条目、已有文字与上传图片保持不变；这里仅可更正来源链接。</p>}
      </> : <>
        {university ? <div className="rounded-lg border border-[#1D3557]/15 bg-white p-4"><p className="text-xs font-bold text-[#0F766E]">评价学校 · 不可更换</p><p className="mt-2 break-words font-bold">{submission.name}</p></div>
          : <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">地区<select value={draft.region} onChange={event => update( 'region', event.target.value as ContributionSubmission['region'] )} className={inputClass}><option value="uk">英国 / UK</option><option value="europa">欧洲大陆 / Europa</option></select></label>
            {textField( 'city', '城市 / 地区', { maxLength: 100, required: true } )}
            <div className="min-w-0 sm:col-span-2">{textField( 'name', '名称 / 主题', { maxLength: 120, required: true } )}</div>
          </div>}
        {textField( 'details', university ? '整体评价' : '投稿内容', { maxLength: 4000, rows: 5, required: true } )}
        {submission.type === 'restaurant' && <>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">菜系<select value={draft.cuisine} required={submission.intent === 'add'} onChange={event => update( 'cuisine', event.target.value as ContributionSubmission['cuisine'] )} className={inputClass}><option value="">请选择</option>{restaurantCuisineOptions.map( value => <option key={value}>{value}</option> )}</select></label>
            {textField( 'price', '价位', { maxLength: 100 } )}
            {draft.cuisine === 'Other' && textField( 'customCuisine', '自定义菜系（英文）', { maxLength: 60, required: true } )}
          </div>
          {textField( 'recommendReason', '推荐理由', { maxLength: 2000, rows: 3, required: submission.intent === 'add' } )}
          {textField( 'recommendSignatures', '推荐招牌菜', { maxLength: 1000, rows: 2 } )}
        </>}
        {university && <>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">{textField( 'studyStartYear', '开始年份', { maxLength: 4, required: true } )}{textField( 'studyEndYear', '结束年份（或至今）', { maxLength: 4, required: true } )}
            <label className="grid gap-2 text-sm font-bold">学习阶段<select value={draft.studyStage} required onChange={event => update( 'studyStage', event.target.value as ContributionSubmission['studyStage'] )} className={inputClass}><option value="">请选择</option>{universityStudyStages.map( value => <option key={value}>{value}</option> )}</select></label>
            {textField( 'studyProgram', '专业', { maxLength: 160, required: true } )}
          </div>
          {textField( 'universityPros', '特别好之处', { maxLength: 2000, rows: 3 } )}{textField( 'universityCons', '特别坏之处', { maxLength: 2000, rows: 3 } )}
          <label className="grid gap-2 text-sm font-bold">评分<select value={draft.rating ?? ''} required onChange={event => update( 'rating', event.target.value ? Number( event.target.value ) : null )} className={inputClass}><option value="">请选择</option>{Array.from( { length: 9 }, ( _, index ) => 1 + index * .5 ).map( value => <option key={value} value={value}>{value} / 5</option> )}</select></label>
        </>}
      </>}
      {textField( 'sourceUrl', '来源链接（选填）', { maxLength: 500, type: 'url' } )}
      <p className="rounded-lg bg-[#1D3557]/5 p-3 text-xs leading-6 text-[#1D3557]/70">已上传 {submission.imageKeys.length} 张图片，保存时原样保留。投稿类别、操作类型、图片版权确认及署名选择不会改变。</p>
      <label className="flex items-start gap-3 border-t border-[#1D3557]/15 pt-4 text-sm leading-6"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed( event.target.checked )} className="mt-1 h-4 w-4 shrink-0 accent-[#0F766E]" />我确认保存将使旧审批／评分失效；若已有未合并 PR，会关闭旧 PR 并保留历史，重新处理后创建新版 PR。</label>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">{error}</p>}
      <div className="flex flex-wrap items-center gap-3"><button type="submit" disabled={!changed || !confirmed || busy} className="min-h-11 rounded-lg bg-[#0F766E] px-5 text-sm font-bold text-white disabled:opacity-40">{busy ? '正在保存…' : '保存修改'}</button><button type="button" onClick={onCancel} className="min-h-11 rounded-lg border border-[#1D3557]/25 px-4 text-sm font-bold">取消编辑</button><p role="status" className="text-xs text-[#1D3557]/60">{changed ? '有尚未保存的修改' : '尚未修改内容'}</p></div>
    </fieldset>
  </form>;
}

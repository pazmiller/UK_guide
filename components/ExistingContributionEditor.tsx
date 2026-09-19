'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fieldLabels, type ChangeField, type ExistingEdit } from '@/lib/contributions/change-contract';
import { completeFields, textFields, type ExistingEntry } from '@/lib/contributions/existing';

const displayLabels: Record<string, string> = { cuisine: '类型 / 菜系', priceRange: '价位', price: '票价', shortDescription: '短简介', description: '详情正文', recommendReason: '推荐理由', mustTry: '推荐招牌', address: '地址', openingHours: '营业时间', website: '网站', highlight: '亮点', bestTime: '建议到访时间', duration: '游览时长' };
type Props = { type: string; region: string; intent: string; onChange: ( value: ExistingEdit | undefined ) => void };
export default function ExistingContributionEditor( { type, region, intent, onChange }: Props ) {
  const [entries, setEntries] = useState<ExistingEntry[]>( [] );
  const [city, setCity] = useState( '' );
  const [selected, setSelected] = useState<ExistingEntry>();
  const [values, setValues] = useState<Partial<Record<ChangeField, string>>>( {} );
  const [error, setError] = useState( '' );
  const [loading, setLoading] = useState( true );
  const [attempt, setAttempt] = useState( 0 );
  useEffect( () => {
    const controller = new AbortController();
    fetch( '/api/contributions/entries', { signal: controller.signal } ).then( async response => {
      const body = await response.json();
      if ( !response.ok ) throw new Error( body.error || '无法载入资料。' );
      setEntries( body.entries ); setLoading( false );
    } ).catch( error => { if ( !controller.signal.aborted ) { setError( error.message ); setLoading( false ); } } );
    return () => controller.abort();
  }, [attempt] );
  const available = entries.filter( item => item.target.region === region && ( type === 'attraction' ? item.target.category === 'attraction' : item.target.category !== 'attraction' ) );
  const cities = [...new Map( available.map( item => [item.target.city, item.cityName] ) )];
  function select( value: string ) {
    const item = available.find( entry => entry.target.city === city && entry.target.id === value );
    setSelected( item ); setValues( item?.fields ?? {} );
    onChange( item ? { target: item.target, before: completeFields( item.fields ), changes: [] } : undefined );
  }
  function editField( field: ChangeField, after: string ) {
    if ( !selected ) return;
    const next = { ...values, [field]: after }; setValues( next );
    onChange( { target: selected.target, before: completeFields( selected.fields ), changes: textFields.filter( key => ( next[key] ?? '' ) !== ( selected.fields[key] ?? '' ) ).map( key => ( { field: key, after: next[key] ?? '' } ) ) } );
  }
  return <section aria-label="选择并编辑现有条目" className="min-w-0 space-y-5 rounded-2xl border border-[#1D3557]/15 bg-[#F6F8FC] p-4 sm:p-6">
    <div><h3 className="text-xl font-bold text-[#1D3557]">先找到这条资料</h3><p className="mt-2 text-sm leading-6 text-[#1D3557]/70">{intent === 'image' ? '选好条目后，在下方上传新图片即可。原文字和已有图片不会被替换。' : '选好城市和条目，在原文上修改。未改动的字段会保持原样。'}</p></div>
    {loading && <p role="status">正在载入现有资料…</p>}
    {error && <div role="alert">{error}<button type="button" className="ml-3 underline" onClick={() => { setError( '' ); setLoading( true ); setAttempt( n => n + 1 ); }}>重新载入</button></div>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-bold">选择城市<select required value={city} disabled={loading} onChange={event => { setCity( event.target.value ); setSelected( undefined ); setValues( {} ); onChange( undefined ); }} className="min-h-12 w-full min-w-0 rounded-lg border border-[#1D3557]/20 bg-white p-2"><option value="">请选择城市</option>{cities.map( ([slug, name]) => <option key={slug} value={slug}>{name}</option> )}</select></label>
      <label className="grid gap-2 text-sm font-bold">选择现有条目<select required value={selected?.target.id ?? ''} disabled={!city || loading} onChange={event => select( event.target.value )} className="min-h-12 w-full min-w-0 rounded-lg border border-[#1D3557]/20 bg-white p-2"><option value="">请选择条目</option>{available.filter( item => item.target.city === city ).map( item => <option key={`${item.target.category}:${item.target.id}`} value={item.target.id}>{item.target.name}</option> )}</select></label>
    </div>
    {!loading && !error && <p className="text-xs leading-5 text-[#1D3557]/60">列表仅显示已能安全关联原资料的餐厅／景点。找不到条目？可改选“其他补充”并说明城市和名称。</p>}
    {selected && <>
      <div className="rounded-xl border border-[#1D3557]/10 bg-white p-4 sm:p-5">
        <p className="text-xs tracking-wide text-[#0F766E]">目前网页上的资料 · {selected.cityName}</p>
        <h4 className="mt-2 break-words text-3xl font-bold text-[#1D3557]">{selected.target.name}</h4>
        <dl className="mt-5 space-y-4">{Object.entries( selected.display ).filter( ([, value]) => value ).map( ([key, value]) => <div key={key}><dt className="text-xs font-bold text-[#1D3557]/55">{displayLabels[key] ?? key}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-7">{value}</dd></div> )}</dl>
        {!!selected.images.length && <div className="mt-5 flex gap-2 overflow-x-auto">{selected.images.map( ( src, index ) => <Image key={`${src}:${index}`} src={src} alt={`${selected.target.name}现有图片 ${index + 1}`} width={160} height={120} className="h-28 w-36 shrink-0 rounded-lg object-cover" /> )}</div>}
      </div>
      {intent === 'update' && <div className="space-y-4 border-t border-[#1D3557]/15 pt-5">
        <p className="text-sm font-bold">在原资料上修改</p>
        <p className="text-xs leading-6 text-[#1D3557]/65">下方是资料源的原文；旧页面的展示文案可能略有不同。只提交实际改动的字段，清空表示申请删除该字段内容。名称与条目身份保持不变。</p>
        {textFields.filter( field => selected.target.category !== 'attraction' || !['cuisine', 'recommendSignatures'].includes( field ) ).map( field => <label key={field} className="grid gap-2 text-sm font-bold">
          <span>{field === 'notes' ? '详情正文 / 备注' : fieldLabels[field]}{( values[field] ?? '' ) !== ( selected.fields[field] ?? '' ) && <span className="ml-2 text-xs font-medium text-[#0F766E]">已修改</span>}</span>
          <textarea value={values[field] ?? ''} maxLength={10000} rows={['summary', 'notes', 'recommendReason'].includes( field ) ? 4 : 2} onChange={event => editField( field, event.target.value )} className="w-full min-w-0 resize-y rounded-lg border border-[#1D3557]/20 bg-white p-3 text-base font-normal leading-7 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15" />
        </label> )}
      </div>}
    </>}
  </section>;
}

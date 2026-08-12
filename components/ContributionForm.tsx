'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import
{
  CheckCircle2,
  FileImage,
  Landmark,
  Lightbulb,
  LoaderCircle,
  MapPin,
  Send,
  ShieldAlert,
  Trash2,
  Upload,
  UtensilsCrossed,
} from 'lucide-react';
import
{
  MAX_CONTRIBUTION_IMAGES,
  MAX_CONTRIBUTION_IMAGE_BYTES,
  restaurantCuisineOptions,
  type ContributionIntent,
  type ContributionRegion,
  type ContributionType,
  type RestaurantCuisine,
} from '@/lib/contributions/schema';

type ContributionFormState = {
  type: ContributionType;
  intent: ContributionIntent;
  region: ContributionRegion;
  name: string;
  city: string;
  cuisine: RestaurantCuisine | '';
  customCuisine: string;
  price: string;
  recommendReason: string;
  recommendSignatures: string;
  sourceUrl: string;
  details: string;
  submitterName: string;
  imageRightsConfirmed: boolean;
  website: string;
};

const initialForm: ContributionFormState = {
  type: 'restaurant',
  intent: 'add',
  region: 'uk',
  name: '',
  city: '',
  cuisine: '',
  customCuisine: '',
  price: '',
  recommendReason: '',
  recommendSignatures: '',
  sourceUrl: '',
  details: '',
  submitterName: '',
  imageRightsConfirmed: false,
  website: '',
};

const contributionOptions = [
  { value: 'restaurant', label: '餐厅', icon: UtensilsCrossed },
  { value: 'attraction', label: '景点', icon: Landmark },
  { value: 'avoid', label: '避雷', icon: ShieldAlert },
  { value: 'tip', label: '其他线索', icon: Lightbulb },
] as const;

const intentOptions = [
  { value: 'add', label: '新增条目' },
  { value: 'update', label: '修改资料' },
  { value: 'closure', label: '停业 / 错误' },
  { value: 'image', label: '补充图片' },
  { value: 'other', label: '其他补充' },
] as const;

const regionOptions = [
  { value: 'uk', label: '英国 / UK' },
  { value: 'europa', label: '欧洲大陆 / Europa' },
] as const;

const allowedImageTypes = new Set( [ 'image/jpeg', 'image/png', 'image/webp' ] );

async function uploadImage( file: File )
{
  const response = await fetch( '/api/contributions/uploads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify( {
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    } ),
  } );
  const result = await response.json() as { error?: string; key?: string; uploadUrl?: string };
  if ( !response.ok || !result.key || !result.uploadUrl )
  {
    throw new Error( result.error ?? `无法上传 ${file.name}` );
  }

  const uploadResponse = await fetch( result.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  } );
  if ( !uploadResponse.ok ) throw new Error( `${file.name} 上传失败，请重试。` );
  return result.key;
}

export default function ContributionForm()
{
  const [ form, setForm ] = useState<ContributionFormState>( initialForm );
  const [ images, setImages ] = useState<File[]>( [] );
  const [ fileInputKey, setFileInputKey ] = useState( 0 );
  const [ status, setStatus ] = useState<'idle' | 'uploading' | 'submitting' | 'success' | 'error'>( 'idle' );
  const [ message, setMessage ] = useState( '' );

  function updateField<K extends keyof ContributionFormState>( field: K, value: ContributionFormState[ K ] )
  {
    setForm( current => ( { ...current, [ field ]: value } ) );
  }

  function handleImages( event: ChangeEvent<HTMLInputElement> )
  {
    const selected = Array.from( event.target.files ?? [] );
    const next = [ ...images, ...selected ];
    if ( next.length > MAX_CONTRIBUTION_IMAGES )
    {
      setStatus( 'error' );
      setMessage( `最多上传 ${MAX_CONTRIBUTION_IMAGES} 张图片。` );
      return;
    }

    const invalid = selected.find( file => !allowedImageTypes.has( file.type ) || file.size > MAX_CONTRIBUTION_IMAGE_BYTES );
    if ( invalid )
    {
      setStatus( 'error' );
      setMessage( `${invalid.name} 需要是 10 MB 内的 JPEG、PNG 或 WebP。` );
      return;
    }

    setImages( next );
    setStatus( 'idle' );
    setMessage( '' );
  }

  function removeImage( index: number )
  {
    setImages( current => current.filter( ( _, imageIndex ) => imageIndex !== index ) );
    setFileInputKey( current => current + 1 );
  }

  async function handleSubmit( event: FormEvent<HTMLFormElement> )
  {
    event.preventDefault();
    setMessage( '' );

    if ( images.length > 0 && !form.imageRightsConfirmed )
    {
      setStatus( 'error' );
      setMessage( '请先确认图片版权和隐私声明。' );
      return;
    }

    try
    {
      setStatus( images.length ? 'uploading' : 'submitting' );
      const imageKeys = await Promise.all( images.map( uploadImage ) );
      setStatus( 'submitting' );

      const response = await fetch( '/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { ...form, version: 1, imageKeys } ),
      } );
      const result = await response.json() as { error?: string; message?: string };
      if ( !response.ok ) throw new Error( result.error ?? '投稿暂时没有送达，请稍后再试。' );

      setForm( initialForm );
      setImages( [] );
      setFileInputKey( current => current + 1 );
      setStatus( 'success' );
      setMessage( result.message ?? '已进入待审核队列，谢谢你出的一份力！' );
    } catch ( error )
    {
      setStatus( 'error' );
      setMessage( error instanceof Error ? error.message : '投稿暂时没有送达，请稍后再试。' );
    }
  }

  const busy = status === 'uploading' || status === 'submitting';
  const restaurantAdd = form.type === 'restaurant' && form.intent === 'add';

  return (
    <section className="border border-[#1D3557]/14 bg-white p-5 shadow-[0_20px_48px_rgba(29,53,87,0.10)] sm:p-8 lg:p-10">
      <div className="flex items-start justify-between gap-4 border-b border-[#1D3557]/12 pb-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#E63946]">Submit a contribution</p>
          <h2 className="mt-2 text-3xl font-black text-[#1D3557]">投进审核队列</h2>
        </div>
      </div>

      <form className="mt-7 space-y-7" onSubmit={handleSubmit}>
        <fieldset>
          <legend className="text-sm font-bold text-[#1D3557]">这是什么信息？</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {contributionOptions.map( option =>
            {
              const Icon = option.icon;
              const selected = form.type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateField( 'type', option.value )}
                  className={`flex min-h-20 flex-col items-start justify-between border p-3 text-left text-sm font-bold transition-[border-color,background-color,color,transform] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946] ${selected ? 'border-[#1D3557] bg-[#1D3557] text-white' : 'border-[#1D3557]/18 bg-white text-[#1D3557] hover:border-[#0F766E] hover:text-[#0F766E]'}`}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            } )}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-bold text-[#1D3557]">希望我们怎么处理？</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {intentOptions.map( option => (
              <button
                key={option.value}
                type="button"
                aria-pressed={form.intent === option.value}
                onClick={() => updateField( 'intent', option.value )}
                className={`min-h-10 border px-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946] ${form.intent === option.value ? 'border-[#0F766E] bg-[#0F766E] text-white' : 'border-[#1D3557]/18 text-[#1D3557] hover:border-[#0F766E]'}`}
              >
                {option.label}
              </button>
            ) )}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-bold text-[#1D3557]">地点属于哪里？</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {regionOptions.map( option => (
              <button
                key={option.value}
                type="button"
                aria-pressed={form.region === option.value}
                onClick={() => updateField( 'region', option.value )}
                className={`min-h-11 border px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946] ${form.region === option.value ? 'border-[#0F766E] bg-[#0F766E] text-white' : 'border-[#1D3557]/18 text-[#1D3557] hover:border-[#0F766E]'}`}
              >
                {option.label}
              </button>
            ) )}
          </div>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#1D3557]">
            地点 / 主题名称 <span className="text-[#E63946]">*</span>
            <input required value={form.name} onChange={event => updateField( 'name', event.target.value )} maxLength={120} className="min-h-12 border-b-2 border-[#1D3557]/22 bg-transparent px-1 text-base font-medium text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder="例如：某家餐厅、某条步行路线" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#1D3557]">
            城市（街区请写在补充里）<span className="text-[#E63946]">*</span>
            <input required value={form.city} onChange={event => updateField( 'city', event.target.value )} maxLength={100} className="min-h-12 border-b-2 border-[#1D3557]/22 bg-transparent px-1 text-base font-medium text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder="例如：London、Nottingham、Paris" />
          </label>
        </div>

        {form.type === 'restaurant' && (
          <fieldset className="border-y border-[#1D3557]/12 bg-[#F6F8FC] px-4 py-6 sm:px-6">
            <legend className="flex items-center gap-2 bg-white px-2 text-sm font-black text-[#1D3557]">
              <UtensilsCrossed className="h-4 w-4 text-[#E63946]" />
              餐厅资料 / Restaurant details
            </legend>

            <div className="mt-1 grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-[#1D3557]">
                菜系 / Cuisine {restaurantAdd && <span className="text-[#E63946]">*</span>}
                <select
                  required={restaurantAdd}
                  value={form.cuisine}
                  onChange={event => updateField( 'cuisine', event.target.value as RestaurantCuisine | '' )}
                  className="min-h-12 w-full min-w-0 border-b-2 border-[#1D3557]/22 bg-white px-2 text-base font-medium text-[#1D3557] outline-none transition-colors focus:border-[#0F766E]"
                >
                  <option value="">请选择菜系</option>
                  {restaurantCuisineOptions.map( cuisine => <option key={cuisine} value={cuisine}>{cuisine}</option> )}
                </select>
              </label>

              {form.cuisine === 'Other' && (
                <label className="grid gap-2 text-sm font-bold text-[#1D3557]">
                  菜系英文名 / Cuisine name <span className="text-[#E63946]">*</span>
                  <input
                    required
                    value={form.customCuisine ?? ''}
                    onChange={event => updateField( 'customCuisine', event.target.value )}
                    maxLength={60}
                    pattern="[A-Za-z][A-Za-z '&amp;/().-]*"
                    title="请使用英文填写菜系名称"
                    className="min-h-12 border-b-2 border-[#1D3557]/22 bg-white px-2 text-base font-medium text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]"
                    placeholder="例如：Korean、Turkish"
                  />
                </label>
              )}

              <label className="grid gap-2 text-sm font-bold text-[#1D3557]">
                价位 / Price <span className="font-medium text-[#1D3557]/48">可选</span>
                <input value={form.price} onChange={event => updateField( 'price', event.target.value )} maxLength={100} className="min-h-12 border-b-2 border-[#1D3557]/22 bg-white px-2 text-base font-medium text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder="例如：£20–30/人；不清楚可留空" />
              </label>
            </div>

            <label className="mt-6 grid gap-2 text-sm font-bold text-[#1D3557]">
              推荐理由 / Why recommend it {restaurantAdd && <span className="text-[#E63946]">*</span>}
              <textarea required={restaurantAdd} value={form.recommendReason} onChange={event => updateField( 'recommendReason', event.target.value )} maxLength={2000} rows={4} className="resize-y border border-[#1D3557]/18 bg-white p-4 text-base font-medium leading-7 text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder="味道、环境、服务或与同类餐厅相比值得去的地方。" />
            </label>

            <label className="mt-6 grid gap-2 text-sm font-bold text-[#1D3557]">
              推荐招牌菜 / Signature dishes <span className="font-medium text-[#1D3557]/48">可选</span>
              <textarea value={form.recommendSignatures} onChange={event => updateField( 'recommendSignatures', event.target.value )} maxLength={1000} rows={3} className="resize-y border border-[#1D3557]/18 bg-white p-4 text-base font-medium leading-7 text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder="只填写你确实推荐的菜品；没有可留空。" />
            </label>
          </fieldset>
        )}

        <label className="grid gap-2 text-sm font-bold text-[#1D3557]">
          {form.type === 'restaurant' ? '餐厅简介与其他补充' : '具体情况、推荐理由或避雷原因'} <span className="text-[#E63946]">*</span>
          <textarea required value={form.details} onChange={event => updateField( 'details', event.target.value )} maxLength={4000} rows={7} className="resize-y border border-[#1D3557]/18 bg-[#F6F8FC] p-4 text-base font-medium leading-7 text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder={form.type === 'restaurant' ? '简要介绍餐厅特色，也可以补充到访时间、分店、服务或其他值得注意的信息。' : '尽量写下你亲自体验到的细节：什么时候去、价格、服务、需要注意什么，或为什么值得推荐。'} />
        </label>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#1D3557]">
            地图或官网链接 <span className="font-medium text-[#1D3557]/48">可选</span>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1D3557]/42" />
              <input type="url" value={form.sourceUrl} onChange={event => updateField( 'sourceUrl', event.target.value )} maxLength={500} className="min-h-12 w-full border-b-2 border-[#1D3557]/22 bg-transparent py-1 pl-7 pr-1 text-base font-medium text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder="https://..." />
            </div>
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#1D3557]">
            您的大名是？！（加进感谢名单） <span className="font-medium text-[#1D3557]/48">可选</span>
            <input value={form.submitterName} onChange={event => updateField( 'submitterName', event.target.value )} maxLength={80} className="min-h-12 border-b-2 border-[#1D3557]/22 bg-transparent px-1 text-base font-medium text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder="想被怎么称呼nia" />
          </label>
        </div>

        <fieldset className="border-y border-[#1D3557]/12 py-6">
          <legend className="px-2 text-sm font-bold text-[#1D3557]">现场图片 <span className="font-medium text-[#1D3557]/48">可选，最多 5 张</span></legend>
          <label className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 border border-[#1D3557]/20 px-4 text-sm font-bold text-[#1D3557] transition-colors hover:border-[#0F766E] hover:text-[#0F766E] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#E63946]">
            <Upload className="h-4 w-4" />
            选择图片
            <input key={fileInputKey} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImages} className="sr-only" />
          </label>

          {images.length > 0 && (
            <div className="mt-4 grid gap-2">
              {images.map( ( image, index ) => (
                <div key={`${image.name}-${image.lastModified}`} className="flex min-h-12 items-center gap-3 border border-[#1D3557]/12 bg-[#F6F8FC] px-3">
                  <FileImage className="h-4 w-4 shrink-0 text-[#0F766E]" />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#1D3557]">{image.name}</span>
                  <span className="text-xs font-medium text-[#1D3557]/50">{( image.size / 1024 / 1024 ).toFixed( 1 )} MB</span>
                  <button type="button" onClick={() => removeImage( index )} className="grid h-9 w-9 place-items-center text-[#C92935] hover:bg-[#C92935]/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C92935]" aria-label={`移除 ${image.name}`} title="移除图片">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) )}
            </div>
          )}

          {images.length > 0 && (
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#1D3557]/72">
              <input type="checkbox" required checked={form.imageRightsConfirmed} onChange={event => updateField( 'imageRightsConfirmed', event.target.checked )} className="mt-1 h-4 w-4 accent-[#0F766E]" />
              <span>我拥有这些图片的版权或已获得公开使用授权，并确认图片不包含需要隐藏的个人信息。</span>
            </label>
          )}
        </fieldset>

        <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={event => updateField( 'website', event.target.value )} className="absolute h-px w-px overflow-hidden opacity-0" name="website" />

        <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-6 text-[#1D3557]/62">请勿提交个人电话、微信、住址或他人的隐私信息。投稿先进入私人审核队列，不会自动公开。</p>
          <button type="submit" disabled={busy} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-[#E63946] px-5 text-base font-black text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#C92935] disabled:cursor-wait disabled:bg-[#E63946]/55 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E63946]">
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {status === 'uploading' ? '正在上传图片' : status === 'submitting' ? '正在送入队列' : '提交审核'}
          </button>
        </div>

        {status !== 'idle' && (
          <p role="status" className={`flex items-center gap-2 text-sm font-bold ${status === 'success' ? 'text-[#0F766E]' : status === 'error' ? 'text-[#C92935]' : 'text-[#1D3557]'}`}>
            {status === 'success' && <CheckCircle2 className="h-4 w-4" />}
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

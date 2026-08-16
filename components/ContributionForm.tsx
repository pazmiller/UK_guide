'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import
{
  CalendarRange,
  CheckCircle2,
  GraduationCap,
  Landmark,
  Lightbulb,
  LoaderCircle,
  MapPin,
  Send,
  ShieldAlert,
  Star,
  Trash2,
  Upload,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import
{
  MAX_CONTRIBUTION_IMAGES,
  MAX_CONTRIBUTION_IMAGE_BYTES,
  restaurantCuisineOptions,
  universityStudyStages,
  type ContributionIntent,
  type ContributionRegion,
  type ContributionType,
  type RestaurantCuisine,
  type UniversityStudyStage,
} from '@/lib/contributions/schema';
import { getUniversityBySlug, UNIVERSITY_FORM_OPTIONS } from '@/lib/universities/catalog';

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
  studyYear: string;
  universitySlug: string;
  studyStartYear: string;
  studyEndYear: string;
  studyStage: UniversityStudyStage | '';
  studyProgram: string;
  rating: number | null;
  discloseSubmitterName: boolean;
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
  studyYear: '',
  universitySlug: '',
  studyStartYear: '',
  studyEndYear: '',
  studyStage: '',
  studyProgram: '',
  rating: null,
  discloseSubmitterName: false,
  sourceUrl: '',
  details: '',
  submitterName: '',
  imageRightsConfirmed: false,
  website: '',
};

const contributionOptions = [
  { value: 'restaurant', label: '餐厅', icon: UtensilsCrossed },
  { value: 'university', label: '大学评价', icon: GraduationCap },
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

const OTHER_UNIVERSITY_OPTION = 'Others...';
const CURRENT_STUDY_YEAR = 2026;
const FIRST_STUDY_YEAR = 1995;
const studyYears = Array.from( { length: CURRENT_STUDY_YEAR - FIRST_STUDY_YEAR + 1 }, ( _, index ) => String( FIRST_STUDY_YEAR + index ) );

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

function LocalImagePreview( { file }: { file: File } )
{
  const [ source ] = useState( () => URL.createObjectURL( file ) );

  useEffect( () => () => URL.revokeObjectURL( source ), [ source ] );

  // Blob previews are local browser URLs and cannot use Next Image optimization.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={source} alt="" className="h-full w-full object-cover" />;
}

function YearRangePicker( { startYear, endYear, onChange }: { startYear: string; endYear: string; onChange: ( startYear: string, endYear: string ) => void } )
{
  const [ isOpen, setIsOpen ] = useState( false );
  const numericStart = Number( startYear );
  const numericEnd = endYear === '至今' ? CURRENT_STUDY_YEAR : Number( endYear );
  const rangeComplete = Boolean( startYear && endYear );

  function selectYear( year: string )
  {
    if ( !startYear || endYear || Number( year ) < numericStart )
    {
      onChange( year, '' );
      return;
    }
    onChange( startYear, year );
  }

  return (
    <div className="relative">
      <button type="button" aria-haspopup="dialog" aria-expanded={isOpen} onClick={() => setIsOpen( true )} className="flex min-h-16 w-full items-center justify-between border border-[#1D3557]/18 bg-white px-4 text-left text-[#1D3557] transition-colors hover:border-[#0F766E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946]">
        <span className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-3">
          <span>
            <span className="block text-[0.65rem] font-black uppercase tracking-wide text-[#1D3557]/48">开始</span>
            <span className={`mt-1 block text-base font-black ${startYear ? '' : 'text-[#1D3557]/35'}`}>{startYear ? `${startYear} 年` : '选择年份'}</span>
          </span>
          <span aria-hidden="true" className="text-[#0F766E]">→</span>
          <span>
            <span className="block text-[0.65rem] font-black uppercase tracking-wide text-[#1D3557]/48">结束</span>
            <span className={`mt-1 block text-base font-black ${endYear ? '' : 'text-[#1D3557]/35'}`}>{endYear ? ( endYear === '至今' ? '至今' : `${endYear} 年` ) : '选择年份'}</span>
          </span>
        </span>
        <CalendarRange className="ml-4 h-5 w-5 shrink-0 text-[#0F766E]" aria-hidden="true" />
      </button>

      {isOpen && (
        <div role="dialog" aria-label="选择就读年份范围" className="absolute left-0 right-0 z-30 mt-2 border border-[#1D3557]/18 bg-white p-4 shadow-[0_18px_42px_rgba(29,53,87,0.18)] sm:p-5">
          <div className="mb-3 flex items-center justify-between border-b border-[#1D3557]/10 pb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#1D3557]/62">选择就读年份</p>
              <p className="mt-1 text-xs leading-5 text-[#1D3557]/50">{!startYear || rangeComplete ? '先选择开始年份' : `已选 ${startYear} 年，现在选择结束年份`}</p>
            </div>
            <button type="button" onClick={() => setIsOpen( false )} className="grid h-8 w-8 place-items-center text-[#1D3557]/55 transition-colors hover:bg-[#1D3557]/6 hover:text-[#1D3557] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946]" aria-label="关闭年份选择器">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto border-y border-[#1D3557]/10 py-3" aria-label="年份列表">
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
              {studyYears.map( year =>
              {
                const numericYear = Number( year );
                const isStart = year === startYear;
                const isEnd = year === endYear || ( endYear === '至今' && numericYear === CURRENT_STUDY_YEAR );
                const isInRange = Boolean( startYear && endYear && numericYear >= numericStart && numericYear <= numericEnd );
                return (
                  <button key={year} type="button" aria-pressed={isStart || isEnd} aria-label={`${year} 年${isStart ? '，开始年份' : isEnd ? '，结束年份' : isInRange ? '，所选范围内' : ''}`} onClick={() => selectYear( year )} className={`min-h-10 px-2 text-sm font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#E63946] ${isStart || isEnd ? 'bg-[#0F766E] text-white' : isInRange ? 'bg-[#E2F2EE] text-[#0F766E]' : 'bg-[#F6F8FC] text-[#1D3557] hover:bg-[#1D3557]/8'}`}>
                    {year}
                  </button>
                );
              } )}
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" disabled={!startYear} aria-pressed={endYear === '至今'} onClick={() => onChange( startYear, '至今' )} className={`min-h-10 border px-4 text-sm font-black transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${endYear === '至今' ? 'border-[#0F766E] bg-[#0F766E] text-white' : 'border-[#1D3557]/18 text-[#1D3557] hover:border-[#0F766E] hover:text-[#0F766E]'}`}>结束时间：至今</button>
            <div className="flex gap-2">
              <button type="button" onClick={() => onChange( '', '' )} className="min-h-10 border border-[#1D3557]/18 px-4 text-sm font-bold text-[#1D3557]/62 hover:border-[#1D3557]/35">清除</button>
              <button type="button" disabled={!rangeComplete} onClick={() => setIsOpen( false )} className="min-h-10 bg-[#1D3557] px-5 text-sm font-black text-white transition-colors hover:bg-[#0F766E] disabled:cursor-not-allowed disabled:bg-[#1D3557]/28">完成</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StarRating( { value, onChange }: { value: number | null; onChange: ( value: number ) => void } )
{
  const [ preview, setPreview ] = useState<number | null>( null );
  const [ focused, setFocused ] = useState( false );
  const displayedRating = preview ?? value ?? 0;
  const ratingOptions = Array.from( { length: 9 }, ( _, index ) => 1 + index * .5 );

  return (
    <fieldset>
      <legend className="text-sm font-bold text-[#1D3557]">评分 <span className="text-[#E63946]">*</span></legend>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div className={`relative w-fit rounded-sm ${focused ? 'outline-2 outline-offset-4 outline-[#E63946]' : ''}`} onMouseLeave={() => setPreview( null )}>
          <div className="pointer-events-none flex gap-1" aria-hidden="true">
            {[ 1, 2, 3, 4, 5 ].map( starNumber =>
            {
              const fill = displayedRating >= starNumber ? 100 : displayedRating >= starNumber - .5 ? 50 : 0;
              return (
                <span key={starNumber} className="relative block h-9 w-9">
                  <Star className="absolute inset-0 h-9 w-9 text-[#1D3557]/22" strokeWidth={1.7} />
                  <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill}%` }}>
                    <Star className="h-9 w-9 max-w-none fill-[#D39A29] text-[#D39A29]" strokeWidth={1.7} />
                  </span>
                </span>
              );
            } )}
          </div>

          {ratingOptions.map( ( rating, index ) => (
            <label
              key={rating}
              className="absolute inset-y-0 cursor-pointer"
              style={{ left: `${index === 0 ? 0 : 20 + ( index - 1 ) * 10}%`, width: `${index === 0 ? 20 : 10}%` }}
              onMouseEnter={() => setPreview( rating )}
            >
              <input
                type="radio"
                name="university-rating"
                value={rating}
                checked={value === rating}
                onChange={() => onChange( rating )}
                onFocus={() => { setFocused( true ); setPreview( rating ); }}
                onBlur={() => { setFocused( false ); setPreview( null ); }}
                required
                className="sr-only"
              />
              <span className="sr-only">{rating.toFixed( 1 )} 星</span>
            </label>
          ) )}
        </div>
        <output className="min-w-24 text-sm font-black text-[#1D3557]" aria-live="polite">
          {value === null ? '请选择评分' : `${value.toFixed( 1 )} / 5`}
        </output>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#1D3557]/52">可选择 1–5 星，Precision:0.5</p>
    </fieldset>
  );
}

export default function ContributionForm()
{
  const [ form, setForm ] = useState<ContributionFormState>( initialForm );
  const [ images, setImages ] = useState<File[]>( [] );
  const [ imageCaptions, setImageCaptions ] = useState<string[]>( [] );
  const [ fileInputKey, setFileInputKey ] = useState( 0 );
  const [ universityChoice, setUniversityChoice ] = useState( '' );
  const [ status, setStatus ] = useState<'idle' | 'uploading' | 'submitting' | 'success' | 'error'>( 'idle' );
  const [ message, setMessage ] = useState( '' );

  function updateField<K extends keyof ContributionFormState>( field: K, value: ContributionFormState[ K ] )
  {
    setForm( current => ( { ...current, [ field ]: value } ) );
  }

  function selectContributionType( type: ContributionType )
  {
    setForm( current => ( {
      ...current,
      type,
      ...( type === 'university' ? {
        intent: 'add' as const,
        region: 'uk' as const,
        name: '',
        city: '',
        universitySlug: '',
        sourceUrl: '',
        submitterName: '',
        discloseSubmitterName: false,
      } : {} ),
    } ) );

    if ( type === 'university' )
    {
      setUniversityChoice( '' );
      setImages( [] );
      setImageCaptions( [] );
      setFileInputKey( current => current + 1 );
    }
    setStatus( 'idle' );
    setMessage( '' );
  }

  function selectUniversity( choice: string )
  {
    setUniversityChoice( choice );
    const university = choice === OTHER_UNIVERSITY_OPTION ? undefined : getUniversityBySlug( choice );
    setForm( current => ( {
      ...current,
      universitySlug: choice === OTHER_UNIVERSITY_OPTION ? 'other' : university?.slug ?? '',
      name: university?.name ?? '',
    } ) );
  }

  function updateStudyRange( studyStartYear: string, studyEndYear: string )
  {
    setForm( current => ( {
      ...current,
      studyStartYear,
      studyEndYear,
      studyYear: studyStartYear && studyEndYear ? `${studyStartYear}–${studyEndYear}` : '',
    } ) );
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
    setImageCaptions( current => [ ...current, ...selected.map( () => '' ) ] );
    setStatus( 'idle' );
    setMessage( '' );
  }

  function removeImage( index: number )
  {
    setImages( current => current.filter( ( _, imageIndex ) => imageIndex !== index ) );
    setImageCaptions( current => current.filter( ( _, imageIndex ) => imageIndex !== index ) );
    setFileInputKey( current => current + 1 );
  }

  function updateImageCaption( index: number, value: string )
  {
    setImageCaptions( current => current.map( ( caption, imageIndex ) => imageIndex === index ? value : caption ) );
  }

  async function handleSubmit( event: FormEvent<HTMLFormElement> )
  {
    event.preventDefault();
    setMessage( '' );

    if ( form.type === 'university' && form.rating === null )
    {
      setStatus( 'error' );
      setMessage( '请选择 1–5 星评分。' );
      return;
    }

    if ( form.type === 'university' && ( !form.studyStartYear || !form.studyEndYear ) )
    {
      setStatus( 'error' );
      setMessage( '请选择开始与结束年份。' );
      return;
    }

    if ( form.type === 'university' && !form.studyStage )
    {
      setStatus( 'error' );
      setMessage( '请选择本科、硕士、博士、博士后或教职。' );
      return;
    }

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
        body: JSON.stringify( {
          ...form,
          version: 1,
          imageKeys,
          imageCaptions: form.type === 'university' ? imageCaptions.map( caption => caption.trim() ) : [],
        } ),
      } );
      const result = await response.json() as { error?: string; message?: string };
      if ( !response.ok ) throw new Error( result.error ?? '投稿暂时没有送达，请稍后再试。' );

      setForm( initialForm );
      setImages( [] );
      setImageCaptions( [] );
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
  const universityReview = form.type === 'university';

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
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {contributionOptions.map( option =>
            {
              const Icon = option.icon;
              const selected = form.type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectContributionType( option.value )}
                  className={`flex min-h-20 flex-col items-start justify-between border p-3 text-left text-sm font-bold transition-[border-color,background-color,color,transform] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946] ${selected ? 'border-[#1D3557] bg-[#1D3557] text-white' : 'border-[#1D3557]/18 bg-white text-[#1D3557] hover:border-[#0F766E] hover:text-[#0F766E]'}`}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            } )}
          </div>
        </fieldset>

        {!universityReview && (
          <>
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
          </>
        )}

        {universityReview && (
          <section className="border-y border-[#1D3557]/12 bg-[#F6F8FC] px-4 py-6 sm:px-6" aria-labelledby="university-review-heading">
            <div className="flex items-center gap-2 text-sm font-black text-[#1D3557]">
              <GraduationCap className="h-4 w-4 text-[#D39A29]" />
              <h3 id="university-review-heading">大学评价 / University review</h3>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-[#1D3557] sm:col-span-2">
                学校全名 <span className="text-[#E63946]">*</span>
                <select required value={universityChoice} onChange={event => selectUniversity( event.target.value )} className="min-h-12 border-b-2 border-[#1D3557]/22 bg-white px-2 text-base font-medium text-[#1D3557] outline-none transition-colors focus:border-[#0F766E]">
                  <option value="">请选择学校</option>
                  {UNIVERSITY_FORM_OPTIONS.map( university => <option key={university.slug} value={university.slug}>{university.name}</option> )}
                  <option value={OTHER_UNIVERSITY_OPTION}>{OTHER_UNIVERSITY_OPTION}</option>
                </select>
              </label>
              {universityChoice === OTHER_UNIVERSITY_OPTION && (
                <label className="grid gap-2 text-sm font-bold text-[#1D3557] sm:col-span-2">
                  学校全名（其他） <span className="text-[#E63946]">*</span>
                  <input required value={form.name} onChange={event => updateField( 'name', event.target.value )} maxLength={120} className="min-h-12 border-b-2 border-[#1D3557]/22 bg-white px-2 text-base font-medium text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder="请输入学校官方全名" />
                </label>
              )}
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-bold text-[#1D3557]">就读年份 <span className="text-[#E63946]">*</span></legend>
                <div className="mt-2">
                  <YearRangePicker startYear={form.studyStartYear} endYear={form.studyEndYear} onChange={updateStudyRange} />
                </div>
              </fieldset>
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-bold text-[#1D3557]">身份 / 阶段 <span className="text-[#E63946]">*</span></legend>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {universityStudyStages.map( stage => (
                    <button key={stage} type="button" aria-pressed={form.studyStage === stage} onClick={() => updateField( 'studyStage', stage )} className={`min-h-11 border px-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946] ${form.studyStage === stage ? 'border-[#0F766E] bg-[#0F766E] text-white' : 'border-[#1D3557]/18 bg-white text-[#1D3557] hover:border-[#0F766E] hover:text-[#0F766E]'}`}>
                      {stage}
                    </button>
                  ) )}
                </div>
              </fieldset>
              <label className="grid gap-2 text-sm font-bold text-[#1D3557] sm:col-span-2">
                专业 <span className="text-[#E63946]">*</span>
                <input required value={form.studyProgram} onChange={event => updateField( 'studyProgram', event.target.value )} maxLength={160} className="min-h-12 border-b-2 border-[#1D3557]/22 bg-white px-2 text-base font-medium text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder="例如：MSc Computer Science" />
              </label>
            </div>

            <div className="mt-7">
              <StarRating value={form.rating} onChange={rating => updateField( 'rating', rating )} />
            </div>

            <fieldset className="mt-7 border-t border-[#1D3557]/12 pt-6">
              <legend className="text-sm font-bold text-[#1D3557]">名字是否公开？</legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" aria-pressed={!form.discloseSubmitterName} onClick={() => { updateField( 'discloseSubmitterName', false ); updateField( 'submitterName', '' ); }} className={`min-h-11 border px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946] ${!form.discloseSubmitterName ? 'border-[#1D3557] bg-[#1D3557] text-white' : 'border-[#1D3557]/18 bg-white text-[#1D3557]'}`}>匿名投稿</button>
                <button type="button" aria-pressed={form.discloseSubmitterName} onClick={() => updateField( 'discloseSubmitterName', true )} className={`min-h-11 border px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946] ${form.discloseSubmitterName ? 'border-[#0F766E] bg-[#0F766E] text-white' : 'border-[#1D3557]/18 bg-white text-[#1D3557]'}`}>署名投稿</button>
              </div>
              {form.discloseSubmitterName && (
                <label className="mt-5 grid gap-2 text-sm font-bold text-[#1D3557]">
                  希望公开显示的名字 <span className="text-[#E63946]">*</span>
                  <input required value={form.submitterName} onChange={event => updateField( 'submitterName', event.target.value )} maxLength={80} className="min-h-12 border-b-2 border-[#1D3557]/22 bg-white px-2 text-base font-medium text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder="昵称或名字" />
                </label>
              )}
              <p className="mt-3 text-xs leading-5 text-[#1D3557]/52">匿名投稿不会保存或公开名字；署名投稿通过审核后可以显示你填写的称呼。</p>
            </fieldset>
          </section>
        )}

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
          {universityReview ? '整体评价' : form.type === 'restaurant' ? '餐厅简介与其他补充' : '具体情况、推荐理由或避雷原因'} <span className="text-[#E63946]">*</span>
          <textarea required value={form.details} onChange={event => updateField( 'details', event.target.value )} maxLength={4000} rows={universityReview ? 9 : 7} className="resize-y border border-[#1D3557]/18 bg-[#F6F8FC] p-4 text-base font-medium leading-7 text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder={universityReview ? '我对这所带学，设施和师资的锐评是……' : form.type === 'restaurant' ? '简要介绍餐厅特色，也可以补充到访时间、分店、服务或其他值得注意的信息。' : '尽量写下你亲自体验到的细节：什么时候去、价格、服务、需要注意什么，或为什么值得推荐。'} />
        </label>

        {!universityReview && (
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
        )}

        <fieldset className="border-y border-[#1D3557]/12 py-6">
          <legend className="px-2 text-sm font-bold text-[#1D3557]">{universityReview ? '校园照片' : '现场图片'} <span className="font-medium text-[#1D3557]/48">可选，最多 5 张</span></legend>
          {universityReview && <p className="mb-3 text-xs leading-5 text-[#1D3557]/55">可以上传校园、宿舍、教室或设施照片，并为每张照片补充内容说明。</p>}
          <label className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 border border-[#1D3557]/20 px-4 text-sm font-bold text-[#1D3557] transition-colors hover:border-[#0F766E] hover:text-[#0F766E] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#E63946]">
            <Upload className="h-4 w-4" />
            {universityReview ? '选择校园照片' : '选择图片'}
            <input key={fileInputKey} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImages} className="sr-only" />
          </label>

          {images.length > 0 && (
            <div className="mt-4 grid gap-2">
              {images.map( ( image, index ) => (
                <div key={`${image.name}-${image.lastModified}-${index}`} className="border border-[#1D3557]/12 bg-[#F6F8FC] p-3">
                  <div className="flex min-h-14 items-center gap-3">
                    <div className="grid h-14 w-16 shrink-0 place-items-center overflow-hidden bg-white">
                      <LocalImagePreview file={image} />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#1D3557]">{image.name}</span>
                    <span className="hidden text-xs font-medium text-[#1D3557]/50 sm:block">{( image.size / 1024 / 1024 ).toFixed( 1 )} MB</span>
                    <button type="button" onClick={() => removeImage( index )} className="grid h-9 w-9 shrink-0 place-items-center text-[#C92935] hover:bg-[#C92935]/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C92935]" aria-label={`移除 ${image.name}`} title="移除图片">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {universityReview && (
                    <label className="mt-3 grid gap-1.5 border-t border-[#1D3557]/10 pt-3 text-xs font-black text-[#1D3557]">
                      <span>照片 {index + 1} 的内容 <span className="font-medium text-[#1D3557]/45">可选</span></span>
                      <input value={imageCaptions[ index ] ?? ''} onChange={event => updateImageCaption( index, event.target.value )} maxLength={200} className="min-h-11 border-b-2 border-[#1D3557]/18 bg-white px-2 text-sm font-medium text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#0F766E]" placeholder="例如：图书馆二楼自习区、宿舍公共厨房" />
                    </label>
                  )}
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
          <p className="max-w-md text-sm leading-6 text-[#1D3557]/62">{universityReview ? '评价提交会进入审核队列，不会自动公开。' : '请勿提交个人电话、微信、住址或他人的隐私信息。投稿先进入私人审核队列，不会自动公开。'}</p>
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

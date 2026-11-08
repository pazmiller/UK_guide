'use client';

import { useState } from 'react';
import { downloadCalendar, readCalendar, type CalendarEvent, type ImportedCalendarEvent } from '@/lib/furconCalendar';

export default function FurconCalendar( { nextMeet, events }: { nextMeet?: CalendarEvent; events: CalendarEvent[] } ) {
  const [ preview, setPreview ] = useState<ImportedCalendarEvent[]>( [] );
  const [ error, setError ] = useState( '' );
  const [ reading, setReading ] = useState( false );
  return <section aria-label="兽聚日历" className="my-8 border-y border-[#1D3557]/25 bg-[#EDF0EA] px-5 py-6 text-[#1D3557] sm:px-8">
    <div className="flex flex-wrap items-center justify-between gap-5">
      <div><p className="text-xs tracking-widest">TAKE THE DATE WITH YOU</p><h2 className="mt-2 text-2xl font-semibold">下次见，记进日历</h2><p className="mt-2 text-sm">{nextMeet ? `London Furmeets · ${nextMeet.start}` : 'London Furmeets：等待后续日期公布'}</p></div>
      <div className="flex flex-wrap gap-3">
        {nextMeet && <button type="button" className="min-h-11 bg-[#1D3557] px-4 text-sm font-bold text-white" onClick={() => downloadCalendar( [nextMeet], 'london-furmeets.ics' )}>＋ 下一次 LFM 日历</button>}
        <a className="inline-flex min-h-11 items-center border border-[#1D3557]/40 px-4 text-sm" href="https://londonfurs.org.uk/" target="_blank" rel="noreferrer">官方安排／报名 ↗</a>
        <button type="button" disabled={!events.length} className="min-h-11 border border-[#1D3557]/40 px-4 text-sm disabled:opacity-40" onClick={() => downloadCalendar( events, 'cffa-furcon.ics' )}>导出筛选内未结束活动（{events.length}）</button>
      </div>
    </div>
    <p className="mt-4 text-xs leading-6">下载 .ics 后可用 Apple／Google／Outlook 日历打开，提醒请在日历应用中设置。仅提供已收录日期，不自动订阅更新；不包含已取消或已结束活动。出发前请核对官网，日历不代表已报名。</p>
    <details className="mt-4 border-t border-[#1D3557]/20 pt-3">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">读取本地 .ics 日历</summary>
      <p className="mb-3 text-sm">只在本页预览，不上传、不保存、不修改公开日程。按文件原时区展示；周期活动仅展示文件中的实例，不展开重复规则。</p>
      <label className="block text-sm font-semibold">选择 ICS 文件（最多 1 MB／200 条）
        <input type="file" accept=".ics,text/calendar" disabled={reading} className="mt-2 block max-w-full text-sm file:mr-3 file:min-h-11 file:border file:px-4" onChange={async event => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if ( !file ) return;
          setError( '' ); setPreview( [] ); setReading( true );
          try {
            if ( file.size > 1_000_000 ) throw new Error( '请选择小于 1 MB 的 ICS 文件。' );
            setPreview( await readCalendar( await file.text() ) );
          } catch ( caught ) { setError( caught instanceof Error ? `读取失败：${caught.message}` : '无法读取，请检查 ICS 文件。' ); }
          finally { setReading( false ); }
        }} />
      </label>
      {reading && <p role="status">正在读取本地日历…</p>}
      {error && <p role="alert" className="mt-3 text-sm text-[#A51F2B]">{error}</p>}
      {preview.length > 0 && <div className="mt-4">
        <div className="flex items-center justify-between"><p role="status">本地预览 · {preview.length} 条活动（未核实）</p><button type="button" onClick={() => setPreview( [] )} className="min-h-11 underline">清除预览</button></div>
        <ul className="max-h-96 overflow-auto">{preview.map( item => <li key={item.id} className="border-t border-[#1D3557]/15 py-3 text-sm">
          <h3 className="break-words font-bold">{item.name}{item.cancelled ? ' · 已取消' : ''}{item.recurring ? ' · 周期／例外记录' : ''}</h3><p className="break-words">{item.when}</p><p className="break-words">{item.location}</p>
        </li> )}</ul>
      </div>}
    </details>
  </section>;
}

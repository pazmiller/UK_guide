'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { X } from 'lucide-react';
import { FORTUNES } from '@/lib/dailyFortune';
import { decodeFortuneSnapshot, drawDailyFortune, fortuneSnapshot, serverFortuneSnapshot, subscribeFortune } from '@/lib/dailyFortuneStore';
import styles from './DailyFortune.module.css';

export default function DailyFortune()
{
  const snapshot = useSyncExternalStore( subscribeFortune, fortuneSnapshot, serverFortuneSnapshot );
  const { record, persistent } = decodeFortuneSnapshot( snapshot );
  const fortune = FORTUNES.find( item => item.id === record?.result );
  const [ drawing, setDrawing ] = useState( false );
  const [ open, setOpen ] = useState( false );
  const [ instant, setInstant ] = useState( false );
  const [ error, setError ] = useState( '' );
  const root = useRef<HTMLDivElement>( null );
  const trigger = useRef<HTMLButtonElement>( null );
  const busy = useRef( false );
  const mounted = useRef( false );
  const timer = useRef<ReturnType<typeof setTimeout> | null>( null );
  const panelId = useId();

  useEffect( () => {
    mounted.current = true;
    const dismiss = ( event: PointerEvent ) => {
      if ( event.target instanceof Node && !root.current?.contains( event.target ) ) setOpen( false );
    };
    document.addEventListener( 'pointerdown', dismiss );
    return () => {
      mounted.current = false;
      if ( timer.current ) clearTimeout( timer.current );
      document.removeEventListener( 'pointerdown', dismiss );
    };
  }, [] );

  function close()
  {
    setOpen( false );
    trigger.current?.focus( { preventScroll: true } );
  }

  async function draw( keyboard: boolean )
  {
    if ( busy.current || !snapshot ) return;
    const noMotion = keyboard || window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
    setInstant( noMotion );
    // Recheck today's date inside the store, even if midnight just passed.
    busy.current = true;
    setDrawing( !fortune && !noMotion );
    setError( '' );
    try
    {
      const { created } = await drawDailyFortune();
      if ( !mounted.current ) return;
      if ( !created || noMotion )
      {
        setDrawing( false );
        setOpen( value => created || !value );
        busy.current = false;
        return;
      }
      setDrawing( true );
      setOpen( false );
      timer.current = setTimeout( () => {
        busy.current = false;
        setDrawing( false );
        setOpen( true );
      }, 950 );
    }
    catch
    {
      busy.current = false;
      if ( mounted.current )
      {
        setDrawing( false );
        setError( '暂时没抽出来，请再试一次。' );
      }
    }
  }

  return (
    <div ref={root} role="group" aria-label="每日运势" className={styles.widget} data-drawing={drawing} data-drawn={Boolean( fortune ) && !drawing} data-instant={instant}
      onKeyDown={event => {
        if ( event.key === 'Escape' && open ) { event.stopPropagation(); close(); }
      }}>
      <button ref={trigger} type="button" className={styles.trigger} disabled={!snapshot || drawing}
        aria-label={drawing ? '正在抽签' : fortune ? `查看今日运势：${fortune.label}` : '抽取今日运势'}
        aria-expanded={open && Boolean( fortune )} aria-controls={panelId}
        onClick={event => void draw( event.detail === 0 )}>
        <span className={styles.jar} aria-hidden="true">
          <span className={styles.sticks}><i /><i /><i /><i /></span>
          <span className={styles.winner}>签</span>
          <span className={styles.cup}>签</span>
        </span>
        <span className={styles.caption}>
          <span className={styles.eyebrow}>今日运势</span>
          <span className={styles.result}>{!snapshot ? '稍候…' : drawing ? '摇一摇…' : fortune?.label ?? '摇一签'}</span>
          <span className={styles.hint}>{fortune && !drawing ? '今日已抽 · 查看' : '每天一次 · 仅供娱乐'}</span>
        </span>
      </button>
      <div id={panelId} role="region" aria-label="今日签文" className={styles.panel}
        data-open={open && Boolean( fortune )} data-tone={fortune?.tone} inert={!open || !fortune} aria-hidden={!open || !fortune}>
        <button type="button" className={styles.close} aria-label="收起签文" onClick={close}><X aria-hidden="true" /></button>
        <p className={styles.kicker}>今日签 · {record?.date}</p>
        <strong className={styles.grade}>{fortune?.label}</strong>
        <p className={styles.note}>{fortune?.note}</p>
        <p className={styles.disclaimer}>英国时间每日 00:00 换签<br />同一浏览器每天一次 · 仅供娱乐</p>
        {!persistent && <p className={styles.warning}>浏览器未能保存，刷新后可能丢失。</p>}
      </div>
      <span className={styles.srOnly} role={drawing || fortune ? 'status' : undefined}>{drawing ? '正在摇签…' : fortune ? `今日运势：${fortune.label}` : ''}</span>
      {error && <span className={styles.error} role="alert">{error}</span>}
    </div>
  );
}

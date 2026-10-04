'use client';

import { FORTUNE_KEY, fortuneDay, fortuneFromTicket, parseFortune, type FortuneRecord } from './dailyFortune';

type FortuneSnapshot = { record: FortuneRecord | null; persistent: boolean };
const changedEvent = 'uk-guide:fortune-changed';
let memory: FortuneSnapshot = { record: null, persistent: true };

function currentFortune(): FortuneSnapshot
{
  const day = fortuneDay();
  let available = true;
  try
  {
    const stored = parseFortune( window.localStorage.getItem( FORTUNE_KEY ) );
    if ( stored?.date === day ) return { record: stored, persistent: true };
  }
  catch { available = false; }
  return memory.record?.date === day ? memory : { record: null, persistent: available };
}

// A stable primitive snapshot lets React subscribe without reading storage during SSR.
export function fortuneSnapshot(): string { return JSON.stringify( currentFortune() ); }
export function serverFortuneSnapshot(): string { return ''; }
export function decodeFortuneSnapshot( snapshot: string ): FortuneSnapshot
{
  return snapshot ? JSON.parse( snapshot ) as FortuneSnapshot : { record: null, persistent: true };
}

export function subscribeFortune( notify: () => void ): () => void
{
  const onStorage = ( event: StorageEvent ) => {
    if ( event.key === FORTUNE_KEY || event.key === null ) notify();
  };
  window.addEventListener( changedEvent, notify );
  window.addEventListener( 'storage', onStorage );
  window.addEventListener( 'focus', notify );
  document.addEventListener( 'visibilitychange', notify );
  const timer = window.setInterval( notify, 1000 );
  return () => {
    window.removeEventListener( changedEvent, notify );
    window.removeEventListener( 'storage', onStorage );
    window.removeEventListener( 'focus', notify );
    document.removeEventListener( 'visibilitychange', notify );
    window.clearInterval( timer );
  };
}

function randomTicket(): number
{
  const values = new Uint32Array( 1 );
  // Reject the last 96 integers so modulo 100 has no bias.
  do { crypto.getRandomValues( values ); } while ( values[0] >= 4_294_967_200 );
  return values[0] % 100;
}

export async function drawDailyFortune(): Promise<{ created: boolean }>
{
  const claim = () => {
    if ( currentFortune().record ) return { created: false };
    const record: FortuneRecord = { version: 1, date: fortuneDay(), result: fortuneFromTicket( randomTicket() ).id };
    let persistent = true;
    try
    {
      const serialized = JSON.stringify( record );
      window.localStorage.setItem( FORTUNE_KEY, serialized );
      persistent = window.localStorage.getItem( FORTUNE_KEY ) === serialized;
    }
    catch { persistent = false; }
    memory = { record, persistent };
    window.dispatchEvent( new Event( changedEvent ) );
    return { created: true };
  };
  // Serialize simultaneous draws from tabs where Web Locks is available.
  if ( navigator.locks ) return navigator.locks.request( FORTUNE_KEY, claim );
  return claim();
}

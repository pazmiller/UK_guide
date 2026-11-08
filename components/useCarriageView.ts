'use client';

import { useSyncExternalStore } from 'react';

const key = 'cffa:carriage-view:v1';
const change = 'cffa:carriage-view';
function subscribe( notify: () => void ) {
  window.addEventListener( 'storage', notify );
  window.addEventListener( change, notify );
  return () => { window.removeEventListener( 'storage', notify ); window.removeEventListener( change, notify ); };
}
// The in-memory choice still works when browser storage is unavailable.
let sessionQuick = false;
let storageUnavailable = false;
function snapshot() {
  if ( storageUnavailable ) return sessionQuick;
  try { return localStorage.getItem( key ) === 'quick'; } catch { return sessionQuick; }
}
export function useCarriageView() {
  const quick = useSyncExternalStore( subscribe, snapshot, () => false );
  return { quick, setQuick( value: boolean ) {
    sessionQuick = value;
    try { localStorage.setItem( key, value ? 'quick' : 'immersive' ); } catch { storageUnavailable = true; }
    window.dispatchEvent( new Event( change ) );
  } };
}

'use client';

import { useSyncExternalStore } from 'react';

const changeEvent = 'cffa:restaurant-query';
function subscribe( notify: () => void ) {
  window.addEventListener( 'popstate', notify );
  window.addEventListener( changeEvent, notify );
  return () => {
    window.removeEventListener( 'popstate', notify );
    window.removeEventListener( changeEvent, notify );
  };
}
const snapshot = () => window.location.search;
const serverSnapshot = () => '';

export function useRestaurantQuery( scope: string ) {
  const search = useSyncExternalStore( subscribe, snapshot, serverSnapshot );
  const params = new URLSearchParams( search );
  const qKey = scope ? `${scope}-q` : 'q';
  const cuisineKey = scope ? `${scope}-cuisine` : 'cuisine';
  return {
    query: params.get( qKey ) ?? '',
    cuisine: params.get( cuisineKey ) ?? 'All',
    update( query: string, cuisine: string ) {
      const url = new URL( window.location.href );
      if ( query.trim() ) url.searchParams.set( qKey, query.trim() );
      else url.searchParams.delete( qKey );
      if ( cuisine !== 'All' ) url.searchParams.set( cuisineKey, cuisine );
      else url.searchParams.delete( cuisineKey );
      if ( url.href === window.location.href ) return;
      window.history.pushState( null, '', `${url.pathname}${url.search}${url.hash}` );
      window.dispatchEvent( new Event( changeEvent ) );
    },
  };
}

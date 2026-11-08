export type CalendarEvent = {
  uid: string;
  name: string;
  start: string;
  end: string; // Inclusive last day in the website's event data.
  location: string;
  description: string;
  url: string;
  cancelled?: boolean;
};

function dateOnly( value: string ) {
  if ( !/^\d{4}-\d{2}-\d{2}$/.test( value ) || !Number.isFinite( Date.parse( value ) ) || new Date( value ).toISOString().slice( 0, 10 ) !== value ) throw new Error( '活动日期无效。' );
  return value.replaceAll( '-', '' );
}
const escapeText = ( value: string ) => value.replaceAll( '\\', '\\\\' ).replace( /\r\n|\r|\n/g, '\\n' ).replaceAll( ';', '\\;' ).replaceAll( ',', '\\,' );
function foldLine( value: string ) {
  const encoder = new TextEncoder();
  let line = '', size = 0;
  const lines: string[] = [];
  for ( const character of value ) {
    const bytes = encoder.encode( character ).length;
    if ( size + bytes > 75 ) { lines.push( line ); line = ' '; size = 1; }
    line += character;
    size += bytes;
  }
  lines.push( line );
  return lines.join( '\r\n' );
}

export function exportCalendar( events: CalendarEvent[], now = new Date() ) {
  const stamp = now.toISOString().replace( /[-:]/g, '' ).replace( /\.\d{3}Z$/, 'Z' );
  const unique = new Map( events.filter( event => !event.cancelled ).map( event => [event.uid, event] ) );
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CFFA UK//Furcon Calendar//ZH', 'CALSCALE:GREGORIAN'];
  for ( const event of unique.values() ) {
    const start = dateOnly( event.start );
    dateOnly( event.end );
    if ( event.end < event.start ) throw new Error( '活动结束日期早于开始日期。' );
    const exclusiveEnd = new Date( `${event.end}T00:00:00Z` );
    exclusiveEnd.setUTCDate( exclusiveEnd.getUTCDate() + 1 );
    lines.push( 'BEGIN:VEVENT', `UID:${escapeText( event.uid )}`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${dateOnly( exclusiveEnd.toISOString().slice( 0, 10 ) )}`, `SUMMARY:${escapeText( event.name )}`, `LOCATION:${escapeText( event.location )}`, `DESCRIPTION:${escapeText( event.description )}` );
    if ( /^https?:\/\/[^\r\n]+$/.test( event.url ) ) lines.push( `URL:${event.url}` );
    lines.push( 'END:VEVENT' );
  }
  return lines.concat( 'END:VCALENDAR', '' ).map( foldLine ).join( '\r\n' );
}

export function downloadCalendar( events: CalendarEvent[], filename: string ) {
  const url = URL.createObjectURL( new Blob( [exportCalendar( events )], { type: 'text/calendar;charset=utf-8' } ) );
  const link = document.createElement( 'a' );
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout( () => URL.revokeObjectURL( url ), 1000 );
}

export function conventionCalendarEvent( event: { name: string; start: string; end: string; venue: string; place: string; officialUrl: string; lastVerified: string; cancelled: boolean } ): CalendarEvent {
  return { uid: `${encodeURIComponent( event.name )}@furcon.cffa.uk`, name: event.name, start: event.start, end: event.end, location: `${event.venue}, ${event.place}`, url: event.officialUrl, cancelled: event.cancelled, description: `核对于 ${event.lastVerified}。日期与地点以主办方最新公布为准；出发前请核对官网。\n${event.officialUrl}` };
}

export type ImportedCalendarEvent = { id: string; name: string; when: string; location: string; cancelled: boolean; recurring: boolean };
export async function readCalendar( text: string ): Promise<ImportedCalendarEvent[]> {
  if ( new TextEncoder().encode( text ).length > 1_000_000 ) throw new Error( '请选择小于 1 MB 的 ICS 文件。' );
  const { default: ICAL } = await import( 'ical.js' );
  const calendar = new ICAL.Component( ICAL.parse( text.replace( /^\uFEFF/, '' ) ) );
  if ( calendar.name !== 'vcalendar' ) throw new Error( '这不是有效的 ICS 日历。' );
  const components = calendar.getAllSubcomponents( 'vevent' );
  if ( components.length === 0 ) throw new Error( '日历中没有可预览的活动。' );
  if ( components.length > 200 ) throw new Error( '这份日历超过 200 条活动，请先导出较小范围。' );
  const entries = new Map<string, ImportedCalendarEvent>();
  for ( const [index, component] of components.entries() ) {
    const event = new ICAL.Event( component );
    if ( !event.startDate ) throw new Error( `第 ${index + 1} 条活动缺少开始日期。` );
    const start = event.startDate;
    const end = event.endDate.clone();
    if ( start.isDate && end.compare( start ) > 0 ) end.adjust( -1, 0, 0, 0 );
    const zone = String( component.getFirstProperty( 'dtstart' )?.getParameter( 'tzid' ) ?? (start.toString().endsWith( 'Z' ) ? 'UTC' : '文件当地时间') );
    const id = `${event.uid || index}:${component.getFirstPropertyValue( 'recurrence-id' ) ?? ''}`;
    entries.set( id, { id, name: event.summary || '未命名活动', when: `${start.toString()}${end.compare( start ) === 0 ? '' : ` — ${end.toString()}`}${start.isDate ? ' · 全天' : ` · ${zone}`}`, location: event.location || '未提供地点', cancelled: component.getFirstPropertyValue( 'status' ) === 'CANCELLED', recurring: event.isRecurring() || event.isRecurrenceException() } );
  }
  return [...entries.values()];
}

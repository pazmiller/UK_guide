export const FORTUNE_KEY = 'uk-guide:daily-fortune:v1';

export const FORTUNES = [
  { id: 'below-average', label: '中下', weight: 12, note: '今天慢半拍也没关系。热茶一杯，小事慢慢来。', tone: 'quiet' },
  { id: 'low', label: '下', weight: 5, note: '今日宜放低期待、提高甜品预算。签不好，日子也可以过得好。', tone: 'quiet' },
  { id: 'middle', label: '中', weight: 35, note: '平平稳稳也是一种好运。把手头的小事做好，就很不错。', tone: 'steady' },
  { id: 'high', label: '上', weight: 35, note: '今天的风有点偏向你。把想做的小事，往前推一步吧。', tone: 'lucky' },
  { id: 'very-high', label: '上上', weight: 11, note: '今日份好运已签收。抬头看看，说不定阳光也在等你。', tone: 'lucky' },
  { id: 'ultra', label: 'Ultra Pro 上上上', weight: 1, note: '隐藏款！今天连英国的天气都该给你几分面子。', tone: 'rare' },
  { id: 'shite', label: 'shite', weight: 1, note: 'Quite shite innit. 抽到的是玩笑，不是预言。去吃点好吃的！', tone: 'mischief' },
] as const;

export type FortuneId = typeof FORTUNES[number]['id'];
export type FortuneRecord = { version: 1; date: string; result: FortuneId };

const londonDate = new Intl.DateTimeFormat( 'en-GB', {
  timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
} );

export function fortuneDay( date = new Date() ): string
{
  const parts = londonDate.formatToParts( date );
  return [ 'year', 'month', 'day' ].map( type => parts.find( part => part.type === type )!.value ).join( '-' );
}

export function fortuneFromTicket( ticket: number ): typeof FORTUNES[number]
{
  if ( !Number.isInteger( ticket ) || ticket < 0 || ticket >= 100 ) throw new RangeError( 'Fortune ticket must be 0–99.' );
  let boundary = 0;
  for ( const fortune of FORTUNES )
  {
    boundary += fortune.weight;
    if ( ticket < boundary ) return fortune;
  }
  throw new Error( 'Fortune weights must total 100.' );
}

export function parseFortune( raw: string | null ): FortuneRecord | null
{
  if ( !raw || raw.length > 1000 ) return null;
  try
  {
    const value: unknown = JSON.parse( raw );
    if ( !value || typeof value !== 'object'
      || !( 'version' in value ) || value.version !== 1
      || !( 'date' in value ) || typeof value.date !== 'string'
      || !/^\d{4}-\d{2}-\d{2}$/.test( value.date )
      || !( 'result' in value ) ) return null;
    const fortune = FORTUNES.find( entry => entry.id === value.result );
    if ( !fortune || new Date( `${value.date}T00:00:00Z` ).toISOString().slice( 0, 10 ) !== value.date ) return null;
    return { version: 1, date: value.date, result: fortune.id };
  }
  catch { return null; }
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, BookOpen, ChevronsLeftRight, Newspaper, RotateCw, X } from 'lucide-react';
import { BBC_NEWS_URL, NEWS_REFRESH_MS, type NewsSnapshot } from '@/lib/news/types';
import styles from './HomeNews.module.css';
import { useNewsReadingMode } from './useNewsReadingMode';
import DailyFortune from './DailyFortune';

const londonTime = new Intl.DateTimeFormat( 'zh-CN', {
  timeZone: 'Europe/London', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
} );
const editionDate = new Intl.DateTimeFormat( 'en-GB', {
  timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
} );
const COMPACT_STORIES = 8;

function NewsThumbnail( { src, reading }: { src: string; reading: boolean } )
{
  const [ failed, setFailed ] = useState( false );
  const [ largeFailed, setLargeFailed ] = useState( false );
  if ( failed ) return null;
  const largeSrc = src.replace( 'https://ichef.bbci.co.uk/ace/standard/240/', 'https://ichef.bbci.co.uk/ace/standard/800/' );
  const useLarge = reading && !largeFailed && largeSrc !== src;
  return <Image src={useLarge ? largeSrc : src} alt="" width={240} height={135} unoptimized className={styles.thumbnail} onError={() => useLarge ? setLargeFailed( true ) : setFailed( true )} />;
}

/** `onSnapshot` lets the page reuse each fetched snapshot instead of requesting the feed again. */
export default function HomeNews( { onSnapshot }: { onSnapshot?: ( snapshot: NewsSnapshot ) => void } = {} )
{
  const [ snapshot, setSnapshot ] = useState<NewsSnapshot | null>( null );
  const onSnapshotRef = useRef( onSnapshot );
  useEffect( () => { onSnapshotRef.current = onSnapshot; } );
  const [ status, setStatus ] = useState<'loading' | 'ready' | 'stale' | 'error'>( 'loading' );
  const [ retry, setRetry ] = useState( 0 );
  const { reading, boardRef, contentRef, toggleRef, toggleReading } = useNewsReadingMode();

  useEffect( () => {
    let disposed = false;
    let pending = false;
    let controller: AbortController | null = null;

    async function refresh()
    {
      if ( pending || document.hidden ) return;
      pending = true;
      controller = new AbortController();
      const requestController = controller;
      const timeout = window.setTimeout( () => requestController.abort(), 12_000 );
      try
      {
        const response = await fetch( '/api/news', { signal: requestController.signal, cache: 'no-store' } );
        if ( !response.ok ) throw new Error( 'News unavailable.' );
        const data: NewsSnapshot = await response.json();
        if ( !disposed )
        {
          setSnapshot( data );
          onSnapshotRef.current?.( data );
          const staleCache = Date.now() - Date.parse( data.fetchedAt ) > NEWS_REFRESH_MS * 2;
          const staleFeed = data.feedUpdatedAt !== null && Date.now() - Date.parse( data.feedUpdatedAt ) > 24 * 60 * 60 * 1000;
          setStatus( staleCache || staleFeed ? 'stale' : 'ready' );
        }
      }
      catch
      {
        if ( !disposed ) setStatus( 'error' );
      }
      finally
      {
        window.clearTimeout( timeout );
        pending = false;
      }
    }

    void refresh();
    const interval = window.setInterval( () => void refresh(), NEWS_REFRESH_MS );
    const onVisibilityChange = () => { if ( !document.hidden ) void refresh(); };
    document.addEventListener( 'visibilitychange', onVisibilityChange );
    return () => {
      disposed = true;
      controller?.abort();
      window.clearInterval( interval );
      document.removeEventListener( 'visibilitychange', onVisibilityChange );
    };
  }, [ retry ] );

  return (
    <section
      ref={boardRef}
      className={styles.board}
      data-reading={reading}
      aria-labelledby="home-news-title"
      onKeyDown={event => {
        if ( event.key === 'Escape' && reading )
        {
          event.preventDefault();
          toggleReading( true );
        }
      }}
    >
      <span className={styles.boardGlow} aria-hidden="true" />
      <div className={styles.folds} aria-hidden="true">
        <i className={styles.foldLeft} />
        <i className={styles.foldRight} />
      </div>
      <div ref={contentRef} className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            <p className={styles.eyebrow}><Newspaper aria-hidden="true" /> 每日新闻</p>
            <p className={styles.masthead}>
              <span className={styles.mastheadInk}>The UKCFFA Dispatch</span>
              <span className={styles.roller} aria-hidden="true" />
            </p>
            <p className={styles.dateline}>
              <span>Free · 免费取阅</span>
              <span>London</span>
              <span>{snapshot ? editionDate.format( new Date( snapshot.fetchedAt ) ) : 'Daily edition'}</span>
            </p>
            <h2 id="home-news-title" className={styles.title}>Quite shite innit<span>。</span></h2>
          </div>
          <div className={styles.fortuneSlot} hidden={reading}><DailyFortune /></div>
        </header>

        <div className={styles.sealRow}>
          <button
            ref={toggleRef}
            type="button"
            className={styles.readToggle}
            aria-expanded={reading}
            aria-controls="home-news-stories"
            onClick={event => toggleReading( event.detail === 0 )}
          >
            <BookOpen aria-hidden="true" />
            {reading ? '合上报纸' : '进入阅读模式'}
            <ChevronsLeftRight aria-hidden="true" className={styles.unfoldIcon} />
          </button>
        </div>
        <div className={styles.edition} hidden={!reading}>
          <span>THE FRONT PAGE</span>
          <span>BBC 新闻与摘要 · 原文在 BBC 阅读 <ArrowUpRight aria-hidden="true" /></span>
        </div>

        <div id="home-news-stories">
          {!snapshot && status === 'loading' && <p className={styles.notice} role="status">正在获取 BBC 最新新闻…</p>}
          {status === 'stale' && <p className={styles.notice} role="status">当前显示的是较早的订阅数据，请留意新闻日期或前往 BBC 查看最新情况。</p>}
          {status === 'error' && (
            <div className={styles.notice} role="status">
              <p>{snapshot ? '更新暂时失败，以下保留上次获取的新闻。' : '新闻暂时无法加载，你仍可前往 BBC 查看。'}</p>
              <button type="button" className={styles.retry} onClick={() => { setStatus( 'loading' ); setRetry( value => value + 1 ); }}>
                <RotateCw aria-hidden="true" /> 重试
              </button>
            </div>
          )}
          {snapshot && (
            <ul className={styles.list}>
              {snapshot.items.slice( 0, reading ? 12 : COMPACT_STORIES ).map( item => (
                <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.story}>
                    <time dateTime={item.publishedAt}>{londonTime.format( new Date( item.publishedAt ) )}</time>
                    <div className={styles.storyBody}>
                      <h3 lang="en">{item.title}</h3>
                      {item.imageUrl && <NewsThumbnail key={item.imageUrl} src={item.imageUrl} reading={reading} />}
                    </div>
                    {reading && item.description && <p lang="en" className={styles.description}>{item.description}</p>}
                    <ArrowUpRight aria-hidden="true" className={styles.storyArrow} />
                  </a>
                </li>
              ) )}
            </ul>
          )}
        </div>

        {reading && (
          <div className={styles.readingEnd}>
            <span>{snapshot ? 'END OF THIS EDITION.' : 'BBC NEWS'}</span>
            <button type="button" className={styles.closeReading} onClick={event => toggleReading( event.detail === 0 )}>
              <X aria-hidden="true" /> 合上，回到首页
            </button>
          </div>
        )}

        {/* Twine round the folded paper; it snaps as the paper scrolls in (resting state: already snapped) */}
        <span className={styles.twine} aria-hidden="true" hidden={reading}>
          <i /><i /><i /><i /><b />
        </span>

        <footer className={styles.footer}>
          <span>来源：<a href={BBC_NEWS_URL} target="_blank" rel="noopener noreferrer" className={styles.sourceCredit}>BBC News</a> · 英国时间 · 每 15 分钟自动检查</span>
          {snapshot && <span>最近同步 <time dateTime={snapshot.fetchedAt}>{londonTime.format( new Date( snapshot.fetchedAt ) )}</time></span>}
        </footer>
      </div>
    </section>
  );
}

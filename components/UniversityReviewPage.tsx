'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react';
import type { UniversityCatalogEntry } from '@/lib/universities/catalog';
import styles from './UniversityReviewPage.module.css';

export type UniversityListing = UniversityCatalogEntry & {
  averageRating: number | null;
  reviewCount: number;
};

type OpeningFile = {
  university: UniversityListing;
  transform: string;
};

export default function UniversityReviewPage( { universities }: { universities: UniversityListing[] } )
{
  const router = useRouter();
  const [ openingFile, setOpeningFile ] = useState<OpeningFile | null>( null );
  const [ curtainOpen, setCurtainOpen ] = useState( false );

  useEffect( () =>
  {
    if ( !openingFile ) return;

    document.body.style.overflow = 'hidden';
    const firstFrame = requestAnimationFrame( () =>
    {
      requestAnimationFrame( () => setCurtainOpen( true ) );
    } );
    const navigationTimer = window.setTimeout( () =>
    {
      router.push( `/universities/${openingFile.university.slug}` );
    }, 390 );

    return () =>
    {
      cancelAnimationFrame( firstFrame );
      window.clearTimeout( navigationTimer );
      document.body.style.overflow = '';
    };
  }, [ openingFile, router ] );

  const openFile = ( event: MouseEvent<HTMLAnchorElement>, university: UniversityListing ) =>
  {
    if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 ) return;
    if ( event.detail === 0 || window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) return;

    event.preventDefault();
    if ( openingFile ) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = rect.width / window.innerWidth;
    const scaleY = rect.height / window.innerHeight;

    setOpeningFile( {
      university,
      transform: `translate3d(${rect.left}px, ${rect.top}px, 0) scale(${scaleX}, ${scaleY})`,
    } );
  };

  return (
    <div className={styles.page} aria-busy={openingFile ? 'true' : 'false'}>
      <header className={styles.archiveHeader}>
        <Link href="/" className={styles.archiveMark}>CFFA / STUDENT ARCHIVE</Link>
        <span>UK UNIVERSITIES · {universities.length} FILES</span>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="university-files-title">
          <p className={styles.eyebrow}>英国大学观察簿 · 第一柜</p>
          <h1 id="university-files-title">UNIVERSITY<br />FILES</h1>
          <div className={styles.heroNotes}>
            <p>只收录就读者提交并通过审核的年份、专业、评分、原文和照片。</p>
            <span>点击大学标签，打开学生评价档案。</span>
          </div>
        </section>

        <section className={styles.cabinet} aria-label="英国大学档案柜">
          {universities.map( ( university, index ) => (
            <Link
              key={university.slug}
              href={`/universities/${university.slug}`}
              className={styles.folder}
              style={{
                '--folder-color': university.color,
                '--folder-text': university.textColor,
                '--folder-index': index,
                '--tab-offset': `${8 + index % 6 * 14}%`,
              } as CSSProperties}
              aria-label={`打开 ${university.name} 档案`}
              onClick={( event ) => openFile( event, university )}
            >
              <span className={styles.folderTab}>
                <b>{university.shortName}</b>
                <small>FILE {university.fileNumber}</small>
              </span>
              <span className={styles.folderBody}>
                <span className={styles.folderMeta}>
                  <b>{university.reviewCount} STUDENT {university.reviewCount === 1 ? 'REVIEW' : 'REVIEWS'}</b>
                  <small>{university.averageRating === null ? '等待第一份评价' : `平均 ${university.averageRating.toFixed( 1 )} / 5`}</small>
                </span>
                <span className={styles.folderPreview}>
                  <strong>{university.name}</strong>
                  <span>{university.reviewCount === 0 ? '这份档案尚未收录已审核评价。' : `打开查看 ${university.reviewCount} 位投稿者的就读背景、整体评价和照片。`}</span>
                  <em>OPEN DOSSIER ↗</em>
                </span>
              </span>
            </Link>
          ) )}
        </section>
      </main>

      <footer className={styles.archiveFooter}>
        <span>FIELD NOTES / NOT A RANKING</span>
        <p>平均分来自已审核投稿；匿名投稿不会公开真实姓名。</p>
      </footer>

      {openingFile && (
        <div
          className={styles.routeCurtain}
          data-open={curtainOpen}
          style={{
            '--curtain-color': openingFile.university.color,
            '--curtain-transform': openingFile.transform,
          } as CSSProperties}
          aria-hidden="true"
        >
          <span>{openingFile.university.shortName}</span>
          <b>{openingFile.university.name}</b>
        </div>
      )}
    </div>
  );
}

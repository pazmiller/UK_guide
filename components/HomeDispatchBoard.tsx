import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowUpRight, GraduationCap } from 'lucide-react';
import { UNIVERSITY_CATALOG } from '@/lib/universities/catalog';
import { getUniversityReviews } from '@/lib/universities/reviews';
import styles from './HomeDispatchBoard.module.css';

export default function HomeDispatchBoard()
{
  const reviewedUniversities = UNIVERSITY_CATALOG
    .map( university => ( { university, reviews: getUniversityReviews( university.slug ) } ) )
    .filter( record => record.reviews.length > 0 );
  const reviewCount = reviewedUniversities.reduce( ( total, record ) => total + record.reviews.length, 0 );
  const featuredUniversities = [ 'kcl', 'exeter', 'imperial-college-london' ]
    .map( slug => UNIVERSITY_CATALOG.find( university => university.slug === slug ) )
    .filter( university => university !== undefined );

  return (
    <section className={styles.board} aria-labelledby="dispatch-board-title">
      <div className={styles.intro}>
        <div className={styles.eyebrow}>
          <GraduationCap aria-hidden="true" />
          <span>林北偷偷跟你讲哦</span>
        </div>
        <h2 id="dispatch-board-title" className={styles.title}>
          UK大学<span className={styles.titleLine}><span className={styles.red}>红</span><span className={styles.black}>黑</span>评测榜</span>
        </h2>
        <Link href="/universities" className={styles.exploreLink}>
          探索大学 <span className={styles.arrow}><ArrowUpRight aria-hidden="true" /></span>
        </Link>
      </div>

      <nav className={styles.schools} aria-label="精选学校的大学评价">
        <h3 className={styles.schoolsLabel}>
          <Link href="/universities" className={styles.schoolsLink}>
            更多学校 <ArrowUpRight aria-hidden="true" />
          </Link>
        </h3>
        <div className={styles.schoolGrid}>
          {featuredUniversities.map( ( university, index ) => (
            <Link
              key={university.slug}
              href={`/universities/${university.slug}`}
              className={styles.schoolCard}
              aria-label={`查看 ${university.shortName} 的大学评价`}
              style={{ '--school-color': university.color, '--card-angle': `${( index - 1 ) * 5}deg` } as CSSProperties}
            >
              <span className={styles.schoolOrb} aria-hidden="true" />
              <strong>{university.shortName}</strong>
              <ArrowUpRight className={styles.schoolArrow} aria-hidden="true" />
            </Link>
          ) )}
        </div>
      </nav>

      <div className={styles.footer}>
        <span><b>{reviewedUniversities.length}</b> 所学校 <span className={styles.separator} aria-hidden="true">·</span> <b>{reviewCount}</b> 份已审核评价</span>
        <span className={styles.reviewHint}><i aria-hidden="true" />真实就读体验</span>
      </div>
    </section>
  );
}

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowUpRight, GraduationCap } from 'lucide-react';
import { UNIVERSITY_CATALOG } from '@/lib/universities/catalog';
import { calculateAverageRating, getUniversityReviews } from '@/lib/universities/reviews';
import CampusDispenser, { type CampusSchool } from './CampusDispenser';
import styles from './CampusLetters.module.css';

/**
 * Campus as a letterbox: every tap delivers an offer letter from another UK
 * university, its wax seal cracking to show the review summary.
 */
export default function CampusLetters()
{
  // Summaries only, so the client never receives the full review texts
  const schools: CampusSchool[] = UNIVERSITY_CATALOG.map( university =>
  {
    const reviews = getUniversityReviews( university.slug );
    return {
      slug: university.slug,
      shortName: university.shortName,
      chineseName: university.chineseName,
      color: university.color,
      count: reviews.length,
      average: calculateAverageRating( reviews ),
    };
  } );
  const reviewedSchools = schools.filter( school => school.count > 0 ).length;
  const reviewCount = schools.reduce( ( total, school ) => total + school.count, 0 );

  return (
    <section className={styles.scroller} aria-labelledby="campus-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}><GraduationCap aria-hidden="true" /> 林北偷偷跟你讲哦</p>
          <h2 id="campus-title" className={styles.title}>
            UK大学<span className={styles.red}>红</span><span className={styles.black}>黑</span>评测榜
          </h2>
        </div>
        <div className={styles.links}>
          <Link href="/universities" className={styles.more}>更多学校 <ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>

      <CampusDispenser schools={schools} />

      <div className={styles.footer}>
        <span>
          <b className={styles.count} style={{ '--target': reviewedSchools } as CSSProperties} aria-hidden="true" />
          <span className="sr-only">{reviewedSchools}</span> 所学校
          <span className={styles.separator} aria-hidden="true">·</span>
          <b className={styles.count} style={{ '--target': reviewCount } as CSSProperties} aria-hidden="true" />
          <span className="sr-only">{reviewCount}</span> 份已审核评价
        </span>
        <span className={styles.hint}><i aria-hidden="true" />真实就读体验</span>
      </div>
    </section>
  );
}

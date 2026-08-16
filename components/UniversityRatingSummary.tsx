'use client';

import { useRef } from 'react';
import type { PublicUniversityReview } from '@/lib/universities/reviews';
import styles from './UniversityDossier.module.css';

type RatingSummaryProps = {
  averageRating: number | null;
  reviews: PublicUniversityReview[];
};

function authorName( review: PublicUniversityReview )
{
  return review.author.kind === 'anonymous' ? '匿名投稿者' : review.author.displayName;
}
export default function UniversityRatingSummary( { averageRating, reviews }: RatingSummaryProps )
{
  const dialogRef = useRef<HTMLDialogElement>( null );
  const hasReviews = reviews.length > 0 && averageRating !== null;

  return (
    <>
      <button type="button" className={styles.scoreLedger} disabled={!hasReviews} aria-haspopup="dialog" onClick={() => dialogRef.current?.showModal()}>
        <span>AVERAGE SCORE</span>
        <strong>{averageRating === null ? '—' : averageRating.toFixed( 1 )}<small> / 5</small></strong>
        <b>{reviews.length === 0 ? '等待第一份评价' : `${reviews.length} 份已审核评价 · 查看明细 ↗`}</b>
      </button>

      {hasReviews && (
        <dialog ref={dialogRef} className={styles.ratingDialog} aria-labelledby="rating-dialog-title" onClick={event => {
          if ( event.target === event.currentTarget ) event.currentTarget.close();
        }}>
          <div className={styles.ratingSheet}>
            <header>
              <div>
                <span>SCORE LEDGER</span>
                <h2 id="rating-dialog-title">谁打了多少分</h2>
              </div>
              <form method="dialog"><button type="submit" aria-label="关闭评分明细">×</button></form>
            </header>
            <ol>
              {reviews.map( review => (
                <li key={review.id}>
                  <div>
                    <strong>{authorName( review )}</strong>
                    <span>{review.studyStartYear}–{review.studyEndYear} · {review.studyStage} · {review.studyProgram}</span>
                  </div>
                  <b>{review.rating.toFixed( 1 )}</b>
                </li>
              ) )}
            </ol>
            <p>总分按所有已审核评价等权计算，匿名投稿不会公开真实姓名。</p>
          </div>
        </dialog>
      )}
    </>
  );
}

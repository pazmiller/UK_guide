import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { UniversityCatalogEntry } from '@/lib/universities/catalog';
import { calculateAverageRating, displayReviewAuthor, type PublicUniversityReview } from '@/lib/universities/reviews';
import UniversityRatingSummary from './UniversityRatingSummary';
import styles from './UniversityDossier.module.css';

type UniversityDossierProps = {
  university: UniversityCatalogEntry;
  nextUniversity: UniversityCatalogEntry;
  reviews: PublicUniversityReview[];
};

export default function UniversityDossier( { university, nextUniversity, reviews }: UniversityDossierProps )
{
  const theme = {
    '--folder-color': university.color,
    '--folder-tab': university.tabColor,
    '--folder-tab-text': university.tabTextColor,
    '--folder-text': university.textColor,
    '--next-color': nextUniversity.color,
  } as CSSProperties;
  const averageRating = calculateAverageRating( reviews );

  return (
    <article className={styles.page} style={theme}>
      <header className={styles.caseHeader}>
        <div className={styles.caseNav}>
          <span>FILE {university.fileNumber}</span>
        </div>
        <p>{reviews.length} STUDENT {reviews.length === 1 ? 'REVIEW' : 'REVIEWS'}</p>
        <h1>{university.name}</h1>
      </header>

      <div className={styles.folderShell}>
        <div className={styles.folderTab} aria-hidden="true">
          <span>{university.shortName}</span>
          <small>OPEN FILE</small>
        </div>

        <Link href="/universities" className={styles.backToCabinet}>
          <span className={styles.backArrow} aria-hidden="true">←</span> 返回大学档案柜
        </Link>

        <nav className={styles.sideTabs} aria-label="相邻大学档案">
          <span className={styles.currentTab}>{university.shortName}</span>
          <Link href={`/universities/${nextUniversity.slug}`} style={{ '--tab-color': nextUniversity.color } as CSSProperties}>
            {nextUniversity.shortName}
          </Link>
        </nav>

        <div className={styles.paper}>
          <span className={styles.holes} aria-hidden="true"><i /><i /><i /><i /><i /></span>

          <section className={styles.reviewHeader} aria-labelledby="review-heading">
            <div>
              <span>STUDENT TESTIMONIES</span>
              <h2 id="review-heading">{university.chineseName}</h2>
            </div>
            <UniversityRatingSummary averageRating={averageRating} reviews={reviews} />
          </section>

          {reviews.length === 0 ? (
            <section className={styles.emptyReviews}>
              <span>EMPTY FILE</span>
              <h2>这所学校还没有已审核评价。</h2>
              <Link href="/contribute">提交第一份大学评价 ↗</Link>
            </section>
          ) : (
            <div className={styles.reviewStack}>
              {reviews.map( ( review, index ) => {
                const author = displayReviewAuthor( review );
                return (
                  <article key={review.id} className={styles.reviewCard} aria-labelledby={`${review.id}-heading`}>
                    <header>
                      <div>
                        <span>REVIEW {String( index + 1 ).padStart( 2, '0' )}</span>
                        <h2 id={`${review.id}-heading`}>{author} 的评价</h2>
                      </div>
                      <strong>{review.rating.toFixed( 1 )}<small> / 5</small></strong>
                    </header>

                    <dl>
                      <div><dt>就读年份</dt><dd>{review.studyStartYear}–{review.studyEndYear}</dd></div>
                      <div><dt>身份 / 阶段</dt><dd>{review.studyStage}</dd></div>
                      <div><dt>专业</dt><dd>{review.studyProgram}</dd></div>
                      <div><dt>投稿者</dt><dd>{author}</dd></div>
                    </dl>

                    <div className={styles.reviewNarrative}>
                      {review.pros && (
                        <section className={styles.reviewBody} aria-label={`${author}写的特别好之处`}>
                          <span><strong>特别好之处</strong> / {author} 写</span>
                          <p>{review.pros}</p>
                        </section>
                      )}
                      {review.cons && (
                        <section className={styles.reviewBody} aria-label={`${author}写的特别坏之处`}>
                          <span><strong>特别坏之处</strong> / {author} 写</span>
                          <p>{review.cons}</p>
                        </section>
                      )}
                      <section className={`${styles.reviewBody} ${styles.overallReview}`} aria-label={`${author}的整体评价`}>
                        <span><strong>整体评价</strong> / {author} 写</span>
                        <p>{review.body}</p>
                      </section>
                    </div>

                    {review.images.length > 0 && (
                      <div className={styles.reviewPhotos} aria-label={`${author}上传的照片`}>
                        {review.images.map( ( image, imageIndex ) => (
                          <figure key={image.src}>
                            <div>
                              <Image src={image.src} alt={image.caption || `${author}上传的校园照片 ${imageIndex + 1}`} fill sizes="(max-width: 760px) 82vw, 380px" />
                            </div>
                            {image.caption && <figcaption>{image.caption}</figcaption>}
                          </figure>
                        ) )}
                      </div>
                    )}
                  </article>
                );
              } )}
            </div>
          )}
        </div>

        <footer className={styles.nextFile}>
          <span>NEXT DOSSIER</span>
          <Link href={`/universities/${nextUniversity.slug}`}>
            <small>继续查看大学评价</small>
            <strong>{nextUniversity.name}</strong>
            <b>→</b>
          </Link>
        </footer>
      </div>
    </article>
  );
}

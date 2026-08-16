'use client';

import Image from 'next/image';
import Link from 'next/link';
import { flushSync } from 'react-dom';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type TransitionEvent } from 'react';
import { UNIVERSITY_PHOTO_RECORDS, type UniversityPhotoRecord } from '@/lib/universityReviews';
import styles from './UniversityPhotoDeck.module.css';

function loopIndex( index: number )
{
  return ( index + UNIVERSITY_PHOTO_RECORDS.length ) % UNIVERSITY_PHOTO_RECORDS.length;
}

export default function UniversityPhotoDeck( { initialSlug }: { initialSlug: string } )
{
  const initialIndex = Math.max( UNIVERSITY_PHOTO_RECORDS.findIndex( ( university ) => university.slug === initialSlug ), 0 );
  const [ activeIndex, setActiveIndex ] = useState( initialIndex );
  const [ reducedMotion, setReducedMotion ] = useState( false );
  const frameRef = useRef<HTMLDivElement>( null );
  const cubeRef = useRef<HTMLDivElement>( null );
  const depthRef = useRef( 0 );
  const pendingDirectionRef = useRef<-1 | 0 | 1>( 0 );
  const pointerRef = useRef<{ id: number; startX: number; lastX: number; startedAt: number } | null>( null );

  const active = UNIVERSITY_PHOTO_RECORDS[activeIndex];
  const previous = UNIVERSITY_PHOTO_RECORDS[loopIndex( activeIndex - 1 )];
  const next = UNIVERSITY_PHOTO_RECORDS[loopIndex( activeIndex + 1 )];

  const setCubeRotation = useCallback( ( degrees: number ) =>
  {
    const cube = cubeRef.current;
    if ( !cube ) return;
    cube.style.transform = `translateZ(${-depthRef.current}px) rotateY(${degrees}deg)`;
  }, [] );

  useEffect( () =>
  {
    const mediaQuery = window.matchMedia( '(prefers-reduced-motion: reduce)' );
    const updatePreference = () => setReducedMotion( mediaQuery.matches );
    updatePreference();
    mediaQuery.addEventListener( 'change', updatePreference );
    return () => mediaQuery.removeEventListener( 'change', updatePreference );
  }, [] );

  useEffect( () =>
  {
    const frame = frameRef.current;
    const cube = cubeRef.current;
    if ( !frame || !cube ) return;

    const measure = () =>
    {
      depthRef.current = frame.getBoundingClientRect().width / 2;
      cube.style.setProperty( '--cube-depth', `${depthRef.current}px` );
      setCubeRotation( 0 );
    };

    measure();
    const observer = new ResizeObserver( measure );
    observer.observe( frame );
    return () => observer.disconnect();
  }, [ setCubeRotation ] );

  const showImmediately = useCallback( ( index: number ) =>
  {
    cubeRef.current?.classList.remove( styles.cubeAnimating, styles.cubeDragging );
    pendingDirectionRef.current = 0;
    setActiveIndex( loopIndex( index ) );
    setCubeRotation( 0 );
  }, [ setCubeRotation ] );

  const rotateTo = useCallback( ( direction: -1 | 1 ) =>
  {
    const cube = cubeRef.current;
    if ( !cube || pendingDirectionRef.current !== 0 ) return;
    if ( reducedMotion )
    {
      showImmediately( activeIndex + direction );
      return;
    }

    pendingDirectionRef.current = direction;
    cube.classList.remove( styles.cubeDragging );
    cube.classList.add( styles.cubeAnimating );
    setCubeRotation( direction === 1 ? -90 : 90 );
  }, [ activeIndex, reducedMotion, setCubeRotation, showImmediately ] );

  const snapBack = useCallback( () =>
  {
    pendingDirectionRef.current = 0;
    cubeRef.current?.classList.remove( styles.cubeDragging );
    cubeRef.current?.classList.add( styles.cubeAnimating );
    setCubeRotation( 0 );
  }, [ setCubeRotation ] );

  const handleTransitionEnd = ( event: TransitionEvent<HTMLDivElement> ) =>
  {
    if ( event.target !== event.currentTarget ) return;
    const cube = cubeRef.current;
    if ( !cube ) return;
    const direction = pendingDirectionRef.current;

    if ( direction !== 0 )
    {
      flushSync( () => setActiveIndex( ( current ) => loopIndex( current + direction ) ) );
    }

    pendingDirectionRef.current = 0;
    cube.classList.remove( styles.cubeAnimating, styles.cubeDragging );
    setCubeRotation( 0 );
  };

  const handlePointerDown = ( event: PointerEvent<HTMLDivElement> ) =>
  {
    if ( event.button !== 0 || pointerRef.current || pendingDirectionRef.current !== 0 || reducedMotion ) return;
    if ( ( event.target as HTMLElement ).closest( 'button, a' ) ) return;

    event.currentTarget.setPointerCapture( event.pointerId );
    pointerRef.current = { id: event.pointerId, startX: event.clientX, lastX: event.clientX, startedAt: performance.now() };
    cubeRef.current?.classList.add( styles.cubeDragging );
  };

  const handlePointerMove = ( event: PointerEvent<HTMLDivElement> ) =>
  {
    const pointer = pointerRef.current;
    const frame = frameRef.current;
    if ( !pointer || pointer.id !== event.pointerId || !frame ) return;

    pointer.lastX = event.clientX;
    const delta = event.clientX - pointer.startX;
    setCubeRotation( Math.max( -88, Math.min( 88, delta / frame.clientWidth * 90 ) ) );
  };

  const finishPointer = ( event: PointerEvent<HTMLDivElement>, cancelled = false ) =>
  {
    const pointer = pointerRef.current;
    const frame = frameRef.current;
    if ( !pointer || pointer.id !== event.pointerId || !frame ) return;

    if ( event.currentTarget.hasPointerCapture( event.pointerId ) ) event.currentTarget.releasePointerCapture( event.pointerId );
    pointerRef.current = null;

    const delta = pointer.lastX - pointer.startX;
    const elapsed = Math.max( performance.now() - pointer.startedAt, 1 );
    const velocity = Math.abs( delta ) / elapsed;
    const hasDistance = Math.abs( delta ) >= frame.clientWidth * .18;
    const hasFlick = Math.abs( delta ) >= 20 && velocity > .5;

    if ( !cancelled && ( hasDistance || hasFlick ) ) rotateTo( delta < 0 ? 1 : -1 );
    else snapBack();
  };

  return (
    <section className={styles.deckSection} aria-labelledby="photo-index-title">
      <header>
        <span>VISUAL INDEX / 05 FILES</span>
        <h2 id="photo-index-title">从照片切换到下一份档案</h2>
        <p>拖动照片或使用箭头。这里保留了第一版的 3D 翻面浏览。</p>
      </header>

      <div className={styles.viewer}>
        <div
          ref={frameRef}
          className={styles.frame}
          role="region"
          aria-roledescription="3D university photo carousel"
          aria-label="大学照片浏览器。拖动或使用箭头切换。"
          tabIndex={0}
          onKeyDown={( event ) =>
          {
            if ( event.key === 'ArrowLeft' ) showImmediately( activeIndex - 1 );
            if ( event.key === 'ArrowRight' ) showImmediately( activeIndex + 1 );
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={( event ) => finishPointer( event )}
          onPointerCancel={( event ) => finishPointer( event, true )}
        >
          <div
            ref={cubeRef}
            className={styles.cube}
            style={{ '--cube-depth': '0px' } as CSSProperties}
            onTransitionEnd={handleTransitionEnd}
          >
            <PhotoFace university={active} position="front" priority />
            <PhotoFace university={previous} position="left" />
            <PhotoFace university={next} position="right" />
          </div>

          <button type="button" className={`${styles.arrow} ${styles.previous}`} aria-label="上一所大学" onClick={() => rotateTo( -1 )}>←</button>
          <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="下一所大学" onClick={() => rotateTo( 1 )}>→</button>
        </div>

        <div className={styles.deckMeta}>
          <span>{active.fileNumber} / {String( UNIVERSITY_PHOTO_RECORDS.length ).padStart( 2, '0' )}</span>
          <strong>{active.name}</strong>
          <small>STUDENT ARCHIVE</small>
          <Link href={`/universities/${active.slug}`}>打开这份档案 ↗</Link>
        </div>
      </div>

      <p className={styles.liveRegion} aria-live="polite">当前照片：{active.name}</p>
    </section>
  );
}

function PhotoFace( { university, position, priority = false }: { university: UniversityPhotoRecord; position: 'front' | 'left' | 'right'; priority?: boolean } )
{
  return (
    <div className={`${styles.face} ${styles[position]}`} aria-hidden={position !== 'front'}>
      <Image
        src={university.image}
        alt={position === 'front' ? university.imageAlt : ''}
        fill
        priority={priority}
        sizes="(max-width: 760px) 92vw, 640px"
        draggable={false}
        className={styles.image}
        style={{ objectPosition: university.imagePosition }}
      />
      <span className={styles.imageWash} aria-hidden="true" />
      <b>{university.shortName}</b>
    </div>
  );
}

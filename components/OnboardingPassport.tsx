'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowRight, Banknote, Car, CardSim, GraduationCap, House, IdCard, ListChecks,
  Luggage, Plane, ShieldAlert, ShoppingBasket, Siren, Stethoscope, TrainFront,
} from 'lucide-react';
import styles from './OnboardingPassport.module.css';
import { useCollapseOnReturn } from './useCollapseOnReturn';

// One stamp per chapter of 带英十三律 (src/guide.md), in chapter order
const STAMPS = [
  { zh: '手机卡', en: 'SIM card', Icon: CardSim, ink: '#C8102E', shape: 'circle', rot: -8 },
  { zh: '入境行李', en: 'Customs', Icon: Luggage, ink: '#1D3557', shape: 'rect', rot: 5 },
  { zh: '银行卡与现金', en: 'Bank & cash', Icon: Banknote, ink: '#2A7D5F', shape: 'oval', rot: -3 },
  { zh: '手机安全', en: 'Phone safety', Icon: ShieldAlert, ink: '#C8102E', shape: 'double', rot: 9 },
  { zh: 'eVisa 身份', en: 'eVisa', Icon: IdCard, ink: '#6A3D9A', shape: 'rect', rot: -6 },
  { zh: '注册 GP', en: 'NHS GP', Icon: Stethoscope, ink: '#12708A', shape: 'circle', rot: 4 },
  { zh: '公共交通', en: 'Railcard', Icon: TrainFront, ink: '#1D3557', shape: 'dashed', rot: -10 },
  { zh: '租房拍照', en: 'Renting', Icon: House, ink: '#B5541C', shape: 'oval', rot: 7 },
  { zh: '防诈骗', en: 'Scams', Icon: Siren, ink: '#C8102E', shape: 'rect', rot: -4 },
  { zh: '学术红线', en: 'Academic', Icon: GraduationCap, ink: '#6A3D9A', shape: 'double', rot: 6 },
  { zh: '易忽略事项', en: 'Checklist', Icon: ListChecks, ink: '#2A7D5F', shape: 'circle', rot: -7 },
  { zh: '超市省钱', en: 'Supermarket', Icon: ShoppingBasket, ink: '#12708A', shape: 'dashed', rot: 3 },
  { zh: '临时驾照', en: 'Provisional ID', Icon: Car, ink: '#B5541C', shape: 'rect', rot: -5 },
] as const;

/** Wide screens with scroll-driven animations pin and scrub this in CSS; everyone else gets a timed play. */
const SCRUB_QUERY = '(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)';

export default function OnboardingPassport()
{
  const scrollerRef = useRef<HTMLDivElement>( null );
  const passRef = useRef<HTMLDivElement>( null );
  const passportRef = useRef<HTMLDivElement>( null );
  // undefined: static (no JS yet, scrubbed by CSS, or reduced motion); false: armed; true: playing
  const [ passOn, setPassOn ] = useState<boolean>();
  const [ stampsOn, setStampsOn ] = useState<boolean>();
  useCollapseOnReturn( scrollerRef );

  useEffect( () =>
  {
    const scrubbed = CSS.supports( 'animation-timeline: view()' ) && window.matchMedia( SCRUB_QUERY ).matches;
    if ( scrubbed || window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) return;

    const watch = ( el: HTMLElement | null, set: ( on: boolean ) => void ) =>
    {
      if ( !el ) return () => {};
      set( false );
      const observer = new IntersectionObserver( ( [ entry ] ) =>
      {
        if ( !entry.isIntersecting ) return;
        set( true );
        observer.disconnect();
      }, { threshold: 0.3 } );
      observer.observe( el );
      return () => observer.disconnect();
    };
    const stopPass = watch( passRef.current, setPassOn );
    const stopStamps = watch( passportRef.current, setStampsOn );
    return () =>
    {
      stopPass();
      stopStamps();
    };
  }, [] );

  return (
    <div ref={scrollerRef} className={styles.scroller} data-pass={passOn} data-stamps={stampsOn}>
      <div className={styles.stage}>
        <div className={styles.layout}>
          <div ref={passRef} className={styles.pass}>
            <div className={styles.passMain}>
              <div className={styles.passTop}>
                <span><Plane aria-hidden="true" /> Boarding pass · 登机牌</span>
                <span>UK Arrival Notes</span>
              </div>
              <div className={styles.route} aria-label="从中国到英国">
                <span><b>CN</b>中国</span>
                <span className={styles.flightPath} aria-hidden="true"><Plane /></span>
                <span><b>UK</b>英国</span>
              </div>
              <h3 className={styles.passTitle}>CFFA UK Onboarding</h3>
              <p className={styles.passText}>
                从落地后的第一张手机卡，到体验NHS医疗，各种指南与逼坑，尽在CFFA出版的带英十三律里！第一次来英国也不用慌nia
              </p>
              <dl className={styles.fields}>
                <div><dt>Passenger</dt><dd>新同学</dd></div>
                <div><dt>Flight</dt><dd>CFFA 013</dd></div>
                <div><dt>Class</dt><dd>Before &amp; After Landing</dd></div>
              </dl>
              <span className={styles.barcode} aria-hidden="true" />
            </div>
            <div className={styles.passStub}>
              <span className={styles.stubLabel}>Twelve Teachings</span>
              <span className={styles.gate} aria-hidden="true"><small>Gate</small>12</span>
              <p className={styles.stubText}>一次读完，之后需要时随手翻开。</p>
            </div>
          </div>

          <div ref={passportRef} className={styles.passport}>
            <div className={styles.passportHead}>
              <span>United Kingdom · 入境记录</span>
              <span>带英十三律 · {STAMPS.length} entries</span>
            </div>
            <ul className={styles.stamps} aria-label="指南章节">
              {STAMPS.map( ( { zh, en, Icon, ink, shape, rot }, i ) => (
                <li
                  key={zh}
                  className={styles.stamp}
                  data-shape={shape}
                  style={{ '--i': i, '--ink': ink, '--rot': `${rot}deg` } as CSSProperties}
                >
                  <Icon aria-hidden="true" />
                  <b>{zh}</b>
                  <span>{en}</span>
                </li>
              ) )}
            </ul>
            <Link href="/guide" className={styles.cleared}>
              <span className={styles.clearedMark} aria-hidden="true">Cleared · 准予入境</span>
              <span className={styles.clearedLink}>打开赴英指南 <ArrowRight aria-hidden="true" /></span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

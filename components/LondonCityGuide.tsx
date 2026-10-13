import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import EatsReceipts from './EatsReceipts';
import { londonRestaurants } from '@/data/london/restaurants';
import { londonCafes } from '@/data/london/cafes';
import { londonAttractions } from '@/data/london/attractions';
import { londonEditorialFood, londonEditorialSights } from '@/data/london/editorial';
import styles from './LondonCityGuide.module.css';

type Fact = { stat: string; label: string; title: string; body: ReactNode };

function TableIllustration()
{
  return (
    <svg viewBox="0 0 620 500" className={styles.illustration} aria-hidden="true" focusable="false">
      <circle cx="310" cy="252" r="192" fill="#1D3557" />
      {[ 176, 164, 150 ].map( radius => <circle key={radius} cx="310" cy="252" r={radius} fill="none" stroke="#F3F0E7" strokeWidth="1.3" /> )}
      <circle cx="310" cy="252" r="127" fill="#F3F0E7" />
      <path d="M218 257Q238 164 323 165L380 266Q302 347 218 257Z" fill="#C3323A" />
      <path d="M251 275Q309 300 351 241M247 247Q294 266 330 211M262 210L311 229" fill="none" stroke="#F3F0E7" strokeWidth="8" />
      <path d="M356 319L391 290L404 305L369 333Z" fill="#4A80C4" />
      <circle cx="364" cy="197" r="17" fill="#1D3557" />
      <circle cx="388" cy="217" r="10" fill="#C3323A" />
      <g transform="translate(62 136) rotate(-9)">
        <path d="M0 0V66Q0 88 24 88Q48 88 48 66V0M16 0V66M32 0V66M24 88V254" fill="none" stroke="#1D3557" strokeWidth="10" />
      </g>
      <g transform="translate(528 143) rotate(9)">
        <path d="M0 0Q-28 49-24 119H0V253H13V0Z" fill="#1D3557" />
      </g>
      <g transform="translate(438 26) rotate(12)">
        <path d="M0 0H76V49Q38 84 0 49Z" fill="#C3323A" />
        <path d="M76 9H86Q110 9 110 29Q110 49 76 47" fill="none" stroke="#C3323A" strokeWidth="9" />
        <path d="M-12 79H98" stroke="#1D3557" strokeWidth="6" />
      </g>
      <path d="M121 454H242M377 454H498" stroke="#1D3557" strokeWidth="1" />
      <text x="310" y="459" textAnchor="middle" fill="#1D3557" fontFamily="monospace" fontSize="11" letterSpacing="3">TABLE FOR YOU</text>
    </svg>
  );
}

function WalkingIllustration()
{
  return (
    <svg viewBox="0 0 620 500" className={styles.illustration} aria-hidden="true" focusable="false">
      <circle cx="297" cy="247" r="203" fill="#F3F0E7" />
      <g fill="#1D3557">
        <path d="M94 377V242H113V214H134V242H154V377ZM92 210L124 153L157 210Z" />
        <path d="M466 378L494 97L520 378Z" />
        <path d="M366 378V276H383V251H397V232C397 199 441 199 441 232V251H455V276H469V378Z" />
      </g>
      <g fill="#F3F0E7">
        <circle cx="124" cy="271" r="14" />
        <path d="M114 305H122V327H114ZM132 305H140V327H132ZM400 285H409V330H400ZM427 285H436V330H427Z" />
      </g>
      <path d="M124 260V272L132 277" fill="none" stroke="#C3323A" strokeWidth="3" />
      <path d="M76 406H557" stroke="#1D3557" strokeWidth="3" />
      <path d="M224 271Q185 274 173 253L158 218L147 239L141 230L139 258Q141 301 190 308L225 302Z" fill="#1D3557" />
      <path d="M173 253L158 218L147 239L141 230L139 258L151 252L158 266L163 253L178 268Z" fill="#F3F0E7" />
      <path d="M345 288C397 321 422 287 409 257C403 244 387 248 389 261" fill="none" stroke="#C3323A" strokeWidth="13" strokeLinecap="round" />
      <g fill="#1D3557">
        <path d="M220 145L217 110L239 135L249 132L268 111L265 151Z" />
        <circle cx="242" cy="155" r="24" />
        <path d="M224 180L267 188L295 259L275 269L252 229L257 290L224 302L199 245L183 284L164 277L190 206Z" />
        <path d="M225 282L256 290L275 393L249 400L230 331L211 368L181 405L160 389L190 350Z" />
      </g>
      <path d="M223 123L225 140L233 136ZM260 124L251 136L260 140Z" fill="#C3323A" />
      <g fill="#C3323A">
        <path d="M308 149L307 118L327 135L337 135L355 118L352 151Z" />
        <circle cx="330" cy="155" r="23" />
        <path d="M316 180L345 184L366 220L379 264L363 270L341 223L336 264L362 337L295 337L310 264L297 228L285 251L274 237L296 195Z" />
      </g>
      <path d="M312 128L313 143L322 137ZM349 128L340 137L348 143Z" fill="#F3F0E7" />
      <path d="M307 337L300 402H316L324 337M343 337L355 403H372L359 337" fill="#1D3557" />
      <path d="M308 211L340 251" stroke="#F3F0E7" strokeWidth="4" />
      <path d="M331 245L351 263L340 289L320 274Z" fill="#4A80C4" />
      <path d="M75 455H224M380 455H550" stroke="#F3F0E7" strokeWidth="1" />
      <text x="302" y="459" textAnchor="middle" fill="#F3F0E7" fontFamily="monospace" fontSize="11" letterSpacing="3">Steady Pompipi</text>
    </svg>
  );
}

export default function LondonCityGuide( { facts }: { facts: Fact[] } )
{
  const foodCount = londonRestaurants.length + londonCafes.length;
  return (
    <div className={styles.guide}>
      <section className={styles.intro} aria-label="伦敦指南导览">
        <div className={styles.container}>
          <div className={styles.introGrid}>
            <div>
              <p className={styles.kicker}>CFFA UK · THE LONDON EDIT</p>
              <p className={styles.introText}>群员的伦敦私藏。<br />从一顿好饭，到一整天的闲逛。</p>
              <p className={styles.introNote}>专门给你</p>
            </div>
            <nav className={styles.index} aria-label="伦敦指南目录">
              <a href="#london-food"><strong>{foodCount}</strong><span>吃喝推荐<small>FOOD &amp; DRINK</small></span><ArrowUpRight aria-hidden="true" /></a>
              <a href="#london-places"><strong>{londonAttractions.length}</strong><span>值得一逛<small>PLACES TO GO</small></span><ArrowUpRight aria-hidden="true" /></a>
            </nav>
          </div>
        </div>
      </section>

      <section id="london-food" className={styles.food} aria-labelledby="london-food-heading">
        <div className={styles.container}>
          <div className={styles.chapterLine}><span>FOOD &amp; DRINK</span><span>LONDON, SERVED.</span></div>
          <div className={styles.spread}>
            <div className={styles.copy}>
              <p className={styles.kicker}>从正餐，到喝的和小甜甜</p>
              <h2 id="london-food-heading" className={styles.heading}>吃遍伦敦<span lang="en">A WORLD<br />AT THE TABLE<span className={styles.redDot}>.</span></span></h2>
              <p className={styles.description}>途经波斯，拐进东南亚，再回到熟悉的中餐。选择困难症的下一顿有着落了。</p>
              <Link href="/london/restaurants" className={styles.action}>找一家好吃的 <ArrowUpRight aria-hidden="true" /></Link>
              <p className={styles.smallPrint}>{foodCount} 家吃喝推荐 · 餐厅 / 咖啡 / 甜品</p>
            </div>
            <div className={styles.art}><TableIllustration /></div>
          </div>
          <EatsReceipts restaurants={londonEditorialFood} variant="receipts" thumbnailBase="/london-editorial" />
        </div>
      </section>

      <section id="london-places" className={styles.places} aria-labelledby="london-places-heading">
        <div className={styles.container}>
          <div className={styles.chapterLine}><span>ART / PARKS / EVERYDAY</span><span>OUT IN LONDON.</span></div>
          <div className={`${styles.spread} ${styles.walkSpread}`}>
            <div className={styles.copy}>
              <p className={styles.kicker}>记得保护好你的手机</p>
              <h2 id="london-places-heading" className={styles.heading}>走进伦敦<span lang="en">GO OUT.<br />LOOK UP.</span></h2>
              <p className={styles.description}>免费的世界级博物馆慢慢看，公园里的天鹅慢慢喂（非食用天鹅）</p>
              <Link href="/london/attractions" className={styles.action}>挑一个地方逛逛 <ArrowUpRight aria-hidden="true" /></Link>
              <p className={styles.smallPrint}>{londonAttractions.length} 个景点 · 博物馆 / 公园 / 城市地标</p>
            </div>
            <div className={styles.art}><WalkingIllustration /></div>
          </div>
          <div className={styles.sightStrip}>
            {londonEditorialSights.map( place => (
              <figure className={styles.sight} key={place.id}>
                <div className={styles.photo}><Image src={`/london-editorial/${place.slug}.webp`} alt={place.name} fill sizes="(max-width: 1200px) 30vw, 360px" /></div>
                <figcaption><small>{place.category}</small>{place.name}</figcaption>
              </figure>
            ) )}
          </div>
        </div>
      </section>

      <section className={styles.meetup} aria-labelledby="london-furmeets-heading">
        <div className={styles.container}>
          <Link href="/furcon" className={styles.meetTicket}>
            <span className={styles.meetBrand}><span>兽聚邀请</span><strong>LFM</strong></span>
            <div className={styles.meetInfo}>
              <h2 id="london-furmeets-heading">London Furmeets</h2>
              <p>每三周一次 · 周六兽聚</p>
              <span className={styles.meetStamp}>免费，但需提前订票</span>
            </div>
            <span className={styles.meetCta}>查看兽聚日程 <ArrowUpRight aria-hidden="true" /></span>
          </Link>
        </div>
      </section>

      <section className={styles.facts} aria-labelledby="london-facts-heading">
        <div className={styles.container}>
          <div className={styles.chapterLine}><span>FIELD NOTES</span><span>A FEW THINGS TO KNOW.</span></div>
          <header className={styles.factsHeader}>
            <h2 id="london-facts-heading">伦敦使用说明<span>Before you head out.</span></h2>
            <p>出门前读几条。<br />以及，记得保护好你的手机！</p>
          </header>
          <div className={styles.factList}>
            {facts.map( fact => (
              <article key={fact.label} className={styles.fact}>
                <div className={styles.stat}><strong>{fact.stat}</strong><span>{fact.label}</span></div>
                <div><h3>{fact.title}</h3><p>{fact.body}</p></div>
              </article>
            ) )}
          </div>
          <div className={styles.colophon}><span>CFFA UK · 伦敦生活指北</span><Link href="/contribute">还有私藏？出一份力 <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        </div>
      </section>
    </div>
  );
}

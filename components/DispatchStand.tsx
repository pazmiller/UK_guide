'use client';

import Image from 'next/image';
import { useState } from 'react';
import HomeNews from './HomeNews';
import millerIcon from '@/src/img/miller_icon.png';
import styles from './DispatchStand.module.css';

/**
 * Dispatch: Miller sells the free paper, and the news board below is the paper itself
 * (The UKCFFA Dispatch). The board is never transformed, so reading mode measures true positions.
 */
export default function DispatchStand()
{
  const [ headline, setHeadline ] = useState<string | null>( null );

  return (
    <div className={styles.stand}>
      <div className={styles.intro}>
        <div className={styles.vendor}>
          <div className={styles.avatar}>
            <Image src={millerIcon} alt="" className={styles.avatarImage} />
          </div>
          <p className={styles.shout}>
            <b>Extra! Extra!</b>
            <span>{headline ? `今日头条：${headline}` : '免费报纸，拿一份再走！'}</span>
          </p>
        </div>
      </div>

      <HomeNews onSnapshot={snapshot => setHeadline( snapshot.items[ 0 ]?.title ?? null )} />
    </div>
  );
}

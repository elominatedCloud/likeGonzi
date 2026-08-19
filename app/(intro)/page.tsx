'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { hasSupabaseSession } from '@/lib/api-client';
import styles from './splash.module.css';

export default function Splash() {
  const router = useRouter();
  const [isSlow, setIsSlow] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const handleStart = () => {
    setIsMoving(true);
    // 이미 로그인한 사용자에게 제품 등록(언박싱) 화면을 다시 보여줄 이유가 없다.
    // 로그인 상태면 바로 내 아카이브로 보낸다.
    void hasSupabaseSession().then((loggedIn) => {
      router.replace(loggedIn ? '/home' : '/start');
    });
  };

  useEffect(() => {
    const moveTimer = window.setTimeout(handleStart, 1800);
    const slowTimer = window.setTimeout(() => setIsSlow(true), 4500);

    return () => {
      window.clearTimeout(moveTimer);
      window.clearTimeout(slowTimer);
    };
  // 시작 화면으로 한 번만 자동 전환합니다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      className={styles.splash}
      onClick={handleStart}
    >
      <div className={styles.content}>
        <div className={styles.logo}>
          <Image
            src="/icon/MCM_Logo.svg"
            alt="MCM"
            width={89}
            height={89}
            priority
          />
        </div>

        <h1 className={styles.title}>
          MCM Storybook
        </h1>

        <p className={styles.description}>
          당신의 첫 MCM 이야기가 지금 시작됩니다.
        </p>

        <div className={styles.loadingFeedback} role="status" aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" />
          <span>{isMoving ? '시작 화면으로 이동하고 있어요' : '스토리북을 준비하고 있어요'}</span>
        </div>

        {isSlow ? (
          <div className={styles.slowFallback}>
            <p>연결이 평소보다 오래 걸리고 있어요.</p>
            <button type="button" onClick={handleStart}>다시 시도</button>
          </div>
        ) : (
          <button type="button" className={styles.touchGuide} onClick={handleStart}>
            바로 시작하기
          </button>
        )}
      </div>
    </main>
  );
}

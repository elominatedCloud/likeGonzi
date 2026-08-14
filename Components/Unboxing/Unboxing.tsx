'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import Image from 'next/image';
import styles from './Unboxing.module.css';

const TOTAL_FRAMES = 31;

export default function Unboxing() {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const progressRef = useRef(0);
  const startY = useRef(0);
  const startProgress = useRef(0);

  const MAX_DRAG = 260;

  // 31개 프레임 미리 로딩
  useEffect(() => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new window.Image();

      img.src = `/images/box/${String(i).padStart(4, '0')}.png`;
    }
  }, []);

  const updateProgress = (value: number) => {
    const clamped = Math.min(Math.max(value, 0), 1);

    progressRef.current = clamped;
    setProgress(clamped);
  };

  const handlePointerDown = (
    e: PointerEvent<HTMLDivElement>
  ) => {
    startY.current = e.clientY;
    startProgress.current = progressRef.current;

    setIsDragging(true);

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (
    e: PointerEvent<HTMLDivElement>
  ) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
      return;
    }

    const distance = startY.current - e.clientY;
    const change = distance / MAX_DRAG;

    updateProgress(startProgress.current + change);
  };

  const handlePointerUp = (
    e: PointerEvent<HTMLDivElement>
  ) => {
    setIsDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (progressRef.current >= 0.5) {
      updateProgress(1);
    } else {
      updateProgress(0);
    }
  };

  const handlePointerCancel = (
    e: PointerEvent<HTMLDivElement>
  ) => {
    setIsDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // 처음 조금은 닫힌 상자 유지
  const boxProgress = Math.min(
    Math.max((progress - 0.2) / 0.6, 0),
    1
  );

  // 0~1 진행도를 1~31 프레임으로 변환
  const frameNumber =
    Math.round(boxProgress * (TOTAL_FRAMES - 1)) + 1;

  // 1 → 0001 / 16 → 0016 / 31 → 0031
  const frameSrc =
    `/images/box/${String(frameNumber).padStart(4, '0')}.png`;

  return (
    <main className={styles.page}>

      <section className={styles.header}>
        <Image
          src="/icon/MCM_Logo.svg"
          alt="MCM"
          width={89}
          height={89}
          priority
        />

        <h1>MCM Storybook</h1>

        <p>
          당신의 첫 MCM 이야기가 지금 시작됩니다.
        </p>
      </section>

      <div className={styles.boxArea}>
        <div className={styles.boxGlow} />
        
          <Image
            src={frameSrc}
            alt="MCM 언박싱 상자"
            fill
            className={styles.boxImage}
            priority
            unoptimized
          />
      </div>

      <p className={styles.product}>
        ✓ 정품 인증 · MV8-4471
      </p>

      <div
        className={`${styles.bottomSheet} ${
          isDragging ? styles.dragging : ''
        }`}
        style={{
          transform: `translateY(${(1 - progress) * 260}px)`,
        }}
      >

        <div
          className={styles.dragArea}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <div className={styles.handle} />

          {progress < 0.5 && (
            <p className={styles.dragGuide}>
              위로 밀어 언박싱 시작하기
            </p>
          )}
        </div>

        <div className={styles.sheetContent}>
          <h2>MCM Storybook 시작하기</h2>

          <p>
            로그인하고 제품을 등록하면 더 많은 기능을 이용할 수 있어요.
          </p>

          <button
            type="button"
            className={styles.loginButton}
          >
            로그인 / 회원가입하고 계속하기
          </button>

          <button
            type="button"
            className={styles.skipButton}
          >
            로그인 없이 둘러보기
          </button>
        </div>

      </div>

    </main>
  );
}
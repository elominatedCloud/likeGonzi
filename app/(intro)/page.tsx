'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './splash.module.css';

export default function Splash() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/start');
  };

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

        <span className={styles.touchGuide}>
          화면을 터치해 시작하기
        </span>
      </div>
    </main>
  );
}
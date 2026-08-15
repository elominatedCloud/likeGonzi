'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 나중에 Supabase 로그인 연결
    console.log('로그인:', id, password);
  };

  return (
    <main className={styles.page}>
      <section className={styles.container}>

        {/* 뒤로가기 */}
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          ←
        </button>

        {/* 타이틀 */}
        <header className={styles.header}>
          <h1>
            MCM과 함께
            <br />
            <strong>당신의 스토리를 시작하세요.</strong>
          </h1>
        </header>

        {/* 로그인 폼 */}
        <form
          className={styles.loginForm}
          onSubmit={handleLogin}
        >
          <div className={styles.inputBox}>
            <label htmlFor="userId">ID:</label>

            <input
              id="userId"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className={styles.inputBox}>
            <label htmlFor="password">PW:</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
          >
            로그인
          </button>
        </form>

        {/* 또는 */}
        <div className={styles.divider}>
          <span />
          <p>또는</p>
          <span />
        </div>

        {/* 소셜 로그인 */}
        <div className={styles.socialLogin}>
            <button
                type="button"
                className={`${styles.socialButton} ${styles.google}`}
            >
                <Image
                src="/icon/social/google.svg"
                alt="Google"
                width={22}
                height={22}
                className={styles.socialIcon}
                />
                Google 계정으로 계속하기
            </button>

            <button
                type="button"
                className={`${styles.socialButton} ${styles.kakao}`}
            >
                <Image
                src="/icon/social/kakao.svg"
                alt="Kakao"
                width={22}
                height={22}
                className={styles.socialIcon}
                />
                Kakao 계정으로 계속하기
            </button>

            <button
                type="button"
                className={`${styles.socialButton} ${styles.naver}`}
            >
                <Image
                src="/icon/social/naver.svg"
                alt="Naver"
                width={22}
                height={22}
                className={styles.socialIcon}
                />
                Naver 계정으로 계속하기
            </button>
            </div>

        {/* 하단 링크 */}
        <div className={styles.links}>
          <Link href="/signup">
            회원가입
          </Link>

          <span>·</span>

          <Link href="/find-password">
            비밀번호 찾기
          </Link>
        </div>

      </section>
    </main>
  );
}
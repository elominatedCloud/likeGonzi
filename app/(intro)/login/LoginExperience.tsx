'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthError, AuthPanel, type AuthSubmission } from '@/Components/auth/AuthPanel';
import { supabase } from '@/lib/supabase';
import styles from './login.module.css';

interface LoginExperienceProps {
  returnTo: string;
  intent?: 'claim';
  initialMode: 'login' | 'signup';
  initialError?: string;
}

interface AuthSessionPayload {
  access_token: string | null;
  refresh_token?: string;
  needs_email_confirmation?: boolean;
}

type AuthApiResult =
  | { ok: true; data: AuthSessionPayload }
  | { ok: false; error: { code: string; message: string } };

const AUTH_ERROR_MESSAGES: Record<string,string> = {
  EMAIL_TAKEN: '이미 가입된 이메일입니다. 아래에서 비밀번호를 입력해 로그인해 주세요.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  SIGNUP_FAILED: '회원가입을 완료하지 못했어요. 입력 내용을 확인해 주세요.',
  VALIDATION_ERROR: '입력 내용을 다시 확인해 주세요.',
};

export function LoginExperience({
  returnTo,
  intent,
  initialMode,
  initialError,
}: LoginExperienceProps) {
  const router = useRouter();

  // 이미 로그인된 채로 로그인 화면에 들어오면 굳이 폼을 보여줄 이유가 없다.
  // (계정 전환은 마이 화면의 로그아웃으로 한다)
  //
  // 이때는 홈으로 보낸다. returnTo는 "로그인하러 왔다가 원래 가려던 곳"이라
  // 방금 로그인한 경우에만 의미가 있고, 주소에 남아 있던 값 때문에 엉뚱한
  // 화면으로 튀는 일이 생긴다. QR 등록을 이어가는 경우만 예외로 지킨다.
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled || !data.session) return;
      window.location.replace(intent === 'claim' ? returnTo : '/home');
    });
    return () => { cancelled = true };
  }, [returnTo, intent]);

  const complete = async ({mode,email,password,nickname}:AuthSubmission) => {
    if(!supabase){
      throw new Error('Supabase 설정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    }

    let response:Response;
    try{
      response=await fetch(`/api/auth/${mode}`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          email,
          password,
          ...(mode==='signup'?{nickname}:{}),
        }),
      });
    }catch{
      throw new Error('네트워크 연결을 확인한 뒤 다시 시도해 주세요.');
    }

    const result=(await response.json().catch(()=>null)) as AuthApiResult|null;
    if(!response.ok||!result||!result.ok){
      const code=result&&!result.ok?result.error.code:'';
      const fallback=result&&!result.ok?result.error.message:'인증 요청을 완료하지 못했어요.';
      throw new AuthError(code,AUTH_ERROR_MESSAGES[code]??fallback);
    }

    const {access_token,refresh_token,needs_email_confirmation}=result.data;
    if(!access_token||!refresh_token){
      if(needs_email_confirmation){
        throw new Error('회원가입은 완료됐어요. 이메일 인증 후 로그인해 주세요.');
      }
      throw new Error('로그인 세션을 만들지 못했어요. 다시 로그인해 주세요.');
    }

    const {error:sessionError}=await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if(sessionError){
      throw new Error('로그인 세션을 저장하지 못했어요. 다시 시도해 주세요.');
    }

    const {data:userData,error:userError}=await supabase.auth.getUser();
    if(userError||!userData.user){
      await supabase.auth.signOut({scope:'local'});
      throw new Error('계정 확인에 실패했어요. 다시 로그인해 주세요.');
    }

    localStorage.removeItem('likegonzi-demo-login');
    localStorage.removeItem('likegonzi-demo-signup');

    // router.replace 직후 router.refresh를 부르면 진행 중인 이동이 취소돼
    // 로그인 화면에 그대로 남는 경우가 있었다.
    // 세션이 막 바뀐 시점이라 문서를 새로 띄워 확실하게 넘긴다.
    window.location.replace(mode==='signup' ? '/home' : returnTo);
  };

  return (
    <main className={styles.page}>
      <button type="button" className={styles.back} onClick={() => router.push('/start')} aria-label="시작 화면으로 돌아가기">←</button>
      <header className={styles.brand}>
        <Image src="/icon/MCM_Logo.svg" alt="MCM" width={70} height={70} priority/>
        <p>MCM STORYBOOK</p>
        <h1>당신의 MCM 이야기를<br/>한곳에 간직하세요.</h1>
        {intent === 'claim' && (
          <div className={styles.intentNotice}>로그인 후 스캔한 제품 등록을 이어갑니다.</div>
        )}
      </header>
      <div className={styles.sheet}>
        <AuthPanel initialMode={initialMode} initialError={initialError} onComplete={complete}/>
      </div>
    </main>
  );
}

'use client';

import { FormEvent, useState } from 'react';
import { Check, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { showFeatureNotice } from '@/lib/feature-notice';
import styles from './AuthPanel.module.css';

type AuthMode = 'login' | 'signup';

/** onComplete가 서버 에러 코드를 그대로 올려보낼 때 쓴다. */
export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export interface AuthSubmission {
  mode: AuthMode;
  email: string;
  password: string;
  nickname?: string;
  /** 브랜드 집계 통계 참여 동의(선택). 가입 시에만 쓰인다. */
  analyticsConsent?: boolean;
}

interface AuthPanelProps {
  initialMode?: AuthMode;
  onComplete: (submission: AuthSubmission) => Promise<void>;
  initialError?: string;
}

export function AuthPanel({initialMode='login',onComplete,initialError=''}:AuthPanelProps){
  const [mode,setMode]=useState<AuthMode>(initialMode);
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [passwordConfirm,setPasswordConfirm]=useState('');
  const [termsAccepted,setTermsAccepted]=useState(false);
  const [analyticsConsent,setAnalyticsConsent]=useState(false);
  const [error,setError]=useState(initialError);
  const [isSubmitting,setIsSubmitting]=useState(false);

  const changeMode=(next:AuthMode)=>{
    if(isSubmitting)return;
    setMode(next);
    setError('');
  };

  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(isSubmitting)return;
    if(mode==='signup'&&!name.trim()){
      setError('이름을 입력해 주세요.');
      return;
    }
    if(!/^\S+@\S+\.\S+$/.test(email)){
      setError('이메일 형식으로 입력해 주세요. 예: hong123@gmail.com');
      return;
    }
    if(password.length<6){
      setError(mode==='login'?'이메일 또는 비밀번호를 다시 확인해 주세요.':'비밀번호는 6자 이상 입력해 주세요.');
      return;
    }
    if(mode==='signup'&&password!==passwordConfirm){
      setError('비밀번호가 서로 달라요. 다시 확인해 주세요.');
      return;
    }
    if(mode==='signup'&&!termsAccepted){
      setError('필수 약관에 동의해 주세요.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try{
      await onComplete({
        mode,
        email:email.trim().toLowerCase(),
        password,
        ...(mode==='signup'?{nickname:name.trim(),analyticsConsent}:{}),
      });
    }catch(submitError){
      // 이미 있는 계정으로 가입을 시도한 경우, 입력값을 그대로 둔 채 로그인 탭으로 넘겨준다.
      // (탭을 못 찾고 계속 가입만 눌러 막히는 일이 많다)
      if(submitError instanceof AuthError&&submitError.code==='EMAIL_TAKEN'){
        setMode('login');
      }
      setError(submitError instanceof Error?submitError.message:'인증 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.');
      setIsSubmitting(false);
    }
  };

  return <section className={styles.panel} aria-label="계정 시작하기">
    <div className={styles.tabs} role="tablist" aria-label="로그인 또는 회원가입">
      <button type="button" role="tab" aria-selected={mode==='login'} className={mode==='login'?styles.active:''} onClick={()=>changeMode('login')}>로그인</button>
      <button type="button" role="tab" aria-selected={mode==='signup'} className={mode==='signup'?styles.active:''} onClick={()=>changeMode('signup')}>회원가입</button>
    </div>

    <form onSubmit={submit} className={styles.form}>
      {mode==='signup'&&<label>
        <span><UserRound size={18}/> 이름</span>
        <input type="text" autoComplete="name" placeholder="이름을 입력해 주세요" value={name} onChange={event=>{setName(event.target.value);setError('')}} required/>
      </label>}
      <label>
        <span><Mail size={18}/> 이메일</span>
        <input type="email" inputMode="email" autoComplete="email" placeholder="hong123@gmail.com" value={email} onChange={event=>{setEmail(event.target.value);setError('')}} aria-describedby="auth-email-hint" aria-invalid={Boolean(error)&&!/^\S+@\S+\.\S+$/.test(email)} required/>
        <small id="auth-email-hint" className={styles.hint}>ID는 가입할 때 사용한 이메일 주소입니다.</small>
      </label>
      <label>
        <span><LockKeyhole size={18}/> 비밀번호</span>
        <input type="password" autoComplete={mode==='login'?'current-password':'new-password'} placeholder="6자 이상 입력해 주세요" value={password} onChange={event=>{setPassword(event.target.value);setError('')}} aria-invalid={Boolean(error)&&password.length<6} required/>
      </label>
      {mode==='signup'&&<label>
        <span><LockKeyhole size={18}/> 비밀번호 확인</span>
        <input type="password" autoComplete="new-password" placeholder="비밀번호를 한 번 더 입력해 주세요" value={passwordConfirm} onChange={event=>{setPasswordConfirm(event.target.value);setError('')}} required/>
      </label>}
      {mode==='signup'&&<label className={styles.terms}>
        <input type="checkbox" checked={termsAccepted} onChange={event=>{setTermsAccepted(event.target.checked);setError('')}}/>
        <span className={styles.checkbox} aria-hidden>{termsAccepted&&<Check size={13} strokeWidth={3}/>}</span>
        <span><b>[필수]</b> 서비스 이용약관 및 개인정보 처리방침에 동의합니다.</span>
      </label>}
      {mode==='signup'&&<label className={styles.terms}>
        <input type="checkbox" checked={analyticsConsent} onChange={event=>setAnalyticsConsent(event.target.checked)}/>
        <span className={styles.checkbox} aria-hidden>{analyticsConsent&&<Check size={13} strokeWidth={3}/>}</span>
        <span><b>[선택]</b> 내 기록을 개인 정보 없이 집계 통계로 사용하는 데 동의합니다. 나중에 마이 화면에서 끌 수 있어요.</span>
      </label>}
      {error&&<div className={styles.error} role="alert"><span>입력 내용을 확인해 주세요.</span><p>{error}</p></div>}
      <button type="submit" className={styles.submit} disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting?'처리 중…':mode==='login'?'로그인':'회원가입하고 시작하기'}
      </button>
    </form>

    {mode==='login'?<button type="button" className={styles.support} onClick={()=>showFeatureNotice('passwordRecovery')} disabled={isSubmitting}>비밀번호를 잊으셨나요?</button>:<p className={styles.demoNote}>Supabase 계정이 생성되며 가입 후 홈으로 이동합니다.</p>}
  </section>;
}

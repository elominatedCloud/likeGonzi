'use client';

import { FormEvent, useState } from 'react';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
import { showFeatureNotice } from '@/lib/feature-notice';
import styles from './AuthPanel.module.css';

type AuthMode = 'login' | 'signup';

interface AuthPanelProps {
  initialMode?: AuthMode;
  onComplete: (mode: AuthMode) => void;
}

export function AuthPanel({initialMode='login',onComplete}:AuthPanelProps){
  const [mode,setMode]=useState<AuthMode>(initialMode);
  const [password,setPassword]=useState('');
  const [passwordConfirm,setPasswordConfirm]=useState('');
  const [error,setError]=useState('');

  const changeMode=(next:AuthMode)=>{
    setMode(next);
    setError('');
  };

  const submit=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(mode==='signup'&&passwordConfirm&&password!==passwordConfirm){
      setError('비밀번호가 서로 달라요. 다시 확인해 주세요.');
      return;
    }
    onComplete(mode);
  };

  return <section className={styles.panel} aria-label="계정 시작하기">
    <div className={styles.tabs} role="tablist" aria-label="로그인 또는 회원가입">
      <button type="button" role="tab" aria-selected={mode==='login'} className={mode==='login'?styles.active:''} onClick={()=>changeMode('login')}>로그인</button>
      <button type="button" role="tab" aria-selected={mode==='signup'} className={mode==='signup'?styles.active:''} onClick={()=>changeMode('signup')}>회원가입</button>
    </div>

    <form onSubmit={submit} className={styles.form}>
      {mode==='signup'&&<label>
        <span><UserRound size={18}/> 이름</span>
        <input type="text" autoComplete="name" placeholder="이름을 입력해 주세요"/>
      </label>}
      <label>
        <span><Mail size={18}/> 이메일</span>
        <input type="email" autoComplete="email" placeholder="example@email.com"/>
      </label>
      <label>
        <span><LockKeyhole size={18}/> 비밀번호</span>
        <input type="password" autoComplete={mode==='login'?'current-password':'new-password'} placeholder="••••••••" value={password} onChange={event=>setPassword(event.target.value)}/>
      </label>
      {mode==='signup'&&<label>
        <span><LockKeyhole size={18}/> 비밀번호 확인</span>
        <input type="password" autoComplete="new-password" placeholder="••••••••" value={passwordConfirm} onChange={event=>setPasswordConfirm(event.target.value)}/>
      </label>}
      {error&&<p className={styles.error} role="alert">{error}</p>}
      <button type="submit" className={styles.submit}>{mode==='login'?'로그인':'회원가입하고 시작하기'}</button>
    </form>

    {mode==='login'?<button type="button" className={styles.support} onClick={()=>showFeatureNotice('passwordRecovery')}>비밀번호를 잊으셨나요?</button>:<p className={styles.demoNote}>지금은 가입 버튼을 누르면 데모 계정으로 바로 시작됩니다.</p>}
  </section>;
}

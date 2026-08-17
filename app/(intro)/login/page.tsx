'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthPanel } from '@/Components/auth/AuthPanel';
import styles from './login.module.css';

export default function LoginPage(){
  const router=useRouter();
  const complete=(mode:'login'|'signup')=>{
    localStorage.setItem('likegonzi-demo-login','true');
    if(mode==='signup')localStorage.setItem('likegonzi-demo-signup','true');
    router.replace('/home');
  };

  return <main className={styles.page}>
    <button type="button" className={styles.back} onClick={()=>router.back()} aria-label="뒤로 가기">←</button>
    <header className={styles.brand}>
      <Image src="/icon/MCM_Logo.svg" alt="MCM" width={70} height={70} priority/>
      <p>MCM STORYBOOK</p>
      <h1>당신의 MCM 이야기를<br/>한곳에 간직하세요.</h1>
    </header>
    <div className={styles.sheet}><AuthPanel onComplete={complete}/></div>
  </main>;
}

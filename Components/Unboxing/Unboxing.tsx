'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import Image from 'next/image';
import styles from './Unboxing.module.css';
import { useRouter } from 'next/navigation';
import { CircleAlert, ShieldCheck, UserRound } from 'lucide-react';
import { apiFetch, hasSupabaseSession, trackEvent } from '@/lib/api-client';

const TOTAL_FRAMES = 31;
export type ScanState = 'mine' | 'unregistered' | 'owned' | 'error';

/** GET /api/products/scan/{tag_code} 응답 */
interface ScanResult {
  tag_code: string;
  product_id: string;
  product_name: string;
  serial: string;
  ownership_status: 'unregistered' | 'owned_by_me' | 'owned_by_other';
}

const SCAN_STATE_BY_OWNERSHIP: Record<ScanResult['ownership_status'], ScanState> = {
  owned_by_me: 'mine',
  unregistered: 'unregistered',
  owned_by_other: 'owned',
};

interface UnboxingProps {
  /** ?status= 로 강제 지정하는 디자인 QA용 상태 (tagCode가 없을 때만 의미 있음) */
  initialScanState?: ScanState;
  /** QR/NFC로 들어온 태그 코드. 있으면 실제 스캔 API를 부른다. */
  tagCode?: string;
  /** 로그인하고 돌아온 경우 등록까지 자동으로 이어간다. */
  autoClaim?: boolean;
}

export default function Unboxing({
  initialScanState = 'unregistered',
  tagCode,
  autoClaim = false,
}: UnboxingProps) {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dialogOpen,setDialogOpen]=useState(false);
  const [scanState,setScanState]=useState(initialScanState);
  const [isRetrying,setIsRetrying]=useState(Boolean(tagCode));
  const [scan,setScan]=useState<ScanResult|null>(null);
  const [claiming,setClaiming]=useState(false);
  const [rescanKey,setRescanKey]=useState(0);

  const progressRef = useRef(0);
  const startY = useRef(0);
  const startProgress = useRef(0);
  const router = useRouter();

  const MAX_DRAG = 190;

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

  const scanCopy = {
    mine: {
      badge: '내 제품으로 등록된 상품',
      title: '등록된 Storybook을 확인해보세요.',
      body: scan?`${scan.product_name}의 사진 기록과 케어 이력이 이어집니다.`:'제품의 사진 기록과 케어 이력이 이어집니다.',
      action: '내 제품 상세 보기',
    },
    unregistered: {
      badge: '등록 가능한 정품',
      title: 'MCM Storybook 시작하기',
      body: scan?`로그인하면 ${scan.product_name}을(를) 내 Storybook에 등록할 수 있어요.`:'로그인하면 이 제품을 내 Storybook에 등록할 수 있어요.',
      action: '내 제품으로 등록하기',
    },
    owned: {
      badge: '소유자 확인 필요',
      title: '이미 등록된 제품이에요.',
      body: '다른 소유자의 제품은 새 계정에 등록할 수 없어요.',
      action: '등록 상태 확인',
    },
    error: {
      badge: '제품 정보를 확인하지 못했어요',
      title: '스캔 결과를 다시 확인해주세요.',
      body: '네트워크 연결을 확인한 뒤 다시 시도할 수 있어요.',
      action: '다시 시도',
    },
  }[scanState];

  // 태그가 있으면 실제 스캔 API로 소유 상태를 판별한다.
  useEffect(()=>{
    if(!tagCode) return;
    let cancelled=false;

    apiFetch<ScanResult>(`/api/products/scan/${encodeURIComponent(tagCode)}`)
      .then(json=>{
        if(cancelled) return;
        if(!json.ok){
          setScan(null);
          setScanState('error');
          return;
        }
        setScan(json.data);
        setScanState(SCAN_STATE_BY_OWNERSHIP[json.data.ownership_status]);
      })
      .catch(()=>{
        if(!cancelled) setScanState('error');
      })
      .finally(()=>{
        if(!cancelled) setIsRetrying(false);
      });

    return ()=>{cancelled=true};
  },[tagCode,rescanKey]);

  /** 스캔한 제품을 내 것으로 등록하고 제품 상세로 이동 */
  const claimProduct=useCallback(async(target:ScanResult)=>{
    setClaiming(true);
    try{
      const json=await apiFetch<{product_id:string}>(
        `/api/products/my/${encodeURIComponent(target.tag_code)}`,
        {method:'POST'},
      );
      if(json.ok){
        router.replace(`/products/${json.data.product_id}`);
        return;
      }
      // 등록 사이에 다른 사람이 먼저 가져간 경우
      setScanState(json.error.code==='ALREADY_REGISTERED'?'owned':'error');
      setDialogOpen(json.error.code==='ALREADY_REGISTERED');
    }catch{
      setScanState('error');
    }finally{
      setClaiming(false);
    }
  },[router]);

  // 로그인하고 돌아왔으면 등록을 이어서 진행한다.
  useEffect(()=>{
    if(!autoClaim||!scan||scan.ownership_status!=='unregistered'||claiming) return;
    let cancelled=false;
    hasSupabaseSession().then(loggedIn=>{
      if(!cancelled&&loggedIn) void claimProduct(scan);
    });
    return ()=>{cancelled=true};
    // claiming은 트리거가 아니라 중복 실행 방지용이라 의존성에서 제외한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[autoClaim,scan,claimProduct]);

  const loginHref=()=>{
    const returnTo=tagCode
      ? `/start?tag=${encodeURIComponent(tagCode)}&claim=1`
      : '/home';
    return `/login?intent=claim&returnTo=${encodeURIComponent(returnTo)}`;
  };

  const handlePrimaryAction=async()=>{
    updateProgress(1);
    trackEvent('unbox_complete', scan?.product_id ?? null, { tag_code: tagCode ?? null });

    if(scanState==='mine'){
      // 스캔 결과가 없으면(디자인 QA 모드) 특정 제품으로 보낼 근거가 없다.
      router.push(scan ? `/products/${scan.product_id}` : '/home');
      return;
    }

    if(scanState==='error'){
      setIsRetrying(true);
      if(tagCode){
        setRescanKey(value=>value+1);
      }else{
        window.setTimeout(()=>{
          setScanState('unregistered');
          setIsRetrying(false);
        },900);
      }
      return;
    }

    // 이미 로그인한 상태라면 다이얼로그 없이 바로 등록
    if(scanState==='unregistered'&&scan&&await hasSupabaseSession()){
      void claimProduct(scan);
      return;
    }

    setDialogOpen(true);
  };

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
        <ShieldCheck size={15} aria-hidden /> 정품 인증 · {scan?.serial ?? 'MV8-4471'}
      </p>
      <p className={`${styles.scanBadge} ${styles[scanState]}`}>{isRetrying?'제품 정보를 확인하고 있어요':scanCopy.badge}</p>

      <div
        className={`${styles.bottomSheet} ${isDragging ? styles.dragging : ''}`}
        style={{
          transform:`translateY(${(1 - progress) * 190}px)`,
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
            <button type="button" className={styles.dragGuide} onClick={()=>updateProgress(1)}>
              위로 밀어 언박싱 시작하기
            </button>
          )}
        </div>

        <div className={styles.sheetContent}>
          <h2>{scanCopy.title}</h2>

          <p>{scanCopy.body}</p>

          <button
            type="button"
            className={styles.loginButton}
            onClick={handlePrimaryAction}
            disabled={isRetrying||claiming}
          >
            {isRetrying?'확인 중…':claiming?'등록 중…':scanCopy.action}
          </button>

        </div>
      </div>

      {dialogOpen&&(
        <div className={styles.dialogLayer} role="presentation">
          <button type="button" className={styles.dialogBackdrop} aria-label="안내 닫기" onClick={()=>setDialogOpen(false)}/>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="scan-dialog-title">
            <span className={styles.dialogIcon} aria-hidden>
              {scanState==='owned'?<CircleAlert size={23}/>:<UserRound size={22}/>}
            </span>
            <h2 id="scan-dialog-title">
              {scanState==='owned'?'다른 소유자의 제품이에요':'등록하려면 로그인이 필요해요'}
            </h2>
            <p>
              {scanState==='owned'
                ?'현재 소유자의 이전 절차가 완료된 후 등록할 수 있습니다.'
                :'로그인 또는 회원가입 후 이 제품 등록을 이어갈 수 있어요.'}
            </p>
            {scanState==='unregistered'&&(
              <button
                type="button"
                className={styles.dialogPrimary}
                onClick={()=>router.push(loginHref())}
              >
                로그인하고 계속하기
              </button>
            )}
            {scanState==='owned'&&(
              <button type="button" className={styles.dialogSecondary} onClick={()=>setDialogOpen(false)}>
                확인
              </button>
            )}
          </section>
        </div>
      )}

    </main>
  );
}

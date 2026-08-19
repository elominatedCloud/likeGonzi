'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowCounterClockwise,
  Camera,
  CameraRotate,
  Check,
  Images,
  WarningCircle,
} from '@phosphor-icons/react';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { BottomNav } from '@/Components/ui/BottomNav';
import { apiFetch, hasSupabaseSession } from '@/lib/api-client';
import { showFeatureNotice } from '@/lib/feature-notice';
import { tagCodeFromScan } from '@/lib/qr-tag';
import styles from './camera.module.css';

type CameraStatus = 'idle' | 'requesting' | 'live' | 'fallback' | 'denied' | 'error';
type FacingMode = 'environment' | 'user';
export type CameraMode = 'photo' | 'qr';

const CAMERA_DRAFT_KEY = 'likegonzi-camera-draft';
const QR_SCAN_INTERVAL_MS = 400;

/** 브라우저 내장 QR 인식기 (Chrome/Android 계열). Safari에는 아직 없어서 수동 입력으로 폴백한다. */
interface DetectedBarcode { rawValue: string }
interface BarcodeDetectorLike { detect(source: CanvasImageSource): Promise<DetectedBarcode[]> }
type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

function getBarcodeDetector(): BarcodeDetectorLike | null {
  const ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  if (!ctor) return null;
  try {
    return new ctor({ formats: ['qr_code'] });
  } catch {
    return null;
  }
}

export default function CameraExperience({
  productId,
  mode='photo',
}:{
  productId?:'stark'|'ella'|'pina';
  mode?:CameraMode;
}) {
  const router = useRouter();
  const isQrMode = mode === 'qr';
  // ?product= 가 없으면 내가 가진 제품 중 첫 번째에 기록한다.
  // 예전에는 'stark' 고정이라 Stark를 소유하지 않은 계정은 촬영 후 저장이
  // PRODUCT_NOT_OWNED로 실패했다.
  const [ownedProductId, setOwnedProductId] = useState<string | null>(productId ?? null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [manualTag, setManualTag] = useState('');
  const [qrError, setQrError] = useState('');
  const [qrSupported, setQrSupported] = useState(true);
  const scannedRef = useRef(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async (nextFacingMode: FacingMode) => {
    stopCamera();
    setCameraStatus('requesting');
    setNotice('카메라를 연결하고 있어요.');

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('fallback');
      setNotice('이 환경에서는 앨범 사진으로 기록할 수 있어요.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: nextFacingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStatus('live');
      setNotice('');
      if (isQrMode) setQrSupported(Boolean(getBarcodeDetector()));
    } catch (error) {
      const denied = error instanceof DOMException && error.name === 'NotAllowedError';
      setCameraStatus(denied ? 'denied' : 'error');
      setNotice(denied
        ? '카메라 권한이 거부됐어요. 브라우저 설정에서 권한을 허용해주세요.'
        : '카메라를 연결하지 못했어요. 다시 시도하거나 앨범을 이용해주세요.');
    }
  }, [stopCamera, isQrMode]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    if (isQrMode || productId) return;
    let cancelled = false;
    apiFetch<{ slug?: string }[]>('/api/products/my')
      .then((json) => {
        if (cancelled || !json.ok) return;
        setOwnedProductId(json.data[0]?.slug ?? null);
      })
      .catch(() => {});
    return () => { cancelled = true };
  }, [isQrMode, productId]);

  /** 태그를 확인하면 스캔 결과 화면으로 넘긴다(로그인 상태라 등록까지 이어짐). */
  const goToTag = useCallback((tagCode: string) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    stopCamera();
    router.replace(`/start?tag=${encodeURIComponent(tagCode)}&claim=1`);
  }, [router, stopCamera]);

  // QR 모드는 로그인 후에만 쓴다 — 인식하자마자 내 계정에 등록해야 하기 때문.
  useEffect(() => {
    if (!isQrMode) return;
    let cancelled = false;
    hasSupabaseSession().then((loggedIn) => {
      if (cancelled || loggedIn) return;
      router.replace(`/login?returnTo=${encodeURIComponent('/camera?mode=qr')}`);
    });
    return () => { cancelled = true };
  }, [isQrMode, router]);

  // 라이브 화면에서 QR을 반복 인식한다.
  useEffect(() => {
    if (!isQrMode || cameraStatus !== 'live') return;

    const detector = getBarcodeDetector();
    if (!detector) return;

    let stopped = false;
    const timer = window.setInterval(async () => {
      const video = videoRef.current;
      if (stopped || !video || !video.videoWidth) return;
      try {
        const codes = await detector.detect(video);
        for (const code of codes) {
          const tagCode = tagCodeFromScan(code.rawValue);
          if (tagCode) {
            goToTag(tagCode);
            return;
          }
        }
        if (codes.length > 0) setQrError('MCM 제품 태그 QR이 아니에요.');
      } catch {
        // 한 프레임 인식 실패는 다음 프레임에서 다시 시도한다.
      }
    }, QR_SCAN_INTERVAL_MS);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [isQrMode, cameraStatus, goToTag]);

  const submitManualTag = () => {
    const tagCode = tagCodeFromScan(manualTag);
    if (!tagCode) {
      setQrError('제품 태그 코드를 다시 확인해주세요.');
      return;
    }
    goToTag(tagCode);
  };

  const createCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (cameraStatus !== 'live' || !video || !canvas || !video.videoWidth) {
      return null;
    }

    const maxWidth = 1280;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.88);
  };

  const takePhoto = () => {
    const photo = createCapture();
    if (!photo) {
      if (cameraStatus === 'live') {
        setCameraStatus('error');
        setNotice('촬영하지 못했어요. 카메라를 다시 연결한 뒤 촬영해주세요.');
      } else {
        setNotice('카메라를 사용할 수 없어 앨범을 열었어요.');
        fileRef.current?.click();
      }
      return;
    }
    setCapturedPhoto(photo);
  };

  const acceptPhoto = () => {
    if (!capturedPhoto) return;

    try {
      sessionStorage.setItem(CAMERA_DRAFT_KEY, capturedPhoto);
      stopCamera();
      if (!ownedProductId) {
        setNotice('기록할 제품이 없어요. 먼저 제품을 등록해주세요.');
        return;
      }
      router.push(`/log/${ownedProductId}/record/new?source=camera`);
    } catch {
      setNotice('사진이 커서 저장하지 못했어요. 다른 사진을 선택해주세요.');
      setCapturedPhoto(null);
    }
  };

  const loadPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setCapturedPhoto(String(reader.result));
    reader.onerror = () => setNotice('사진을 불러오지 못했어요.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <main className={styles.stage}>
      <section className={styles.phone} aria-label="MCM 사진 촬영">
        <header className={styles.topChrome}>
          <div className={styles.statusBar} aria-hidden="true">
            <span>9:41</span>
            <span className={styles.signal}>● ᯤ ▰</span>
          </div>
          <div className={styles.appBar}>
            <Image className={styles.logo} src="/camera/mcm-logo.png" width={38} height={31} alt="MCM" priority />
            <h1 className={styles.screenTitle}>{isQrMode ? '제품 등록' : '사진 기록'}</h1>
            <button type="button" className={styles.bellButton} aria-label="알림" onClick={() => showFeatureNotice('notifications')}>
              <Image src="/camera/bell.png" width={22} height={22} alt="" />
              <span />
            </button>
          </div>
        </header>

        <div className={styles.viewfinder}>
          <Image
            className={styles.fallbackImage}
            src="/camera/record-stark.png"
            fill
            sizes="393px"
            alt="사진 촬영 예시"
            priority
          />
          <video
            ref={videoRef}
            className={`${styles.cameraVideo} ${cameraStatus === 'live' ? styles.videoVisible : ''}`}
            autoPlay
            muted
            playsInline
            aria-label="실시간 카메라 화면"
          />
          <div className={styles.cameraShade} />

          <div className={styles.instructions}>
            <strong>
              {isQrMode
                ? '제품 태그의 QR을 사각형 안에 맞춰주세요.'
                : '오늘의 순간을 사진으로 남겨보세요.'}
            </strong>
            <span>
              {isQrMode
                ? '인식되면 바로 내 Storybook에 등록됩니다.'
                : '촬영한 사진은 기록 작성 화면에서 확인할 수 있어요.'}
            </span>
          </div>

          {isQrMode && cameraStatus === 'live' && (
            <div className={styles.qrFrame} aria-hidden />
          )}

          {notice && (
            <div className={styles.notice} role="status">
              {cameraStatus !== 'live' && <WarningCircle size={16} weight="fill" />}
              <span>{notice}</span>
              {(cameraStatus === 'denied' || cameraStatus === 'error') && (
                <button type="button" onClick={() => void startCamera(facingMode)}>다시 연결</button>
              )}
            </div>
          )}

          {cameraStatus !== 'live' && cameraStatus !== 'requesting' && (
            <div className={styles.permissionLayer}>
              <div className={styles.permissionCard}>
                <span><Camera size={25}/></span>
                <strong>
                  {cameraStatus === 'idle' ? '카메라 사용 권한이 필요해요' :
                    cameraStatus === 'denied' ? '카메라 권한이 꺼져 있어요' :
                    cameraStatus === 'fallback' ? '이 기기에서는 카메라를 열 수 없어요' :
                    '카메라 연결을 다시 확인해주세요'}
                </strong>
                <p>
                  {isQrMode
                    ? '제품 태그의 QR을 읽는 데만 사용되며, 화면은 저장되지 않습니다.'
                    : cameraStatus === 'idle'
                      ? '사진은 기록 작성에만 사용되며 촬영 전에는 저장되지 않습니다.'
                      : '권한을 다시 허용하거나 앨범에서 사진을 선택할 수 있어요.'}
                </p>
                {cameraStatus !== 'fallback' && (
                  <button type="button" className={styles.permissionPrimary} onClick={() => void startCamera(facingMode)}>
                    {cameraStatus === 'idle' ? '카메라 권한 허용하기' : '다시 연결하기'}
                  </button>
                )}
                {!isQrMode && (
                  <button type="button" className={styles.permissionSecondary} onClick={() => fileRef.current?.click()}>앨범에서 선택</button>
                )}
              </div>
            </div>
          )}

          {cameraStatus === 'requesting' && (
            <div className={styles.connecting} role="status"><span aria-hidden/>카메라를 연결하고 있어요.</div>
          )}

          {isQrMode ? (
            <div className={styles.qrPanel}>
              {qrError && <p className={styles.qrError} role="alert">{qrError}</p>}
              {!qrSupported && (
                <p className={styles.qrHint}>
                  이 브라우저는 QR 자동 인식을 지원하지 않아요. 태그에 적힌 코드를 입력해주세요.
                </p>
              )}
              <div className={styles.qrManual}>
                <input
                  value={manualTag}
                  onChange={(event) => setManualTag(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') submitManualTag() }}
                  placeholder="태그 코드 직접 입력 (예: UNIT-STARK-0001)"
                  aria-label="제품 태그 코드"
                />
                <button type="button" onClick={submitManualTag}>등록</button>
              </div>
            </div>
          ) : (
          <div className={styles.captureControls}>
            <button type="button" className={styles.utilityButton} onClick={() => fileRef.current?.click()}>
              <span><Images size={24} weight="regular" /></span>
              앨범
            </button>

            <button type="button" className={styles.shutter} onClick={takePhoto} aria-label="사진 촬영">
              <span><Camera size={26} weight="regular" /></span>
            </button>

            <button
              type="button"
              className={styles.utilityButton}
              onClick={() => {
                const next = facingMode === 'environment' ? 'user' : 'environment';
                setFacingMode(next);
                void startCamera(next);
              }}
              disabled={cameraStatus === 'requesting'}
            >
              <span><CameraRotate size={24} weight="regular" /></span>
              전환
            </button>
          </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" hidden onChange={loadPhoto} />
          <canvas ref={canvasRef} hidden />

          {!isQrMode && capturedPhoto && (
            <div className={styles.reviewPanel}>
              <div className={styles.reviewPhoto} style={{ backgroundImage: `url("${capturedPhoto}")` }} role="img" aria-label="촬영한 사진 미리보기" />
              <div className={styles.reviewShade} />
              <div className={styles.reviewHeading}>
                <strong>이 사진을 기록에 사용할까요?</strong>
                <span>사진을 확인한 뒤 선택해주세요.</span>
              </div>
              <div className={styles.reviewActions}>
                <button type="button" onClick={() => setCapturedPhoto(null)}>
                  <ArrowCounterClockwise size={20} /> 다시 촬영
                </button>
                <button type="button" className={styles.reviewPrimary} onClick={acceptPhoto}>
                  <Check size={20} weight="bold" /> 이 사진 사용
                </button>
              </div>
            </div>
          )}
        </div>

        <BottomNav />
      </section>
    </main>
  );
}

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
import { showFeatureNotice } from '@/lib/feature-notice';
import styles from './camera.module.css';

type CameraStatus = 'requesting' | 'live' | 'fallback' | 'denied';
type FacingMode = 'environment' | 'user';

const CAMERA_DRAFT_KEY = 'likegonzi-camera-draft';

export default function CameraExperience() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('requesting');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [notice, setNotice] = useState('카메라를 연결하고 있어요.');

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
    } catch {
      setCameraStatus('denied');
      setNotice('카메라 권한을 허용하거나 앨범에서 사진을 선택해주세요.');
    }
  }, [stopCamera]);

  useEffect(() => {
    const timer = window.setTimeout(() => void startCamera(facingMode), 0);
    return () => {
      window.clearTimeout(timer);
      stopCamera();
    };
  }, [facingMode, startCamera, stopCamera]);

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
      setNotice('카메라를 사용할 수 없어 앨범을 열었어요.');
      fileRef.current?.click();
      return;
    }
    setCapturedPhoto(photo);
  };

  const acceptPhoto = () => {
    if (!capturedPhoto) return;

    try {
      sessionStorage.setItem(CAMERA_DRAFT_KEY, capturedPhoto);
      stopCamera();
      router.push('/log/stark/record/new?source=camera');
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
            <h1 className={styles.screenTitle}>사진 기록</h1>
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
            <strong>오늘의 순간을 사진으로 남겨보세요.</strong>
            <span>촬영한 사진은 기록 작성 화면에서 확인할 수 있어요.</span>
          </div>

          {notice && (
            <div className={styles.notice} role="status">
              {cameraStatus !== 'live' && <WarningCircle size={16} weight="fill" />}
              <span>{notice}</span>
              {cameraStatus === 'denied' && (
                <button type="button" onClick={() => void startCamera(facingMode)}>다시 연결</button>
              )}
            </div>
          )}

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
              onClick={() => setFacingMode((current) => current === 'environment' ? 'user' : 'environment')}
              disabled={cameraStatus === 'requesting'}
            >
              <span><CameraRotate size={24} weight="regular" /></span>
              전환
            </button>
          </div>

          <input ref={fileRef} type="file" accept="image/*" hidden onChange={loadPhoto} />
          <canvas ref={canvasRef} hidden />

          {capturedPhoto && (
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

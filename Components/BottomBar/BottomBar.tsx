'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomBar.module.css';

const menus = [
  {
    name: '홈',
    href: '/',
    icon: '/icon/home.svg',
  },
  {
    name: '로그',
    href: '/log',
    icon: '/icon/log.svg',
  },
  {
    name: 'camera',
    href: '/camera',
    icon: '/icon/camera.svg',
    camera: true,
  },
  {
    name: '쇼핑',
    href: '/shopping',
    icon: '/icon/shopping.svg',
  },
  {
    name: '마이',
    href: '/my',
    icon: '/icon/my.svg',
  },
];

export default function BottomBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomBar}>
      {menus.map((menu) => {
        const isActive = pathname === menu.href;

        if (menu.camera) {
          return (
            <Link
              href={menu.href}
              key={menu.href}
              className={styles.cameraButton}
            >
              <img
                src={menu.icon}
                alt="카메라"
                className={styles.cameraIcon}
              />
            </Link>
          );
        }

        return (
          <Link
            href={menu.href}
            key={menu.href}
            className={`${styles.menuItem} ${
              isActive ? styles.active : ''
            }`}
          >
            <span
              className={styles.icon}
              style={{
                maskImage: `url(${menu.icon})`,
                WebkitMaskImage: `url(${menu.icon})`,
              }}
            />

            <span>{menu.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
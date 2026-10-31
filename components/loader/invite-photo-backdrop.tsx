'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import {
  BACKGROUND_PHOTO_LIMIT,
  LOADING_BG_PHOTOS,
  MARQUEE_IMAGE_QUALITY,
  MARQUEE_IMAGE_SIZES,
  MOBILE_BACKGROUND_PHOTOS,
} from '@/lib/loading-bg-photos';
import './loading-screen.css';

export { LOADING_BG_PHOTOS };

export const MOBILE_BG_PHOTOS = MOBILE_BACKGROUND_PHOTOS;

const MARQUEE_SAMPLE_SIZE = 24;
const MARQUEE_EAGER_COUNT = 3;

/** White wash over the photo strip — one value for the loader and the envelope so the
 *  hand-off between them doesn't shift the tone. */
export const PHOTO_BACKGROUND_VEIL = 0.48;

// One clock for every photo strip on the page: each marquee starts its slide that many
// seconds in (negative animation-delay, see --marquee-elapsed in loading-screen.css), so
// the loader, the envelope and the home hero always show the strip at the same spot and
// cross-fade without the photos jumping.
let marqueeEpoch: number | null = null;
function marqueeElapsedSeconds() {
  const now = performance.now();
  if (marqueeEpoch === null) marqueeEpoch = now;
  return (now - marqueeEpoch) / 1000;
}

// Photos that have already decoded once show straight away in later strips
// (no second fade-in from blank during the loader → envelope cross-fade)
const loadedPhotos = new Set<string>();

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function pickRandomPhotos(photos: readonly string[], count: number) {
  const next = [...photos];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next.slice(0, Math.min(count, next.length));
}

function splitMarqueeRows(photos: readonly string[]) {
  const top: string[] = [];
  const bottom: string[] = [];
  photos.forEach((src, index) => {
    (index % 2 === 0 ? top : bottom).push(src);
  });
  return [top, bottom] as const;
}

function MarqueeRow({
  photos,
  copies,
  direction,
  eagerCount,
}: {
  photos: readonly string[];
  copies: number;
  direction: 'left' | 'right';
  eagerCount: number;
}) {
  return (
    <div className={`loading-screen__marquee-row loading-screen__marquee-row--${direction}`}>
      <div className="loading-screen__slide-track">
        {Array.from({ length: copies }, (_, copy) => (
          <div key={copy} className="loading-screen__slide-strip">
            {photos.map((src, index) => {
              const eager = copy === 0 && index < eagerCount;
              return (
                <div key={`${copy}-${src}`} className="loading-screen__slide-photo">
                  <Image
                    data-loaded={loadedPhotos.has(src) ? '' : undefined}
                    src={src}
                    alt=""
                    fill
                    sizes={MARQUEE_IMAGE_SIZES}
                    quality={MARQUEE_IMAGE_QUALITY}
                    priority={eager}
                    draggable={false}
                    decoding="async"
                    fetchPriority={copy === 0 && index < 2 ? 'high' : 'low'}
                    className="object-cover"
                    // Each photo fades in once it has decoded instead of popping in
                    onLoad={(e) => {
                      loadedPhotos.add(src);
                      e.currentTarget.setAttribute('data-loaded', '');
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PhotoMarquee({
  photos,
  copies,
  variant,
  shuffle = true,
}: {
  photos: readonly string[];
  copies: number;
  variant: 'mobile' | 'desktop' | 'loader';
  shuffle?: boolean;
}) {
  const compact = !shuffle || photos.length <= 5;
  const [selected, setSelected] = useState(() =>
    compact ? [...photos] : photos.slice(0, MARQUEE_SAMPLE_SIZE),
  );

  useEffect(() => {
    if (compact) {
      setSelected([...photos]);
      return;
    }
    setSelected(pickRandomPhotos(photos, MARQUEE_SAMPLE_SIZE));
  }, [photos, compact]);

  // Loader with a longer hand-picked list: alternate photos between the rows so each row
  // shows different shots (shorter lists repeat, mirrored, on the second row)
  const [top, bottom] =
    !compact || (variant === 'loader' && selected.length > 5)
      ? splitMarqueeRows(selected)
      : [selected, [...selected].reverse()];
  // Only the first tiles on screen load eagerly; the rest wait their turn
  const eagerCount = Math.min(selected.length, MARQUEE_EAGER_COUNT);

  // Join the shared clock before the first paint (see marqueeElapsedSeconds)
  const rootRef = useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    rootRef.current?.style.setProperty('--marquee-elapsed', `${marqueeElapsedSeconds().toFixed(3)}s`);
  }, []);

  return (
    <div ref={rootRef} className={`loading-screen__marquee loading-screen__marquee--${variant}`}>
      <MarqueeRow photos={top} copies={copies} direction="left" eagerCount={eagerCount} />
      <MarqueeRow photos={bottom} copies={copies} direction="right" eagerCount={eagerCount} />
    </div>
  );
}

/**
 * Sliding photo marquee with a soft white wash — drop-in for BackgroundVideo
 * behind the plain loader and envelope (fills its positioned parent).
 */
/** true from 768px up; null until measured so neither photo set loads before we know. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

export function PhotoBackground({
  photos,
  desktopPhotos,
  veil = PHOTO_BACKGROUND_VEIL,
}: {
  /** Portrait photos (public/mobile-background) — phones */
  photos: readonly string[];
  /** Landscape photos (public/desktop-background) — 768px and up; falls back to `photos` */
  desktopPhotos?: readonly string[];
  /** Strength of the white wash over the photos (0–1). */
  veil?: number;
}) {
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const mobile = photos;
  const resolved = useMemo(
    () =>
      (isDesktop && desktopPhotos && desktopPhotos.length > 0 ? desktopPhotos : mobile).slice(
        0,
        BACKGROUND_PHOTO_LIMIT,
      ),
    [isDesktop, desktopPhotos, mobile],
  );
  // No photos (plain display): soft butter-yellow / pastel-blue paper instead (globals.css)
  if (resolved.length === 0) return <div className="invite-blush-backdrop" aria-hidden="true" />;

  return (
    <div className="background-video" aria-hidden="true">
      {isDesktop !== null && (
        <PhotoMarquee
          key={isDesktop ? 'desktop' : 'mobile'}
          photos={resolved}
          copies={reduceMotion ? 1 : 2}
          variant="loader"
          // Same order every time: the photos preloaded in app/layout.tsx are the ones shown
          // first, and the loader → envelope → home hero keep one continuous strip
          shuffle={false}
        />
      )}
      <div className="background-video__veil" style={{ opacity: veil, zIndex: 2 }} />
    </div>
  );
}

/** Fixed photo marquee + veil — continuity from loading screen (photos display only). */
export function InvitePhotoBackdrop({
  className = '',
  photos,
}: {
  className?: string;
  photos?: readonly string[];
}) {
  const reduceMotion = useReducedMotion();
  const copies = reduceMotion ? 1 : 2;
  const resolved =
    photos && photos.length > 0
      ? photos
      : LOADING_BG_PHOTOS.length > 0
        ? LOADING_BG_PHOTOS
        : MOBILE_BG_PHOTOS;

  if (resolved.length === 0) return null;

  return (
    <div className={`invite-photo-backdrop ${className}`.trim()} aria-hidden="true">
      <PhotoMarquee photos={resolved} copies={copies} variant="mobile" />
      <div className="loading-screen__backdrop-veil" />
    </div>
  );
}

/**
 * Photos-display backdrop shared by the loader and the envelope: the same two-row
 * portrait marquee, veil and scrim. Both screens render this exact markup and the
 * marquee runs on one shared clock, so when the envelope fades in over the loader
 * the photo strip simply carries on — same photos, same spot, same speed.
 */
export function LoaderPhotoBackdrop({
  photos,
  enter = false,
}: {
  photos: readonly string[];
  /** Loader only: fade + settle the strip in on first paint */
  enter?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  if (photos.length === 0) return null;
  return (
    <div className="ls-photo-backdrop loading-screen--invitation" aria-hidden="true">
      <div className={`loading-screen__backdrop${enter ? ' ls-backdrop-in' : ''}`}>
        <PhotoMarquee photos={photos} copies={reduceMotion ? 1 : 2} variant="loader" shuffle={false} />
        <div className="loading-screen__backdrop-veil" />
      </div>
      <div className="loading-screen__readability-scrim" />
    </div>
  );
}

/** Faint, edge-faded illustration behind the loader, envelope and home hero
 *  (content/site.ts → loadingScreen.ghostImage; styles: .ghost-backdrop in globals.css). */
export function GhostBackdrop({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <div className="ghost-backdrop" aria-hidden="true">
      <Image src={encodeURI(src)} alt="" fill priority sizes="100vw" className="ghost-backdrop__img" />
    </div>
  );
}

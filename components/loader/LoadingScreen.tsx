'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import { useReducedMotion } from 'motion/react';
import { useSiteConfig } from '@/hooks/use-site-config';
import { siteConfig as defaultSiteConfig } from '@/content/site';
import { GhostBackdrop, PhotoBackground } from '@/components/loader/invite-photo-backdrop';
import { TintedDeco } from '@/components/tinted-deco';
import { SectionBackdrop } from '@/components/section-backdrop';
import { LeafParticles } from '@/components/loader/leaf-particles';
import './loading-screen.css';

const theSeasons = localFont({
  src: '../../Font/Fontspring-DEMO-theseasons-reg.otf',
  display: 'swap',
});

const aboveTheBeyond = localFont({
  src: '../../Font/above-the-beyond-script.otf',
  display: 'swap',
});

interface LoadingScreenProps {
  onComplete: () => void;
  onFadeStart?: () => void;
}

// Photos-mode entrance, top to bottom (ms). CSS-delay driven, so it plays as soon as the
// HTML paints — no wait for hydration:
// photo backdrop → headline → countdown → groom · "and" · bride → date boxes → footer
const PHOTO_IN = {
  headline: 150,
  kicker: 500,
  groom: 750,
  and: 1000,
  bride: 1150,
  boxes: 1500,
  boxStagger: 180,
  boxText: 350, // after its own box
  eyebrow: 2250,
  copy: 2400,
  rule: 2550,
  status: 2650,
  progress: 2750,
} as const;
const FADE_OUT_MS = 1400;
// Handoff: the loader's content fades away first, then the envelope screen fades in
// (photos mode: over the same, uninterrupted photo marquee)
const HANDOFF_LEAD_MS = 550;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Plain mode choreography — all CSS-delay driven so it plays in sync even before hydration:
// ornament → headline letters → countdown → names → date (day, month/year, weekday) → details
const PLAIN_LETTER_START_MS = 350;
const PLAIN_LETTER_STAGGER_MS = 75;
// Offsets below are measured from the moment the last headline letter has landed
const PLAIN_DATE_OFFSET_MS = 1300;
const PLAIN_DATE_STAGGER_MS = 800;

// Short joining words in the headline ("Save the Date") are set in script
const SCRIPT_WORDS = new Set(['the', 'of', 'and', '&', 'a']);

// Splits the headline into display words with a running letter index for staggering.
// Longer titles break onto a second line before a mid-title joining word
// ("A Celebration / of Love"); short ones like "Save the Date" stay on one line.
function splitHeadline(headline: string) {
  let letterIndex = 0;
  const words = headline.split(/\s+/).filter(Boolean);
  return words.map((word, i) => {
    const script = SCRIPT_WORDS.has(word.toLowerCase());
    const start = letterIndex;
    letterIndex += script ? 2 : word.length;
    const breakBefore = words.length >= 4 && script && i > 0 && i < words.length - 1;
    return { word, script, start, breakBefore };
  });
}

// Motif colors cycled through the floating petals (plain mode): mostly pastel blue
// and sky blue, a little butter yellow, navy only once in a while
const MOTE_COLORS = [
  'var(--color-motif-blush)',
  'var(--color-motif-medium)',
  'var(--color-motif-blush)',
  'var(--color-motif-yellow)',
  'var(--color-motif-medium)',
  'var(--color-motif-blush)',
  'var(--color-motif-deep)',
]

// Colorful motes and petals drifting up behind the invitation card (plain mode)
const PLAIN_MOTES = Array.from({ length: 14 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  size: 4 + ((i * 7) % 6),
  dur: 14 + ((i * 5) % 10),
  delay: -((i * 3.1) % 18),
  drift: ((i % 2 === 0 ? 1 : -1) * (12 + ((i * 11) % 24))),
  spin: (i % 2 === 0 ? 1 : -1) * (180 + ((i * 47) % 360)),
  color: MOTE_COLORS[i % MOTE_COLORS.length],
  petal: i % 3 === 0,
}))

// "Mars J. Vallejo" → "Mars Vallejo": drops middle initials from a full name
function withoutMiddleInitials(name: string) {
  return name.replace(/\s+\p{L}\.(?=\s)/gu, '');
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, onFadeStart }) => {
  const siteConfig = useSiteConfig();
  // Fall back to the bundled config if a remote override is missing this block.
  const content = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen;
  const totalDurationMs = content.durationMs;
  const statusMessages = content.statusMessages;
  const isPlain = content.display === 'plain';
  const backgroundPhotos = useMemo(
    () => (content.backgroundPhotos ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotos],
  );
  const backgroundPhotosDesktop = useMemo(
    () => (content.backgroundPhotosDesktop ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotosDesktop],
  );
  const plainTheme = content.plainTheme ?? defaultSiteConfig.loadingScreen.plainTheme;
  const cornerDecos = content.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos;
  const plainInvite = content.plainInvite ?? defaultSiteConfig.loadingScreen.plainInvite;

  const reduceMotion = useReducedMotion();
  const [fadeOut, setFadeOut] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const weddingDate = useMemo(() => new Date(siteConfig.wedding.date), [siteConfig.wedding.date]);
  const hasValidDate = !Number.isNaN(weddingDate.getTime());

  const countdownText = useMemo(() => {
    if (!hasValidDate) return '';
    const days = Math.round((startOfDay(weddingDate) - startOfDay(now)) / MS_PER_DAY);
    if (days < 0) return content.countdownPastText;
    if (days === 0) return content.countdownTodayText;
    if (days === 1) return content.countdownOneDayText;
    return content.countdownText.replace('{days}', days.toLocaleString());
  }, [content, hasValidDate, now, weddingDate]);

  const dateParts = hasValidDate
    ? [
        weddingDate.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        String(weddingDate.getDate()).padStart(2, '0'),
        String(weddingDate.getFullYear()),
      ]
    : [];

  // Plain display: short month ("Dec") + full weekday for the engraved-style date line
  const silkDate = hasValidDate
    ? {
        weekday: weddingDate.toLocaleString('en-US', { weekday: 'long' }),
        month: weddingDate.toLocaleString('en-US', { month: 'short' }),
        day: String(weddingDate.getDate()).padStart(2, '0'),
        year: String(weddingDate.getFullYear()),
        label: weddingDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      }
    : null;

  const headlineWords = useMemo(() => splitHeadline(content.headline), [content.headline]);
  const headlineLetterCount = headlineWords.reduce(
    (n, w) => n + (w.script ? 2 : w.word.length),
    0,
  );
  // Plain mode: the rest of the card waits for the headline letters to land
  const afterHeadlineMs = isPlain
    ? PLAIN_LETTER_START_MS + headlineLetterCount * PLAIN_LETTER_STAGGER_MS + 250
    : 0;
  // Photos mode: no opening curtains, so the photo marquee shows from the very first paint
  // and the text plays in straight away over it
  const pin = (ms: number) => ms;
  const revealDelay = (photoMs: number, plainOffsetMs: number) =>
    ({ '--ls-delay': `${isPlain ? afterHeadlineMs + plainOffsetMs : pin(photoMs)}ms` }) as React.CSSProperties;
  // Plain date steps: 0 = day, 1 = month & year, 2 = weekday
  const dateDelay = (step: number) =>
    ({
      '--ls-delay': `${afterHeadlineMs + PLAIN_DATE_OFFSET_MS + step * PLAIN_DATE_STAGGER_MS}ms`,
    }) as React.CSSProperties;

  const ceremonyLine = siteConfig.ceremony.time ?? '';
  // Nicknames only ("Mars and Yanyan"); falls back to the full name without middle initials
  const groomName = siteConfig.couple.groomNickname || withoutMiddleInitials(siteConfig.couple.groom);
  const brideName = siteConfig.couple.brideNickname || withoutMiddleInitials(siteConfig.couple.bride);
  const coupleNames = `${groomName} & ${brideName}`;


  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (statusMessages.length < 2) return;
    const step = totalDurationMs / statusMessages.length;
    const t = setInterval(
      () => setStatusIndex((i) => Math.min(i + 1, statusMessages.length - 1)),
      step,
    );
    return () => clearInterval(t);
  }, [statusMessages.length, totalDurationMs]);

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let handoffTimer: ReturnType<typeof setTimeout> | undefined;
    const lead = reduceMotion ? 0 : HANDOFF_LEAD_MS;
    const t = setTimeout(() => {
      setFadeOut(true);
      handoffTimer = setTimeout(() => {
        onFadeStart?.();
        fadeTimer = setTimeout(onComplete, reduceMotion ? 200 : FADE_OUT_MS);
      }, lead);
    }, totalDurationMs);
    return () => {
      clearTimeout(t);
      clearTimeout(handoffTimer);
      clearTimeout(fadeTimer);
    };
  }, [isPlain, onComplete, onFadeStart, reduceMotion, totalDurationMs]);

  return (
    <div
      className={`loading-screen loading-screen--invitation${isPlain ? ' loading-screen--plain' : ''} fixed inset-0 z-50 flex flex-col overflow-hidden overscroll-none h-dvh max-h-dvh w-full${fadeOut ? ' is-fading' : ''}${reduceMotion ? ' is-reduced-motion' : ''}`}
      aria-live="polite"
      aria-busy={!fadeOut}
      aria-label="Loading invitation"
      style={
        {
          pointerEvents: fadeOut ? 'none' : 'auto',
          ...(isPlain && {
            '--ls-plain-bg': plainTheme.background,
            '--ls-plain-ink': plainTheme.text,
            '--ls-plain-accent': plainTheme.accent,
          }),
        } as React.CSSProperties
      }
    >
      {/* Photos display: the sliding photo marquee is rendered once by the page
          (invitation-page.tsx → LoaderPhotoBackdrop) behind both this screen and the
          envelope, so it carries straight on through the handoff */}

      {isPlain && (
        <>
          <PhotoBackground photos={backgroundPhotos} desktopPhotos={backgroundPhotosDesktop} />
          <GhostBackdrop src={content.ghostImage} />
          <div className="loading-screen__plain-corners" aria-hidden="true">
            {(
              [
                { src: cornerDecos.topLeft, pos: 'tl', className: 'left-0 top-0' },
                { src: cornerDecos.topRight, pos: 'tr', className: 'right-0 top-0' },
                { src: cornerDecos.bottomLeft, pos: 'bl', className: 'left-0 bottom-0' },
                { src: cornerDecos.bottomRight, pos: 'br', className: 'right-0 bottom-0' },
              ] as const
            ).filter(({ src }) => src).map(({ src, pos, className }) => (
              <div
                key={pos}
                className={`loading-screen__plain-corner-slot loading-screen__plain-corner-slot--${pos} pointer-events-none absolute ${className}`}
              >
                {/* Corners keep their original artwork colors (no tint) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="loading-screen__plain-corner-img" />
              </div>
            ))}
          </div>
          <div className="loading-screen__plain-frame" aria-hidden="true" />
          <div className="ls-plain-glow" aria-hidden="true" />
          {/* Paper grain + rising hearts, same as the invitation sections (section-backdrop.tsx);
              no extra wash — the backdrop (photos or plain paper) already carries the tint */}
          <SectionBackdrop wash={false} overlay />
          {!reduceMotion && (
            <div className="ls-plain-motes" aria-hidden="true">
              {PLAIN_MOTES.map((m, i) => (
                <span
                  key={i}
                  className={`ls-plain-mote${m.petal ? ' ls-plain-mote--petal' : ''}`}
                  style={
                    {
                      '--x': `${m.x}%`,
                      '--size': `${m.size}px`,
                      '--dur': `${m.dur}s`,
                      '--delay': `${m.delay}s`,
                      '--drift': `${m.drift}px`,
                      '--spin': `${m.spin}deg`,
                      '--c': m.color,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Photos mode: pastel leaves falling over the photos (under the corners + text) */}
      {!isPlain && !reduceMotion && <LeafParticles />}

      {/* Photos mode: four corner florals (content/site.ts → loadingScreen.cornerDecos), tucked
          into the screen corners. Already in place behind the curtains — revealed as they part,
          then they just sway gently */}
      {!isPlain && (
        <div className="ls-photo-corners" aria-hidden="true">
          {(
            [
              { src: cornerDecos.topLeft, pos: 'tl', delay: 0 },
              { src: cornerDecos.topRight, pos: 'tr', delay: -2000 },
              { src: cornerDecos.bottomLeft, pos: 'bl', delay: -4000 },
              { src: cornerDecos.bottomRight, pos: 'br', delay: -6000 },
            ] as const
          )
            .filter(({ src }) => src)
            .map(({ src, pos, delay }) => (
              <span
                key={pos}
                className={`ls-photo-corner ls-photo-corner--${pos}`}
                // Sway phase offset per corner so they don't move in unison
                style={{ '--ls-delay': `${delay}ms` } as React.CSSProperties}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={encodeURI(src)} alt="" className="ls-photo-corner__img" />
              </span>
            ))}
        </div>
      )}

      <div className="loading-screen__save-date">
        <header
          className={`flex flex-col items-center w-full px-4 sm:px-6 flex-shrink-0${
            isPlain ? ' pt-10 sm:pt-14 md:pt-16' : ' ls-photo-header'
          }`}
        >
          {isPlain && plainInvite.ornament && (
            <TintedDeco
              src={plainInvite.ornament}
              className="loading-screen__plain-ornament ls-ornament-in"
              style={{ '--ls-delay': '100ms' } as React.CSSProperties}
            />
          )}
          {isPlain ? (
            <h1 className="loading-screen__std-headline ls-headline" aria-label={content.headline}>
              {headlineWords.map(({ word, script, start, breakBefore }, wi) =>
                script ? (
                  <React.Fragment key={wi}>
                  {breakBefore && <span className="ls-headline__break" aria-hidden="true" />}
                  <span
                    className="ls-headline__script"
                    aria-hidden="true"
                    style={
                      {
                        '--ls-delay': `${PLAIN_LETTER_START_MS + start * PLAIN_LETTER_STAGGER_MS}ms`,
                      } as React.CSSProperties
                    }
                  >
                    {word}
                  </span>
                  </React.Fragment>
                ) : (
                  <span key={wi} className="ls-headline__word" aria-hidden="true">
                    {Array.from(word).map((ch, ci) => (
                      <span
                        key={ci}
                        className="ls-headline__letter"
                        style={
                          {
                            '--ls-delay': `${PLAIN_LETTER_START_MS + (start + ci) * PLAIN_LETTER_STAGGER_MS}ms`,
                          } as React.CSSProperties
                        }
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                ),
              )}
            </h1>
          ) : (
            <h1
              className="loading-screen__std-headline ls-in ls-in--headline"
              style={{ '--ls-delay': `${pin(PHOTO_IN.headline)}ms` } as React.CSSProperties}
            >
              {content.headline}
            </h1>
          )}
          {countdownText && (
            <p
              className={`loading-screen__std-kicker ${isPlain ? 'ls-reveal' : 'ls-in ls-in--track'}`}
              style={revealDelay(PHOTO_IN.kicker, 0)}
            >
              {countdownText}
            </p>
          )}
        </header>

        {isPlain && plainInvite.lineAbove && (
          <p className="loading-screen__plain-line ls-reveal" style={revealDelay(350, 200)}>
            {plainInvite.lineAbove}
          </p>
        )}

        <div
          className={`loading-screen__std-names-slot${isPlain ? ' ls-reveal' : ''}`}
          style={isPlain ? revealDelay(0, 400) : undefined}
        >
          <h2 className="loading-screen__std-names loading-screen__std-names--text" aria-label={coupleNames}>
            {/* Photos mode: groom glides in from the left, "and" blooms, bride from the right */}
            <span
              className={`${theSeasons.className} ls-names__nick${isPlain ? '' : ' ls-in ls-in--from-left'}`}
              style={isPlain ? undefined : ({ '--ls-delay': `${pin(PHOTO_IN.groom)}ms` } as React.CSSProperties)}
              aria-hidden="true"
            >
              {groomName}
            </span>
            <span
              className={`${aboveTheBeyond.className} ls-names__and${isPlain ? '' : ' ls-in ls-in--bloom'}`}
              style={isPlain ? undefined : ({ '--ls-delay': `${pin(PHOTO_IN.and)}ms` } as React.CSSProperties)}
              aria-hidden="true"
            >
              and
            </span>
            <span
              className={`${theSeasons.className} ls-names__nick${isPlain ? '' : ' ls-in ls-in--from-right'}`}
              style={isPlain ? undefined : ({ '--ls-delay': `${pin(PHOTO_IN.bride)}ms` } as React.CSSProperties)}
              aria-hidden="true"
            >
              {brideName}
            </span>
          </h2>
        </div>

        {isPlain && plainInvite.lineBelow && (
          <p className="loading-screen__plain-line ls-reveal" style={revealDelay(550, 650)}>
            {plainInvite.lineBelow}
          </p>
        )}

        {isPlain && silkDate && (
          <div className="ls-silk-date px-4 pt-1 pb-3 sm:pb-4 flex-shrink-0" role="img" aria-label={silkDate.label}>
            {/* Entry order: day rises in → month & year glide out from it → weekday draws in */}
            <p className="ls-silk-date__weekday is-visible" style={dateDelay(2)}>
              {silkDate.weekday}
            </p>
            <div className="ls-silk-date__row">
              <span className="ls-silk-date__side ls-silk-date__side--month is-visible" style={dateDelay(1)}>
                {silkDate.month}
              </span>
              <span className="ls-silk-date__day is-visible" style={dateDelay(0)}>
                {Array.from(silkDate.day).map((digit, i) => (
                  <span key={i} className="ls-silk-date__digit" style={{ '--i': i } as React.CSSProperties}>
                    <span className="ls-silk-date__digit-inner">{digit}</span>
                  </span>
                ))}
              </span>
              <span className="ls-silk-date__side ls-silk-date__side--year is-visible" style={dateDelay(1)}>
                {silkDate.year}
              </span>
            </div>
          </div>
        )}

        {!isPlain && dateParts.length > 0 && (
          <div className="flex items-stretch justify-center gap-3 sm:gap-4 md:gap-6 px-4 pt-1 pb-3 sm:pb-4 flex-shrink-0">
            {dateParts.map((value, i) => {
              const photo = content.photos[i % content.photos.length];
              const boxDelay = pin(PHOTO_IN.boxes) + i * PHOTO_IN.boxStagger;
              return (
                <div
                  key={content.dateLabels[i] ?? i}
                  className="loading-screen__std-box ls-box-in relative flex-1 max-w-[28vw] sm:max-w-[140px] md:max-w-[160px] aspect-[3/4] overflow-hidden rounded-2xl"
                  style={{ '--ls-delay': `${boxDelay}ms` } as React.CSSProperties}
                >
                  {photo && (
                    <Image
                      src={photo}
                      alt=""
                      fill
                      // The cards fade in after the marquee, so let the marquee photos load first
                      loading="eager"
                      fetchPriority="low"
                      className="loading-screen__std-box-img object-cover scale-105"
                      sizes="(max-width: 640px) 30vw, 160px"
                      quality={70}
                    />
                  )}
                  <div className="loading-screen__std-box-overlay absolute inset-0" />
                  <div
                    className="loading-screen__std-box-text ls-in ls-in--up absolute bottom-2 inset-x-0 sm:bottom-3 flex flex-col items-center"
                    style={{ '--ls-delay': `${boxDelay + PHOTO_IN.boxText}ms` } as React.CSSProperties}
                  >
                    <span className="loading-screen__std-box-num text-2xl sm:text-3xl md:text-4xl font-medium select-none leading-none text-center">
                      {value}
                    </span>
                    <span className="loading-screen__std-box-label text-[8px] sm:text-[9px] uppercase mt-0.5">
                      {content.dateLabels[i]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <footer
          className={`loading-screen__std-footer flex flex-col items-center w-full pt-1 px-6 flex-shrink-0${isPlain ? '' : ' ls-photo-footer'}`}
        >
          {/* Photos mode: invitation line + message under the date boxes */}
          {!isPlain && content.eyebrow && (
            <p className="loading-screen__std-eyebrow ls-in ls-in--track" style={revealDelay(PHOTO_IN.eyebrow, 0)}>
              {content.eyebrow}
            </p>
          )}
          {!isPlain && content.message && (
            <p className="loading-screen__std-copy ls-in ls-in--up" style={revealDelay(PHOTO_IN.copy, 0)}>
              {content.message}
            </p>
          )}
          {isPlain && content.showCeremonyDetails &&
            (ceremonyLine || siteConfig.ceremony.location || siteConfig.ceremony.venue) && (
            <div className="loading-screen__std-venue ls-reveal" style={revealDelay(900, 3200)}>
              {ceremonyLine && <span className="loading-screen__std-venue-time">{ceremonyLine}</span>}
              {siteConfig.ceremony.location && (
                <span className="loading-screen__std-venue-name">{siteConfig.ceremony.location}</span>
              )}
              {siteConfig.ceremony.venue && (
                <span className="loading-screen__std-venue-address">{siteConfig.ceremony.venue}</span>
              )}
            </div>
          )}
          <div
            className={`loading-screen__std-rule${isPlain ? '' : ' ls-in ls-in--line'}`}
            style={isPlain ? undefined : ({ '--ls-delay': `${pin(PHOTO_IN.rule)}ms` } as React.CSSProperties)}
            aria-hidden="true"
          />
          {statusMessages.length > 0 && (
            <p
              key={statusIndex}
              className="loading-screen__std-status"
              // Photos mode: the first message waits its turn in the entrance; later ones swap in right away
              style={!isPlain && statusIndex === 0 ? { animationDelay: `${pin(PHOTO_IN.status)}ms` } : undefined}
            >
              {statusMessages[statusIndex]}
            </p>
          )}
          <div
            className={`w-full max-w-[200px] sm:max-w-xs mx-auto${isPlain ? '' : ' ls-in ls-in--fade'}`}
            style={isPlain ? undefined : ({ '--ls-delay': `${pin(PHOTO_IN.progress)}ms` } as React.CSSProperties)}
            role="progressbar"
            aria-label="Loading invitation"
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="loading-screen__std-track">
              <div
                className="loading-screen__std-bar"
                style={{ animationDuration: `${totalDurationMs}ms` }}
              />
              {isPlain && (
                <span
                  className="ls-plain-progress-glow"
                  style={{ animationDuration: `${totalDurationMs}ms` }}
                  aria-hidden="true"
                />
              )}
            </div>
            {/* Photos mode: percentage counting up in step with the bar (CSS-animated) */}
            {!isPlain && (
              <span
                className="ls-progress-pct"
                style={{ animationDuration: `${totalDurationMs}ms` }}
                aria-hidden="true"
              />
            )}
          </div>
        </footer>
      </div>

    </div>
  );
};
